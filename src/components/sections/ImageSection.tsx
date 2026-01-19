// File: src/components/sections/ImageSection.tsx

"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { FaTimes, FaSearchPlus } from "react-icons/fa";

// --- TYPE DEFINITIONS ---

interface ImageAttributes {
   url?: string;
   alternativeText?: string;
   width?: number;
   height?: number;
}

interface StrapiImageData {
   id?: number;
   attributes?: ImageAttributes;
   url?: string;
}

interface ImageField {
   data?: StrapiImageData | null;
   url?: string;
}

interface ImageSectionData {
   title?: string;
   description?: string;
   // Menambahkan field alignment dari Strapi
   alignment?: "left" | "center" | "right";
   is_lightbox_enabled?: boolean;
   image?: ImageField;
}

interface ImageSectionProps {
   data: ImageSectionData;
}

export default function ImageSection({ data }: ImageSectionProps) {
   const [isOpen, setIsOpen] = useState(false);

   // Extract Data
   const title = data.title;
   const desc = data.description;
   // Default ke 'left' jika kosong
   const alignment = data.alignment || "left";
   const enableLightbox = data.is_lightbox_enabled !== false;

   // --- CONFIGURATION MAPPING ---
   // Kita buat mapping class Tailwind berdasarkan alignment agar kode rapi
   const styles = {
      left: {
         wrapper: "text-left",                   // Container rata kiri
         underline: "left-0",                    // Garis judul di kiri
         descMargin: "mr-auto",                  // Margin kanan auto (agar teks di kiri)
      },
      center: {
         wrapper: "text-center",                 // Container rata tengah
         underline: "left-1/2 -translate-x-1/2", // Garis judul di tengah
         descMargin: "mx-auto",                  // Margin kiri-kanan auto (tengah)
      },
      right: {
         wrapper: "text-right",                  // Container rata kanan
         underline: "right-0",                   // Garis judul di kanan
         descMargin: "ml-auto",                  // Margin kiri auto (agar teks di kanan)
      }
   };

   // Ambil style aktif
   const activeStyle = styles[alignment];

   // --- LOGIKA PENCARIAN URL ---
   const getImageUrl = (obj: ImageSectionData): string | null | undefined => {
      if (obj.image?.data?.attributes?.url) return obj.image.data.attributes.url;
      if (obj.image?.data?.url) return obj.image.data.url;
      if (obj.image?.url) return obj.image.url;
      return null;
   };

   const rawUrl = getImageUrl(data) || null;
   const imgUrl = getStrapiMedia(rawUrl);

   const imgField = data.image;
   const imgData = imgField?.data;
   const imgAttr = imgData?.attributes;

   const altText = imgAttr?.alternativeText || title || "Image Section";
   const imgWidth = imgAttr?.width || 800;
   const imgHeight = imgAttr?.height || 600;

   if (!imgUrl) return null;

   return (
      <>
         <section className="container mx-auto px-4 py-8 md:py-12 relative z-10">
            {/* TERAPKAN ALIGNMENT PADA WRAPPER UTAMA */}
            <div className={`max-w-4xl mx-auto ${activeStyle.wrapper}`}>

               {/* 1. Header Section */}
               {title && (
                  <div className="mb-6">
                     <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative inline-block">
                        {title}
                        {/* Garis Bawah Judul Dinamis */}
                        <span className={`absolute -bottom-2 w-16 h-1 bg-green-600 rounded-full ${activeStyle.underline}`}></span>
                     </h2>
                  </div>
               )}

               {/* 2. Image Container */}
               {/* inline-block akan mengikuti text-align dari parent (wrapper) */}
               <div className="relative group inline-block max-w-full">
                  <div
                     className={`
                relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white 
                ${enableLightbox ? "cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl" : ""}
              `}
                     onClick={() => enableLightbox && setIsOpen(true)}
                  >
                     <div className="relative w-auto h-auto max-w-full">
                        <Image
                           src={imgUrl}
                           alt={altText}
                           width={imgWidth}
                           height={imgHeight}
                           className="w-full h-auto max-h-[600px] object-contain bg-gray-50"
                        />
                     </div>

                     {/* Overlay Hover */}
                     {enableLightbox && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                           <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 p-3 rounded-full text-green-700 shadow-md">
                              <FaSearchPlus size={24} />
                           </div>
                        </div>
                     )}
                  </div>

                  {/* 3. Description */}
                  {desc && (
                     // Gunakan margin dinamis agar deskripsi tidak melebar ke sisi yang salah
                     <p className={`text-gray-600 mt-4 text-sm md:text-base max-w-2xl leading-relaxed ${activeStyle.descMargin}`}>
                        {desc}
                     </p>
                  )}

                  {enableLightbox && (
                     <p className="text-xs text-gray-400 mt-2 italic block md:hidden">
                        Ketuk gambar untuk memperbesar
                     </p>
                  )}
               </div>

            </div>
         </section>

         {/* --- MODAL POPUP --- */}
         {isOpen && enableLightbox && typeof document !== "undefined" && createPortal(
            <div
               className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
               onClick={() => setIsOpen(false)}
            >
               <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 z-[10000] transition-colors bg-black/50 rounded-full"
               >
                  <FaTimes size={32} />
               </button>

               <div
                  className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
               >
                  <Image
                     src={imgUrl}
                     alt={altText}
                     fill
                     className="object-contain"
                     quality={100}
                     priority
                  />
               </div>
            </div>,
            document.body
         )}
      </>
   );
}