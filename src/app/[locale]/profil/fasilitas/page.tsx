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

interface PaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  }
}

interface StrapiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

// --- 1. GENERATE METADATA ---
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

  // --- SETTING PAGINATION ---
  const PAGE_SIZE = 5; 

  let facilities: FacilityV5[] = [];
  let pageConfig: PageConfigV5 | null = null;
  let paginationMeta = { page: 1, pageCount: 1, pageSize: PAGE_SIZE, total: 0 };

  try {
    const queryFacilities = qs.stringify({
      locale: locale,
      sort: ["name:asc"], 
      populate: ["images"],
      pagination: { 
        page: 1, 
        pageSize: PAGE_SIZE 
      }, 
    }, { encodeValuesOnly: true });

    // B. Fetch Data
    const [facilitiesRes, configRes] = await Promise.all([
      fetchAPI(`/facilities?${queryFacilities}`) as Promise<StrapiResponse<FacilityV5[]>>,
      fetchAPI(`/facilities-page?locale=${locale}`) as Promise<StrapiResponse<PageConfigV5>>,
    ]);

    // C. Masukkan data
    facilities = facilitiesRes.data || [];
    pageConfig = configRes.data || null;

    // D. Simpan Metadata 
    if (facilitiesRes.meta?.pagination) {
        paginationMeta = facilitiesRes.meta.pagination;
    }

  } catch (error) {
    console.error("[FasilitasPage Error]:", error);
  }

  // E. Render Komponen List
  return (
    <div className="bg-white min-h-screen pt-16 md:pt-20 pb-20">
      <div className="container mx-auto px-0 relative z-10">
        
        <FacilitiesListSection
          initialData={facilities} 
          config={pageConfig}
          locale={locale}
          initialMeta={{
            page: paginationMeta.page,
            pageCount: paginationMeta.pageCount
          }}
        />
        
      </div>
    </div>
  );
}