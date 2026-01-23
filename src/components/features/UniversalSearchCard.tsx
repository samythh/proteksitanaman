// src/components/features/UniversalSearchCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale"; // Import enUS juga untuk jaga-jaga
import { FaCalendarAlt } from "react-icons/fa";

// Placeholder aman
const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/png?text=No+Image";
const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.backendn8n.cloud";

// 1. Tambahkan 'locale' ke dalam interface Props
interface UniversalSearchCardProps {
  item: any;
  locale: string;
}

export default function UniversalSearchCard({
  item,
  locale,
}: UniversalSearchCardProps) {
  // A. Logika Gambar (Anti Mixed Content)
  let imageUrl = item.image || PLACEHOLDER_IMAGE;

  if (typeof imageUrl === "string") {
    if (imageUrl.startsWith("/")) {
      imageUrl = `${STRAPI_BASE_URL}${imageUrl}`;
    } else if (imageUrl.includes("202.10.34.176")) {
      imageUrl = imageUrl.replace("http://202.10.34.176:1337", STRAPI_BASE_URL);
    }
  }

  // B. Format Tanggal
  let dateLabel = "";
  if (item.publishedAt) {
    try {
      dateLabel = format(new Date(item.publishedAt), "d MMMM yyyy", {
        locale: locale === "en" ? enUS : idLocale,
      });
    } catch (e) {
      /* ignore error */
    }
  }

  // C. Data Highlight
  const titleHtml = item._formatted?.title || item.title;
  const contentHtml =
    item._formatted?.content ||
    item.content ||
    item.description ||
    "Tidak ada deskripsi.";

  // D. Badge Color
  const getBadgeColor = (type: string) => {
    // Pastikan type ada sebelum toLowerCase
    const safeType = (type || "").toLowerCase();
    if (safeType.includes("berita")) return "bg-blue-600";
    if (safeType.includes("agenda")) return "bg-orange-500";
    if (safeType.includes("dosen")) return "bg-purple-600";
    if (safeType.includes("fasilitas")) return "bg-emerald-600";
    return "bg-gray-600";
  };

  // E. LOGIKA FIX LINK (PENTING!)
  // Gabungkan locale dengan link dari Meilisearch
  // Hasilnya: /id + /profil/staf/slug -> /id/profil/staf/slug
  const finalLink = item.link ? `/${locale}${item.link}` : "#";

  return (
    <Link href={finalLink} className="block group h-full">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col hover:-translate-y-1">
        {/* Gambar */}
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={imageUrl}
            alt={item.title || "Search Result"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.srcset = PLACEHOLDER_IMAGE;
            }}
          />
          {item.type && (
            <div
              className={`absolute top-3 right-3 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wide z-10 ${getBadgeColor(item.type)}`}
            >
              {item.type}
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          {dateLabel && (
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <FaCalendarAlt />
              <span>{dateLabel}</span>
            </div>
          )}

          <h3
            className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />

          <div
            className="text-sm text-gray-600 line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <div className="mt-auto pt-4 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Lihat Detail &rarr;
          </div>
        </div>
      </div>
    </Link>
  );
}
