// File: src/app/[locale]/profil/staf/[category]/page.tsx

import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
import StaffList from "@/components/features/StaffList";
import StaffFilter from "@/components/features/StaffFilter";
import PageHeader from "@/components/ui/PageHeader";
import { Staff } from "@/types/staff";

// --- TYPE DEFINITIONS ---

// Interface Helper untuk Gambar Strapi (Nested vs Flat)
interface StrapiImage {
  url?: string;
  data?: {
    attributes?: {
      url?: string;
    };
  } | null;
}

// Interface Response Wrapper (Generics)
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

// Interface Config Halaman
interface PageConfigData {
  attributes?: {
    Default_Card_Banner?: StrapiImage;
    Icon_Sinta?: StrapiImage;
    Icon_Scopus?: StrapiImage;
    Icon_GoogleScholar?: StrapiImage;
  };
  // Fallback flattened structure
  Default_Card_Banner?: StrapiImage;
  Icon_Sinta?: StrapiImage;
  Icon_Scopus?: StrapiImage;
  Icon_GoogleScholar?: StrapiImage;
}

// Interface Global Data
interface GlobalData {
  attributes?: {
    Default_Hero_Image?: StrapiImage;
  };
  Default_Hero_Image?: StrapiImage;
}

function formatTitle(slug: string) {
  if (slug === "akademik") return "Staf Akademik";
  if (slug === "administrasi") return "Staf Administrasi";
  return "Direktori Staf";
}

// 1. Generate Static Params
export async function generateStaticParams() {
  const params = [];
  
  // FIX: Menghapus fetchAPI yang tidak digunakan agar variable unused hilang
  // Data kategori sudah didefinisikan manual di bawah
  
  const locales = ["id", "en"];
  const categories = ["akademik", "administrasi"];

  for (const locale of locales) {
    for (const category of categories) {
      params.push({ locale, category });
    }
  }
  return params;
}

// 2. Halaman Utama
export default async function StaffPage({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const { category, locale } = await params;

  if (!["akademik", "administrasi"].includes(category)) {
    return notFound();
  }

  // --- 1. INISIALISASI VARIABEL ---
  let staffList: Staff[] = [];
  let paginationMeta = { pagination: { page: 1, pageCount: 1, pageSize: 6, total: 0 } };
  let finalHeroUrl: string | undefined = undefined;
  let cardBannerUrl: string | undefined = undefined;

  const icons = {
    sinta: undefined as string | undefined,
    scopus: undefined as string | undefined,
    scholar: undefined as string | undefined,
  };

  // --- 2. FETCH DATA ---
  try {
    const [staffRes, configRes, globalRes] = await Promise.all([
      // A. Ambil Data Staf
      fetchAPI("/staff-members", {
        filters: { category: { $eq: category } },
        populate: {
          photo: { fields: ["url"] },
          Role_Details: { populate: "*" },
          Education_History: { populate: "*" },
        },
        locale: locale,
        sort: ["name:asc"],
        pagination: {
          page: 1,
          pageSize: 6,
        },
      }),

      // B. Config Halaman
      fetchAPI("/staff-page-config", {
        populate: {
          Default_Card_Banner: { fields: ["url"] },
          Icon_Sinta: { fields: ["url"] },
          Icon_Scopus: { fields: ["url"] },
          Icon_GoogleScholar: { fields: ["url"] },
        },
        locale: locale,
      }),

      // C. Config Global
      fetchAPI("/global", {
        populate: "Default_Hero_Image",
        locale: locale,
      }),
    ]);

    // Type Casting Response
    const staffData = staffRes as StrapiResponse<Staff[]>;
    const staffConfig = configRes as StrapiResponse<PageConfigData>;
    const globalConfig = globalRes as StrapiResponse<GlobalData>;

    // Isi Data Staf
    staffList = staffData?.data || [];
    if (staffData?.meta) {
      paginationMeta = staffData.meta;
    }

    // Ekstraksi Gambar Hero (Support Flat & Nested)
    const globalAttr = globalConfig?.data?.attributes || globalConfig?.data;
    const heroData = globalAttr?.Default_Hero_Image;
    finalHeroUrl = heroData?.url || heroData?.data?.attributes?.url;

    // Ekstraksi Config Halaman
    const configData = staffConfig?.data?.attributes || staffConfig?.data;

    const bannerObj = configData?.Default_Card_Banner;
    cardBannerUrl = bannerObj?.url || bannerObj?.data?.attributes?.url;

    const sintaObj = configData?.Icon_Sinta;
    icons.sinta = sintaObj?.url || sintaObj?.data?.attributes?.url;

    const scopusObj = configData?.Icon_Scopus;
    icons.scopus = scopusObj?.url || scopusObj?.data?.attributes?.url;

    const scholarObj = configData?.Icon_GoogleScholar;
    icons.scholar = scholarObj?.url || scholarObj?.data?.attributes?.url;

  } catch (error) {
    console.error("[StaffPage Error] Gagal mengambil data:", error);
  }

  const title = formatTitle(category);

  return (
    <div className="bg-white min-h-screen pb-20 -mt-20 md:-mt-24">

      {/* 1. PageHeader Paket Lengkap */}
      <PageHeader
        title={title}
        breadcrumb={`Profil / Staf / ${title}`}
        backgroundImageUrl={finalHeroUrl}
        sectionTitle={title}
        sectionSubtitle="Departemen Proteksi Tanaman"
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 relative z-10">

        {/* Box Filter */}
        <div className="bg-white rounded-t-xl p-8 pt-6 pb-4 text-center shadow-sm border-b border-gray-50">
          <StaffFilter currentCategory={category} locale={locale} />
        </div>

        {/* Staff List Area */}
        <div className="bg-white p-4 md:p-8 min-h-[400px] rounded-b-xl shadow-sm">
          {staffList.length > 0 ? (
            <StaffList
              initialStaff={staffList}
              category={category}
              locale={locale}
              cardBannerUrl={cardBannerUrl}
              icons={icons}
              initialMeta={paginationMeta}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-lg font-medium">
                Belum ada data untuk {title}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}