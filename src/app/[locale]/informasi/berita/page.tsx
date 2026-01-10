// File: src/app/[locale]/informasi/berita/page.tsx
import { fetchAPI } from "@/lib/strapi/fetcher";
import qs from "qs";
import NewsHeroSlider, { ArticleSlide } from "@/components/sections/NewsHeroSlider";

interface BeritaPageProps {
   params: Promise<{ locale: string }>;
}

interface StrapiArticleRaw {
   id: number;
   documentId: string;
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

      return res.data.map((item: StrapiArticleRaw) => ({
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
      console.error("Gagal mengambil featured news:", error);
      return [];
   }
}

export const metadata = {
   title: "Berita & Artikel - Dept. Proteksi Tanaman",
   description: "Berita terbaru, pengumuman, dan kegiatan departemen.",
};

export default async function BeritaPage({ params }: BeritaPageProps) {
   const { locale } = await params;
   const featuredArticles = await getFeaturedNews(locale);

   return (
      <div className="w-full min-h-screen bg-gray-50 pb-20">

         {/* PERBAIKAN UTAMA: NEGATIVE MARGIN (-mt-8)
          Ini akan menarik slider ke atas sejauh 32px (atau sesuaikan angka ini)
          untuk menghilangkan celah kosong dengan Navbar.
      */}
         <div className="-mt-8 lg:-mt-10 w-full">
            <NewsHeroSlider articles={featuredArticles} />
         </div>

         {/* Konten Bawah */}
         <div className="container mx-auto px-4 pt-12">
            <h2 className="text-3xl font-bold text-[#005320] mb-8 border-l-4 border-yellow-400 pl-4">
               Berita Terbaru
            </h2>
            <p className="text-gray-500 italic">
               (Grid berita akan muncul di sini...)
            </p>
         </div>

      </div>
   );
}