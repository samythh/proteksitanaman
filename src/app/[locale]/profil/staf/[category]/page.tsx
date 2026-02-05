// File: src/app/[locale]/profil/staf/[category]/page.tsx

import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import StaffList from "@/components/features/StaffList";
import StaffFilter from "@/components/features/StaffFilter";
import PageHeader from "@/components/ui/PageHeader";
import qs from "qs";
import { Metadata } from "next";
import { Staff } from "@/types/staff";

/** * KONFIGURASI ROUTE
 * Kita hapus "force-dynamic" agar Next.js bisa melakukan optimasi statis saat build.
 * dynamicParams = true memastikan rute baru tetap bisa diakses di runtime.
 * revalidate = 60 memungkinkan halaman diperbarui secara otomatis (ISR).
 */
export const dynamicParams = true;
export const revalidate = 60;

// --- TYPE DEFINITIONS ---

interface MediaField {
  id: number;
  url: string;
}

interface ConfigAttributes {
  Default_Card_Banner?: MediaField;
  default_card_banner?: MediaField;
  Icon_Sinta?: MediaField;
  Icon_Scopus?: MediaField;
  Icon_GoogleScholar?: MediaField;
}

interface ConfigResponse {
  data: {
    attributes?: ConfigAttributes;
  } | null;
}

interface GlobalResponse {
  data: {
    attributes?: {
      Default_Hero_Image?: MediaField;
      default_hero_image?: MediaField;
    };
  } | null;
}

interface StaffListResponse {
  data: Staff[];
  meta: {
    pagination: {
      page: number;
      pageCount: number;
      pageSize: number;
      total: number;
    };
  };
}

// --- HELPERS ---

function extractImageUrl(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const imgData = data as Record<string, any>;

  if (typeof imgData.url === "string")
    return getStrapiMedia(imgData.url) || undefined;

  const nestedAttributes = imgData.data?.attributes || imgData.attributes;
  if (typeof nestedAttributes?.url === "string")
    return getStrapiMedia(nestedAttributes.url) || undefined;

  return undefined;
}

function formatTitle(slug: string, locale: string) {
  if (slug === "akademik")
    return locale === "en" ? "Academic Staff" : "Staf Akademik";
  if (slug === "administrasi")
    return locale === "en" ? "Administrative Staff" : "Staf Administrasi";
  return locale === "en" ? "Staff Directory" : "Direktori Staf";
}

// --- 1. GENERATE STATIC PARAMS ---
// Tetap dibutuhkan untuk optimasi rute navigasi
export async function generateStaticParams() {
  const locales = ["id", "en"];
  const categories = ["akademik", "administrasi"];
  return locales.flatMap((locale) =>
    categories.map((category) => ({ locale, category })),
  );
}

// --- 2. GENERATE METADATA ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  const { category, locale } = await params;
  const title = formatTitle(category, locale);

  return {
    title: `${title} - ${locale === "en" ? "Department" : "Departemen"}`,
    description: `Daftar ${title} di Departemen Proteksi Tanaman.`,
  };
}

// --- 3. MAIN PAGE ---
export default async function StaffPage({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const { category, locale } = await params;

  if (!["akademik", "administrasi"].includes(category)) {
    return notFound();
  }

  // Inisialisasi variabel default agar build tidak crash jika fetch gagal
  let staffList: Staff[] = [];
  let paginationMeta = {
    pagination: { page: 1, pageCount: 1, pageSize: 6, total: 0 },
  };
  let finalHeroUrl: string | undefined = undefined;
  let cardBannerUrl: string | undefined = undefined;
  const icons = { sinta: undefined, scopus: undefined, scholar: undefined };

  try {
    const queryStaff = qs.stringify({
      filters: { category: { $eq: category } },
      populate: {
        photo: { populate: "*" },
        Role_Details: { populate: "*" },
        Education_History: { populate: "*" },
      },
      locale,
      sort: ["name:asc"],
      pagination: { page: 1, pageSize: 6 },
    });

    const queryConfig = qs.stringify({ populate: "*", locale });
    const queryGlobal = qs.stringify({ populate: "*", locale });

    /**
     * FETCH DATA DENGAN TRY-CATCH
     * Membungkus fetch dalam Promise.all agar efisien.
     * Jika terjadi 502 saat build Docker, catch akan menangkapnya sehingga build tetap sukses.
     */
    const [staffRes, configRes, globalRes] = (await Promise.all([
      fetchAPI(`/staff-members?${queryStaff}`),
      fetchAPI(`/staff-page-config?${queryConfig}`),
      fetchAPI(`/global?${queryGlobal}`),
    ])) as [StaffListResponse, ConfigResponse, GlobalResponse];

    // Proses data Staff
    if (staffRes?.data) staffList = staffRes.data;
    if (staffRes?.meta) paginationMeta = staffRes.meta;

    // Proses data Config
    const configData = configRes?.data?.attributes || configRes?.data;
    if (configData) {
      const rawConfig = configData as Record<string, any>;
      cardBannerUrl = extractImageUrl(
        rawConfig.Default_Card_Banner || rawConfig.default_card_banner,
      );
      icons.sinta = extractImageUrl(
        rawConfig.Icon_Sinta || rawConfig.icon_sinta,
      ) as any;
      icons.scopus = extractImageUrl(
        rawConfig.Icon_Scopus || rawConfig.icon_scopus,
      ) as any;
      icons.scholar = extractImageUrl(
        rawConfig.Icon_GoogleScholar || rawConfig.icon_googlescholar,
      ) as any;
    }

    // Proses data Hero
    const globalData = globalRes?.data?.attributes || globalRes?.data;
    if (globalData) {
      const rawGlobal = globalData as Record<string, any>;
      finalHeroUrl = extractImageUrl(
        rawGlobal.Default_Hero_Image || rawGlobal.default_hero_image,
      );
    }
  } catch (error) {
    // Memberikan log tanpa menghentikan proses build Docker
    console.error(
      `[StaffPage Build Notice] Strapi API belum dapat dijangkau untuk kategori: ${category}. Halaman akan di-render secara dinamis di server.`,
    );
  }

  const title = formatTitle(category, locale);
  const subtitle =
    locale === "en"
      ? "Department of Plant Protection"
      : "Departemen Proteksi Tanaman";

  return (
    <div className="bg-white min-h-screen pb-20 -mt-20 md:-mt-24">
      <PageHeader
        title={title}
        breadcrumb={`${locale === "en" ? "Profile" : "Profil"} / ${locale === "en" ? "Staff" : "Staf"} / ${title}`}
        backgroundImageUrl={finalHeroUrl}
        sectionTitle={title}
        sectionSubtitle={subtitle}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="bg-white rounded-t-xl p-8 pt-6 pb-4 text-center shadow-sm border-b border-gray-50">
          <StaffFilter currentCategory={category} locale={locale} />
        </div>

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
                {locale === "en"
                  ? `No data for ${title}`
                  : `Belum ada data untuk ${title}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
