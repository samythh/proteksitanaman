// src/components/features/AgendaHeroSlider.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Agenda } from "@/types/agenda";

// Import CSS Swiper (Wajib)
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { FaCalendarAlt, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";

interface AgendaHeroSliderProps {
  data: Agenda[];
  locale: string;
}

export default function AgendaHeroSlider({
  data,
  locale,
}: AgendaHeroSliderProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="relative w-full h-[50vh] min-h-[500px] bg-gray-900 group">
      <Swiper
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade" // Efek pudar saat ganti slide (lebih elegan)
        loop={true}
        autoplay={{
          delay: 5000, // Ganti slide setiap 5 detik
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        className="w-full h-full"
      >
        {data.map((item, index) => {
          // Ekstraksi Data (Support Strapi v4 & v5)
          const attr = (item as any).attributes || item;
          const { title, slug, startDate, location, image } = attr;

          const imgUrl = getStrapiMedia(
            image?.data?.attributes?.url || image?.url
          );

          return (
            <SwiperSlide key={item.id} className="relative w-full h-full">
              {/* Background Image */}
              {imgUrl ? (
                <Image
                  src={imgUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

              {/* Konten Teks */}
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-16 container mx-auto z-10 flex flex-col items-start justify-end h-full pb-16">
                <span className="inline-block bg-green-600 text-white text-xs font-bold px-3 py-1 rounded mb-4 shadow-sm">
                  HIGHLIGHT EVENT
                </span>

                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight max-w-4xl drop-shadow-lg">
                  {title}
                </h1>

                <div className="flex flex-wrap gap-6 text-gray-200 mb-8 text-sm md:text-base font-medium">
                  <div className="flex items-center gap-2">
                    <FaCalendarAlt className="text-orange-500" />
                    <span>
                      {new Date(startDate).toLocaleDateString(
                        locale === "id" ? "id-ID" : "en-US",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                  {location && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-green-500" />
                      <span>{location}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/${locale}/informasi/agenda/${slug}`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 font-bold rounded-full hover:bg-green-600 hover:text-white transition-all transform hover:scale-105 shadow-lg"
                >
                  {locale === "en" ? "View Details" : "Lihat Detail"}
                  <FaArrowRight />
                </Link>
              </div>
            </SwiperSlide>
          );
        })}

        {/* Tombol Navigasi Kustom (Muncul saat hover) */}
        <div className="swiper-button-prev !text-white/50 hover:!text-white after:!text-2xl transition-colors !hidden md:group-hover:!block pl-8"></div>
        <div className="swiper-button-next !text-white/50 hover:!text-white after:!text-2xl transition-colors !hidden md:group-hover:!block pr-8"></div>
      </Swiper>
    </div>
  );
}
