// File: src/app/[locale]/profil/fasilitas/[slug]/page.tsx

import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
// PERBAIKAN: Import 'getStrapiMedia' dihapus karena tidak dipakai
import PageHeader from "@/components/ui/PageHeader";
import FacilityDetail from "@/components/sections/FacilityDetail";
import qs from "qs";

// --- TYPE DEFINITIONS ---
interface StrapiImage {
   url?: string;
   data?: {
      attributes?: {
         url?: string;
      };
   } | null;
}

interface GlobalData {
   attributes?: {
      Default_Hero_Image?: StrapiImage;
   };
   Default_Hero_Image?: StrapiImage;
}

// 1. Generate Static Params
export async function generateStaticParams() {
   const facilityData = await fetchAPI("/facilities", {
      fields: ["slug"],
      pagination: { limit: 100 },
   });

   const locales = ["id", "en"];
   const params = [];

   if (!facilityData?.data) return [];

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   for (const item of facilityData.data as any[]) {
      const attr = item.attributes || item;
      if (attr.slug) {
         for (const locale of locales) {
            params.push({ locale, slug: attr.slug });
         }
      }
   }
   return params;
}

// 2. Halaman Detail Fasilitas
export default async function FacilityDetailPage({
   params,
}: {
   params: Promise<{ slug: string; locale: string }>;
}) {
   const { slug, locale } = await params;

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   let facility: any | null = null;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   let otherFacilities: any[] = [];
   let globalData: GlobalData | null = null;

   try {
      // A. Query Detail Fasilitas (Sesuai Locale)
      const queryFacility = qs.stringify({
         filters: { slug: { $eq: slug } },
         locale: locale,
         fields: ['name', 'slug', 'description', 'content', 'youtube_id'],
         populate: {
            images: { fields: ['url', 'alternativeText', 'width', 'height'] },
         }
      });

      // B. Query Fasilitas Lainnya (Sidebar)
      const queryOthers = qs.stringify({
         filters: { slug: { $ne: slug } },
         locale: locale,
         pagination: { limit: 5 },
         sort: ["name:asc"],
         fields: ["name", "slug"],
         populate: {
            images: { fields: ["url"] }
         },
      });

      const [facilityRes, othersRes, globalRes] = await Promise.all([
         fetchAPI(`/facilities?${queryFacility}`),
         fetchAPI(`/facilities?${queryOthers}`),
         fetchAPI("/global", {
            populate: "Default_Hero_Image",
            locale: locale,
         }),
      ]);

      facility = facilityRes?.data?.[0] || null;
      otherFacilities = othersRes?.data || [];
      globalData = globalRes?.data;

   } catch (error) {
      console.error("[FacilityDetail] Error fetching data:", error);
   }

   // Jika data tidak ditemukan di locale ini, return 404
   if (!facility) {
      return notFound();
   }

   // --- Ekstraksi Data ---
   const attr = facility.attributes || facility;
   const name = attr.name || "";

   // Helper URL Global Hero (Manual, tidak pakai getStrapiMedia)
   const getUrl = (obj: StrapiImage | undefined | null) =>
      obj?.url || obj?.data?.attributes?.url;

   const globalAttr = globalData?.attributes || globalData;
   const heroUrl = getUrl(
      globalAttr?.Default_Hero_Image || globalAttr?.Default_Hero_Image
   );

   // Normalisasi Data
   const sanitizedData = {
      ...facility,
      attributes: {
         ...attr,
         youtube_id: attr.youtube_id || null
      }
   };

   const breadcrumbLabel = locale === "en" ? "Profile / Facilities / Detail" : "Profil / Fasilitas / Detail";
   const sectionTitle = locale === "en" ? "Facilities" : "Fasilitas";

   return (
      <div className="bg-white min-h-screen pb-20 -mt-20 md:-mt-24">

         <PageHeader
            title={name}
            breadcrumb={breadcrumbLabel}
            backgroundImageUrl={heroUrl}
            sectionTitle={sectionTitle}
            sectionSubtitle="Departemen"
         />

         <FacilityDetail
            data={sanitizedData}
            others={otherFacilities}
            locale={locale}
         />

      </div>
   );
}