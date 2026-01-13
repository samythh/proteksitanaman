// File: src/app/[locale]/informasi/berita/page.tsx
import { getTranslations } from 'next-intl/server';
import { fetchAPI } from '@/lib/strapi/fetcher';
import qs from 'qs';
import NewsHeroSlider, { ArticleSlide } from '@/components/sections/NewsHeroSlider';
import NewsDashboard, { NewsItem } from '@/components/sections/NewsDashboard';

type Props = {
   params: Promise<{ locale: string }>;
};

// --- 1. FETCH DATA ---
async function getArticles(locale: string) {
   try {
      const query = qs.stringify({
         locale: locale,
         sort: ['publishedDate:desc', 'publishedAt:desc'],
         pagination: {
            page: 1,
            pageSize: 15, // Ambil cukup banyak data
         },
         populate: {
            cover: { fields: ['url', 'alternativeText'] },
            category: { fields: ['name', 'slug', 'color'] }
         },
         // Fields: excerpt saja, jangan description agar tidak error 400
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

   const allArticles = await getArticles(locale);

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
         excerpt: attributes.excerpt || "",
         cover: { url: coverUrl },
         category: catData ? { name: catData.name, color: catData.color } : undefined
      };
   });

   // --- LOGIKA BARU ---

   // 1. Hero Data: Ambil 5 teratas untuk Highlight
   const heroData: ArticleSlide[] = normalizedArticles.slice(0, 5);

   // 2. Dashboard Data: Ambil SEMUA data (Tidak di-slice/dipotong)
   // Jadi berita yang ada di Hero akan muncul lagi di Dashboard
   const dashboardData: NewsItem[] = normalizedArticles;

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