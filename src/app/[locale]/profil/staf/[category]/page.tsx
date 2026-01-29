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

// --- TYPE DEFINITIONS ---

// Define specific shapes for the API responses
interface MediaField {
  id: number;
  url: string;
  // Add other media fields if needed
}

// Config Response Structure
interface ConfigAttributes {
  Default_Card_Banner?: MediaField;
  default_card_banner?: MediaField;
  Icon_Sinta?: MediaField;
  icon_sinta?: MediaField;
  Icon_Scopus?: MediaField;
  icon_scopus?: MediaField;
  Icon_GoogleScholar?: MediaField;
  icon_googlescholar?: MediaField;
}

interface ConfigResponse {
  data: {
    attributes?: ConfigAttributes;
    // Handle flattened structure too
    Default_Card_Banner?: MediaField;
    Icon_Sinta?: MediaField;
    Icon_Scopus?: MediaField;
    Icon_GoogleScholar?: MediaField;
  } | null;
}

// Global Response Structure
interface GlobalAttributes {
  Default_Hero_Image?: MediaField;
  default_hero_image?: MediaField;
}

interface GlobalResponse {
  data: {
    attributes?: GlobalAttributes;
    // Handle flattened structure
    Default_Hero_Image?: MediaField;
  } | null;
}

// Staff List Response Structure
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

// Helper to extract image URL safely from various possible structures
function extractImageUrl(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  // Type assertion for easier access since we are checking properties manually
  const imgData = data as Record<string, unknown>;

  // 1. Check for direct URL (Flat structure / Strapi v5 / JSON provided)
  if (typeof imgData.url === 'string') {
    return getStrapiMedia(imgData.url) || undefined;
  }

  // 2. Check for Nested Strapi v4 standard: data.attributes.url
  const nestedData = imgData.data as Record<string, unknown> | undefined;
  const nestedAttributes = nestedData?.attributes as Record<string, unknown> | undefined;
  if (typeof nestedAttributes?.url === 'string') {
    return getStrapiMedia(nestedAttributes.url) || undefined;
  }

  // 3. Check for intermediate Attributes: attributes.url
  const directAttributes = imgData.attributes as Record<string, unknown> | undefined;
  if (typeof directAttributes?.url === 'string') {
    return getStrapiMedia(directAttributes.url) || undefined;
  }

  return undefined;
}

function formatTitle(slug: string, locale: string) {
  if (slug === "akademik") return locale === "en" ? "Academic Staff" : "Staf Akademik";
  if (slug === "administrasi") return locale === "en" ? "Administrative Staff" : "Staf Administrasi";
  return locale === "en" ? "Staff Directory" : "Direktori Staf";
}

// --- 1. GENERATE STATIC PARAMS ---
export async function generateStaticParams() {
  const locales = ["id", "en"];
  const categories = ["akademik", "administrasi"];
  return locales.flatMap((locale) =>
    categories.map((category) => ({ locale, category }))
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

  // Init Variables
  let staffList: Staff[] = [];
  let paginationMeta = { pagination: { page: 1, pageCount: 1, pageSize: 6, total: 0 } };

  let finalHeroUrl: string | undefined = undefined;
  let cardBannerUrl: string | undefined = undefined;

  const icons = {
    sinta: undefined as string | undefined,
    scopus: undefined as string | undefined,
    scholar: undefined as string | undefined,
  };

  try {
    // --- QUERY BUILDER ---

    // 1. Staff List (Collection Type)
    const queryStaff = qs.stringify({
      filters: { category: { $eq: category } },
      populate: {
        photo: { populate: "*" },
        Role_Details: { populate: "*" },
        Education_History: { populate: "*" },
      },
      locale: locale,
      sort: ["name:asc"],
      pagination: { page: 1, pageSize: 6 },
    });

    // 2. Config & Global (Single Type)
    const queryConfig = qs.stringify({
      populate: "*",
      locale: locale,
    });

    const queryGlobal = qs.stringify({
      populate: "*",
      locale: locale,
    });

    // --- FETCH DATA ---
    // Explicitly cast the Promise.all result to a tuple of expected types
    const [staffRes, configRes, globalRes] = await Promise.all([
      fetchAPI(`/staff-members?${queryStaff}`),
      fetchAPI(`/staff-page-config?${queryConfig}`),
      fetchAPI(`/global?${queryGlobal}`),
    ]) as [StaffListResponse, ConfigResponse, GlobalResponse];

    // --- PROCESS STAFF LIST ---
    if (staffRes?.data) {
      staffList = staffRes.data;
    }
    if (staffRes?.meta) {
      paginationMeta = staffRes.meta;
    }

    // --- PROCESS CONFIG ---
    // Use the type-safe response structure
    const configData = configRes?.data?.attributes || configRes?.data;

    if (configData) {
      // Cast to unknown to allow checking for both CamelCase and snake_case properties
      // safely without TypeScript complaining about properties missing on specific interface types.
      // This is safe because extractImageUrl handles validation.
      const rawConfig = configData as Record<string, unknown>;

      const bannerData = rawConfig.Default_Card_Banner || rawConfig.default_card_banner;
      const sintaData = rawConfig.Icon_Sinta || rawConfig.icon_sinta;
      const scopusData = rawConfig.Icon_Scopus || rawConfig.icon_scopus;
      const scholarData = rawConfig.Icon_GoogleScholar || rawConfig.icon_googlescholar;

      cardBannerUrl = extractImageUrl(bannerData);
      icons.sinta = extractImageUrl(sintaData);
      icons.scopus = extractImageUrl(scopusData);
      icons.scholar = extractImageUrl(scholarData);
    }

    // --- PROCESS HERO ---
    const globalData = globalRes?.data?.attributes || globalRes?.data;
    if (globalData) {
      const rawGlobal = globalData as Record<string, unknown>;
      const heroData = rawGlobal.Default_Hero_Image || rawGlobal.default_hero_image;
      finalHeroUrl = extractImageUrl(heroData);
    }

  } catch (error) {
    console.error("[StaffPage Error] Failed to fetch data:", error);
  }

  const title = formatTitle(category, locale);
  const subtitle = locale === "en" ? "Department of Plant Protection" : "Departemen Proteksi Tanaman";

  return (
    <div className="bg-white min-h-screen pb-20 -mt-20 md:-mt-24">
      <PageHeader
        title={title}
        breadcrumb={`${locale === 'en' ? 'Profile' : 'Profil'} / ${locale === 'en' ? 'Staff' : 'Staf'} / ${title}`}
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
                {locale === "en" ? `No data for ${title}` : `Belum ada data untuk ${title}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}