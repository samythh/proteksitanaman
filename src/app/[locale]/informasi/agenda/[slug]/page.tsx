// File: src/app/[locale]/informasi/agenda/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import AgendaCard from "@/components/features/AgendaCard";
import ShareButton from "@/components/features/ShareButton";
import PosterLightBox from "@/components/ui/PosterLightBox";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

// Icons
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaRegImage,
  FaTag, // Diambil dari Incoming (Fitur baru)
} from "react-icons/fa";

// --- TYPE DEFINITIONS ---

interface Tag {
  id: number;
  attributes?: { name: string };
  name?: string;
}

interface EventAttributes {
  title: string;
  slug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any;
  startDate: string;
  endDate: string;
  location?: string;
  image?: {
    data?: {
      attributes?: { url: string };
    };
    url?: string;
  };
  tags?: {
    data: Tag[];
  } | Tag[];
}

interface EventItem {
  id: number;
  attributes?: EventAttributes;
  title?: string;
  slug?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  startDate?: string;
  endDate?: string;
  location?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tags?: any;
}

// 1. GENERATE STATIC PARAMS
export async function generateStaticParams() {
  try {
    const events = await fetchAPI("/events", {
      fields: ["slug"],
      pagination: { limit: 100 },
    });
    if (!events?.data) return [];
    const params = [];
    const locales = ["id", "en"];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of events.data as any[]) {
      const attr = item.attributes || item;
      if (attr.slug) {
        for (const locale of locales) {
          params.push({ slug: attr.slug, locale });
        }
      }
    }
    return params;
  } catch (error) {
    console.error("[AgendaDetail] Error generating params:", error);
    return [];
  }
}

// 2. HALAMAN UTAMA
export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // --- FETCH DATA (Menggunakan Versi HEAD yang lebih aman) ---
  let event: EventItem | null = null;
  let relatedEvents: EventItem[] = [];

  try {
    const [detailRes, relatedRes] = await Promise.all([
      fetchAPI("/events", {
        filters: { slug: { $eq: slug } },
        populate: {
          image: { fields: ["url"] },
          tags: { populate: "*" },
        },
        locale: locale,
      }),
      fetchAPI("/events", {
        filters: { slug: { $ne: slug } },
        populate: {
          image: { fields: ["url"] },
          tags: { populate: "*" },
        },
        sort: ["startDate:desc"],
        pagination: { limit: 4 },
        locale: locale,
      }),
    ]);
    event = detailRes?.data?.[0];
    relatedEvents = relatedRes?.data || [];
  } catch (error) {
    console.error("[AgendaDetail] Error fetching data:", error);
  }

  if (!event) return notFound();

  const rawData = event as EventItem;
  const attr = rawData.attributes || rawData;

  const { title, content, startDate, endDate, location, image, tags } = attr;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imgData = image as any;
  const imgUrl = getStrapiMedia(imgData?.data?.attributes?.url || imgData?.url);

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(
      locale === "id" ? "id-ID" : "en-US",
      { day: "numeric", month: "long", year: "numeric" }
    );
  };

  const sDate = startDate || "";
  const eDate = endDate || "";

  const dateDisplay =
    formatDate(sDate) === formatDate(eDate)
      ? formatDate(sDate)
      : `${formatDate(sDate)} - ${formatDate(eDate)}`;

  // Handle Tags: Support both nested and flat structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tagsData = tags as any;
  const tagsList: Tag[] = Array.isArray(tagsData) ? tagsData : tagsData?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-24 md:pt-32">

      {/* --- KONTEN UTAMA --- */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-visible">

          {/* A. HEADER SECTION */}
          <div className="p-6 md:p-12 border-b border-gray-100 text-center bg-white rounded-t-3xl z-0 relative">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {tagsList.length > 0 ? (
                tagsList.map((tag: Tag, idx: number) => (
                  <span
                    key={idx}
                    // Menggabungkan Style HEAD dengan Ikon dari Incoming
                    className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2"
                  >
                    <FaTag className="text-[10px] opacity-70" /> {/* Ikon Tag Added */}
                    {tag.attributes ? tag.attributes.name : tag.name}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                  Agenda
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto mb-8">
              {title}
            </h1>

            <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-8 text-gray-600 bg-gray-50 px-8 py-4 rounded-2xl border border-gray-100 shadow-sm relative z-10">
              <div className="flex items-center gap-3">
                <FaCalendarAlt className="text-green-600 text-xl" />
                <span className="font-bold text-sm md:text-lg">
                  {dateDisplay}
                </span>
              </div>
              {location && (
                <>
                  <div className="hidden md:block w-px h-6 bg-gray-300"></div>
                  <div className="flex items-center gap-3">
                    <FaMapMarkerAlt className="text-red-500 text-xl" />
                    <span className="font-medium text-sm md:text-lg">
                      {location}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* B. BADAN KONTEN (Grid Layout - Menggunakan Versi HEAD Sticky Poster) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">

            {/* KOLOM KIRI: POSTER */}
            <div className="lg:col-span-5 bg-gray-50 p-6 md:p-10 flex items-start justify-center border-r border-gray-100 rounded-bl-3xl">

              <div className="sticky top-28 w-full flex justify-center z-20">

                {/* Posisi Poster: Naik sedikit */}
                <div className="relative w-full -mt-4 md:-mt-8 transition-all duration-300">

                  {/* FRAME PUTIH */}
                  <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                    {/* ASPECT RATIO 3:4 (PORTRAIT FLYER) */}
                    <div className="relative w-full aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">

                      {imgUrl ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <PosterLightBox src={imgUrl} alt={title || "Agenda Image"} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <FaRegImage className="text-5xl mb-3 opacity-40" />
                          <p className="text-sm font-medium mt-2">Poster belum tersedia</p>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* KOLOM KANAN: DESKRIPSI + SHARE */}
            <div className="lg:col-span-7 p-6 md:p-12 bg-white min-h-[500px] z-10 rounded-br-3xl flex flex-col">

              <div className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed prose-headings:font-bold prose-headings:text-gray-900 prose-img:rounded-xl prose-a:text-green-600 mb-10">
                {content ? (
                  <BlocksRenderer content={content} />
                ) : (
                  <div className="text-gray-400 italic text-center py-10 border border-dashed border-gray-200 rounded-xl">
                    <p>Tidak ada deskripsi detail untuk acara ini.</p>
                  </div>
                )}
              </div>

              {/* SHARE DI KANAN BAWAH */}
              <div className="mt-auto pt-8 border-t border-gray-100">
                <div className="flex justify-end">
                  <ShareButton title={title || "Agenda"} />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- FOOTER: AGENDA LAINNYA (UPDATED STYLE) --- */}
      <div className="container mx-auto px-4 max-w-6xl mt-16 mb-20">

        {/* HEADER SECTION - SAMA DENGAN NEWS DASHBOARD */}
        <div className="flex flex-row justify-between items-end mb-8 gap-4 border-b border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#005320] border-l-4 border-yellow-400 pl-4 leading-none">
            Agenda Lainnya
          </h2>

          {/* Tombol Desktop */}
          <Link
            href={`/${locale}/informasi/agenda`}
            className="hidden md:flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 shrink-0"
          >
            Lihat Semua <FaArrowLeft className="rotate-180" />
          </Link>
        </div>

        {relatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEvents.map((item: EventItem) => (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <AgendaCard key={item.id} data={item as any} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-10 text-center border border-dashed border-gray-300">
            <p className="text-gray-500 italic">
              Belum ada agenda lain saat ini.
            </p>
          </div>
        )}

        {/* Tombol Mobile */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href={`/${locale}/informasi/agenda`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Lihat Semua Agenda <FaArrowLeft className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}