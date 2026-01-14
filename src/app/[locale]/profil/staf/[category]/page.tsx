// File: src/app/[locale]/profil/staf/[category]/page.tsx
import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
import StaffList from "@/components/features/StaffList"; // <-- Komponen Client Scroll
import StaffFilter from "@/components/features/StaffFilter";
import PageHeader from "@/components/ui/PageHeader";
import { Staff } from "@/types/staff";

// Interface Helper untuk Gambar Strapi
interface StrapiImage {
  url?: string;
  data?: {
    attributes?: {
      url?: string;
    };
  };
}

function formatTitle(slug: string) {
  if (slug === "akademik") return "Staf Akademik";
  if (slug === "administrasi") return "Staf Administrasi";
  return "Direktori Staf";
}

export async function generateStaticParams() {
  const params = [];

  // Ambil semua data staff, minta field slug dan category saja agar ringan
  const staffData = await fetchAPI("/staff-members", {
    fields: ["slug", "category"],
    pagination: { limit: -1 }, // Ambil semua data (unlimited)
  });

  const locales = ["id", "en"];
  const categories = ["akademik", "administrasi"];
  for (const locale of locales) {
    for (const category of categories) {
      params.push({ locale, category });
    }
  }
  return params;
}

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
  // Default Meta agar tidak error jika fetch gagal
  let paginationMeta = { pagination: { page: 1, pageCount: 1 } };
  let finalHeroUrl: string | undefined = undefined;
  let cardBannerUrl: string | undefined = undefined;

  // Gunakan 'const' untuk icons (Properties mutated)
  const icons = {
    sinta: undefined as string | undefined,
    scopus: undefined as string | undefined,
    scholar: undefined as string | undefined,
  };

  // --- 2. FETCH DATA (Try-Catch Anti-Crash) ---
  try {
    const [staffData, staffConfig, globalConfig] = await Promise.all([
      // A. Ambil Data Staf (Hanya Halaman 1, isi 6 item)
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
          page: 1, // Mulai dari halaman 1
          pageSize: 6, // Muat 6 data awal
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

    // Isi Data & Meta Pagination
    staffList = staffData?.data || [];
    if (staffData?.meta) {
      paginationMeta = staffData.meta;
    }

    // Ekstraksi Gambar Hero
    const heroData = globalConfig?.data?.Default_Hero_Image as
      | StrapiImage
      | undefined;
    finalHeroUrl = heroData?.url || heroData?.data?.attributes?.url;

    // Ekstraksi Config & Icons
    const configData = staffConfig?.data;

    const bannerObj = configData?.Default_Card_Banner as
      | StrapiImage
      | undefined;
    cardBannerUrl = bannerObj?.url || bannerObj?.data?.attributes?.url;

    const sintaObj = configData?.Icon_Sinta as StrapiImage | undefined;
    icons.sinta = sintaObj?.url || sintaObj?.data?.attributes?.url;

    const scopusObj = configData?.Icon_Scopus as StrapiImage | undefined;
    icons.scopus = scopusObj?.url || scopusObj?.data?.attributes?.url;

    const scholarObj = configData?.Icon_GoogleScholar as
      | StrapiImage
      | undefined;
    icons.scholar = scholarObj?.url || scholarObj?.data?.attributes?.url;
  } catch (error) {
    console.error("[StaffPage Error] Gagal mengambil data:", error);
  }

  const title = formatTitle(category);

  return (
    <div className="bg-white min-h-screen pb-20 -mt-20 md:-mt-24">
      {/* Hero Section */}
      <PageHeader
        title={title}
        breadcrumb={`Profil / Staf / ${title}`}
        backgroundImageUrl={finalHeroUrl}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        {/* Box Filter */}
        <div className="bg-white rounded-t-xl p-8 pb-4 text-center shadow-sm border-b border-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <h3 className="text-xl font-medium text-green-600 mt-1">
            Departemen Proteksi Tanaman
          </h3>
          <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full mb-6"></div>

          <StaffFilter currentCategory={category} locale={locale} />
        </div>

        {/* Staff List Area (Infinite Scroll) */}
        <div className="bg-white p-4 md:p-8 min-h-[400px] rounded-b-xl shadow-sm">
          {staffList.length > 0 ? (
            // Menggunakan Komponen Client Side untuk Logic Scroll
            <StaffList
              initialStaff={staffList}
              category={category}
              locale={locale}
              cardBannerUrl={cardBannerUrl}
              icons={icons}
              initialMeta={paginationMeta} // Penting untuk tahu kapan stop scroll
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
