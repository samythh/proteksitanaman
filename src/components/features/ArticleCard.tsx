// src/components/features/ArticleCard.tsx
"use client"; // Pastikan ada ini

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";

// Gunakan placeholder online jika file lokal tidak ada, untuk menghindari error 404 fatal
// Atau ganti ke "/images/placeholder-agenda.jpg" jika file fisik SUDAH ADA.
const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/png?text=No+Image";

export default function ArticleCard({
  data,
  locale,
}: {
  data: any;
  locale: string;
}) {
  // 1. Ambil Base URL dari env atau hardcode IP VPS Anda
  const STRAPI_BASE_URL =
    process.env.NEXT_PUBLIC_STRAPI_URL || "http://202.10.34.176:1337";

  // 2. Normalisasi Data Item
  const item = data.attributes || data;

  // 3. Logika Pencari Gambar (Cari string URL di mana saja)
  let rawUrl =
    (typeof item.image === "string" ? item.image : null) || // Cek level 1 (Meilisearch flat)
    item.image?.url || // Cek level 2 (Strapi plugin default)
    item.image?.[0]?.url || // Cek array
    item.image?.data?.attributes?.url || // Cek nested Strapi
    null;

  // 4. LOGIKA FIX URL (PENTING!)
  // Jika rawUrl ada isinya, tapi diawali dengan "/", kita tempelkan domain VPS
  let finalImageUrl = PLACEHOLDER_IMAGE;

  if (rawUrl) {
    if (rawUrl.startsWith("http")) {
      // Jika sudah ada http (misal gambar eksternal), pakai langsung
      finalImageUrl = rawUrl;
    } else if (rawUrl.startsWith("/")) {
      // Jika path relatif (/uploads/...), tempelkan domain VPS
      finalImageUrl = `${STRAPI_BASE_URL}${rawUrl}`;
    }
  }

  // DEBUGGING: Cek di Console Browser (F12) untuk melihat hasil URLnya
  console.log(
    `[ArticleCard] Judul: ${item.title}, URL Gambar: ${finalImageUrl}`,
  );

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
    const firstBlock = item.content[0];
    if (firstBlock.type === "paragraph" && firstBlock.children?.[0]?.text) {
      summary = firstBlock.children[0].text;
    }
  } else if (item.description) {
    summary = item.description;
  }

  return (
    <Link
      href={`/${locale}/informasi/berita/${item.slug}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col h-full"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-200">
        <Image
          src={finalImageUrl}
          alt={item.title || "Article Image"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // Fallback jika gambar error load
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
          📅 {dateLabel}
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
