// File: src/app/[locale]/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
import SectionRenderer from "@/components/strapi/section-renderer";

// --- TYPES DEFINITION ---

interface StrapiImage {
   url?: string;
   data?: { attributes?: { url?: string } };
}

// Tipe untuk Blocks/Sections (Dynamic Zone)
// Kita menggunakan 'any' secara eksplisit di sini karena struktur blok Strapi sangat variatif
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StrapiBlock = any;

// Interface untuk menampung data halaman yang sudah dinormalisasi
interface PageData {
   slug?: string;
   blocks?: StrapiBlock[];
   attributes?: {
      slug?: string;
      blocks?: StrapiBlock[];
   };
   // Mengizinkan properti lain (index signature) untuk fleksibilitas data Strapi
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   [key: string]: any;
}

export async function generateStaticParams() {
   try {
      const pages = await fetchAPI("/pages", {
         fields: ["slug"],
         pagination: { limit: -1 },
      });

      const params = [];
      const locales = ["id", "en"];

      if (pages?.data) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         for (const page of pages.data as any[]) {
            const slug = page.slug || page.attributes?.slug;
            for (const locale of locales) {
               if (slug) params.push({ slug, locale });
            }
         }
      }
      return params;
   } catch (error) {
      console.error("Error generating params:", error);
      return [];
   }
}

export default async function DynamicPage({
   params,
}: {
   params: Promise<{ slug: string; locale: string }>;
}) {
   const { slug, locale } = await params;

   // --- FETCH DATA ---
   // PERBAIKAN: Mengganti 'any' dengan interface PageData atau null
   let pageData: PageData | null = null;
   let globalHeroUrl: string | undefined = undefined;

   try {
      const [pageRes, globalRes] = await Promise.all([
         // A. Ambil Halaman berdasarkan Slug
         fetchAPI("/pages", {
            filters: { slug: { $eq: slug } },
            populate: {
               blocks: {
                  populate: "*"
               },
            },
            locale: locale,
         }),

         // B. Ambil Global Config
         fetchAPI("/global", {
            populate: "Default_Hero_Image",
            locale: locale,
         }),
      ]);

      if (!pageRes.data || pageRes.data.length === 0) {
         return notFound();
      }

      const rawPage = pageRes.data[0];

      // Normalisasi: Handle Strapi v4 (attributes) vs v5 (flat)
      pageData = rawPage.attributes ? rawPage.attributes : rawPage;

      const globalImg = globalRes?.data?.Default_Hero_Image as StrapiImage | undefined;
      globalHeroUrl = globalImg?.url || globalImg?.data?.attributes?.url;

   } catch (error) {
      console.error("[DynamicPage] Error:", error);
      return notFound();
   }

   // Normalisasi Blocks
   const sections = pageData?.blocks || pageData?.attributes?.blocks || [];

   const globalDataForRenderer = {
      locale: locale,
      globalHeroUrl: globalHeroUrl,
      articles: []
   };

   return (
      <main className="min-h-screen bg-white pb-20 -mt-20 md:-mt-24">
         {/* Pastikan SectionRenderer menerima data yang sesuai.
         Biasanya SectionRenderer menangani 'any' untuk props sections.
      */}
         <SectionRenderer
            sections={sections}
            globalData={globalDataForRenderer}
         />
      </main>
   );
}