// File: src/app/[locale]/profil/fasilitas/[slug]/page.tsx

import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import PageHeader from "@/components/ui/PageHeader";
import FacilityDetail from "@/components/sections/FacilityDetail";
import qs from "qs";
import { Metadata } from "next";

// --- TYPE DEFINITIONS ---

// 1. Tipe Data Dasar (Isi Attributes Raw)
interface FacilityBase {
   name: string;
   slug: string;
   description: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   content?: any;
   youtube_id?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   images?: { data: any[] } | any[];
}

// 2. Tipe Data untuk 'data' utama (Disesuaikan dengan FacilityDetail.tsx prop 'data')
interface NormalizedFacilityData extends Omit<FacilityBase, 'images'> {
   id: number;
   images?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any[];
   };
}

// 3. Tipe Data untuk 'others' (Struktur Legacy/Nested sesuai prop 'others')
interface FacilityItem {
   id: number;
   attributes: {
      name: string;
      slug: string;
      description: string;
      images?: {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         data: any[];
      };
   };
}

// 4. Wrapper Response API Strapi
interface StrapiEntity {
   id: number;
   attributes?: FacilityBase;
   [key: string]: unknown;
}

interface StrapiResponse<T> {
   data: T;
   meta?: Record<string, unknown>;
}

// --- HELPER: Normalisasi ---
function getAttributes(item: StrapiEntity | null | undefined): (FacilityBase & { id: number }) | null {
   if (!item) return null;
   const id = item.id;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const attrs = (item.attributes || item) as any;
   return { id, ...attrs };
}

// --- 1. GENERATE STATIC PARAMS ---
export async function generateStaticParams() {
   try {
      const facilityData = await fetchAPI("/facilities", {
         fields: ["slug"],
         pagination: { limit: 100 },
      }) as StrapiResponse<StrapiEntity[]>;

      const locales = ["id", "en"];
      const params: { locale: string; slug: string }[] = [];

      if (!facilityData?.data) return [];

      facilityData.data.forEach((item) => {
         const data = getAttributes(item);
         if (data?.slug) {
            locales.forEach((locale) => {
               params.push({ locale, slug: data.slug });
            });
         }
      });

      return params;
   } catch (error) {
      console.error("Error generating params for facilities:", error);
      return [];
   }
}

// --- 2. GENERATE METADATA ---
export async function generateMetadata({
   params,
}: {
   params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
   const { slug, locale } = await params;

   const query = qs.stringify({
      filters: { slug: { $eq: slug } },
      locale,
      fields: ['name', 'description'],
   });

   const res = await fetchAPI(`/facilities?${query}`) as StrapiResponse<StrapiEntity[]>;
   const data = getAttributes(res?.data?.[0]);

   if (!data) return { title: "Facility Not Found" };

   return {
      title: data.name,
      description: data.description || `Detail fasilitas: ${data.name}`,
   };
}

// --- 3. HALAMAN UTAMA ---
export default async function FacilityDetailPage({
   params,
}: {
   params: Promise<{ slug: string; locale: string }>;
}) {
   const { slug, locale } = await params;

   // Init Data Containers
   let facility: NormalizedFacilityData | null = null;
   let otherFacilities: FacilityItem[] = [];
   let globalHeroUrl: string | undefined = undefined;

   try {
      // A. Query Detail Fasilitas
      const queryFacility = qs.stringify({
         filters: { slug: { $eq: slug } },
         locale: locale,
         populate: {
            images: { fields: ['url', 'alternativeText', 'width', 'height'] },
         }
      });

      // B. Query Fasilitas Lainnya
      const queryOthers = qs.stringify({
         filters: { slug: { $ne: slug } },
         locale: locale,
         pagination: { limit: 6 },
         sort: ["name:asc"],
         fields: ["name", "slug"],
         populate: {
            images: { fields: ["url"] }
         },
      });

      // C. Fetch Parallel
      const [facilityRes, othersRes, globalRes] = await Promise.all([
         fetchAPI(`/facilities?${queryFacility}`) as Promise<StrapiResponse<StrapiEntity[]>>,
         fetchAPI(`/facilities?${queryOthers}`) as Promise<StrapiResponse<StrapiEntity[]>>,
         fetchAPI("/global", {
            populate: "Default_Hero_Image",
            locale: locale,
         }) as Promise<StrapiResponse<StrapiEntity>>,
      ]);

      // D. Process Detail Data (Normalized)
      const rawFacility = facilityRes?.data?.[0];
      const facilityData = getAttributes(rawFacility);

      if (facilityData) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const flatImages = (facilityData.images as any)?.data || facilityData.images || [];

         facility = {
            id: facilityData.id,
            name: facilityData.name,
            slug: facilityData.slug,
            description: facilityData.description,
            content: facilityData.content,
            youtube_id: facilityData.youtube_id,
            // Struktur yang diminta Component FacilityDetail (prop 'data'):
            images: {
               data: Array.isArray(flatImages) ? flatImages : []
            }
         };
      }

      // E. Process Other Data
      if (othersRes?.data) {
         // Ini memberitahu TypeScript bahwa kita sengaja mengembalikan null jika data invalid
         const mappedOthers = othersRes.data.map((item): FacilityItem | null => {
            const data = getAttributes(item);
            if (!data) return null;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const flatImages = (data.images as any)?.data || data.images || [];

            return {
               id: data.id,
               attributes: {
                  name: data.name,
                  slug: data.slug,
                  description: data.description,
                  images: { data: Array.isArray(flatImages) ? flatImages : [] }
               }
            };
         });

         otherFacilities = mappedOthers.filter((item): item is FacilityItem => item !== null);
      }

      // F. Process Global Hero
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globalRaw = globalRes?.data as any;
      const globalAttr = globalRaw?.attributes || globalRaw;

      globalHeroUrl = getStrapiMedia(
         globalAttr?.Default_Hero_Image?.data?.attributes?.url || globalAttr?.Default_Hero_Image?.url
      ) || undefined;

   } catch (error) {
      console.error("[FacilityDetail] Error fetching data:", error);
   }

   // Handle 404
   if (!facility) return notFound();

   // --- UI Labels ---
   const breadcrumbLabel = locale === "en" ? "Profile / Facilities" : "Profil / Fasilitas";
   const sectionTitle = locale === "en" ? "Facilities" : "Fasilitas";
   const sectionSubtitle = locale === "en" ? "Department" : "Departemen";

   return (
      <div className="bg-white min-h-screen pb-20 -mt-16 relative z-10">
         <PageHeader
            title={facility.name}
            breadcrumb={breadcrumbLabel}
            backgroundImageUrl={globalHeroUrl}
            sectionTitle={sectionTitle}
            sectionSubtitle={sectionSubtitle}
         />

         <FacilityDetail
            data={facility}
            others={otherFacilities}
         />
      </div>
   );
}