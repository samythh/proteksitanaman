// File: src/app/[locale]/informasi/berita/page.tsx

import { getTranslations } from 'next-intl/server';
import { fetchAPI } from '@/lib/strapi/fetcher';
import { getStrapiMedia } from '@/lib/strapi/utils';
import qs from 'qs';
import NewsHeroSlider, { ArticleSlide } from '@/components/sections/NewsHeroSlider';
import NewsDashboard, { NewsItem } from '@/components/sections/NewsDashboard';
import { Metadata } from 'next';

// --- TYPES ---
interface StrapiEntity {
   id: number;
   attributes: Record<string, unknown>;
}

interface StrapiResponse<T> {
   data: T[];
   meta?: {
      pagination?: {
         total: number;
         page: number;
         pageSize: number;
         pageCount: number;
      }
   }
}

type Props = {
   params: Promise<{ locale: string }>;
};

// --- HELPERS ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeArticle = (item: any): NewsItem => {
   // Handle v5 (flat) vs v4 (nested attributes)
   const attr = item.attributes || item;

   const coverData = attr.cover?.data?.attributes || attr.cover || null;
   const coverUrl = getStrapiMedia(coverData?.url);

   const catData = attr.category?.data?.attributes || attr.category || null;

   return {
      id: item.id,
      title: String(attr.title || ""),
      slug: String(attr.slug || ""),
      publishedAt: String(attr.publishedDate || attr.publishedAt || ""),
      excerpt: String(attr.excerpt || ""),
      cover: {
         url: coverUrl || ""
      },
      category: catData ? {
         name: String(catData.name),
         color: String(catData.color)
      } : undefined
   };
};

// --- 1. FETCH FEATURED ---
async function getFeaturedArticles(locale: string) {
   try {
      const query = qs.stringify({
         locale: locale,
         filters: {
            isFeatured: { $eq: true }
         },
         sort: ['publishedAt:desc'],
         pagination: { limit: 5 },
         populate: {
            cover: { fields: ['url', 'alternativeText'] },
            category: { fields: ['name', 'slug', 'color'] }
         },
         fields: ['title', 'slug', 'publishedAt', 'excerpt'],
      });

      const res = await fetchAPI(`/articles?${query}`) as StrapiResponse<StrapiEntity>;
      return res?.data || [];
   } catch (error) {
      console.error("[NewsPage] Error fetching featured articles:", error);
      return [];
   }
}

// --- 2. FETCH ALL (DASHBOARD) ---
async function getAllArticles(locale: string) {
   try {
      const query = qs.stringify({
         locale: locale,
         sort: ['publishedAt:desc'],
         pagination: {
            page: 1,
            pageSize: 14,
         },
         populate: {
            cover: { fields: ['url', 'alternativeText'] },
            category: { fields: ['name', 'slug', 'color'] }
         },
         fields: ['title', 'slug', 'publishedAt', 'excerpt'],
      });

      const res = await fetchAPI(`/articles?${query}`) as StrapiResponse<StrapiEntity>;
      
      return res; 
   } catch (error) {
      console.error("[NewsPage] Error fetching all articles:", error);
      return { data: [], meta: undefined };
   }
}

// --- 3. METADATA ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
   const { locale } = await params;

   const t = await getTranslations({ locale, namespace: 'NewsPage' });
   
   const tGlobal = await getTranslations({ locale, namespace: 'Metadata' });

   return {
      title: `${t('meta_title')} - ${tGlobal('title')}`,
      description: t('meta_description')
   };
}

// --- 4. MAIN COMPONENT ---
export default async function NewsPage({ params }: Props) {
   const { locale } = await params;
   const t = await getTranslations({ locale, namespace: 'NewsPage' });

   const [featuredRaw, allResponse] = await Promise.all([
      getFeaturedArticles(locale),
      getAllArticles(locale)
   ]);

   const featuredList = featuredRaw.map(normalizeArticle);
   const allList = (allResponse?.data || []).map(normalizeArticle);
   
   const rawPagination = allResponse?.meta?.pagination;
   const initialMeta = rawPagination ? { pagination: rawPagination } : undefined;

   const heroDataRaw = featuredList.length > 0 ? featuredList : allList.slice(0, 5);
   const heroData: ArticleSlide[] = heroDataRaw as unknown as ArticleSlide[];

   // Data Dashboard 
   const dashboardData: NewsItem[] = allList;

   return (
      <main className="w-full bg-gray-50 min-h-screen pt-24 -mt-2">

         {/* 1. CONTAINER HERO SLIDER */}
         <div className="container mx-auto px-4 mb-16">
            <h1 className="sr-only">{t('hero_sr_title')}</h1>

            {heroData.length > 0 ? (
               <section>
                  <NewsHeroSlider articles={heroData} />
               </section>
            ) : (
               <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-400 font-medium">{t('no_news_display')}</p>
               </div>
            )}
         </div>

         {/* 2. DASHBOARD LIST */}
         <section className="w-full">
            <NewsDashboard
               initialData={dashboardData}
               initialMeta={initialMeta} 
               locale={locale}
               isHomePage={false}
            />
         </section>
      </main>
   );
}