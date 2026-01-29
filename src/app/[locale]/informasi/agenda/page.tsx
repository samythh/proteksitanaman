// File: src/app/[locale]/informasi/agenda/page.tsx

import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import AgendaCard from "@/components/features/AgendaCard";
import AgendaHeroSlider from "@/components/features/AgendaHeroSlider";
import { Agenda } from "@/types/agenda";
import { getTranslations } from "next-intl/server"; 

// --- TYPE DEFINITIONS ---

interface StrapiEntity {
  id: number;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

interface StrapiResponseWrapper {
  data: StrapiEntity[];
  meta?: {
    pagination?: {
      total: number;
    };
  };
}

interface NormalizedAgenda extends Omit<Agenda, 'endDate' | 'image' | 'tags'> {
  endDate: string;
  image?: { url: string; alternativeText?: string };
  tags?: { id: number; name: string }[];
}

// --- HELPER COMPONENT (Updated with Translation) ---
// Kita pass label sebagai props
function SectionTitle({ title, link, linkLabel }: { title: string; link?: string; linkLabel?: string }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="relative">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="h-1 w-12 bg-green-600 rounded-full mt-1"></div>
      </div>
      {link && (
        <Link
          href={link}
          className="px-4 py-1.5 text-xs font-bold text-green-700 border border-green-200 bg-green-50 rounded-full hover:bg-green-600 hover:text-white transition-all"
        >
          {linkLabel} &rarr;
        </Link>
      )}
    </div>
  );
}

// --- HELPER FUNCTION ---
const normalizeData = (data: StrapiEntity[]): NormalizedAgenda[] => {
  if (!data) return [];
  return data.map((item) => {
    const attr = item.attributes || item;
    return {
      ...item,
      ...attr,
      endDate: (attr.endDate as string) || (attr.startDate as string) || "",
      image: attr.image ?? undefined,
      tags: attr.tags ?? [],
    } as unknown as NormalizedAgenda;
  });
};

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AgendaPage" });

  const now = new Date().toISOString();

  const commonPopulate = {
    image: { fields: ["url", "alternativeText"] },
    tags: { populate: "*" },
  };

  // --- FETCH PARALEL ---
  const [ongoingRes, upcomingRes, pastRes, featuredRes] = await Promise.all([
    // 1. Sedang Berjalan
    fetchAPI("/events", {
      filters: { startDate: { $lte: now }, endDate: { $gte: now } },
      populate: commonPopulate,
      sort: ["startDate:asc"],
      pagination: { limit: 4 },
      locale,
    }) as Promise<StrapiResponseWrapper>,

    // 2. Akan Datang
    fetchAPI("/events", {
      filters: { startDate: { $gt: now } },
      populate: commonPopulate,
      sort: ["startDate:asc"],
      pagination: { limit: 4 },
      locale,
    }) as Promise<StrapiResponseWrapper>,

    // 3. Selesai
    fetchAPI("/events", {
      filters: { endDate: { $lt: now } },
      populate: commonPopulate,
      sort: ["endDate:desc"],
      pagination: { limit: 4 },
      locale,
    }) as Promise<StrapiResponseWrapper>,

    // 4. Featured Slider
    fetchAPI("/events", {
      filters: { is_featured: { $eq: true }, endDate: { $gte: now } },
      populate: commonPopulate,
      sort: ["startDate:asc"],
      pagination: { limit: 5 },
      locale,
    }) as Promise<StrapiResponseWrapper>,
  ]);

  // Normalisasi data
  const ongoing = normalizeData(ongoingRes?.data || []);
  const upcoming = normalizeData(upcomingRes?.data || []);
  const past = normalizeData(pastRes?.data || []);

  // --- LOGIC BACKUP DATA SLIDER ---
  let featuredList = normalizeData(featuredRes?.data || []);

  if (featuredList.length === 0) {
    featuredList = upcoming.slice(0, 3);
  }

  if (featuredList.length === 0) {
    featuredList = ongoing.slice(0, 3);
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20 -mt-3">

      {/* 1. HERO SLIDER */}
      {featuredList.length > 0 && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <AgendaHeroSlider data={featuredList as unknown as any} locale={locale} />
      )}

      {/* 2. KONTEN UTAMA */}
      <div className="container mx-auto px-4 mt-12 space-y-20">

        {/* SECTION: SEDANG BERJALAN */}
        {ongoing.length > 0 && (
          <section>
            <SectionTitle title={t("title_ongoing")} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {ongoing.map((item) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <AgendaCard key={item.id} data={item as unknown as any} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* SECTION: AKAN DATANG */}
        <section>
          <SectionTitle title={t("title_upcoming")} />
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {upcoming.map((item) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <AgendaCard key={item.id} data={item as unknown as any} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">{t("no_upcoming")}</p>
            </div>
          )}
        </section>

        {/* SECTION: SELESAI */}
        <section>
          <SectionTitle
            title={t("title_past")}
            link={`/${locale}/informasi/agenda/archive`}
            linkLabel={t("view_all")}
          />

          {past.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 opacity-90 hover:opacity-100 transition-opacity">
              {past.map((item) => (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <AgendaCard key={item.id} data={item as unknown as any} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              {t("no_past")}
            </p>
          )}
        </section>

        {/* SECTION: BUTTON LOAD MORE (ARSIP) */}
        <div className="flex justify-center pt-8">
          <Link
            href={`/${locale}/informasi/agenda/archive`}
            className="px-10 py-3 bg-white border border-green-600 text-green-700 font-bold rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1"
          >
            {t("view_archive")}
          </Link>
        </div>
      </div>
    </div>
  );
}