// File: src/app/[locale]/profil/fasilitas/page.tsx

import { fetchAPI } from "@/lib/strapi/fetcher";
import FacilitiesListSection from "@/components/sections/FacilitiesListSection";
import qs from "qs";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// --- TYPE DEFINITIONS ---
interface FacilityV5 {
  id: number;
  name: string;
  slug: string;
  description: string;
  youtube_id?: string;
  images?: Array<{
    id: number;
    url: string;
    alternativeText?: string;
  }>;
}

interface PageConfigV5 {
  section_label?: string;
  title_main?: string;
  title_highlight?: string;
  description?: string;
}

interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      total: number;
    }
  }
}

// --- 1. GENERATE METADATA (SEO) ---
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FacilitiesPage" }); 

  try {
    const res = await fetchAPI("/facilities-page", { locale }) as StrapiResponse<PageConfigV5>;
    const data = res.data;
    
    return {
      title: data?.title_main || t("title"), 
      description: data?.description || t("section_subtitle"),
    };
  } catch {
    return { title: t("title") };
  }
}

// --- 2. HALAMAN UTAMA ---
export default async function FasilitasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Inisialisasi variabel data kosong
  let facilities: FacilityV5[] = [];
  let pageConfig: PageConfigV5 | null = null;

  try {
    // A. Buat Query String
    const queryFacilities = qs.stringify({
      locale: locale,
      sort: ["name:asc"], 
      populate: ["images"],
      pagination: { page: 1, pageSize: 100 }, 
    }, { encodeValuesOnly: true });

    // B. Fetch Data (Parallel)
    const [facilitiesRes, configRes] = await Promise.all([
      fetchAPI(`/facilities?${queryFacilities}`) as Promise<StrapiResponse<FacilityV5[]>>,
      fetchAPI(`/facilities-page?locale=${locale}`) as Promise<StrapiResponse<PageConfigV5>>,
    ]);

    // C. Masukkan data ke variabel
    facilities = facilitiesRes.data || [];
    pageConfig = configRes.data || null;

  } catch (error) {
    console.error("[FasilitasPage Error]:", error);
    // Jika error, halaman tetap render tapi list kosong (agar tidak crash 500)
  }

  // D. Render Komponen List
  return (
    <div className="bg-white min-h-screen pt-16 md:pt-20 pb-20">
      <div className="container mx-auto px-0 relative z-10">
        
        <FacilitiesListSection
          data={{ facilities }} 
          config={pageConfig}
          locale={locale}
        />
        
      </div>
    </div>
  );
}