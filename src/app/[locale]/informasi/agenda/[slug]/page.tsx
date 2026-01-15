// src/app/[locale]/informasi/agenda/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import AgendaCard from "@/components/features/AgendaCard"; // Reuse kartu yang sudah ada
import ShareButton from "@/components/features/ShareButton";
import PageHeader from "@/components/ui/PageHeader"; // Optional, jika ingin header kecil di atas
import { BlocksRenderer } from "@strapi/blocks-react-renderer";

// Icons
import { FaCalendarAlt, FaMapMarkerAlt, FaTag } from "react-icons/fa";

// 1. GENERATE STATIC PARAMS (Agar halaman cepat & SEO bagus)
export async function generateStaticParams() {
  const events = await fetchAPI("/events", {
    fields: ["slug"],
    pagination: { limit: 100 },
  });

  if (!events?.data) return [];

  // Kita generate untuk locale 'id' dan 'en'
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

  // 2. FETCH DATA (Detail Agenda + Agenda Lainnya)
  const [detailRes, relatedRes] = await Promise.all([
    // A. Fetch Detail Acara
    fetchAPI("/events", {
      filters: { slug: { $eq: slug } },
      populate: ["image"], // Pastikan image dipopulate
      locale: locale,
    }),

    // B. Fetch Agenda Lainnya (Related) - Kecuali yang sedang dibuka
    fetchAPI("/events", {
      filters: { slug: { $ne: slug } }, // Exclude current slug
      populate: ["image"],
      sort: ["startDate:desc"],
      pagination: { limit: 4 }, // Ambil 4 berita lain
      locale: locale,
    }),
  ]);

  const event = detailRes?.data?.[0];
  const relatedEvents = relatedRes?.data || [];

  if (!event) {
    return notFound();
  }

  // Support v4/v5 Attributes
  const attr = (event as any).attributes || event;
  const { title, content, startDate, endDate, location, image } = attr;

  // Image Helper
  const imgUrl = getStrapiMedia(image?.data?.attributes?.url || image?.url);

  // Date Formatter Helper
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      locale === "id" ? "id-ID" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  return (
    <div className="bg-white min-h-screen pb-20 -m-3">
      {/* Optional: Breadcrumb Header Kecil */}
      <div className="bg-gray-900 py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <p className="text-sm opacity-80 uppercase tracking-wider mb-2">
            Informasi / Agenda / Detail
          </p>
        </div>
      </div>

      {/* CONTAINER UTAMA */}
      <div className="container mx-auto px-4 mt-4 relative z-10">
        <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-xl border border-gray-300">
          {/* 1. HEADER ACARA */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {title}
            </h1>

            {/* Meta Data (Tanggal & Lokasi) */}
            <div className="flex flex-wrap gap-4 md:gap-8 text-sm md:text-base text-gray-600 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <FaCalendarAlt className="text-green-600" />
                <span className="font-medium">
                  {formatDate(startDate)} - {formatDate(endDate)}
                </span>
              </div>

              {location && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <FaMapMarkerAlt className="text-orange-500" />
                  <span className="font-medium">{location}</span>
                </div>
              )}

              {/* Tags Mockup (Bisa diambil dari Strapi jika ada relation tags) */}
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                <FaTag />
                <span className="font-medium">Seminar</span>
              </div>
            </div>
          </div>

          {/* 2. FEATURED IMAGE (POSTER) */}
          {imgUrl && (
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden mb-10 shadow-sm bg-gray-100">
              <Image
                src={imgUrl}
                alt={title}
                fill
                className="object-contain" // Gunakan contain agar poster full terlihat tidak terpotong
              />
            </div>
          )}

          {/* 3. KONTEN ARTIKEL (Rich Text) */}
          <div className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed mb-10">
            {content ? (
              // Gunakan BlocksRenderer untuk Strapi v5 Blocks
              <BlocksRenderer content={content} />
            ) : (
              <p className="text-gray-400 italic">
                Tidak ada deskripsi detail untuk acara ini.
              </p>
            )}
          </div>

          {/* 4. SHARE BUTTON */}
          <ShareButton title={title} slug={slug} />
        </div>
      </div>

      {/* 5. AGENDA LAINNYA (RELATED EVENTS) */}
      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-1 bg-green-600 rounded-full"></div>
          <h2 className="text-2xl font-bold text-gray-900">Agenda Lainnya</h2>
        </div>

        {relatedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEvents.map((item: any) => (
              <AgendaCard key={item.id} data={item} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Belum ada agenda lain saat ini.
          </p>
        )}

        {/* Tombol Lihat Semua */}
        <div className="text-right mt-6">
          <Link
            href={`/${locale}/informasi/agenda`}
            className="inline-flex items-center text-green-700 font-semibold hover:underline"
          >
            Lihat Semua Agenda &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
