// File: src/app/[locale]/risetdanpublikasi/publikasiilmiah/page.tsx

import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Metadata } from "next";
import qs from "qs";
import PublicationSection from "@/components/sections/PublicationSection";
import PageHeader from "@/components/ui/PageHeader";

// --- HELPER ---
function extractImageUrl(data: unknown): string | undefined {
   if (!data || typeof data !== 'object') return undefined;
   const imgData = data as Record<string, unknown>;

   if (typeof imgData.url === 'string') return getStrapiMedia(imgData.url) || undefined;

   const nestedData = imgData.data as Record<string, unknown> | undefined;
   const nestedAttributes = nestedData?.attributes as Record<string, unknown> | undefined;
   if (typeof nestedAttributes?.url === 'string') return getStrapiMedia(nestedAttributes.url) || undefined;

   const directAttributes = imgData.attributes as Record<string, unknown> | undefined;
   if (typeof directAttributes?.url === 'string') return getStrapiMedia(directAttributes.url) || undefined;

   return undefined;
}

// --- TYPE DEFINITIONS ---
interface StrapiResponse {
   data: Array<{
      id: number;
      attributes: {
         title: string;
         subtitle?: string;
         slug: string;
      };
   }>;
}

interface GlobalResponse {
   data: {
      attributes?: {
         [key: string]: unknown;
      };
      [key: string]: unknown;
   } | null;
}

// --- KONFIGURASI ---
const PAGE_SLUG = "publikasi-ilmiah";

// --- 1. GENERATE METADATA ---
export async function generateMetadata({
   params,
}: {
   params: Promise<{ locale: string }>;
}): Promise<Metadata> {
   const { locale } = await params;

   const pageQuery = qs.stringify({
      locale,
      filters: { slug: { $eq: PAGE_SLUG } },
   });

   const pageRes = await fetchAPI(`/pages?${pageQuery}`) as StrapiResponse;
   const pageData = pageRes?.data?.[0]?.attributes;

   return {
      title: pageData?.title || "Publikasi Ilmiah",
      description: pageData?.subtitle || "Daftar publikasi ilmiah departemen",
   };
}

// --- 2. HALAMAN UTAMA ---
export default async function PublikasiIlmiahPage({
   params,
}: {
   params: Promise<{ locale: string }>;
}) {
   const { locale } = await params;

   // Variables Init
   let pageTitle = "Publikasi Ilmiah";
   let pageSubtitle = "Daftar publikasi ilmiah departemen";
   let finalHeroUrl: string | undefined = undefined;

   // --- QUERY BUILDER ---
   const queryPage = qs.stringify({
      locale,
      filters: { slug: { $eq: PAGE_SLUG } },
   });

   const queryGlobal = qs.stringify({
      populate: "*",
      locale,
   });

   const queryPublications = qs.stringify({
      locale,
      sort: ["year:desc", "title:asc"],
      populate: ["image"],
      pagination: { page: 1, pageSize: 8 },
   });

   try {
      // --- FETCH DATA ---
      const pageRes = await fetchAPI(`/pages?${queryPage}`) as StrapiResponse;
      const pageData = pageRes?.data?.[0]?.attributes;
      if (pageData) {
         pageTitle = pageData.title || pageTitle;
         pageSubtitle = pageData.subtitle || pageSubtitle;
      }

      const globalRes = await fetchAPI(`/global?${queryGlobal}`) as GlobalResponse;
      const globalData = globalRes?.data?.attributes || globalRes?.data;

      if (globalData) {
         const rawGlobal = globalData as Record<string, unknown>;
         const heroData = rawGlobal.Default_Hero_Image || rawGlobal.default_hero_image;
         finalHeroUrl = extractImageUrl(heroData);
      }

   } catch (err) {
      console.error("Error fetching data:", err);
   }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const publicationsRes = await fetchAPI(`/publications?${queryPublications}`) as any;
   const initialItems = publicationsRes?.data || [];
   const paginationMeta = publicationsRes?.meta?.pagination;

   const sectionConfig = { title: "", subtitle: "" };

   // --- RENDER ---
   return (
      <div className="bg-white min-h-screen pb-20 -mt-20 md:-mt-24">

         <PageHeader
            title={pageTitle}
            breadcrumb="Riset dan Publikasi / Publikasi Ilmiah"
            backgroundImageUrl={finalHeroUrl}
            sectionTitle=""
            sectionSubtitle=""
         />

         <div className="container mx-auto px-4 relative z-10">

            <div className="mt-8 bg-white rounded-t-xl px-4 pt-8 pb-8 shadow-sm border-t border-gray-50 overflow-hidden">

               <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
                     {pageTitle}
                  </h2>
                  <h3 className="text-lg md:text-xl font-medium text-[#005320] mt-2">
                     {pageSubtitle}
                  </h3>
                  <div className="w-20 h-1.5 bg-[#005320] mx-auto mt-4 rounded-full"></div>
               </div>

               <div className="mt-6">
                  <PublicationSection
                     initialData={initialItems}
                     config={sectionConfig}
                     locale={locale}
                     initialMeta={paginationMeta}
                  />
               </div>

            </div>
         </div>
      </div>
   );
}