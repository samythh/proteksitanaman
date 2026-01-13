// File: src/app/[locale]/informasi/berita/page.tsx
import { getTranslations } from 'next-intl/server';
import { fetchAPI } from '@/lib/strapi/fetcher';
import qs from 'qs';
import NewsHeroSlider, { ArticleSlide } from '@/components/sections/NewsHeroSlider';
import NewsDashboard, { NewsItem } from '@/components/sections/NewsDashboard';

type Props = {
   params: Promise<{ locale: string }>;
};

// ... (Interface StrapiArticleItem dan fungsi getArticles TETAP SAMA, tidak perlu diubah) ...
interface StrapiArticleItem {
   id: number;
   title: string;
   slug: string;
   publishedAt: string;
   publishedDate?: string;
   description?: string;
   excerpt?: string;
   cover?: {
      url?: string;
      alternativeText?: string;
      data?: { attributes: { url: string; }; };
   };
   category?: {
      name: string;
      slug: string;
      color?: string;
   };
}

async function getArticles(locale: string) {
   // ... (Kode query tetap sama) ...
   const heroQuery = qs.stringify({
      locale,
      sort: ['publishedAt:desc'],
      pagination: { pageSize: 5 },
      populate: { cover: { fields: ['url', 'alternativeText'] }, category: { fields: ['name', 'slug', 'color'] } },
   });

   const dashboardQuery = qs.stringify({
      locale,
      sort: ['publishedAt:desc'],
      pagination: { page: 1, pageSize: 9 },
      populate: { cover: { fields: ['url', 'alternativeText'] }, category: { fields: ['name', 'slug', 'color'] } },
   });

   const [heroRes, dashboardRes] = await Promise.all([
      fetchAPI(`/articles?${heroQuery}`),
      fetchAPI(`/articles?${dashboardQuery}`)
   ]);

   return {
      heroData: (heroRes?.data || []) as StrapiArticleItem[],
      dashboardData: (dashboardRes?.data || []) as StrapiArticleItem[]
   };
}

export async function generateMetadata({ params }: Props) {
   const { locale } = await params;
   const t = await getTranslations({ locale, namespace: 'Metadata' });
   return { title: `Berita & Artikel - ${t('title')}` };
}

export default async function NewsPage({ params }: Props) {
   const { locale } = await params;
   const { heroData, dashboardData } = await getArticles(locale);

   // Mapping Data Hero
   const formattedHeroData: ArticleSlide[] = heroData.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      publishedAt: item.publishedAt,
      excerpt: item.description || item.excerpt,
      cover: { url: item.cover?.url || item.cover?.data?.attributes?.url || "" },
      category: item.category ? { name: item.category.name, color: item.category.color } : undefined
   }));

   // Mapping Data Dashboard
   const formattedDashboardData: NewsItem[] = dashboardData.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      publishedAt: item.publishedAt,
      publishedDate: item.publishedDate,
      excerpt: item.excerpt || item.description,
      cover: { url: item.cover?.url || item.cover?.data?.attributes?.url || "" },
      category: item.category ? { name: item.category.name, color: item.category.color } : undefined
   }));

   return (
      // PERBAIKAN POSISI:
      // Sebelumnya: pt-24 md:pt-28 (terlalu jauh)
      // Sekarang: pt-20 (Jarak standar minimal untuk Navbar Fixed 80px)
      <main className="w-full bg-gray-50 min-h-screen pt-8">

         {/* Hero Slider */}
         <NewsHeroSlider articles={formattedHeroData} />

         {/* Dashboard Berita */}
         <NewsDashboard initialData={formattedDashboardData} locale={locale} />
      </main>
   );
}