// File: src/components/features/FacilitiesListSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, X, ChevronDown, Image as ImageIcon } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- KAMUS TERJEMAHAN SEDERHANA ---
const DICTIONARY = {
   id: {
      featuredBadge: "Fasilitas Unggulan",
      exploreBtn: "Jelajahi Fasilitas",
      loadMoreBtn: "MUAT LEBIH BANYAK",
      endOfList: "Akhir Daftar",
      noMedia: "Tidak ada media"
   },
   en: {
      featuredBadge: "Featured Facility",
      exploreBtn: "Explore Facility",
      loadMoreBtn: "LOAD MORE",
      endOfList: "End of List",
      noMedia: "No media available"
   }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FacilityData = any;

interface PageConfig {
   section_label?: string;
   title_main?: string;
   title_highlight?: string;
   description?: string;
}

interface FacilitiesListSectionProps {
   data: {
      facilities: FacilityData[];
   };
   config?: PageConfig | null;
   locale: string;
}

interface ItemProps {
   item: FacilityData;
   index: number;
   onImageClick: (url: string) => void;
   locale: string;
}

const FacilityItemCard = ({ item, index, onImageClick, locale }: ItemProps) => {
   const data = item.attributes || item;
   const { name, slug, description, youtube_id, images } = data;
   const gallery = images?.data || images || [];

   // ✅ Pilih teks berdasarkan locale (Default ke 'id' jika locale aneh)
   const t = DICTIONARY[locale === 'en' ? 'en' : 'id'];

   const isEven = index % 2 === 0;
   const coverImage = gallery.length > 0 ? getStrapiMedia(gallery[0].attributes?.url || gallery[0].url) : null;
   const remainingImages = gallery.slice(1, 4);

   return (
      <div className={`group relative flex flex-col lg:flex-row gap-8 lg:gap-16 items-center py-12 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>

         {/* MEDIA SECTION */}
         <div className="w-full lg:w-1/2 relative">
            <div className={`absolute -top-20 -z-10 text-[10rem] font-black text-gray-100 select-none leading-none ${isEven ? '-left-10' : '-right-10'}`}>
               {String(index + 1).padStart(2, '0')}
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500 bg-gray-100">
               {youtube_id ? (
                  <iframe src={`https://www.youtube.com/embed/${youtube_id}?rel=0`} title={name} className="w-full h-full object-cover" allowFullScreen />
               ) : coverImage ? (
                  <div className="relative w-full h-full cursor-pointer" onClick={() => onImageClick(coverImage)}>
                     <Image src={coverImage} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur p-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                           <ImageIcon className="text-[#005320]" size={24} />
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">{t.noMedia}</div>
               )}
            </div>

            {remainingImages.length > 0 && (
               <div className={`absolute -bottom-6 flex gap-3 ${isEven ? 'right-4 lg:-right-12' : 'left-4 lg:-left-12'}`}>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {remainingImages.map((img: any, idx: number) => {
                     const thumbUrl = getStrapiMedia(img.attributes?.url || img.url);
                     return (
                        <div key={idx} onClick={() => thumbUrl && onImageClick(thumbUrl)} className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-white shadow-lg overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform relative bg-gray-200">
                           {thumbUrl && <Image src={thumbUrl} alt="Thumb" fill className="object-cover" />}
                        </div>
                     );
                  })}
                  {gallery.length > 4 && (
                     <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-white shadow-lg bg-[#005320] text-white flex items-center justify-center font-bold text-sm">+{gallery.length - 4}</div>
                  )}
               </div>
            )}
         </div>

         {/* TEXT SECTION */}
         <div className="w-full lg:w-1/2 flex flex-col gap-6 relative z-10 px-2">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-[#005320] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-green-100">
                  {/* ✅ Dynamic Text */}
                  {t.featuredBadge}
               </div>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">{name}</h2>
               <div className="w-20 h-1.5 bg-yellow-400 rounded-full mb-6"></div>
               <p className="text-gray-600 text-base md:text-lg leading-relaxed text-justify">{description}</p>
            </div>
            <div className="pt-4">
               <Link href={`/${locale}/profil/fasilitas/${slug}`} className="inline-flex items-center gap-3 text-[#005320] font-bold text-lg group/link">
                  <span className="border-b-2 border-[#005320] pb-0.5 group-hover/link:border-yellow-400 transition-colors">
                     {/* ✅ Dynamic Text */}
                     {t.exploreBtn}
                  </span>
                  <div className="bg-[#005320] text-white p-2 rounded-full group-hover/link:bg-yellow-400 group-hover/link:text-[#005320] transition-all transform group-hover/link:rotate-45"><ArrowUpRight size={20} /></div>
               </Link>
            </div>
         </div>
      </div>
   );
};

export default function FacilitiesListSection({ data, config, locale }: FacilitiesListSectionProps) {
   const allFacilities = data?.facilities || [];
   const [itemsCnt, setItemsCnt] = useState(3);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const currentItems = allFacilities.slice(0, itemsCnt);

   // ✅ Pilih teks berdasarkan locale
   const t = DICTIONARY[locale === 'en' ? 'en' : 'id'];

   if (allFacilities.length === 0) return null;

   return (
      <section className="bg-white pt-0 pb-24 px-4 md:px-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

         <div className="container mx-auto max-w-7xl relative z-10">

            {/* Header Section (Dynamic from Strapi) */}
            <div className="text-center max-w-3xl mx-auto mb-12">
               {config?.section_label && (
                  <h2 className="text-sm font-bold tracking-[0.2em] text-yellow-500 uppercase mb-3">
                     {config.section_label}
                  </h2>
               )}

               <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
                  {config?.title_main || "Fasilitas"} <br />
                  {config?.title_highlight && (
                     <span className="text-[#005320]">{config.title_highlight}</span>
                  )}
               </h3>

               {config?.description && (
                  <p className="text-gray-500 text-lg">
                     {config.description}
                  </p>
               )}
            </div>

            {/* List Facilities */}
            <div className="flex flex-col gap-20 md:gap-32">
               {currentItems.map((item, index) => (
                  <FacilityItemCard
                     key={index}
                     index={index}
                     item={item}
                     locale={locale}
                     onImageClick={setSelectedImage}
                  />
               ))}
            </div>

            {/* Load More Button */}
            <div className="mt-24 flex justify-center">
               {itemsCnt < allFacilities.length ? (
                  <button onClick={() => setItemsCnt(prev => prev + 2)} className="group relative px-8 py-4 bg-white text-[#005320] font-bold rounded-full shadow-lg border border-gray-100 hover:shadow-xl hover:border-green-200 transition-all overflow-hidden">
                     <div className="absolute inset-0 bg-green-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                     <span className="relative flex items-center gap-3">
                        {/* ✅ Dynamic Text */}
                        {t.loadMoreBtn}
                        <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                     </span>
                  </button>
               ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 opacity-70">
                     <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                     <span className="text-sm font-medium uppercase tracking-widest">
                        {/* ✅ Dynamic Text */}
                        {t.endOfList}
                     </span>
                  </div>
               )}
            </div>
         </div>

         {/* Lightbox Modal */}
         {selectedImage && (
            <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
               <button className="absolute top-6 right-6 text-white/70 hover:text-white hover:rotate-90 transition-all p-2 bg-white/10 rounded-full z-[10000]"><X size={32} /></button>
               <div className="relative w-full max-w-6xl h-[85vh]" onClick={(e) => e.stopPropagation()}>
                  <Image src={selectedImage} alt="Preview" fill className="object-contain" priority sizes="100vw" />
               </div>
            </div>
         )}
      </section>
   );
}