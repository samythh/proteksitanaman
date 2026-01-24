// src/components/features/ArticleCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";

// Placeholder aman (HTTPS)
const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/png?text=No+Image";

export default function ArticleCard({
  data,
  locale,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any; // Menggunakan any agar fleksibel (Strapi vs Meilisearch)
  locale: string;
}) {
  // 1. Ambil Base URL HTTPS yang benar
  const STRAPI_BASE_URL =
    process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.backendn8n.cloud";

  // 2. Normalisasi Data Item (Handle Nested vs Flat)
  const item = data.attributes || data;

  // 3. LOGIKA PENCARI GAMBAR (Super Robust)
  // [PERBAIKAN 1]: Mengubah 'let' menjadi 'const' karena tidak pernah di-reassign
  const rawUrl =
    (typeof item.image === "string" ? item.image : null) ||
    (typeof item.cover === "string" ? item.cover : null) || // Cek kalau Meilisearch kirim URL string di 'cover'
    item.image?.url ||
    item.cover?.url || // Cek field 'cover' (Standard Strapi)
    item.image?.[0]?.url ||
    item.cover?.[0]?.url ||
    item.image?.data?.attributes?.url ||
    item.cover?.data?.attributes?.url || // Cek nested Strapi di 'cover'
    null;

  // 4. LOGIKA FIX URL & ANTI MIXED CONTENT
  let finalImageUrl = PLACEHOLDER_IMAGE;

  if (rawUrl) {
    if (rawUrl.startsWith("http")) {
      // PENTING: Cek apakah URL ini adalah URL lama (IP Address HTTP)
      // Jika ya, kita paksa ganti ke Domain HTTPS agar tidak diblokir browser
      if (rawUrl.includes("202.10.34.176")) {
        finalImageUrl = rawUrl.replace(
          "http://202.10.34.176:1337",
          STRAPI_BASE_URL
        );
      } else {
        finalImageUrl = rawUrl;
      }
    } else if (rawUrl.startsWith("/")) {
      // Jika relative path (/uploads/...), tempelkan domain di depannya
      finalImageUrl = `${STRAPI_BASE_URL}${rawUrl}`;
    }
  }

  // 5. Format Tanggal
  const dateObj = item.publishedAt ? new Date(item.publishedAt) : new Date();
  const dateLabel = format(dateObj, "d MMMM yyyy", {
    locale: locale === "id" ? idLocale : enUS,
  });

  // 6. Logika Summary (Support Rich Text Strapi)
  let summary = "Klik untuk membaca selengkapnya...";
  if (typeof item.content === "string") {
    summary = item.content;
  } else if (Array.isArray(item.content) && item.content.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstBlock = item.content[0] as any;
    if (firstBlock.type === "paragraph" && firstBlock.children?.[0]?.text) {
      summary = firstBlock.children[0].text;
    }
  } else if (item.description) {
    summary = item.description;
  }

  return (
    <Link
      href={`/${locale}/informasi/berita/${item.slug}`}
      // [PERBAIKAN 2]: Menghapus class 'block' karena bentrok dengan 'flex'
      // Sebelum: "group block bg-white ... flex flex-col ..."
      // Sesudah: "group bg-white ... flex flex-col ..."
      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col h-full"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-200">
        <Image
          src={finalImageUrl}
          alt={item.title || "Article Image"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // Tambahkan onError agar aman
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.srcset = PLACEHOLDER_IMAGE;
          }}
        />
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          Artikel
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          {dateLabel}
        </div>

        <h3
          className="font-bold text-lg line-clamp-2 group-hover:text-blue-700 transition-colors mb-2"
          dangerouslySetInnerHTML={{
            __html: data._formatted?.title || item.title,
          }}
        />

        <p className="text-sm text-gray-600 line-clamp-3">{summary}</p>
      </div>
    </Link>
  );
}