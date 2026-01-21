// File: src/components/sections/GallerySection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- TYPE DEFINITIONS ---
interface GalleryItem {
   id: number;
   title: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   image: any;
}

interface GallerySectionData {
   title?: string;
   subtitle?: string;
   items: GalleryItem[];
}

interface GallerySectionProps {
   data: GallerySectionData;
}

export default function GallerySection({ data }: GallerySectionProps) {
   const title = data.title;
   const items = data.items || [];

   // State untuk Popup (Lightbox)
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const [selectedCaption, setSelectedCaption] = useState<string>("");

   // HAPUS: State mounted tidak diperlukan lagi karena Portal hanya aktif saat ada klik.

   // Handle Scroll Lock
   useEffect(() => {
      if (selectedImage) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "auto";
      }
      return () => {
         document.body.style.overflow = "auto";
      };
   }, [selectedImage]);

   // Helper URL
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const getRawUrl = (img: any): string | null => {
      if (!img) return null;
      if (img.url) return img.url;
      if (img.data?.attributes?.url) return img.data.attributes.url;
      if (img.data?.url) return img.data.url;
      return null;
   };

   const openLightbox = (imgUrl: string, caption: string) => {
      setSelectedImage(imgUrl);
      setSelectedCaption(caption);
   };

   const closeLightbox = () => {
      setSelectedImage(null);
      setSelectedCaption("");
   };

   if (!items.length) return null;

   return (
      <>
         <section className="container mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20">

            {/* 1. HEADER */}
            <div className="text-left max-w-3xl mb-10 md:mb-12">
               {title && (
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-4">
                     {title}
                  </h2>
               )}
               {data.subtitle && (
                  <p className="text-gray-600 text-lg leading-relaxed">{data.subtitle}</p>
               )}
            </div>

            {/* 2. GRID GALLERY */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {items.map((item, index) => {
                  const rawUrl = getRawUrl(item.image);
                  const imgUrl = getStrapiMedia(rawUrl);

                  if (!imgUrl) return null;

                  return (
                     <div
                        key={item.id || index}
                        className="group relative cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 aspect-square"
                        onClick={() => openLightbox(imgUrl, item.title)}
                     >
                        <Image
                           src={imgUrl}
                           alt={item.title || "Gallery Image"}
                           fill
                           className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end">
                           <div className="p-4 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              <p className="text-white font-medium text-sm md:text-base text-center bg-black/50 backdrop-blur-sm py-2 px-3 rounded-lg">
                                 {item.title}
                              </p>
                           </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                           <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                 <circle cx="11" cy="11" r="8"></circle>
                                 <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                 <line x1="11" y1="8" x2="11" y2="14"></line>
                                 <line x1="8" y1="11" x2="14" y2="11"></line>
                              </svg>
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </section>

         {/* 3. LIGHTBOX POPUP (MENGGUNAKAN PORTAL) */}
         {/* Logic: Kita hanya merender Portal jika `selectedImage` ada isinya (Truth).
          Karena `selectedImage` awalnya null, kode ini TIDAK dijalankan saat Server Side Rendering (SSR).
          Kode ini hanya jalan setelah user melakukan KLIK (Client Side interaction), 
          sehingga `document.body` dijamin sudah ada.
      */}
         {selectedImage && typeof document !== "undefined" && createPortal(
            <div
               className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
               onClick={closeLightbox}
            >
               {/* Close Button */}
               <button
                  onClick={closeLightbox}
                  className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 p-2 bg-white/10 rounded-full cursor-pointer"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <line x1="18" y1="6" x2="6" y2="18"></line>
                     <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
               </button>

               {/* Image Container */}
               <div
                  className="relative w-full max-w-5xl h-[80vh] flex flex-col items-center justify-center pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="relative w-full h-full pointer-events-auto">
                     <Image
                        src={selectedImage}
                        alt="Popup Image"
                        fill
                        className="object-contain"
                     />
                  </div>

                  {selectedCaption && (
                     <p className="mt-4 text-white text-lg font-medium text-center bg-black/50 px-6 py-2 rounded-full pointer-events-auto">
                        {selectedCaption}
                     </p>
                  )}
               </div>
            </div>,
            document.body
         )}
      </>
   );
}