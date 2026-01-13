// File: src/components/sections/NewsHeroSlider.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Calendar, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";

// @ts-expect-error - Swiper CSS types
import "swiper/css";
// @ts-expect-error - Swiper CSS types
import "swiper/css/effect-fade";
// @ts-expect-error - Swiper CSS types
import "swiper/css/navigation";
// @ts-expect-error - Swiper CSS types
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

  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);

  if (!articles || articles.length === 0) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // --- FUNGSI PEMBATAS KATA ---
  const limitWords = (text: string | undefined, limit: number) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > limit) {
      return words.slice(0, limit).join(" ") + "...";
    }
    return text;
  };

  return (
    // PERBAIKAN POSISI: Hapus mt-4 agar lebih naik ke atas
    <section className="container mx-auto px-4 py-4">

      <div className="relative group">
        <Swiper
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          speed={1000}
          loop={true}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          navigation={{ prevEl, nextEl }}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="w-full h-[550px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl bg-gray-900"
        >
          {articles.map((item) => {
            const imageUrl = getStrapiMedia(item.cover?.url);

            const colorName = item.category?.color || "Green-Default";
            const badgeColor = CATEGORY_COLORS[colorName] || CATEGORY_COLORS["Green-Default"];
            const isYellow = colorName === "Pastel-Yellow";
            const badgeTextColor = isYellow ? "text-black" : "text-white";

            return (
              <SwiperSlide key={item.id} className="relative w-full h-full">
                {/* Background Layer */}
                <div className="absolute inset-0 z-0">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover opacity-60 md:opacity-40 blur-[3px] scale-105"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:hidden" />
                </div>

                {/* Content Layer */}
                <div className="absolute inset-0 z-10 flex items-center px-6 md:px-12 lg:px-16">
                  <div className="grid grid-cols-12 w-full gap-8 items-center">

                    {/* Kolom Kiri */}
                    <div className="col-span-12 md:col-span-7 lg:col-span-8 flex flex-col justify-center space-y-4">

                      {/* Badge Kategori */}
                      <div className="flex items-center gap-3">
                        {item.category && (
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm ${badgeTextColor}`}
                            style={{ backgroundColor: badgeColor }}
                          >
                            {item.category.name}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-gray-300 text-xs md:text-sm font-medium">
                          <Calendar className="w-3.5 h-3.5 text-yellow-500" />
                          {formatDate(item.publishedAt)}
                        </div>
                      </div>

                      {/* Judul Artikel: Dibatasi maksimal 10 kata */}
                      <Link href={`/${locale}/informasi/berita/${item.slug}`} className="group/title block">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight group-hover/title:text-yellow-400 transition-colors drop-shadow-lg">
                          {limitWords(item.title, 10)}
                        </h2>
                      </Link>

                      {/* Excerpt: Dibatasi maksimal 15 kata agar ringkas */}
                      {item.excerpt && (
                        <p className="text-gray-300 text-sm md:text-base max-w-xl hidden sm:block">
                          {limitWords(item.excerpt, 15)}
                        </p>
                      )}

                      <div className="pt-2">
                        <Link
                          href={`/${locale}/informasi/berita/${item.slug}`}
                          className="inline-flex items-center gap-2 bg-white text-[#005320] px-6 py-2.5 rounded-lg font-bold hover:bg-yellow-400 transition-all text-sm md:text-base shadow-lg transform hover:-translate-y-1"
                        >
                          Baca Artikel
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    {/* Kolom Kanan (Gambar Pop-out) */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-4 hidden md:flex justify-end relative pr-4">
                      {imageUrl && (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 border-white/10 group-hover:scale-105 transition-transform duration-700 rotate-1 bg-black">
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

        <button ref={(node) => setPrevEl(node)} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#005320] text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 cursor-pointer">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button ref={(node) => setNextEl(node)} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-[#005320] text-white p-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 cursor-pointer">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}