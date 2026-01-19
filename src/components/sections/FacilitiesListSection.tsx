"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FacilityData = any;

interface FacilitiesListSectionProps {
   data: {
      facilities: FacilityData[];
   };
   locale: string; // ✅ Menerima Locale
}

interface ItemProps {
   item: FacilityData;
   isLast: boolean;
   onImageClick: (url: string) => void;
   locale: string; // ✅ Menerima Locale
}

const FacilityItemCard = ({ item, isLast, onImageClick, locale }: ItemProps) => {
   const scrollRef = useRef<HTMLDivElement>(null);
   const data = item.attributes || item;
   const { name, slug, description, youtube_id, images } = data;

   const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
         const scrollAmount = 300;
         scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
         });
      }
   };

   const gallery = images?.data || images || [];

   return (
      <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-700">
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col gap-4">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-left">{name}</h2>
               <p className="text-gray-600 leading-relaxed text-justify line-clamp-4">{description}</p>
            </div>
            {youtube_id && (
               <div className="w-full aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${youtube_id}?rel=0`} title={`Video ${name}`} className="w-full h-full" allowFullScreen />
               </div>
            )}
         </div>

         {Array.isArray(gallery) && gallery.length > 0 && (
            <div className="relative group/carousel w-full">
               <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity -ml-4 hover:scale-105"><ChevronLeft size={24} className="text-gray-700" /></button>
               <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1" style={{ scrollbarWidth: 'none' }}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {gallery.map((img: any, idx: number) => {
                     const imgData = img.attributes || img;
                     const imageUrl = getStrapiMedia(imgData.url);
                     if (!imageUrl) return null;
                     return (
                        <div key={idx} onClick={() => onImageClick(imageUrl)} className="flex-shrink-0 w-[200px] md:w-[250px] aspect-[4/3] relative rounded-xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer group/img transition-all">
                           <Image src={imageUrl} alt={imgData.alternativeText || name} fill className="object-cover group-hover/img:scale-105 transition-transform duration-500" />
                        </div>
                     );
                  })}
               </div>
               <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-md opacity-0 group-hover/carousel:opacity-100 transition-opacity -mr-4 hover:scale-105"><ChevronRight size={24} className="text-gray-700" /></button>
            </div>
         )}

         <div className="flex justify-end">
            {/* ✅ FIX LINK: Gunakan locale yang diterima */}
            <Link href={`/${locale}/profil/fasilitas/${slug}`} className="flex items-center gap-2 bg-[#749F74] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#5e855e] transition-colors shadow-sm hover:shadow-md text-sm md:text-base">
               Selengkapnya <ArrowRight size={18} />
            </Link>
         </div>
         {!isLast && <hr className="border-t border-gray-200 mt-4" />}
      </div>
   );
};

export default function FacilitiesListSection({ data, locale }: FacilitiesListSectionProps) {
   const allFacilities = data?.facilities || [];
   const [itemsCnt, setItemsCnt] = useState(2);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const currentItems = allFacilities.slice(0, itemsCnt);

   if (allFacilities.length === 0) return null;

   return (
      <section className="bg-white py-16 px-4 md:px-12 min-h-screen">
         <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col gap-12">
               {currentItems.map((item, index) => (
                  <FacilityItemCard
                     key={index}
                     item={item}
                     locale={locale} // ✅ Kirim locale ke item
                     isLast={index === currentItems.length - 1}
                     onImageClick={setSelectedImage}
                  />
               ))}
            </div>
            <div className="mt-16 flex justify-center pb-10">
               {itemsCnt < allFacilities.length ? (
                  <button onClick={() => setItemsCnt(prev => prev + 2)} className="group flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm tracking-wide bg-[#749F74] text-white hover:bg-[#5e855e] shadow-lg hover:shadow-xl transition-all uppercase">
                     MUAT LEBIH BANYAK <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
                  </button>
               ) : (
                  <div className="text-gray-400 text-sm font-medium italic border px-4 py-2 rounded-full bg-gray-50">— Semua fasilitas telah ditampilkan —</div>
               )}
            </div>
         </div>
         {selectedImage && (
            <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
               <button className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-[10000]"><X size={32} /></button>
               <div className="relative w-full max-w-5xl h-[80vh]" onClick={(e) => e.stopPropagation()}>
                  <Image src={selectedImage} alt="Fullscreen Preview" fill className="object-contain" priority sizes="100vw" />
               </div>
            </div>
         )}
      </section>
   );
}