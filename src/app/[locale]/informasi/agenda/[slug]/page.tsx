// src/app/[locale]/informasi/agenda/[slug]/page.tsx

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
  FaTag, // Import FaTag
  FaArrowLeft,
} from "react-icons/fa";

// 1. GENERATE STATIC PARAMS
export async function generateStaticParams() {
  const events = await fetchAPI("/events", {
    fields: ["slug"],
    pagination: { limit: 100 },
  });

  if (!events?.data) return [];

  const params = [];
  for (const item of events.data) {
    const attr = item.attributes || item;
    if (attr.slug) {
      params.push({ slug: attr.slug, locale: "id" });
      params.push({ slug: attr.slug, locale: "en" });
    }
  }
  return params;
}

export default async function AgendaDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // 2. FETCH DATA
  const [detailRes, relatedRes] = await Promise.all([
    // A. Fetch Detail Acara
    fetchAPI("/events", {
      filters: { slug: { $eq: slug } },
      populate: {
        image: { fields: ["url"] },
        tags: { populate: "*" }, // Ambil data tags
      },
      locale: locale,
    }),

    // B. Fetch Agenda Lainnya
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

  const event = detailRes?.data?.[0];
  const relatedEvents = relatedRes?.data || [];

  if (!event) {
    return notFound();
  }

  // Ekstraksi Data
  const attr = (event as any).attributes || event;
  const { title, content, startDate, endDate, location, image, tags } = attr;

  // Image Helper
  const imgUrl = getStrapiMedia(image?.data?.attributes?.url || image?.url);

  // Date Helper
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      locale === "id" ? "id-ID" : "en-US",
      { day: "numeric", month: "long", year: "numeric" }
    );
  };

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  const dateDisplay =
    startStr === endStr ? startStr : `${startStr} - ${endStr}`;

  // Tags Helper: Handle both Strapi v4 (tags.data) and v5 (tags array) structures
  const tagsList = Array.isArray(tags) ? tags : tags?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 2. KONTEN UTAMA (Layout Grid) */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header Judul (Di dalam Card) */}
          <div className="p-6 md:p-12 border-b border-gray-100 text-center">
            {/* Tags Badge */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {tagsList.length > 0 ? (
                tagsList.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                  >
                    <FaTag className="text-[10px]" /> {/* Ikon Tag */}
                    {tag.attributes ? tag.attributes.name : tag.name}
                  </span>
                ))
              ) : (
                <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Agenda
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight max-w-4xl mx-auto mb-6">
              {title}
            </h1>

            {/* Info Bar (Date & Location) */}
            <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-8 text-gray-500 bg-gray-50 px-6 py-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                <span className="font-medium text-sm md:text-base">
                  {dateDisplay}
                </span>
              </div>
              {location && (
                <>
                  <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-red-500" />
                    <span className="font-medium text-sm md:text-base">
                      {location}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content Body (Grid Layout: Kiri Poster, Kanan Teks) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* KOLOM KIRI: POSTER IMAGE (Sticky pada Desktop) */}
            <div className="lg:col-span-5 bg-gray-100 p-6 md:p-10 flex items-start justify-center border-r border-gray-100">
              {imgUrl ? (
                <PosterLightBox src={imgUrl} alt={title} />
              ) : (
                <div className="relative w-full aspect-[3/4] max-w-md shadow-lg rounded-2xl overflow-hidden sticky top-24 bg-gray-200 flex items-center justify-center text-gray-400">
                  No Poster Available
                </div>
              )}
            </div>

            {/* KOLOM KANAN: DESCRIPTION TEXT */}
            <div className="lg:col-span-7 p-6 md:p-12">
              <div className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed">
                {content ? (
                  <BlocksRenderer content={content} />
                ) : (
                  <p className="text-gray-400 italic text-center py-10">
                    Tidak ada deskripsi detail untuk acara ini.
                  </p>
                )}
              </div>

              {/* Share Section */}
              <div className="mt-12 pt-8 border-t border-gray-100">
                <ShareButton title={title} slug={slug} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AGENDA LAINNYA */}
      <div className="container mx-auto px-4 mt-8 mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-2 h-8 bg-green-600 rounded-full"></span>
            Agenda Lainnya
          </h2>
          <Link
            href={`/${locale}/informasi/agenda`}
            className="hidden md:flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors"
          >
            Lihat Semua <FaArrowLeft className="rotate-180" />
          </Link>
        </div>

        {relatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEvents.map((item: any) => (
              <AgendaCard key={item.id} data={item} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-300">
            <p className="text-gray-500 italic">
              Belum ada agenda lain saat ini.
            </p>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href={`/${locale}/informasi/agenda`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm"
          >
            Lihat Semua Agenda <FaArrowLeft className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
