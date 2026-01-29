import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import AgendaCard from "@/components/features/AgendaCard";
import ShareButton from "@/components/features/ShareButton";
import PosterLightBox from "@/components/ui/PosterLightBox";
import { getTranslations } from "next-intl/server";

import {
  Calendar,
  MapPin,
  ArrowLeft,
  Tag,
  Image as ImageIcon
} from "lucide-react";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

// --- TYPE DEFINITIONS ---

interface AgendaDetail {
  id: number;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  location: string;
  content: BlocksContent;
  description?: string;
  image?: {
    url: string;
    caption?: string;
  };
  tags?: { id: number; name: string }[];
}

// --- HELPER: DATA NORMALIZER ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeAgendaDetail(data: any): AgendaDetail | null {
  if (!data) return null;
  const attr = data.attributes || data;

  return {
    id: data.id,
    title: attr.title || "",
    slug: attr.slug || "",
    startDate: attr.startDate || "",
    endDate: attr.endDate || attr.startDate || "",
    location: attr.location || "Kampus UNAND Limau Manis",
    content: attr.content || [],
    description: attr.description || "",
    image: {
      url: getStrapiMedia(attr.image?.data?.attributes?.url || attr.image?.url) || "",
      caption: attr.image?.data?.attributes?.caption || "",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tags: (attr.tags?.data || attr.tags || []).map((t: any) => ({
      id: t.id,
      name: t.attributes?.name || t.name || "",
    })),
  };
}

// --- 1. FETCH DATA (DETAIL & RELATED) ---
async function getData(slug: string, locale: string) {
  try {
    const [detailRes, relatedRes] = await Promise.all([
      // A. Detail Agenda
      fetchAPI("/events", {
        filters: { slug: { $eq: slug } },
        populate: {
          image: { fields: ["url", "caption", "alternativeText"] },
          tags: { populate: "*" },
        },
        locale,
      }),
      // B. Related Agenda (Agenda Lainnya)
      fetchAPI("/events", {
        filters: { slug: { $ne: slug } }, // Kecuali slug saat ini
        populate: {
          image: { fields: ["url"] },
          tags: { populate: "*" },
        },
        sort: ["startDate:desc"],
        pagination: { limit: 4 },
        locale,
      }),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawDetail = (detailRes as any)?.data?.[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawRelated = (relatedRes as any)?.data || [];

    return {
      agenda: normalizeAgendaDetail(rawDetail),
      related: rawRelated.map(normalizeAgendaDetail).filter(Boolean) as AgendaDetail[],
    };
  } catch (error) {
    console.error("Error fetching agenda data:", error);
    return { agenda: null, related: [] };
  }
}

// --- 2. METADATA (Dengan Translasi JSON) ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const { agenda } = await getData(slug, locale);
  const t = await getTranslations({ locale, namespace: "AgendaDetail" });

  if (!agenda) return {};

  return {
    title: `${agenda.title} - Agenda`,
    description: agenda.description?.slice(0, 160) || `${t('meta_desc_prefix')} ${agenda.title}`,
  };
}

// --- 3. MAIN PAGE COMPONENT ---
export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const { agenda, related } = await getData(slug, locale);
  const t = await getTranslations({ locale, namespace: "AgendaDetail" });

  if (!agenda) {
    return notFound();
  }

  // Helper Format Tanggal (Tetap manual karena format Date spesifik)
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const dateDisplay =
    formatDate(agenda.startDate) === formatDate(agenda.endDate)
      ? formatDate(agenda.startDate)
      : `${formatDate(agenda.startDate)} - ${formatDate(agenda.endDate)}`;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-24 md:pt-32 font-sans">

      {/* --- KONTEN UTAMA --- */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-visible">

          {/* A. HEADER SECTION */}
          <div className="p-6 md:p-12 border-b border-gray-100 text-center bg-white rounded-t-3xl z-0 relative">

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {agenda.tags && agenda.tags.length > 0 ? (
                agenda.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2"
                  >
                    <Tag size={12} className="opacity-70" />
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Agenda
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto mb-8">
              {agenda.title}
            </h1>

            {/* Info Bar (Date & Location) */}
            <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-8 text-gray-600 bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 shadow-sm relative z-10">
              {/* Date */}
              <div className="flex items-center gap-3">
                <Calendar className="text-green-600 w-5 h-5 md:w-6 md:h-6" />
                <div className="flex flex-col items-start text-left">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {t('date')}
                  </span>
                  <span className="font-bold text-sm md:text-lg text-gray-800">
                    {dateDisplay}
                  </span>
                </div>
              </div>

              {/* Location */}
              {agenda.location && (
                <>
                  <div className="hidden md:block w-px h-8 bg-gray-200"></div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-red-500 w-5 h-5 md:w-6 md:h-6" />
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {t('location')}
                      </span>
                      <span className="font-medium text-sm md:text-lg text-gray-800">
                        {agenda.location}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* B. BADAN KONTEN */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">

            {/* KOLOM KIRI: POSTER (STICKY) */}
            <div className="lg:col-span-5 bg-gray-50 p-6 md:p-10 flex items-start justify-center border-r border-gray-100 rounded-bl-3xl">
              <div className="sticky top-28 w-full flex justify-center z-20">
                <div className="relative w-full -mt-4 md:-mt-8 transition-all duration-300">
                  <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="relative w-full aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">

                      {agenda.image?.url ? (
                        <div className="w-full h-full">
                          <PosterLightBox
                            src={agenda.image.url}
                            alt={agenda.title}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <ImageIcon size={48} className="mb-3 opacity-40" />
                          <p className="text-sm font-medium mt-2">
                            {t('poster_unavailable')}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KOLOM KANAN: DESKRIPSI & SHARE */}
            <div className="lg:col-span-7 p-6 md:p-12 bg-white min-h-[500px] z-10 rounded-br-3xl flex flex-col">

              <article className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed prose-headings:font-bold prose-headings:text-gray-900 prose-img:rounded-xl prose-a:text-green-600 mb-12">
                {agenda.content ? (
                  <BlocksRenderer content={agenda.content} />
                ) : (
                  <div className="text-gray-400 italic text-center py-10 border border-dashed border-gray-200 rounded-xl">
                    {/* ✅ Pakai JSON */}
                    <p>{t('desc_unavailable')}</p>
                  </div>
                )}
              </article>

              <div className="mt-auto border-t border-gray-200 pt-6 flex justify-end">
                <ShareButton title={agenda.title} />
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER: AGENDA LAINNYA --- */}
      <div className="container mx-auto px-4 max-w-6xl mt-16 mb-20">

        {/* HEADER SECTION */}
        <div className="flex flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#005320] border-l-4 border-yellow-400 pl-4 leading-none">
            {t('related_events')}
          </h2>

          {/* Tombol Desktop */}
          <Link
            href={`/${locale}/informasi/agenda`}
            className="hidden md:flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 shrink-0"
          >
            {t('view_all')} <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </div>

        {/* RELATED EVENTS GRID */}
        {related.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <AgendaCard key={item.id} data={item as any} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-10 text-center border border-dashed border-gray-300">
            <p className="text-gray-500 italic">
              {t('no_related_events')}
            </p>
          </div>
        )}

        {/* Tombol Mobile */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href={`/${locale}/informasi/agenda`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            {t('view_all_mobile')} <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </div>

      </div>
    </div>
  );
}