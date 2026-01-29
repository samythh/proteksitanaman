"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { ZoomIn, X } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface StrapiImage {
   url: string;
   data?: {
      attributes?: { url: string };
      url?: string;
   };
}

interface GalleryItem {
   id: number;
   title: string;
   image: StrapiImage;
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

   // State for Lightbox
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const [selectedCaption, setSelectedCaption] = useState<string>("");
   const [isClient, setIsClient] = useState(false);

   // Set isClient to true on mount to safely use createPortal
   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsClient(true);
   }, []);

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
   const getRawUrl = (img: StrapiImage | null): string | null => {
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
         <section className="container mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">

            {/* 1. HEADER */}
            <div className="text-left max-w-4xl mb-12">
               {title && (
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 border-l-4 border-green-600 pl-4">
                     {title}
                  </h2>
               )}
               {data.subtitle && (
                  <p className="text-gray-600 text-lg leading-relaxed pl-5">
                     {data.subtitle}
                  </p>
               )}
            </div>

            {/* 2. GRID GALLERY */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
               {items.map((item, index) => {
                  const rawUrl = getRawUrl(item.image);
                  const imgUrl = getStrapiMedia(rawUrl);

                  if (!imgUrl) return null;

                  return (
                     <div
                        key={item.id || index}
                        className="group relative cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 aspect-square bg-gray-100"
                        onClick={() => openLightbox(imgUrl, item.title)}
                     >
                        <Image
                           src={imgUrl}
                           alt={item.title || "Gallery Image"}
                           fill
                           sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                           className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">

                           {/* Caption on Hover */}
                           <p className="text-white font-medium text-sm md:text-base transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              {item.title}
                           </p>
                        </div>

                        {/* Zoom Icon Center */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                           <div className="bg-white/30 backdrop-blur-md p-3 rounded-full text-white shadow-lg border border-white/20">
                              <ZoomIn size={24} />
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </section>

         {/* 3. LIGHTBOX POPUP */}
         {selectedImage && isClient && createPortal(
            <div
               className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
               onClick={closeLightbox}
            >
               {/* Close Button */}
               <button
                  onClick={closeLightbox}
                  className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer"
                  aria-label="Close Gallery"
               >
                  <X size={32} />
               </button>

               {/* Image Container */}
               <div
                  className="relative w-full max-w-6xl h-[85vh] flex flex-col items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="relative w-full h-full">
                     <Image
                        src={selectedImage}
                        alt={selectedCaption || "Gallery Preview"}
                        fill
                        className="object-contain"
                        quality={100}
                        priority
                     />
                  </div>

                  {selectedCaption && (
                     <div className="mt-4 text-white text-center">
                        <p className="text-lg font-medium bg-black/50 px-6 py-2 rounded-full inline-block backdrop-blur-sm border border-white/10">
                           {selectedCaption}
                        </p>
                     </div>
                  )}
               </div>
            </div>,
            document.body
         )}
      </>
   );
}