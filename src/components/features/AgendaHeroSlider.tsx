// src/components/features/AgendaHeroSlider.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Agenda } from "@/types/agenda";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

interface AgendaHeroSliderProps {
  data: Agenda[];
  locale: string;
}

export default function AgendaHeroSlider({
  data,
  locale,
}: AgendaHeroSliderProps) {
  if (!data || data.length === 0) return null;

  const formatDate = (dateString: string) => {
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

  return (
    // Container Utama: Tinggi sedikit ditambah agar elemen tidak sesak
    <div className="relative w-full h-[680px] md:h-[650px] mb-16 group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return (
              '<span class="' +
              className +
              ' !bg-white !w-3 !h-3 !opacity-50 aria-[current=true]:!bg-white aria-[current=true]:!opacity-100"></span>'
            );
          },
        }}
        navigation={{
          nextEl: ".hero-next",
          prevEl: ".hero-prev",
        }}
        className="w-full h-full"
      >
        {data.map((item, index) => {
          const attr = (item as any).attributes || item;
          const { title, slug, startDate, endDate, image, tags } = attr;
          const imgUrl = getStrapiMedia(
            image?.data?.attributes?.url || image?.url
          );

          const startStr = formatDate(startDate);
          const endStr = formatDate(endDate);
          const dateDisplay =
            startStr === endStr ? startStr : `${startStr} - ${endStr}`;

          const dummyTags = [
            { id: 1, attributes: { name: "Terbuka untuk umum" } },
            { id: 2, attributes: { name: "Sertifikat" } },
            { id: 3, attributes: { name: "Free Entry" } },
          ];
          const tagsList = Array.isArray(tags) ? tags : tags?.data || dummyTags;

          return (
            <SwiperSlide
              key={item.id}
              className="relative w-full h-full overflow-hidden"
            >
              {/* 1. BACKGROUND BLUR (Full Screen) */}
              {imgUrl && (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={imgUrl}
                    alt={title}
                    fill
                    quality={100}
                    priority={index === 0}
                    className="object-cover filter blur-2xl scale-110 brightness-75"
                  />
                </div>
              )}

              {/* 2. CONTENT CONTAINER (CENTERED) */}
              {/* Flexbox digunakan untuk memastikan kartu berada tepat di tengah layar */}
              <div className="relative z-10 w-full h-full flex items-center justify-center px-4 md:px-0">
                {/* KARTU GLASSMORPHISM */}
                {/* Update: max-w-5xl (lebih kecil dari sebelumnya max-w-6xl) */}
                <div className="w-full max-w-5xl bg-white/85 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center transform transition-all mx-auto">
                  {/* KOLOM KIRI: POSTER IMAGE */}
                  <div className="md:col-span-5 relative aspect-[3/4] w-full max-w-[280px] mx-auto md:max-w-full rounded-2xl overflow-hidden shadow-lg bg-gray-200">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 40vw"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 animate-pulse" />
                    )}
                  </div>

                  {/* KOLOM KANAN: TEXT CONTENT */}
                  <div className="md:col-span-7 flex flex-col items-start text-left space-y-5 py-2">
                    {/* Judul Besar */}
                    <h1 className="text-2xl md:text-4xl lg:text-[2.75rem] font-extrabold text-gray-900 leading-tight drop-shadow-sm">
                      {title}
                    </h1>

                    {/* Date Pill */}
                    <div className="bg-white border border-gray-300 px-4 py-1.5 rounded-lg shadow-sm">
                      <p className="text-sm font-semibold text-gray-700">
                        {dateDisplay}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {tagsList.slice(0, 3).map((tag: any, idx: number) => (
                        <span
                          key={tag.id}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${getTagStyle(
                            idx
                          )}`}
                        >
                          {tag.attributes ? tag.attributes.name : tag.name}
                        </span>
                      ))}
                    </div>

                    {/* Tombol Selengkapnya */}
                    <div className="pt-4">
                      <Link
                        href={`/${locale}/informasi/agenda/${slug}`}
                        className="group inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all duration-300"
                      >
                        {locale === "en" ? "Read More" : "Selengkapnya"}
                        <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* --- TOMBOL NAVIGASI --- */}
      <button className="hero-prev absolute top-1/2 left-4 md:left-8 z-20 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-gray-100 transition-all disabled:opacity-50">
        <FaChevronLeft className="text-xl md:text-2xl" />
      </button>

      <button className="hero-next absolute top-1/2 right-4 md:right-8 z-20 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:bg-gray-100 transition-all disabled:opacity-50">
        <FaChevronRight className="text-xl md:text-2xl" />
      </button>
    </div>
  );
}
