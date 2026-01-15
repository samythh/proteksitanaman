// src/components/features/AgendaCard.tsx
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Agenda } from "@/types/agenda";
import { FaMapMarkerAlt, FaCalendarAlt, FaArrowRight } from "react-icons/fa";

interface AgendaCardProps {
  data: Agenda;
  locale: string;
}

export default function AgendaCard({ data, locale }: AgendaCardProps) {
  // Support Strapi v4 & v5
  const attr = (data as any).attributes || data;

  const { title, slug, startDate, endDate, location, image } = attr;

  // Helper Image URL
  const imgUrl =
    getStrapiMedia(image?.data?.attributes?.url || image?.url) ||
    "/images/placeholder-agenda.jpg"; // Pastikan ada placeholder

  // Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(
      locale === "en" ? "en-US" : "id-ID",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imgUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge Tanggal */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-green-700 shadow-sm">
          {formatDate(startDate)}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-green-700 transition-colors">
          {title}
        </h3>

        <div className="space-y-2 mt-auto">
          {/* Lokasi */}
          <div className="flex items-center text-gray-500 text-sm">
            <FaMapMarkerAlt className="w-4 h-4 mr-2 text-green-600 shrink-0" />
            <span className="truncate">{location || "Kampus Unand"}</span>
          </div>

          {/* Waktu */}
          <div className="flex items-center text-gray-500 text-sm">
            <FaCalendarAlt className="w-4 h-4 mr-2 text-orange-500 shrink-0" />
            <span>
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
          </div>
        </div>

        {/* Button */}
        <Link
          href={`/${locale}/informasi/agenda/${slug}`}
          className="mt-4 w-full py-2 bg-gray-50 text-green-700 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 group-hover:bg-green-600 group-hover:text-white transition-all"
        >
          {locale === "en" ? "Details" : "Detail Acara"}
          <FaArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
