// File: src/app/[locale]/profil/fasilitas/page.tsx

import { fetchAPI } from "@/lib/strapi/fetcher";
import PageHeader from "@/components/ui/PageHeader";
import FacilitiesListSection from "@/components/sections/FacilitiesListSection";

// --- TYPE DEFINITIONS (Mengikuti Gaya Staff Page) ---

interface StrapiImage {
   url?: string;
   data?: {
      attributes?: {
         url?: string;
      };
   } | null;
}

interface StrapiResponse<T> {
   data: T;
   meta?: {
      pagination: {
         page: number;
         pageCount: number;
         pageSize: number;
         total: number;
      };
   };
}

interface GlobalData {
   attributes?: {
      Default_Hero_Image?: StrapiImage;
   };
   Default_Hero_Image?: StrapiImage;
}

// 1. Generate Metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
   const { locale } = await params;
   return {
      title: locale === "en" ? "Facilities - Department" : "Fasilitas - Departemen",
   };
}

// 2. Halaman Utama Fasilitas
export default async function FasilitasPage({
   params,
}: {
   params: Promise<{ locale: string }>;
}) {
   const { locale } = await params;

   // --- 1. INISIALISASI VARIABEL ---
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   let facilitiesList: any[] = [];
   let finalHeroUrl: string | undefined = undefined;

   // --- 2. FETCH DATA ---
   try {
      const [facilitiesRes, globalRes] = await Promise.all([
         // A. Ambil Data Fasilitas
         fetchAPI("/facilities", {
            locale: locale,
            sort: ["name:asc"],
            populate: {
               images: {
                  fields: ["url", "alternativeText", "width", "height"],
               },
            },
            pagination: { limit: 100 },
         }),

         // B. Config Global (Untuk Hero Image)
         fetchAPI("/global", {
            populate: "Default_Hero_Image",
            locale: locale,
         }),
      ]);

      // Type Casting & Assignment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const facilitiesData = facilitiesRes as StrapiResponse<any[]>;
      const globalConfig = globalRes as StrapiResponse<GlobalData>;

      facilitiesList = facilitiesData?.data || [];

      // Ekstraksi Gambar Hero (Gaya Staff Page)
      const globalAttr = globalConfig?.data?.attributes || globalConfig?.data;
      const heroData = globalAttr?.Default_Hero_Image;
      finalHeroUrl = heroData?.url || heroData?.data?.attributes?.url;

   } catch (error) {
      console.error("[FasilitasPage Error] Gagal mengambil data:", error);
   }

   const pageTitle = locale === "en" ? "Facilities" : "Fasilitas";

   return (
      <div className="bg-white min-h-screen pb-20 -mt-20 md:-mt-24">

         {/* HEADER: Menggunakan Format String seperti Staff Page */}
         <PageHeader
            title={pageTitle}
            breadcrumb={`Profil / ${pageTitle}`}
            backgroundImageUrl={finalHeroUrl}
            sectionTitle="Profil"
            sectionSubtitle={pageTitle}
         />

         {/* Main Content */}
         <div className="container mx-auto px-4 relative z-10">
            <FacilitiesListSection
               data={{ facilities: facilitiesList }}
               locale={locale}
            />
         </div>
      </div>
   );
}