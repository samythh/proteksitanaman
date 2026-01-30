// File: src/app/[locale]/profil/fasilitas/[slug]/page.tsx

import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import PageHeader from "@/components/ui/PageHeader";
import FacilityDetail from "@/components/sections/FacilityDetail";
import qs from "qs";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// --- TYPE DEFINITIONS ---

interface StrapiImage {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
}

interface LegacyImageFormat {
  id: number;
  attributes: {
    url: string;
    alternativeText?: string;
    caption?: string;
    width?: number;
    height?: number;
  };
}

interface NormalizedFacilityData {
  id: number;
  name: string;
  slug: string;
  description: string;
  content?: unknown;
  youtube_id?: string;
  images: {
    data: LegacyImageFormat[];
  };
}

interface FacilityItem {
  id: number;
  attributes: {
    name: string;
    slug: string;
    description: string;
    images: {
      data: LegacyImageFormat[];
    };
  };
}

interface StrapiEntity {
  id: number;
  attributes?: {
    name?: string;
    slug?: string;
    description?: string;
    content?: unknown;
    youtube_id?: string;
    images?: unknown;
    Default_Hero_Image?: unknown;
  };
  name?: string;
  slug?: string;
  description?: string;
  content?: unknown;
  youtube_id?: string;
  images?: unknown;
  Default_Hero_Image?: unknown;
}

interface StrapiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

// --- HELPER: Image Extractor ---
function extractImages(imageData: unknown): StrapiImage[] {
  if (!imageData) return [];
  
  if (typeof imageData === 'object' && 'data' in imageData && Array.isArray((imageData as { data: unknown[] }).data)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (imageData as { data: any[] }).data.map((img) => ({
      id: img.id,
      url: img.attributes?.url || img.url,
      alternativeText: img.attributes?.alternativeText || img.alternativeText,
      caption: img.attributes?.caption || img.caption,
    }));
  }

  if (Array.isArray(imageData)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return imageData.map((img: any) => ({
      id: img.id,
      url: img.attributes?.url || img.url,
      alternativeText: img.attributes?.alternativeText || img.alternativeText,
      caption: img.attributes?.caption || img.caption,
    }));
  }

  return [];
}

// --- HELPER: Normalisasi Data ---
function normalizeData(item: StrapiEntity): NormalizedFacilityData | null {
  if (!item) return null;
  
  const attrs = item.attributes || item;
  const id = item.id;

  // 1. Ambil data gambar bersih (Flat)
  const cleanImages = extractImages(attrs.images);

  // 2. Konversi ke Legacy Format (Nested) 
  const legacyImages: LegacyImageFormat[] = cleanImages.map(img => ({
    id: img.id,
    attributes: {
      url: img.url,
      alternativeText: img.alternativeText,
      caption: img.caption,
      width: img.width,
      height: img.height
    }
  }));

  return {
    id,
    name: attrs.name || "",
    slug: attrs.slug || "",
    description: attrs.description || "",
    content: attrs.content,
    youtube_id: attrs.youtube_id,
    images: {
      data: legacyImages 
    }
  };
}

// --- 1. GENERATE STATIC PARAMS ---
export async function generateStaticParams() {
  try {
    const facilityData = await fetchAPI("/facilities", {
      fields: ["slug"],
      pagination: { limit: 100 },
    }) as StrapiResponse<StrapiEntity[]>;

    if (!facilityData?.data) return [];

    const locales = ["id", "en"];
    const params: { locale: string; slug: string }[] = [];

    facilityData.data.forEach((item) => {
      const attrs = item.attributes || item;
      if (attrs.slug) {
        locales.forEach((locale) => {
          params.push({ locale, slug: attrs.slug || "" });
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
  const t = await getTranslations({ locale, namespace: "FacilityDetail" });

  const query = qs.stringify({
    filters: { slug: { $eq: slug } },
    locale,
    fields: ['name', 'description'],
  }, { encodeValuesOnly: true });

  const res = await fetchAPI(`/facilities?${query}`) as StrapiResponse<StrapiEntity[]>;
  const raw = res?.data?.[0];
  const data = raw ? (raw.attributes || raw) : null;

  if (!data) return { title: "Facility Not Found" };

  return {
    title: data.name,
    description: data.description || `${t('meta_desc_prefix')} ${data.name}`,
  };
}

// --- 3. HALAMAN UTAMA ---
export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "FacilityDetail" });

  let facility: NormalizedFacilityData | null = null;
  let otherFacilities: FacilityItem[] = [];
  let globalHeroUrl: string | undefined = undefined;

  try {
    // A. Query
    const queryFacility = qs.stringify({
      filters: { slug: { $eq: slug } },
      locale: locale,
      populate: ["images"], 
    }, { encodeValuesOnly: true });

    const queryOthers = qs.stringify({
      filters: { slug: { $ne: slug } },
      locale: locale,
      pagination: { limit: 6 },
      sort: ["name:asc"],
      populate: ["images"],
    }, { encodeValuesOnly: true });

    // B. Fetch
    const [facilityRes, othersRes, globalRes] = await Promise.all([
      fetchAPI(`/facilities?${queryFacility}`) as Promise<StrapiResponse<StrapiEntity[]>>,
      fetchAPI(`/facilities?${queryOthers}`) as Promise<StrapiResponse<StrapiEntity[]>>,
      fetchAPI("/global", {
        populate: "Default_Hero_Image",
        locale: locale,
      }) as Promise<StrapiResponse<StrapiEntity>>,
    ]);

    // C. Process Detail
    const rawFacility = facilityRes?.data?.[0];
    if (rawFacility) {
      facility = normalizeData(rawFacility);
    }

    // D. Process Others 
    if (othersRes?.data && Array.isArray(othersRes.data)) {
      const mappedOthers = othersRes.data.map((item): FacilityItem | null => {
        const normalized = normalizeData(item);
        if (!normalized) return null;

        return {
          id: normalized.id,
          attributes: {
            name: normalized.name,
            slug: normalized.slug,
            description: normalized.description,
            images: normalized.images 
          }
        };
      });

      otherFacilities = mappedOthers.filter((item): item is FacilityItem => item !== null);
    }

    // E. Process Global Hero
    const globalRaw = globalRes?.data;
    if (globalRaw) {
       const globalAttr = globalRaw.attributes || globalRaw;
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       const heroData = (globalAttr.Default_Hero_Image as any); 
       const heroUrl = heroData?.data?.attributes?.url || heroData?.url;
       globalHeroUrl = getStrapiMedia(heroUrl) || undefined;
    }

  } catch (error) {
    console.error("[FacilityDetail] Error fetching data:", error);
  }

  if (!facility) return notFound();

  const breadcrumbLabel = t('breadcrumb');
  const sectionTitle = t('section_title');
  const sectionSubtitle = t('section_subtitle');

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