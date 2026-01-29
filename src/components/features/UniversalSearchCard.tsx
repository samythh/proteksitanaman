// File: src/components/features/UniversalSearchCard.tsx
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, isValid } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  Calendar,
  User,
  Building2,
  FileText,
  Link as LinkIcon,
  LucideIcon
} from "lucide-react";

// --- KONFIGURASI ---
const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/png?text=No+Image";
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.backendn8n.cloud";

// --- TIPE DATA ---
interface FormattedContent {
  title?: string;
  content?: string;
}

export interface SearchResultItem {
  id: number | string;
  title: string;
  content: string;
  type: string;
  link: string;
  image?: string;
  formattedDate?: string;
  _formatted?: FormattedContent; // Field highlight dari Meilisearch
}

interface UniversalSearchCardProps {
  item: SearchResultItem;
  locale: string;
}

// --- HELPER: LOGIC GAMBAR ---
const getValidImageUrl = (url?: string): string => {
  if (!url || typeof url !== "string") return PLACEHOLDER_IMAGE;

  // Fix Legacy IP jika ada
  if (url.includes("202.10.34.176")) {
    return url.replace("http://202.10.34.176:1337", STRAPI_BASE_URL);
  }

  // Jika relative path (dari Strapi lokal)
  if (url.startsWith("/")) {
    return `${STRAPI_BASE_URL}${url}`;
  }

  return url;
};

// --- HELPER: BADGE INFO ---
const getTypeConfig = (type: string): { label: string; color: string; icon: LucideIcon } => {
  const t = (type || "").toLowerCase();

  switch (t) {
    case "article":
      return { label: "Berita", color: "bg-blue-50 text-blue-700 border-blue-200", icon: FileText };
    case "agenda":
      return { label: "Agenda", color: "bg-orange-50 text-orange-700 border-orange-200", icon: Calendar };
    case "staff":
      return { label: "Dosen & Staff", color: "bg-purple-50 text-purple-700 border-purple-200", icon: User };
    case "fasilitas":
      return { label: "Fasilitas", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Building2 };
    default:
      return { label: "Halaman", color: "bg-gray-50 text-gray-700 border-gray-200", icon: LinkIcon };
  }
};

export default function UniversalSearchCard({ item, locale }: UniversalSearchCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(getValidImageUrl(item.image));

  // 1. Memoize Type Info
  const typeInfo = useMemo(() => getTypeConfig(item.type), [item.type]);

  // 2. Format Tanggal Aman
  const dateLabel = useMemo(() => {
    if (!item.formattedDate) return "";
    const dateObj = new Date(item.formattedDate);
    if (!isValid(dateObj)) return "";

    return format(dateObj, "d MMMM yyyy", {
      locale: locale === "en" ? enUS : idLocale,
    });
  }, [item.formattedDate, locale]);

  // 3. Highlight Data (Meilisearch)
  // Menggunakan _formatted jika ada (untuk highlight kata kunci), jika tidak gunakan raw
  const titleHtml = item._formatted?.title || item.title;
  const contentHtml = item._formatted?.content || item.content || "Tidak ada deskripsi.";

  const finalLink = item.link ? `/${locale}${item.link}` : "#";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-lg hover:border-green-200 transition-all duration-300 group">



      <div className="flex gap-5 flex-col sm:flex-row items-start">

        {/* Gambar (Thumbnail) */}
        {item.image && (
          <div className="relative w-full sm:w-36 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
            <Image
              src={imgSrc}
              alt={item.title || "Thumbnail"}
              fill
              sizes="(max-width: 768px) 100vw, 150px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
            />
          </div>
        )}

        <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex child from overflowing */}

          {/* Header Card: Tipe & Tanggal */}
          <div className="flex flex-wrap items-center gap-3 mb-2.5">
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border flex items-center gap-1.5 ${typeInfo.color}`}
            >
              <typeInfo.icon size={12} />
              {typeInfo.label}
            </span>
            {dateLabel && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                • {dateLabel}
              </span>
            )}
          </div>

          {/* Judul Link */}
          <Link href={finalLink} className="block">
            <h3
              className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#005320] transition-colors line-clamp-2"
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          </Link>

          {/* Snippet / Deskripsi */}
          <div
            className="text-sm text-gray-600 line-clamp-2 leading-relaxed prose prose-sm max-w-none prose-p:my-0 prose-strong:text-green-700 prose-strong:bg-green-50 prose-strong:px-1 prose-strong:rounded"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

        </div>
      </div>
    </div>
  );
}