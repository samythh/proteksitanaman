// File: src/components/sections/HeroSlider.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

// --- DEFINISI TIPE DATA ---

interface SlideImage {
   url?: string;
   alternativeText?: string;
   data?: {
      attributes: {
         url: string;
         alternativeText?: string;
      };
   };
}

interface SlideItem {
   id: number;
   title: string;
   subtitle?: string;
   buttonText?: string;
   buttonLink?: string;
   image?: SlideImage;
}

interface HeroSliderData {
   slides?: SlideItem[];
}

interface HeroSliderProps {
   data: HeroSliderData;
}

export default function HeroSlider({ data }: HeroSliderProps) {
   const [current, setCurrent] = useState(0);
   const slides = data?.slides || [];
   const length = slides.length;

   const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

   const nextSlide = useCallback(() => {
      setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
   }, [length]);

   const prevSlide = useCallback(() => {
      setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
   }, [length]);

   useEffect(() => {
      if (length <= 1) return;
      const timer = setTimeout(() => {
         nextSlide();
      }, 6000);
      return () => clearTimeout(timer);
   }, [current, length, nextSlide]);

   if (length === 0) return null;

   return (
      <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] bg-gray-900 overflow-hidden group -mt-20 lg:-mt-24">
         {slides.map((slide: SlideItem, index: number) => {

            // Logic URL Gambar
            let rawUrl = slide.image?.url;
            if (!rawUrl) rawUrl = slide.image?.data?.attributes?.url;

            let imageUrl = "";
            if (rawUrl) {
               imageUrl = rawUrl.startsWith("http") ? rawUrl : `${STRAPI_URL}${rawUrl}`;
            }

            const altText = slide.image?.alternativeText || slide.image?.data?.attributes?.alternativeText || slide.title;
            const isActive = index === current;

            return (
               <div
                  key={slide.id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
               >
                  {imageUrl ? (
                     <Image
                        src={imageUrl}
                        alt={altText || 'Hero Image'}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="100vw"
                     />
                  ) : (
                     <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <ImageIcon size={64} className="opacity-20 text-white" />
                     </div>
                  )}

                  {/* ✅ PERUBAHAN DISINI: Gradien dibuat lebih terang/transparan */}
                  {/* Lama: from-black via-black/60 to-black/10 opacity-90 */}
                  {/* Baru: from-black/90 (gelap di bawah) via-black/30 (transparan di tengah) to-transparent (bening di atas) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80" />

                  <div className="absolute inset-0 flex flex-col justify-center items-start text-left px-8 md:px-20 lg:px-32 z-20 w-full pt-[85px]">
                     <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-xl transition-all duration-700 delay-100 transform max-w-4xl leading-tight ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                        {slide.title}
                     </h2>

                     {(slide.subtitle) && (
                        <p className={`text-gray-200 text-lg md:text-xl max-w-2xl font-light leading-relaxed drop-shadow-md transition-all duration-700 delay-200 transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                           {slide.subtitle}
                        </p>
                     )}

                     {slide.buttonText && (
                        <div className={`mt-8 transition-all duration-500 delay-300 transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                           <Link
                              href={slide.buttonLink || '#'}
                              target={slide.buttonLink?.startsWith('http') ? '_blank' : '_self'}
                              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-[#005320] rounded-full font-bold transition-all shadow-lg hover:scale-105 active:scale-95 inline-block"
                           >
                              {slide.buttonText}
                           </Link>
                        </div>
                     )}
                  </div>
               </div>
            );
         })}

         {length > 1 && (
            <>
               <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all z-30 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300"
                  aria-label="Previous slide"
               >
                  <ChevronLeft size={32} />
               </button>
               <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all z-30 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 duration-300"
                  aria-label="Next slide"
               >
                  <ChevronRight size={32} />
               </button>

               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
                  {slides.map((_, idx: number) => (
                     <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === current ? 'w-8 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white'}`}
                     />
                  ))}
               </div>
            </>
         )}
      </section>
   );
}