// src/components/features/UniversalSearchCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import {
  FaCalendarAlt,
  FaUserTie,
  FaBuilding,
  FaNewspaper,
} from "react-icons/fa";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/png?text=No+Image";
const STRAPI_BASE_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.backendn8n.cloud";

interface UniversalSearchCardProps {
  item: any;
  locale: string;
}

export default function UniversalSearchCard({
  item,
  locale,
}: UniversalSearchCardProps) {
  // Logic Gambar
  let imageUrl = item.image || PLACEHOLDER_IMAGE;
  if (typeof imageUrl === "string") {
    if (imageUrl.startsWith("/")) {
      imageUrl = `${STRAPI_BASE_URL}${imageUrl}`;
    } else if (imageUrl.includes("202.10.34.176")) {
      imageUrl = imageUrl.replace("http://202.10.34.176:1337", STRAPI_BASE_URL);
    }
  }

  // Format Tanggal
  let dateLabel = "";
  if (item.formattedDate) {
    try {
      dateLabel = format(new Date(item.formattedDate), "d MMMM yyyy", {
        locale: locale === "en" ? enUS : idLocale,
      });
    } catch (e) {
      /* ignore */
    }
  }

  // Highlight Data
  const titleHtml = item._formatted?.title || item.title;
  const contentHtml =
    item._formatted?.content || item.content || "Tidak ada deskripsi.";

  // Badge & Icon Logic
  const getTypeInfo = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t === "article")
      return {
        label: "Berita",
        color: "bg-blue-100 text-blue-800",
        icon: <FaNewspaper />,
      };
    if (t === "agenda")
      return {
        label: "Agenda",
        color: "bg-orange-100 text-orange-800",
        icon: <FaCalendarAlt />,
      };
    if (t === "staff")
      return {
        label: "Dosen & Staff",
        color: "bg-purple-100 text-purple-800",
        icon: <FaUserTie />,
      };
    if (t === "fasilitas")
      return {
        label: "Fasilitas",
        color: "bg-emerald-100 text-emerald-800",
        icon: <FaBuilding />,
      };
    return { label: "Halaman", color: "bg-gray-100 text-gray-800", icon: null };
  };

  const typeInfo = getTypeInfo(item.type);
  const finalLink = item.link ? `/${locale}${item.link}` : "#";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
      <div className="flex gap-4 flex-col sm:flex-row">
        {/* Gambar (Thumbnail Kecil di Kiri - Opsional) */}
        {item.image && (
          <div className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={item.title || "Thumbnail"}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).srcset = PLACEHOLDER_IMAGE;
              }}
            />
          </div>
        )}

        <div className="flex-1">
          {/* Header Card: Tipe & Tanggal */}
          <div className="flex items-center gap-3 mb-2 text-xs">
            <span
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 ${typeInfo.color}`}
            >
              {typeInfo.icon} {typeInfo.label}
            </span>
            {dateLabel && <span className="text-gray-500">{dateLabel}</span>}
          </div>

          {/* Judul Link */}
          <Link href={finalLink} className="group">
            <h3
              className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 group-hover:underline decoration-2 underline-offset-2"
              dangerouslySetInnerHTML={{ __html: titleHtml }}
            />
          </Link>

          {/* Snippet / Deskripsi */}
          <div
            className="text-sm text-gray-600 line-clamp-3 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </div>
    </div>
  );
}
