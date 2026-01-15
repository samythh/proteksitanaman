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

import { FaCalendarAlt, FaArrowRight } from "react-icons/fa";

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
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto mt-8 mb-16 px-4 h-[500px] md:h-[550px] group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          renderBullet: function (index, className) {
            return (
              '<span class="' +
              className +
              ' !bg-white !opacity-50 hover:!opacity-100 aria-[current=true]:!bg-yellow-400 aria-[current=true]:!opacity-100"></span>'
            );
          },
        }}
        navigation={{
          nextEl: ".button-next-hero",
          prevEl: ".button-prev-hero",
        }}
        className="w-full h-full rounded-3xl overflow-hidden shadow-2xl"
      >
        {data.map((item, index) => {
          const attr = (item as any).attributes || item;
          const { title, slug, startDate, image } = attr;
          const imgUrl = getStrapiMedia(
            image?.data?.attributes?.url || image?.url
          );

          return (
            <SwiperSlide
              key={item.id}
              className="relative w-full h-full bg-gray-900 overflow-hidden"
            >
              {/* LAYER 1: BACKGROUND BLUR */}
              {imgUrl && (
                <div className="absolute inset-0 z-0">
                  <Image
                    src={imgUrl}
                    alt={title}
                    fill
                    // UPDATE 1: Tambahkan quality={10} (Sangat rendah karena akan diblur)
                    quality={50}
                    // UPDATE 2: Pastikan sizes 100vw
                    sizes="100vw"
                    className="object-cover filter blur-xl scale-110 opacity-50"
                    // UPDATE 3: Priority HANYA untuk slide pertama (index 0)
                    priority={index === 0}

                    // (Opsional) Tambahkan fetchPriority jika Next.js versi terbaru mendukung
                    // fetchPriority={index === 0 ? "high" : "auto"}
                  />
                  <div className="absolute inset-0 bg-black/30" />
                </div>
              )}

              {/* LAYER 2: KONTEN GRID */}
              <div className="relative z-10 h-full container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 items-center gap-8">
                {/* KOLOM KIRI */}
                <div className="md:col-span-7 lg:col-span-7 flex flex-col items-start text-white pt-10 md:pt-0 order-2 md:order-1">
                  <div className="flex items-center flex-wrap gap-4 mb-6">
                    {/* UPDATE: Badge hanya 'Agenda' */}
                    <span className="inline-block bg-yellow-400 text-black text-xs uppercase font-bold px-3 py-1.5 rounded-md tracking-wider shadow-sm">
                      {locale === "en" ? "Upcoming Event" : "Agenda"}
                    </span>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <FaCalendarAlt />
                      <span>{formatDate(startDate)}</span>
                    </div>
                  </div>

                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg line-clamp-3">
                    {title}
                  </h1>

                  {/* UPDATE: Text Button diubah */}
                  <Link
                    href={`/${locale}/informasi/agenda/${slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-all transform hover:-translate-y-1 shadow-lg"
                  >
                    {locale === "en" ? "Event Details" : "Detail Acara"}
                    <FaArrowRight className="text-sm" />
                  </Link>
                </div>

                {/* KOLOM KANAN: Kartu Gambar */}
                <div className="md:col-span-5 lg:col-span-5 hidden md:block h-full py-12 order-1 md:order-2 relative">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 relative z-20 transform rotate-2 hover:rotate-0 transition-all duration-500">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Tombol Navigasi */}
      {/* Tombol Kiri (Prev) */}
      <button className="button-prev-hero absolute top-1/2 left-4 md:-left-6 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 hover:bg-green-600 border border-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
        <FaArrowRight className="rotate-180 text-lg" />
      </button>

      {/* Tombol Kanan (Next) */}
      <button className="button-next-hero absolute top-1/2 right-4 md:-right-6 -translate-y-1/2 z-20 w-12 h-12 bg-black/40 hover:bg-green-600 border border-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all shadow-lg group-hover:scale-110">
        <FaArrowRight className="text-lg" />
      </button>
    </div>
  );
}
