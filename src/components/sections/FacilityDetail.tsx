// File: src/components/sections/FacilityDetail.tsx
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { getStrapiMedia } from "@/lib/strapi/utils";
import RichText from "@/components/strapi/rich-text";
import {
   ChevronLeft,
   ChevronRight,
   ArrowLeft,
   X,
   Image as ImageIcon
} from "lucide-react";

// --- TYPE DEFINITIONS ---
interface FacilityAttributes {
   name: string;
   slug: string;
   description: string;
   youtube_id?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   content?: any;
   images?: {
      data: Array<{
         attributes: {
            url: string;
         };
      }>;
   };
}

interface FacilityItem {
   id: number;
   attributes: FacilityAttributes;
}

interface FacilityDetailProps {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   data: any;
   others: FacilityItem[];
}

export default function FacilityDetail({ data, others }: FacilityDetailProps) {
   const t = useTranslations("FacilityDetail");

   // Normalisasi data
   const attr: FacilityAttributes = data.attributes || data;

   const galleryRef = useRef<HTMLDivElement>(null);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);

   // Data Extraction
   const images = attr.images?.data || [];
   const youtubeId = attr.youtube_id;

   // --- FUNGSI SCROLL GALERI ---
   const scrollGallery = (direction: "left" | "right") => {
      if (galleryRef.current) {
         const scrollAmount = 320;
         galleryRef.current.scrollBy({
            left: direction === "right" ? scrollAmount : -scrollAmount,
            behavior: "smooth",
         });
      }
   };

   return (
      <>
         <section className="container mx-auto px-4 py-12 md:py-20 relative z-10 min-h-screen">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

               {/* === KIRI: KONTEN UTAMA (2/3) === */}
               <div className="w-full lg:w-2/3">

                  {/* 1. VIDEO PLAYER (Jika Ada) */}
                  {youtubeId && (
                     <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-video bg-black relative z-10 group">
                        <iframe
                           src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                           title="YouTube video player"
                           className="absolute top-0 left-0 w-full h-full"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                        ></iframe>
                     </div>
                  )}

                  <div className="mb-12">
                     {/* HEADER JUDUL */}
                     <h1 className="text-3xl md:text-5xl font-extrabold text-[#005320] mb-6 leading-tight">
                        {attr.name}
                     </h1>

                     {/* 2. DESCRIPTION (Lead Paragraph) */}
                     {attr.description && (
                        <div className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-yellow-400 pl-6 italic bg-yellow-50/50 py-4 rounded-r-lg">
                           {attr.description}
                        </div>
                     )}

                     {/* 3. RICH TEXT CONTENT (Isi Utama) */}
                     <div className="prose prose-lg max-w-none text-gray-800">
                        <RichText content={attr.content} />
                     </div>
                  </div>

                  {/* 4. GALERI FOTO */}
                  {images.length > 0 && (
                     <div className="pt-10 border-t border-gray-100 relative group/gallery">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                           <ImageIcon className="text-[#005320]" />
                           {t("gallery_title")}
                        </h3>

                        <div className="relative">
                           {/* Tombol Kiri */}
                           <button
                              onClick={() => scrollGallery("left")}
                              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg text-gray-700 hover:text-[#005320] hover:scale-110 transition-all -ml-4 opacity-0 group-hover/gallery:opacity-100 duration-300 border border-gray-100 hidden md:block"
                              aria-label="Scroll Left"
                           >
                              <ChevronLeft size={24} />
                           </button>

                           {/* Slider Container */}
                           <div
                              ref={galleryRef}
                              className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x px-1"
                              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                           >
                              {images.map((img, idx) => {
                                 const imgUrl = getStrapiMedia(img.attributes?.url);
                                 if (!imgUrl) return null;

                                 return (
                                    <div
                                       key={idx}
                                       onClick={() => setSelectedImage(imgUrl)}
                                       className="relative h-48 w-72 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border-2 border-transparent hover:border-[#005320] snap-center cursor-zoom-in transition-all group/item"
                                    >
                                       <Image
                                          src={imgUrl}
                                          alt={`${attr.name} gallery ${idx + 1}`}
                                          fill
                                          className="object-cover transition-transform duration-700 group-hover/item:scale-110"
                                          sizes="(max-width: 768px) 50vw, 25vw"
                                       />
                                       <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/10 transition-colors" />
                                    </div>
                                 );
                              })}
                           </div>

                           {/* Tombol Kanan */}
                           <button
                              onClick={() => scrollGallery("right")}
                              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg text-gray-700 hover:text-[#005320] hover:scale-110 transition-all -mr-4 opacity-0 group-hover/gallery:opacity-100 duration-300 border border-gray-100 hidden md:block"
                              aria-label="Scroll Right"
                           >
                              <ChevronRight size={24} />
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               {/* === KANAN: SIDEBAR (1/3) === */}
               <aside className="w-full lg:w-1/3">
                  <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 sticky top-28">
                     <h3 className="text-xl font-bold text-[#005320] mb-6 pb-4 border-b border-gray-200 uppercase tracking-wide flex items-center gap-2">
                        <div className="w-2 h-8 bg-yellow-400 rounded-full"></div>
                        {t("other_facilities")}
                     </h3>

                     <ul className="space-y-4">
                        {others.map((item) => {
                           const itemAttr = item.attributes || item;
                           const itemLink = `/profil/fasilitas/${itemAttr.slug}`;

                           const firstImage = itemAttr.images?.data?.[0];
                           const sideImgUrl = getStrapiMedia(firstImage?.attributes?.url);

                           return (
                              <li key={item.id}>
                                 <Link
                                    href={itemLink}
                                    className="group flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-green-50 transition-all border border-gray-100 hover:border-green-200"
                                 >
                                    {/* Thumbnail Kecil */}
                                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                       {sideImgUrl ? (
                                          <Image
                                             src={sideImgUrl}
                                             alt={itemAttr.name}
                                             fill
                                             className="object-cover group-hover:scale-105 transition-transform"
                                          />
                                       ) : (
                                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                                             <ImageIcon size={16} />
                                          </div>
                                       )}
                                    </div>

                                    {/* Judul */}
                                    <div className="flex-1 min-w-0 py-1">
                                       <h4 className="font-semibold text-gray-800 group-hover:text-[#005320] transition-colors line-clamp-2 text-sm md:text-base mb-1">
                                          {itemAttr.name}
                                       </h4>
                                       <span className="text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                          Lihat Detail <ChevronRight size={12} />
                                       </span>
                                    </div>
                                 </Link>
                              </li>
                           );
                        })}
                     </ul>
                  </div>
               </aside>

            </div>

            {/* TOMBOL KEMBALI */}
            <div className="text-center mt-20 pt-10 border-t border-gray-100">
               <Link
                  href="/profil/fasilitas"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-[#005320] text-[#005320] font-bold rounded-full shadow-sm hover:bg-[#005320] hover:text-white transition-all duration-300 group"
               >
                  <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-1" />
                  <span>{t("back_to_list")}</span>
               </Link>
            </div>
         </section>

         {/* === MODAL POPUP GALERI (MANUAL) === */}
         {selectedImage && (
            <div
               className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
               onClick={() => setSelectedImage(null)}
            >
               {/* Tombol Close */}
               <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50 focus:outline-none"
                  aria-label="Close"
               >
                  <X size={32} />
               </button>

               {/* Gambar Fullscreen */}
               <div
                  className="relative w-full max-w-7xl h-[85vh] flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
               >
                  <Image
                     src={selectedImage}
                     alt="Facility Fullscreen"
                     fill
                     className="object-contain drop-shadow-2xl"
                     quality={100}
                     priority
                  />
               </div>
            </div>
         )}
      </>
   );
}