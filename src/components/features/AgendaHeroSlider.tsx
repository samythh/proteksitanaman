"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// --- TIPE DATA ---
interface AgendaImage {
  url?: string;
  data?: {
    attributes?: { url: string };
  } | null;
}

interface TagItem {
  id: number;
  attributes?: { name: string };
  name?: string;
}

interface AgendaData {
  id: number;
  title: string;
  slug: string;
  startDate: string;
  endDate: string;
  image?: AgendaImage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tags?: any;
}

interface AgendaHeroSliderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  locale: string;
}

export default function AgendaHeroSlider({ data, locale }: AgendaHeroSliderProps) {
  const t = useTranslations("AgendaHeroSlider");

  if (!data || data.length === 0) return null;

  // --- HELPERS ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(
      locale === "id" ? "id-ID" : "en-US",
      { day: "numeric", month: "long", year: "numeric" }
    );
  };

  const getTagStyle = (idx: number) => {
    if (idx === 0) return "bg-blue-600 text-white";
    if (idx === 1) return "bg-green-600 text-white";
    return "bg-purple-500 text-white";
  };

  // Meggunakan Translation
  const getEventStatus = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Reset jam agar perbandingan tanggal akurat
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (now < startDate) {
      return {
        label: t("status_upcoming"), 
        color: "bg-blue-100 text-blue-700 border-blue-200"
      };
    } else if (now > endDate) {
      return {
        label: t("status_finished"), 
        color: "bg-gray-100 text-gray-500 border-gray-200"
      };
    } else {
      return {
        label: t("status_ongoing"), 
        color: "bg-green-100 text-green-700 border-green-200 animate-pulse"
      };
    }
  };

  return (
    <div className="relative w-full h-[680px] md:h-[650px] mb-16 group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={data.length > 1}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return `<span class="${className} !bg-white !w-3 !h-3 !opacity-50 aria-[current=true]:!bg-white aria-[current=true]:!opacity-100"></span>`;
          },
        }}
        navigation={{
          nextEl: ".hero-next",
          prevEl: ".hero-prev",
        }}
        className="w-full h-full"
      >
        {data.map((item, index) => {
          const attr = item.attributes || item;
          const { title, slug, startDate, endDate, image, tags } = attr as AgendaData;

          const imgUrl = getStrapiMedia(
            image?.url || image?.data?.attributes?.url
          );

          let tagsList: TagItem[] = [];
          if (Array.isArray(tags)) {
            tagsList = tags;
          } else if (tags?.data && Array.isArray(tags.data)) {
            tagsList = tags.data;
          }
          if (tagsList.length === 0) tagsList = [{ id: 0, name: t("default_tag") }];

          const startStr = formatDate(startDate);
          const endStr = formatDate(endDate);
          const dateDisplay = startStr === endStr ? startStr : `${startStr} - ${endStr}`;

          // Ambil Status
          const status = getEventStatus(startDate, endDate);

          return (
            <SwiperSlide key={item.id} className="relative w-full h-full overflow-hidden">
              {/* BACKGROUND */}
              {imgUrl && (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={imgUrl}
                    alt={title || t("default_tag")} 
                    fill
                    priority={index === 0}
                    className="object-cover filter blur-2xl scale-110 brightness-75"
                  />
                </div>
              )}

              {/* CONTENT */}
              <div className="relative z-10 w-full h-full flex items-center justify-center px-4 md:px-0">
                <div className="w-full max-w-5xl bg-white/85 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center mx-auto">

                  {/* POSTER */}
                  <div className="md:col-span-5 relative aspect-[3/4] w-full max-w-[280px] mx-auto md:max-w-full rounded-2xl overflow-hidden shadow-lg bg-gray-200">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={title || "Poster"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        {t("no_image")}
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="md:col-span-7 flex flex-col items-start text-left space-y-5 py-2">
                    <h1 className="text-2xl md:text-4xl lg:text-[2.75rem] font-extrabold text-gray-900 leading-tight drop-shadow-sm">
                      {title}
                    </h1>

                    {/* Date + Status Badge */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-white border border-gray-300 px-4 py-1.5 rounded-lg shadow-sm">
                        <p className="text-sm font-semibold text-gray-700">
                          {dateDisplay}
                        </p>
                      </div>

                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border ${status.color}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tagsList.slice(0, 3).map((tag, idx) => (
                        <span key={tag.id} className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${getTagStyle(idx)}`}>
                          {tag.attributes?.name || tag.name || t("default_tag")} 
                        </span>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link
                        href={`/${locale}/informasi/agenda/${slug}`}
                        className="group inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all duration-300"
                      >
                        {t("read_more")}
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <button className="hero-prev absolute top-1/2 left-4 md:left-8 z-20 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-gray-100 transition-all disabled:opacity-50">
        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      <button className="hero-next absolute top-1/2 right-4 md:right-8 z-20 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-gray-100 transition-all disabled:opacity-50">
        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
      </button>
    </div>
  );
}