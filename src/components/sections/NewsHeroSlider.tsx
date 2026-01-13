// File: src/components/sections/NewsHeroSlider.tsx
"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Calendar, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const CATEGORY_COLORS: Record<string, string> = {
  "Strong-Blue": "#1E3A8A",
  "Soft-Blue": "#3B82F6",
  "Sky-Blue": "#0EA5E9",
  "Pastel-Yellow": "#FCD34D",
  "Pure-Red": "#EF4444",
  "Dark-Red": "#7F1D1D",
  "Green-Default": "#005320"
};

export interface ArticleSlide {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  cover: {
    url: string;
    alternativeText?: string;
  };
  category?: {
    name: string;
    color?: string;
  };
}

interface NewsHeroSliderProps {
  articles: ArticleSlide[];
}

export default function NewsHeroSlider({ articles = [] }: NewsHeroSliderProps) {
  const params = useParams();
  const locale = (params?.locale as string) || "id";

  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);

  const handlePrev = useCallback(() => {
    if (!swiperRef) return;
    swiperRef.slidePrev();
  }, [swiperRef]);

  const handleNext = useCallback(() => {
    if (!swiperRef) return;
    swiperRef.slideNext();
  }, [swiperRef]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const limitWords = (text: string | undefined, limit: number) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }
    return text;
  };

  if (!articles || articles.length === 0) return null;

  return (
    // PERBAIKAN: Menambahkan '-mt-6 md:-mt-8' untuk menarik komponen ke atas
    <section className="container mx-auto px-4 -mt-6 md:-mt-8 relative z-10">

      {/* Container Box: Tinggi disesuaikan agar compact */}
      <div className="relative group rounded-2xl overflow-hidden shadow-xl bg-gray-900 h-[450px] md:h-[380px]">

        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          onSwiper={setSwiperRef}
          effect="fade"
          speed={1000}
          loop={true}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{
            clickable: true,
            el: '.hero-pagination-custom',
          }}
          className="w-full h-full"
        >
          {articles.map((item) => {
            const imageUrl = getStrapiMedia(item.cover?.url);
            const colorName = item.category?.color || "Green-Default";
            const badgeColor = CATEGORY_COLORS[colorName] || CATEGORY_COLORS["Green-Default"];
            const isYellow = colorName === "Pastel-Yellow";
            const badgeTextColor = isYellow ? "text-black" : "text-white";

            return (
              <SwiperSlide key={item.id} className="relative w-full h-full">

                {/* BACKGROUND LAYER */}
                <div className="absolute inset-0 z-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover opacity-60 md:opacity-50 blur-[2px] scale-105"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:hidden" />
                </div>

                {/* KONTEN LAYER */}
                <div className="absolute inset-0 z-10 flex items-center px-6 md:px-12 lg:px-16">
                  <div className="grid grid-cols-12 w-full gap-6 items-center">

                    {/* KOLOM KIRI (TEKS) */}
                    <div className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col justify-center space-y-3">

                      {/* Meta Data */}
                      <div className="flex items-center gap-3">
                        {item.category && (
                          <span
                            className={`px-3 py-1 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm ${badgeTextColor}`}
                            style={{ backgroundColor: badgeColor }}
                          >
                            {item.category.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-300 text-[10px] md:text-xs font-medium">
                          <Calendar className="w-3 h-3 text-yellow-500" />
                          {formatDate(item.publishedAt)}
                        </div>
                      </div>

                      {/* Judul */}
                      <Link href={`/${locale}/informasi/berita/${item.slug}`} className="group/title block">
                        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white leading-tight group-hover/title:text-yellow-400 transition-colors drop-shadow-lg">
                          {limitWords(item.title, 10)}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      {item.excerpt && (
                        <p className="text-gray-300 text-xs md:text-sm max-w-xl hidden sm:block leading-relaxed line-clamp-2">
                          {limitWords(item.excerpt, 15)}
                        </p>
                      )}

                      {/* Tombol */}
                      <div className="pt-1">
                        <Link
                          href={`/${locale}/informasi/berita/${item.slug}`}
                          className="inline-flex items-center gap-2 bg-white text-[#005320] px-5 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-all text-xs md:text-sm shadow-lg transform hover:-translate-y-1"
                        >
                          Baca Artikel
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* KOLOM KANAN (GAMBAR POPOUT) */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-4 hidden md:flex justify-end relative pr-4">
                      {imageUrl && (
                        <div className="relative w-[280px] h-[180px] lg:w-[320px] lg:h-[200px] rounded-xl overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)] border-2 border-white/10 group-hover:scale-105 transition-transform duration-700 rotate-2 bg-black">
                          <Image src={imageUrl} alt={item.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* NAVIGATION BUTTONS */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#005320] text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#005320] text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* PAGINATION */}
        <div className="hero-pagination-custom absolute bottom-4 left-0 w-full flex justify-center z-20 gap-2" />

        <style jsx global>{`
          .hero-pagination-custom .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.4);
            opacity: 1;
            width: 8px;
            height: 8px;
            margin: 0 4px;
            border-radius: 50%;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .hero-pagination-custom .swiper-pagination-bullet-active {
            background: #facc15; 
            width: 24px;
            border-radius: 999px;
          }
        `}</style>

      </div>
    </section>
  );
}