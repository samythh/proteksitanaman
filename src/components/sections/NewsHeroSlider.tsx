// File: src/components/sections/NewsHeroSlider.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";

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
   const [current, setCurrent] = useState(0);
   const length = articles.length;

   const nextSlide = useCallback(() => {
      setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
   }, [length]);

   const prevSlide = useCallback(() => {
      setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
   }, [length]);

   useEffect(() => {
      if (length <= 1) return;
      const timer = setTimeout(() => nextSlide(), 6000);
      return () => clearTimeout(timer);
   }, [current, length, nextSlide]);

   const formatDate = (dateString: string) => {
      if (!dateString) return "";
      return new Date(dateString).toLocaleDateString("id-ID", {
         weekday: "long",
         day: "numeric",
         month: "long",
         year: "numeric",
      });
   };

   if (length === 0) return null;

   return (
      <section className="relative w-full h-[500px] md:h-[650px] group overflow-hidden bg-gray-900">

         {articles.map((item, index) => {
            const imageUrl = getStrapiMedia(item.cover?.url);
            const isActive = index === current;

            return (
               <div
                  key={item.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                     }`}
               >
                  {imageUrl && (
                     <Image
                        src={imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                     />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071C46] via-[#071C46]/60 to-transparent opacity-90" />

                  {/* PERBAIKAN 1: POSISI TENGAH VERTIKAL (Left-Center)
               - justify-center: Membuat konten berada di tengah secara vertikal.
               - text-left: Memastikan teks rata kiri (default).
               - px-6...: Memberikan jarak dari pinggir kiri.
            */}
                  <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24">
                     <div
                        className={`max-w-4xl transition-all duration-700 transform ${isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                           }`}
                     >

                        {/* Tag Kategori (Pill Shape) */}
                        <div className="mb-6">
                           {item.category && (
                              <span
                                 className="inline-block px-4 py-1.5 text-xs font-bold rounded-full text-white uppercase tracking-wider shadow-md border border-white/20 backdrop-blur-md"
                                 style={{
                                    backgroundColor: item.category.color || '#EF4444'
                                 }}
                              >
                                 {item.category.name}
                              </span>
                           )}
                        </div>

                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight line-clamp-2 drop-shadow-md">
                           {item.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 mb-8 text-white/90">
                           <div className="flex items-center gap-2 text-sm md:text-base font-medium">
                              <Calendar className="w-5 h-5 text-yellow-400" />
                              <span>{formatDate(item.publishedAt)}</span>
                           </div>
                        </div>

                        {/* PERBAIKAN 2: TOMBOL KUNING (Sesuai Hero Utama)
                   - bg-yellow-400: Warna dasar kuning.
                   - text-[#005320]: Teks warna hijau tua unand.
                */}
                        <Link
                           href={`/informasi/berita/${item.slug}`}
                           className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 text-[#005320] hover:bg-yellow-500 rounded-full transition-all text-sm font-bold shadow-lg transform hover:-translate-y-1"
                        >
                           BACA SELENGKAPNYA
                           <ChevronRight className="w-4 h-4" />
                        </Link>

                     </div>
                  </div>
               </div>
            );
         })}

         {/* ARROWS */}
         {length > 1 && (
            <>
               <button
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-[#005320] text-white backdrop-blur-md border border-white/20 transition-all z-20 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-300"
               >
                  <ChevronLeft className="w-6 h-6" />
               </button>

               <button
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 hover:bg-[#005320] text-white backdrop-blur-md border border-white/20 transition-all z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300"
               >
                  <ChevronRight className="w-6 h-6" />
               </button>
            </>
         )}

         {/* PAGINATION DOTS */}
         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
            {articles.map((_, idx) => (
               <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === current ? "w-10 bg-yellow-400" : "w-2 bg-white/40 hover:bg-white"
                     }`}
               />
            ))}
         </div>

      </section>
   );
}