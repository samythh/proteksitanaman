// File: src/app/[locale]/informasi/berita/page.tsx
import { fetchAPI } from "@/lib/strapi/fetcher";
import qs from "qs";
import NewsHeroSlider, { ArticleSlide } from "@/components/sections/NewsHeroSlider";
import NewsDashboard, { NewsItem } from "@/components/sections/NewsDashboard";
import ScrollReveal from "@/components/ui/ScrollReveal";

interface BeritaPageProps {
   params: Promise<{ locale: string }>;
}

interface StrapiRawItem {
   id: number;
   title: string;
   slug: string;
   publishedAt: string;
   publishedDate?: string;
   excerpt?: string;
   cover?: {
      url: string;
      alternativeText?: string;
   };
   category?: {
      name: string;
      color?: string;
      slug: string;
   };
}

// 1. Fetch untuk Slider
async function getFeaturedNews(locale: string): Promise<ArticleSlide[]> {
   try {
      const query = qs.stringify({
         locale: locale,
         filters: { isFeatured: { $eq: true } },
         sort: ["publishedDate:desc", "publishedAt:desc"],
         populate: {
            cover: { fields: ["url", "alternativeText"] },
            category: { fields: ["name", "color", "slug"] },
         },
         fields: ["title", "slug", "publishedAt", "publishedDate", "excerpt"],
         pagination: { limit: 5 },
      });

      const res = await fetchAPI(`/articles?${query}`);
      if (!res?.data) return [];

      return res.data.map((item: StrapiRawItem) => ({
         id: item.id,
         title: item.title,
         slug: item.slug,
         publishedAt: item.publishedDate || item.publishedAt,
         excerpt: item.excerpt,
         cover: { url: item.cover?.url || "" },
         category: item.category ? { name: item.category.name, color: item.category.color } : undefined,
      }));
   } catch (error) {
      console.error("Error fetching featured news:", error);
      return [];
   }
}

// 2. Fetch untuk Dashboard
async function getLatestNews(locale: string): Promise<NewsItem[]> {
   try {
      const query = qs.stringify({
         locale: locale,
         sort: ["publishedDate:desc", "publishedAt:desc"],
         populate: {
            cover: { fields: ["url", "alternativeText"] },
            category: { fields: ["name", "color", "slug"] },
         },
         fields: ["title", "slug", "publishedAt", "publishedDate", "excerpt"],
         pagination: {
            page: 1,
            pageSize: 14
         },
      });

      const res = await fetchAPI(`/articles?${query}`);
      if (!res?.data) return [];

      return res.data.map((item: StrapiRawItem) => ({
         id: item.id,
         title: item.title,
         slug: item.slug,
         publishedAt: item.publishedDate || item.publishedAt,
         excerpt: item.excerpt,
         cover: {
            url: item.cover?.url || "",
            alternativeText: item.cover?.alternativeText || "",
         },
         category: item.category ? {
            name: item.category.name,
            color: item.category.color,
         } : undefined,
      }));
   } catch (error) {
      console.error("Gagal mengambil latest news:", error);
      return [];
   }
}

export const metadata = {
   title: "Berita & Artikel - Dept. Proteksi Tanaman",
   description: "Berita terbaru, pengumuman, dan kegiatan departemen.",
};

export default async function BeritaPage({ params }: BeritaPageProps) {
   const { locale } = await params;

   const [featuredArticles, latestArticles] = await Promise.all([
      getFeaturedNews(locale),
      getLatestNews(locale)
   ]);

   return (
      <div className="w-full min-h-screen bg-gray-50 pb-20">

         {/* PERUBAHAN POSISI:
         Saya ubah dari -mt-24 menjadi -mt-20 (Mobile) dan -mt-24 (Desktop).
         Ini akan menurunkan posisi slider sedikit agar tidak terlalu mepet ke atas.
      */}
         <div className="-mt-20 lg:-mt-22 w-full relative z-0">
            <ScrollReveal width="100%" direction="down">
               <NewsHeroSlider articles={featuredArticles} />
            </ScrollReveal>
         </div>

         {/* DASHBOARD BERITA */}
         <ScrollReveal width="100%" delay={0.2}>
            <NewsDashboard initialData={latestArticles} locale={locale} />
         </ScrollReveal>

      </div>
   );
}