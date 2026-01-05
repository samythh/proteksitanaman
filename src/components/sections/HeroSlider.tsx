// File: src/components/sections/HeroSlider.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { HeroSliderBlock } from '@/types/sections';
import { getStrapiMedia } from '@/lib/strapi/utils';

interface HeroSliderProps {
   data: HeroSliderBlock;
}

export default function HeroSlider({ data }: HeroSliderProps) {
   const [current, setCurrent] = useState(0);
   const slides = data.slides || [];
   const length = slides.length;

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
      <section className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] bg-gray-900 overflow-hidden group -mt-[85px]">
         {slides.map((slide, index) => {
            const imageUrl = getStrapiMedia(slide.image?.url || null);
            const isActive = index === current;

            return (
               <div
                  key={slide.id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
               >
                  {imageUrl ? (
                     <Image
                        src={imageUrl}
                        alt={slide.image?.alternativeText || slide.title || 'Hero Image'}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 100vw"
                     />
                  ) : (
                     <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <ImageIcon size={64} className="opacity-20 text-white" />
                     </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                  <div className="absolute inset-0 flex flex-col justify-center items-start text-left px-8 md:px-20 lg:px-32 z-20 w-full pt-[85px]">
                     <h2 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-xl transition-all duration-700 delay-100 transform max-w-4xl leading-tight ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                        {slide.title}
                     </h2>

                     {slide.subtitle && (
                        <p className={`text-gray-200 text-lg md:text-xl max-w-2xl font-light leading-relaxed drop-shadow-md transition-all duration-700 delay-200 transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                           {slide.subtitle}
                        </p>
                     )}

                     {slide.buttonText && (
                        <div className={`mt-8 transition-all duration-500 delay-300 transform ${isActive ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                           <Link
                              href={slide.buttonLink || '#'}
                              target={slide.buttonLink?.startsWith('http') ? '_blank' : '_self'}
                              className="px-8 py-3 bg-[#005700] hover:bg-[#004200] text-white rounded-full font-medium transition-all shadow-lg border border-green-500/30 hover:scale-105 active:scale-95 inline-block"
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
               <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all z-30 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
                  <ChevronLeft size={32} />
               </button>
               <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all z-30 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-300">
                  <ChevronRight size={32} />
               </button>
               <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
                  {slides.map((_, idx) => (
                     <button
                        key={idx}
                        onClick={() => setCurrent(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 shadow-sm ${idx === current ? 'w-8 bg-[#005700] border border-white/50' : 'w-2 bg-white/50 hover:bg-white'}`}
                     />
                  ))}
               </div>
            </>
         )}
      </section>
   );
}