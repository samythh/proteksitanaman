"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { isValid } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";

// --- KONFIGURASI ---
const PLACEHOLDER_IMAGE = "https://placehold.co/600x800/png?text=Agenda+No+Image";
const STRAPI_BASE_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.backendn8n.cloud";

// --- TIPE DATA ---
interface StrapiImageV5 {
  url: string;
  alternativeText?: string;
}

interface TagV5 {
  id: number;
  name: string;
}

export interface AgendaItemV5 {
  id: number;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  image?: StrapiImageV5;
  tags?: TagV5[];
}

interface AgendaCardProps {
  data: AgendaItemV5;
  locale: string;
}

// --- HELPER: LOGIC URL GAMBAR ---
const getValidImageUrl = (item: AgendaItemV5): string => {
  const rawUrl = item.image?.url;

  if (!rawUrl) return PLACEHOLDER_IMAGE;

  if (rawUrl.startsWith("http")) {
    return rawUrl.includes("202.10.34.176")
      ? rawUrl.replace("http://202.10.34.176:1337", STRAPI_BASE_URL)
      : rawUrl;
  }

  return rawUrl.startsWith("/") ? `${STRAPI_BASE_URL}${rawUrl}` : PLACEHOLDER_IMAGE;
};

// --- HELPER: TAG STYLE ---
const getTagStyle = (idx: number) => {
  const styles = [
    "bg-blue-50 text-blue-700 border-blue-200",
    "bg-green-50 text-green-700 border-green-200",
    "bg-purple-50 text-purple-700 border-purple-200",
  ];
  return styles[idx % styles.length];
};

export default function AgendaCard({ data, locale }: AgendaCardProps) {
  const t = useTranslations("AgendaCard");

  const { title, slug, startDate, endDate, tags } = data;

  const [imgSrc, setImgSrc] = useState<string>(getValidImageUrl(data));

  // Logic Tanggal
  const dateDisplay = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isValid(start) || !isValid(end)) return "-";

    const fmt = (d: Date) => d.toLocaleDateString(
      locale === "en" ? "en-US" : "id-ID",
      { day: "numeric", month: "short", year: "numeric" }
    );

    const startStr = fmt(start);
    const endStr = fmt(end);

    return startStr === endStr ? startStr : `${startStr} - ${endStr}`;
  }, [startDate, endDate, locale]);

  // ✅ LOGIC STATUS (Fixed Dependency)
  const status = useMemo(() => {
    const now = new Date();
    const s = new Date(startDate);
    const e = new Date(endDate);

    now.setHours(0, 0, 0, 0);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    if (now < s) {
      return {
        label: t("status_upcoming"),
        classes: "bg-blue-600 text-white border-blue-700 shadow-blue-200"
      };
    } else if (now > e) {
      return {
        label: t("status_finished"),
        classes: "bg-gray-500 text-white border-gray-600 shadow-gray-200"
      };
    } else {
      return {
        label: t("status_ongoing"),
        classes: "bg-green-600 text-white border-green-700 shadow-green-200 animate-pulse"
      };
    }
  }, [startDate, endDate, t]); 

  // Logic Tags
  const tagsList = Array.isArray(tags) && tags.length > 0
    ? tags
    : [{ id: 0, name: t("default_tag") }];

  const visibleTags = tagsList.slice(0, 2);
  const hiddenCount = tagsList.length - 2;

  return (
    <Link href={`/${locale}/informasi/agenda/${slug}`} className="group block h-full">
      <div className="bg-white rounded-[1.5rem] p-4 flex flex-col h-full shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-green-200 transition-all duration-300">

        {/* 1. GAMBAR POSTER */}
        <div className="relative w-full aspect-[3/4] mb-4 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
          <Image
            src={imgSrc}
            alt={title || t("poster_alt")}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImgSrc(PLACEHOLDER_IMAGE)}
          />

          {/* STATUS BADGE */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md border ${status.classes}`}>
            {status.label}
          </div>

          {/* LABEL AGENDA */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md border border-gray-100 flex items-center gap-1.5 text-xs font-bold text-gray-800">
            <CalendarDays size={14} className="text-[#005320]" />
            {t("label")}
          </div>
        </div>

        {/* 2. KONTEN TENGAH */}
        <div className="flex flex-col items-center text-center flex-grow space-y-3">
          <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#005320] transition-colors">
            {title}
          </h3>
          <div className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-xs font-medium text-gray-600 flex items-center justify-center gap-2">
            <CalendarDays size={14} className="text-gray-400" />
            {dateDisplay}
          </div>
        </div>

        {/* 3. FOOTER: TAGS */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 flex-wrap w-full">
          {visibleTags.map((tag, index) => (
            <span
              key={tag.id || index}
              className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wide ${getTagStyle(index)}`}
            >
              {tag.name}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded bg-gray-100 text-gray-500 border border-gray-200">
              +{hiddenCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}