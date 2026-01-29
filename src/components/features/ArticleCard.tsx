"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { useTranslations } from "next-intl"; 

// --- CONFIG WARNA KATEGORI ---
const CATEGORY_COLORS: Record<string, string> = {
  "Strong-Blue": "#1E3A8A",
  "Soft-Blue": "#3B82F6",
  "Sky-Blue": "#0EA5E9",
  "Pastel-Yellow": "#FCD34D",
  "Pure-Red": "#EF4444",
  "Dark-Red": "#7F1D1D",
  "Green-Default": "#005320"
};

const getTextColor = (colorName: string | undefined) => {
  if (colorName === "Pastel-Yellow") return "text-black";
  return "text-white";
};

// --- TYPES ---
export interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
  publishedDate?: string;
  image?: {
    url: string;
  } | null;
  category?: {
    name: string;
    color?: string;
  };
  description?: string;
}

interface ArticleCardProps {
  data: ArticleItem;
  locale: string;
}

export default function ArticleCard({ data, locale }: ArticleCardProps) {
  const t = useTranslations("ArticleCard");

  // 1. Data Processing
  const imgUrl = getStrapiMedia(data.image?.url || null);

  // Jika kategori dari Strapi kosong, ambil default dari JSON (News/Berita)
  const categoryName = data.category?.name || t("default_category");

  const strapiColorValue = data.category?.color || "Green-Default";

  // Tentukan Warna Background & Teks
  const backgroundColorHex = CATEGORY_COLORS[strapiColorValue] || CATEGORY_COLORS["Green-Default"];
  const textColorClass = getTextColor(strapiColorValue);

  // Format Date (Date formatting bawaan JS sudah aman, tapi locale-nya dinamis)
  const dateStr = data.publishedDate || data.publishedAt;
  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
    day: "numeric",
    month: "long",
    year: "numeric"
  }) : "-";

  return (
    <Link
      href={`/${locale}/informasi/berita/${data.slug}`}
      className="group flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
    >
      {/* A. IMAGE CONTAINER */}
      <div className="relative w-full h-56 overflow-hidden bg-gray-100">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={data.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            {t("no_image")}
          </div>
        )}

        {/* B. BADGE CATEGORY (Absolute) */}
        <span
          className={`absolute top-3 left-3 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md shadow-md z-10 ${textColorClass}`}
          style={{ backgroundColor: backgroundColorHex, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
        >
          {categoryName}
        </span>
      </div>

      {/* C. CONTENT BODY */}
      <div className="p-5 flex flex-col flex-grow">

        {/* Date Info */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-medium">{formattedDate}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#005320] line-clamp-2 leading-snug mb-3 transition-colors">
          {data.title}
        </h3>

        {/* Excerpt / Description */}
        {data.description && (
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4 flex-grow">
            {data.description}
          </p>
        )}

        {/* Read More Link (Visual) */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <span className="text-xs font-bold text-[#005320] group-hover:underline inline-flex items-center gap-1">
            {t("read_more")} &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}