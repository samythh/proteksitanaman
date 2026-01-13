// File: src/app/[locale]/informasi/berita/page.tsx
import { getTranslations } from 'next-intl/server';
import { fetchAPI } from '@/lib/strapi/fetcher';
import qs from 'qs';
import NewsHeroSlider, { ArticleSlide } from '@/components/sections/NewsHeroSlider';
import NewsDashboard, { NewsItem } from '@/components/sections/NewsDashboard';

type Props = {
   params: Promise<{ locale: string }>;
};

// --- 1. FETCH DATA (Diperbaiki) ---
async function getArticles(locale: string) {
   try {
      const query = qs.stringify({
         locale: locale,
         sort: ['publishedDate:desc', 'publishedAt:desc'],
         pagination: {
            page: 1,
            pageSize: 14,
         },
         populate: {
            cover: { fields: ['url', 'alternativeText'] },
            category: { fields: ['name', 'slug', 'color'] }
         },
         // PERBAIKAN DISINI: Menghapus 'description' karena field itu tidak ada di Strapi
         fields: ['title', 'slug', 'publishedAt', 'publishedDate', 'excerpt'],
      });

      const res = await fetchAPI(`/articles?${query}`);
      return res?.data || [];
   } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
   }
}

export async function generateMetadata({ params }: Props) {
   const { locale } = await params;
   const t = await getTranslations({ locale, namespace: 'Metadata' });
   return { title: `Berita & Artikel - ${t('title')}` };
}

export default async function NewsPage({ params }: Props) {
   const { locale } = await params;

   // Ambil semua data mentah
   const allArticles = await getArticles(locale);

   // --- 2. PEMISAHAN DATA ---
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const normalizedArticles = allArticles.map((item: any) => {
      const attributes = item.attributes || item;
      const coverUrl = attributes.cover?.data?.attributes?.url || attributes.cover?.url || "";
      const catData = attributes.category?.data?.attributes || attributes.category || null;

      return {
         id: item.id,
         title: attributes.title,
         slug: attributes.slug,
         publishedAt: attributes.publishedDate || attributes.publishedAt || "",
         // Cukup gunakan excerpt saja
         excerpt: attributes.excerpt || "",
         cover: { url: coverUrl },
         category: catData ? { name: catData.name, color: catData.color } : undefined
      };
   });

   // 5 Artikel Pertama masuk ke Hero Slider
   const heroData: ArticleSlide[] = normalizedArticles.slice(0, 5);

   // Sisanya masuk ke News Dashboard
   const dashboardData: NewsItem[] = normalizedArticles.slice(5);

   return (
      <main className="w-full bg-gray-50 min-h-screen pt-24 pb-20">

         {/* Hero Slider */}
         {heroData.length > 0 && (
            <div className="mb-12">
               <NewsHeroSlider articles={heroData} />
            </div>
         )}

         {/* Dashboard Berita */}
         <NewsDashboard
            initialData={dashboardData}
            locale={locale}
            isHomePage={false}
         />

      </main>
   );
}