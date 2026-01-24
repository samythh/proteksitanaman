// File: src/app/[locale]/profil/fasilitas/page.tsx

import { fetchAPI } from "@/lib/strapi/fetcher";
import FacilitiesListSection from "@/components/sections/FacilitiesListSection";

// --- TYPE DEFINITIONS ---
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

// ✅ Interface Baru untuk Config Halaman
interface FacilitiesPageConfig {
   section_label?: string;
   title_main?: string;
   title_highlight?: string;
   description?: string;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
   const { locale } = await params;
   return {
      title: locale === "en" ? "Facilities - Department" : "Fasilitas - Departemen",
   };
}

export default async function FasilitasPage({
   params,
}: {
   params: Promise<{ locale: string }>;
}) {
   const { locale } = await params;

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   let facilitiesList: any[] = [];
   let pageConfig: FacilitiesPageConfig | null = null;

   try {
      // ✅ Fetching Parallel: List Fasilitas & Config Halaman
      const [facilitiesRes, configRes] = await Promise.all([
         // 1. Fetch List Fasilitas
         fetchAPI("/facilities", {
            locale: locale,
            sort: ["name:asc"],
            populate: {
               images: { fields: ["url", "alternativeText", "width", "height"] },
            },
            pagination: { limit: 100 },
         }),

         // 2. Fetch Config Halaman (Judul, Deskripsi, dll)
         fetchAPI("/facilities-page", {
            locale: locale,
            // Tidak butuh populate karena cuma text field biasa
         }),
      ]);

      // Type Casting
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const facilitiesData = facilitiesRes as StrapiResponse<any[]>;
      const configData = configRes as StrapiResponse<{ attributes: FacilitiesPageConfig }>;

      facilitiesList = facilitiesData?.data || [];
      // Handle struktur Strapi (attributes atau flat)
      pageConfig = configData?.data?.attributes || configData?.data || null;

   } catch (error) {
      console.error("[FasilitasPage Error] Gagal mengambil data:", error);
   }

   return (
      <div className="bg-white min-h-screen pt-16 md:pt-20 pb-20">
         <div className="container mx-auto px-0 relative z-10">
            {/* ✅ Kirim data pageConfig ke Client Component */}
            <FacilitiesListSection
               data={{ facilities: facilitiesList }}
               config={pageConfig}
               locale={locale}
            />
         </div>
      </div>
   );
}