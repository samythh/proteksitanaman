// File: src/components/sections/FacilityDetail.tsx
"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { getStrapiMedia } from "@/lib/strapi/utils";
import RichText from "@/components/strapi/rich-text";
import PosterLightBox from "@/components/ui/PosterLightBox";
import { cn } from "@/lib/utils/cn";
import {
   ChevronLeft,
   ChevronRight,
   Image as ImageIcon,
   ChevronRight as IconArrowRight
} from "lucide-react";

// --- TYPE DEFINITIONS ---

interface LegacyImage {
   id?: number;
   attributes?: {
      url: string;
      alternativeText?: string;
      caption?: string;
   };
}

interface FacilityItem {
   id: number;
   attributes: {
      name: string;
      slug: string;
      description?: string;
      images?: {
         data?: LegacyImage[];
      };
   };
}

interface FacilityDetailProps {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   data: any; // Menggunakan any untuk menangani struktur data flat/nested secara fleksibel
   others: FacilityItem[];
}

export default function FacilityDetail({ data, others = [] }: FacilityDetailProps) {
   const t = useTranslations("FacilityDetail");
   const galleryRef = useRef<HTMLDivElement>(null);

   // --- SAFE DATA HANDLING ---
   // Normalisasi data: Cek apakah data dibungkus 'attributes' atau sudah flat
   const facility = data?.attributes ? data.attributes : data;

   if (!facility) return null;

   // Ekstrak properti dengan aman
   const name = facility.name || "";
   const description = facility.description || "";
   const content = facility.content;
   const youtubeId = facility.youtube_id;

   // Ekstrak Images
   const images = facility.images?.data || [];

   // Gambar Utama (Index 0)
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const mainImageObj = images[0] as any; 
   const mainImageUrl = mainImageObj?.attributes?.url
      ? getStrapiMedia(mainImageObj.attributes.url)
      : (mainImageObj?.url ? getStrapiMedia(mainImageObj.url) : null);

   // Gambar Galeri (Index 1 ke atas)
   const galleryImages = images.slice(1);

   // --- FUNGSI SCROLL ---
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
      <section className="container mx-auto px-4 py-12 md:py-20 relative z-10 min-h-screen">
         <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

            {/* === KIRI: KONTEN UTAMA (2/3) === */}
            <div className="w-full lg:w-2/3">

               {/* A. MEDIA AREA */}
               {youtubeId ? (
                  <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-video bg-black relative z-10 group">
                     <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
                        title="YouTube video player"
                        className="absolute top-0 left-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                     ></iframe>
                  </div>
               ) : mainImageUrl ? (
                  // IMPLEMENTASI POSTERLIGHTBOX
                  <div className="mb-10 w-full aspect-[16/9] relative z-10">
                     <PosterLightBox
                        src={mainImageUrl}
                        alt={name}
                        className={cn(
                           "rounded-2xl shadow-2xl border-4 border-white bg-gray-100",
                           "object-cover w-full h-full"
                        )}
                     />
                  </div>
               ) : (
                  // Fallback
                  <div className="mb-10 rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-[16/9] relative z-10 bg-gray-50 flex items-center justify-center text-gray-400">
                     <div className="text-center">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                        <span className="text-sm font-medium">{t("no_image")}</span>
                     </div>
                  </div>
               )}

               <div className="mb-12">
                  <h1 className="text-3xl md:text-5xl font-extrabold text-[#005320] mb-6 leading-tight">
                     {name}
                  </h1>

                  {description && (
                     <div className="text-lg text-gray-600 leading-relaxed mb-8 border-l-4 border-yellow-400 pl-6 italic bg-yellow-50/50 py-4 rounded-r-lg">
                        {description}
                     </div>
                  )}

                  <div className="prose prose-lg max-w-none text-gray-800">
                     <RichText content={content} />
                  </div>
               </div>

               {/* B. GALERI SLIDER */}
               {galleryImages.length > 0 && (
                  <div className="pt-10 border-t border-gray-100 relative group/gallery">
                     <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                        <ImageIcon className="text-[#005320]" />
                        {t("gallery_title")}
                     </h3>

                     <div className="relative">
                        <button
                           onClick={() => scrollGallery("left")}
                           className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg text-gray-700 hover:text-[#005320] hover:scale-110 transition-all -ml-4 opacity-0 group-hover/gallery:opacity-100 duration-300 border border-gray-100 hidden md:block"
                        >
                           <ChevronLeft size={24} />
                        </button>

                        <div
                           ref={galleryRef}
                           className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x px-1"
                           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                           {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                           {galleryImages.map((img: any, idx: number) => {
                              const imgUrl = img.attributes?.url
                                 ? getStrapiMedia(img.attributes.url)
                                 : (img.url ? getStrapiMedia(img.url) : null);

                              if (!imgUrl) return null;

                              return (
                                 <div
                                    key={idx}
                                    className="relative h-48 w-72 flex-shrink-0 snap-center"
                                 >
                                    <PosterLightBox
                                       src={imgUrl}
                                       alt={`${name} gallery ${idx + 1}`}
                                       className={cn(
                                          "rounded-xl border-2 border-transparent hover:border-[#005320]",
                                          "shadow-sm transition-all bg-gray-100",
                                          "object-cover w-full h-full cursor-zoom-in"
                                       )}
                                    />
                                 </div>
                              );
                           })}
                        </div>

                        <button
                           onClick={() => scrollGallery("right")}
                           className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white shadow-lg text-gray-700 hover:text-[#005320] hover:scale-110 transition-all -mr-4 opacity-0 group-hover/gallery:opacity-100 duration-300 border border-gray-100 hidden md:block"
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
                     {others && others.length > 0 ? others.map((item) => {
                        const itemAttr = item.attributes;
                        if (!itemAttr) return null;

                        const itemLink = `/profil/fasilitas/${itemAttr.slug}`;
                        const firstImage = itemAttr.images?.data?.[0];
                        const sideImgUrl = getStrapiMedia(firstImage?.attributes?.url);

                        return (
                           <li key={item.id}>
                              <Link
                                 href={itemLink}
                                 className="group flex items-start gap-4 p-3 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-green-50 transition-all border border-gray-100 hover:border-green-200"
                              >
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

                                 <div className="flex-1 min-w-0 py-1">
                                    <h4 className="font-semibold text-gray-800 group-hover:text-[#005320] transition-colors line-clamp-2 text-sm md:text-base mb-1">
                                       {itemAttr.name}
                                    </h4>
                                    <span className="text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                       Lihat Detail <IconArrowRight size={12} />
                                    </span>
                                 </div>
                              </Link>
                           </li>
                        );
                     }) : (
                        <li className="text-gray-400 italic text-sm">Tidak ada fasilitas lain.</li>
                     )}
                  </ul>
               </div>
            </aside>

         </div>
      </section>
   );
}