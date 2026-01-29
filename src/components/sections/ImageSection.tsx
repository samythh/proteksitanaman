// File: src/components/sections/ImageSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { X, ZoomIn } from "lucide-react";

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
   alignment?: "left" | "center" | "right";
   image_size?: "small" | "medium" | "large";
   is_lightbox_enabled?: boolean;
   image?: ImageField;
}

interface ImageSectionProps {
   data: ImageSectionData;
}

export default function ImageSection({ data }: ImageSectionProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [mounted, setMounted] = useState(false);

   // Ensure portal only renders on client
   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
   }, []);

   // Extract Data with defaults
   const {
      title,
      description,
      alignment = "left",
      image_size = "medium",
      is_lightbox_enabled: enableLightbox = true
   } = data;

   // --- 1. CONFIGURATION: ALIGNMENT ---
   const alignStyles = {
      left: {
         wrapper: "text-left",
         underline: "left-0",
         descMargin: "mr-auto",
      },
      center: {
         wrapper: "text-center",
         underline: "left-1/2 -translate-x-1/2",
         descMargin: "mx-auto",
      },
      right: {
         wrapper: "text-right",
         underline: "right-0",
         descMargin: "ml-auto",
      }
   };

   // --- 2. CONFIGURATION: SIZE ---
   const sizeStyles = {
      small: "max-w-[180px] md:max-w-[200px]",
      medium: "max-w-[300px] md:max-w-[400px]",
      large: "max-w-[500px] md:max-w-[700px]",
   };

   const activeAlign = alignStyles[alignment] || alignStyles.left;
   const activeSize = sizeStyles[image_size] || sizeStyles.medium;

   // --- LOGIKA URL GAMBAR ---
   const getImageUrl = (imgField?: ImageField): string | null => {
      if (!imgField) return null;
      const url = imgField.url || imgField.data?.attributes?.url || imgField.data?.url;
      return getStrapiMedia(url);
   };

   const imgUrl = getImageUrl(data.image);
   const imgAttr = data.image?.data?.attributes;
   const altText = imgAttr?.alternativeText || title || "Image Section";
   const imgWidth = imgAttr?.width || 800;
   const imgHeight = imgAttr?.height || 600;

   if (!imgUrl) return null;

   return (
      <>
         <section className="container mx-auto px-4 py-8 md:py-12 relative z-10">
            <div className={`max-w-4xl mx-auto ${activeAlign.wrapper}`}>

               {/* 1. Header Section */}
               {title && (
                  <div className="mb-6">
                     <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative inline-block">
                        {title}
                        <span className={`absolute -bottom-2 w-16 h-1 bg-green-600 rounded-full ${activeAlign.underline}`}></span>
                     </h2>
                  </div>
               )}

               {/* 2. Image Container */}
               <div className={`relative group inline-block w-full ${activeSize}`}>
                  <div
                     className={`
                relative rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white 
                ${enableLightbox ? "cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl" : ""}
              `}
                     onClick={() => enableLightbox && setIsOpen(true)}
                  >
                     <div className="relative w-full h-auto">
                        <Image
                           src={imgUrl}
                           alt={altText}
                           width={imgWidth}
                           height={imgHeight}
                           className="w-full h-auto object-contain bg-gray-50"
                        />
                     </div>

                     {/* Overlay Hover */}
                     {enableLightbox && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                           <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 p-3 rounded-full text-green-700 shadow-md">
                              <ZoomIn size={24} />
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Hint Text Mobile */}
                  {enableLightbox && (
                     <p className="text-xs text-gray-400 mt-2 italic block md:hidden">
                        Ketuk gambar untuk memperbesar
                     </p>
                  )}
               </div>

               {/* 3. Description */}
               {description && (
                  <p className={`text-gray-600 mt-4 text-sm md:text-base max-w-2xl leading-relaxed ${activeAlign.descMargin}`}>
                     {description}
                  </p>
               )}

            </div>
         </section>

         {/* --- MODAL POPUP (Portal) --- */}
         {/* Portal hanya dirender jika 'mounted' true (Client Side) dan 'isOpen' true */}
         {mounted && isOpen && enableLightbox && createPortal(
            <div
               className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
               onClick={() => setIsOpen(false)}
            >
               {/* Close Button */}
               <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 z-[10000] transition-colors bg-black/50 rounded-full"
                  aria-label="Close"
               >
                  <X size={32} />
               </button>

               {/* Fullscreen Image */}
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