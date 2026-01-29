// File: src/components/sections/NewsHeroSlider.tsx
"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
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

  const handlePrev = useCallback(() => swiperRef?.slidePrev(), [swiperRef]);
  const handleNext = useCallback(() => swiperRef?.slideNext(), [swiperRef]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  const limitWords = (text: string | undefined, limit: number) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section className="container mx-auto px-4 -mt-6 md:-mt-8 relative z-10 mb-12">

      {/* Container Box */}
      <div className="relative group rounded-3xl overflow-hidden shadow-2xl bg-gray-900 h-[450px] md:h-[400px]">

        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          onSwiper={setSwiperRef}
          effect="fade"
          speed={1000}
          loop={true}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true, el: '.hero-pagination-custom' }}
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

                {/* --- BACKGROUND LAYER --- */}
                <div className="absolute inset-0 z-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover opacity-60 md:opacity-50 blur-[3px] scale-105"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                </div>

                {/* --- CONTENT LAYER --- */}
                <div className="absolute inset-0 z-10 flex items-center px-6 md:px-12 lg:px-16">
                  <div className="grid grid-cols-12 w-full gap-6 items-center">

                    {/* KOLOM KIRI: TEKS UTAMA */}
                    <div className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col justify-center space-y-4">

                      {/* Meta Badge */}
                      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-700">
                        {item.category && (
                          <span
                            className={`px-3 py-1 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm ${badgeTextColor}`}
                            style={{ backgroundColor: badgeColor }}
                          >
                            {item.category.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-300 text-xs font-medium bg-black/30 px-2 py-1 rounded-md backdrop-blur-sm border border-white/10">
                          <Calendar className="w-3 h-3 text-yellow-400" />
                          {formatDate(item.publishedAt)}
                        </div>
                      </div>

                      {/* Judul Artikel */}
                      <Link href={`/informasi/berita/${item.slug}`} className="group/title block">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight group-hover/title:text-yellow-400 transition-colors drop-shadow-lg line-clamp-3">
                          {limitWords(item.title, 12)}
                        </h2>
                      </Link>

                      {/* Excerpt */}
                      {item.excerpt && (
                        <p className="text-gray-300 text-sm md:text-base max-w-xl hidden sm:block leading-relaxed line-clamp-2">
                          {limitWords(item.excerpt, 20)}
                        </p>
                      )}

                      {/* Tombol Baca */}
                      <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                        <Link
                          href={`/informasi/berita/${item.slug}`}
                          className="inline-flex items-center gap-2 bg-white text-[#005320] px-6 py-2.5 rounded-full font-bold hover:bg-yellow-400 hover:text-[#005320] transition-all text-sm shadow-lg transform hover:-translate-y-1 active:scale-95"
                        >
                          {locale === 'en' ? 'Read Article' : 'Baca Artikel'}
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* KOLOM KANAN: GAMBAR POPOUT (Desktop Only) */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-4 hidden md:flex justify-end relative pr-6">
                      {imageUrl && (
                        <div className="relative w-[280px] h-[180px] lg:w-[340px] lg:h-[220px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 group-hover:scale-105 transition-transform duration-1000 rotate-3 hover:rotate-0 bg-black animate-in zoom-in-50">
                          <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
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

        {/* --- CONTROLS --- */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-[#005320] text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-300"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-[#005320] text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* --- CUSTOM PAGINATION --- */}
        <div className="hero-pagination-custom absolute bottom-6 left-0 w-full flex justify-center z-20 gap-2 pointer-events-none" />

        <style jsx global>{`
          .hero-pagination-custom .swiper-pagination-bullet {
            background: rgba(255, 255, 255, 0.3);
            opacity: 1;
            width: 8px;
            height: 8px;
            margin: 0 4px;
            border-radius: 50%;
            transition: all 0.3s ease;
            cursor: pointer;
            pointer-events: auto;
          }
          .hero-pagination-custom .swiper-pagination-bullet-active {
            background: #facc15; 
            width: 32px;
            border-radius: 999px;
          }
        `}</style>

      </div>
    </section>
  );
}