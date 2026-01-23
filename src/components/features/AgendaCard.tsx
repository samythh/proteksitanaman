// src/components/features/AgendaCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

// Placeholder aman (HTTPS)
const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x800/png?text=Agenda+No+Image";

// --- TYPE DEFINITIONS ---
interface Tag {
  id: number;
  attributes?: { name: string };
  name?: string;
}

interface AgendaAttributes {
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cover?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tags?: any;
}

interface AgendaCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Menggunakan any agar fleksibel menerima data Strapi/Meilisearch
  locale: string;
}

export default function AgendaCard({ data, locale }: AgendaCardProps) {
  // 1. Ambil Base URL HTTPS yang benar
  const STRAPI_BASE_URL =
    process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.backendn8n.cloud";

  // 2. Normalisasi Data (Handle Nested vs Flat)
  // Strapi membungkus di 'attributes', Meilisearch biasanya langsung datar
  const item = data.attributes || data;
  const { title, slug, startDate, endDate, tags } = item;

  // 3. LOGIKA PENCARI GAMBAR (Super Robust)
  // Mencari di field 'image' ATAU 'cover', baik bentuk string, object, atau array
  let rawUrl =
    (typeof item.image === "string" ? item.image : null) ||
    (typeof item.cover === "string" ? item.cover : null) ||
    item.image?.url ||
    item.cover?.url ||
    item.image?.data?.attributes?.url ||
    item.cover?.data?.attributes?.url ||
    item.image?.[0]?.url ||
    null;

  // 4. LOGIKA FIX URL & MIXED CONTENT
  let finalImageUrl = PLACEHOLDER_IMAGE;

  if (rawUrl) {
    if (rawUrl.startsWith("http")) {
      // PENTING: Cek apakah URL ini adalah URL lama (IP Address HTTP)
      // Jika ya, kita paksa ganti ke Domain HTTPS agar tidak diblokir browser
      if (rawUrl.includes("202.10.34.176")) {
        finalImageUrl = rawUrl.replace(
          "http://202.10.34.176:1337",
          STRAPI_BASE_URL,
        );
      } else {
        finalImageUrl = rawUrl;
      }
    } else if (rawUrl.startsWith("/")) {
      // Jika relative path, tempelkan domain di depannya
      finalImageUrl = `${STRAPI_BASE_URL}${rawUrl}`;
    }
  }

  // --- LOGIKA TANGGAL ---
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString(
        locale === "en" ? "en-US" : "id-ID",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      );
    } catch (e) {
      return "-";
    }
  };

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  const dateDisplay =
    startStr === endStr ? startStr : `${startStr} - ${endStr}`;

  // --- LOGIKA TAGS ---
  // Normalisasi tags agar aman dari error map
  let tagsList: Tag[] = [];

  if (Array.isArray(tags)) {
    // Kasus Meilisearch (biasanya array of strings atau objects)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tagsList = tags.map((t: any, idx: number) => {
      if (typeof t === "string") return { id: idx, name: t }; // Jika cuma string
      return t; // Jika object
    });
  } else if (tags?.data) {
    // Kasus Strapi Original
    tagsList = tags.data;
  }

  // Fallback default tags jika kosong
  if (tagsList.length === 0) {
    tagsList = [
      { id: 1, attributes: { name: "Umum" } },
      { id: 2, attributes: { name: "Sertifikat" } },
    ];
  }

  const visibleTags = tagsList.slice(0, 2);
  const hiddenCount = tagsList.length - 2;

  const getTagStyle = (index: number) => {
    if (index === 0) return "bg-blue-600 text-white";
    if (index === 1) return "bg-green-600 text-white";
    return "bg-gray-200 text-gray-700";
  };

  // Helper untuk ambil nama tag dengan aman
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTagName = (tag: any) => {
    return tag.attributes?.name || tag.name || "Tag";
  };

  return (
    <Link
      href={`/${locale}/informasi/agenda/${slug}`}
      className="block h-full group"
    >
      <div className="bg-[#F3F4F6] rounded-3xl p-4 flex flex-col h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-green-200">
        {/* 1. GAMBAR POSTER */}
        <div className="relative w-full aspect-[3/4] mb-4 rounded-2xl overflow-hidden shadow-sm bg-gray-300">
          <Image
            src={finalImageUrl}
            alt={title || "Agenda Poster"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // Tambahkan onError agar jika URL masih salah, dia lari ke placeholder
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = PLACEHOLDER_IMAGE;
            }}
          />
        </div>

        {/* 2. KONTEN TENGAH */}
        <div className="flex flex-col items-center text-center flex-grow">
          <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
            {title}
          </h3>

          <div className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 mb-4 shadow-sm">
            <p className="text-xs font-medium text-gray-700">{dateDisplay}</p>
          </div>
        </div>

        {/* 3. FOOTER: TAGS */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-2 flex-wrap justify-center w-full">
            {visibleTags.map((tag, index) => (
              <span
                key={index}
                className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm ${getTagStyle(
                  index,
                )}`}
              >
                {getTagName(tag)}
              </span>
            ))}

            {hiddenCount > 0 && (
              <span className="bg-[#86EFAC] text-green-800 text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-sm">
                +{hiddenCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
