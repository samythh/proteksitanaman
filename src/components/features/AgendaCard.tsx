// src/components/features/AgendaCard.tsx
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Agenda } from "@/types/agenda";
import { FaChevronRight } from "react-icons/fa";

interface AgendaCardProps {
  data: Agenda;
  locale: string;
}

export default function AgendaCard({ data, locale }: AgendaCardProps) {
  const attr = (data as any).attributes || data;
  const { title, slug, startDate, endDate, image, tags } = attr;

  const imgUrl =
    getStrapiMedia(image?.data?.attributes?.url || image?.url) ||
    "/images/placeholder-agenda.jpg";

  // Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(
      locale === "en" ? "en-US" : "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  const dateDisplay =
    startStr === endStr ? startStr : `${startStr} - ${endStr}`;

  // --- LOGIKA TAGS ---
  const tagsList = Array.isArray(tags)
    ? tags
    : tags?.data || [
        { id: 1, attributes: { name: "Terbuka untuk umum" } },
        { id: 2, attributes: { name: "Sertifikat" } },
        { id: 3, attributes: { name: "Gratis" } },
        { id: 4, attributes: { name: "Online" } },
      ];

  const visibleTags = tagsList.slice(0, 2);
  const hiddenCount = tagsList.length - 2;

  const getTagStyle = (index: number) => {
    if (index === 0) return "bg-blue-600 text-white";
    if (index === 1) return "bg-green-600 text-white";
    return "bg-gray-200 text-gray-700";
  };

  return (
    // BUNGKUS SELURUH KARTU DENGAN LINK
    <Link
      href={`/${locale}/informasi/agenda/${slug}`}
      className="block h-full group" // 'block h-full' agar area klik memenuhi grid
    >
      <div className="bg-[#F3F4F6] rounded-3xl p-4 flex flex-col h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-green-200">
        {/* 1. GAMBAR POSTER */}
        <div className="relative w-full aspect-[3/4] mb-4 rounded-2xl overflow-hidden shadow-sm">
          <Image
            src={imgUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* 2. KONTEN TENGAH */}
        <div className="flex flex-col items-center text-center flex-grow">
          {/* Judul: Warna berubah saat hover kartu */}
          <h3 className="text-lg font-extrabold text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
            {title}
          </h3>

          {/* Tanggal */}
          <div className="w-full bg-white border border-gray-300 rounded-lg py-1.5 px-3 mb-4 shadow-sm">
            <p className="text-xs font-medium text-gray-700">{dateDisplay}</p>
          </div>
        </div>

        {/* 3. FOOTER: TAGS & ICON PANAH */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {/* Tags Area */}
          <div className="flex items-center gap-2 flex-wrap">
            {visibleTags.map((tag: any, index: number) => (
              <span
                key={tag.id}
                className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-sm ${getTagStyle(
                  index
                )}`}
              >
                {tag.attributes ? tag.attributes.name : tag.name}
              </span>
            ))}

            {hiddenCount > 0 && (
              <span className="bg-[#86EFAC] text-green-800 text-[10px] font-bold px-2 py-1.5 rounded-lg shadow-sm">
                +{hiddenCount}
              </span>
            )}
          </div>

          {/* Tombol Panah (Hanya Visual, bukan Link lagi) */}
        </div>
      </div>
    </Link>
  );
}
