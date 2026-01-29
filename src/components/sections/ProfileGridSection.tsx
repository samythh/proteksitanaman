"use client";

import React from "react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { User } from "lucide-react";

// --- TYPE DEFINITIONS ---

interface StrapiImage {
   url?: string;
   data?: {
      attributes?: { url: string };
      url?: string;
   } | null;
}

interface ProfileItem {
   id: number;
   headline: string;
   description: string;
   photo: StrapiImage;
}

interface ProfileGridSectionData {
   title?: string;
   subtitle?: string;
   items: ProfileItem[];
}

interface ProfileGridSectionProps {
   data: ProfileGridSectionData;
}

export default function ProfileGridSection({ data }: ProfileGridSectionProps) {

   // Helper URL (Typed)
   const getRawUrl = (img: StrapiImage | null): string | null => {
      if (!img) return null;
      if (img.url) return img.url;
      if (img.data?.attributes?.url) return img.data.attributes.url;
      if (img.data?.url) return img.data.url;
      return null;
   };

   const title = data.title;
   const items = data.items || [];

   if (!items.length) return null;

   return (
      <section className="container mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">

         {/* 1. HEADER SECTION */}
         <div className="text-left max-w-4xl mb-12">
            {title && (
               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-4">
                  {title}
               </h2>
            )}
            {data.subtitle && (
               <p className="text-gray-600 text-lg mt-4 leading-relaxed">
                  {data.subtitle}
               </p>
            )}
         </div>

         {/* 2. GRID LAYOUT */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {items.map((item, index) => {
               const rawPhotoUrl = getRawUrl(item.photo);
               const photoUrl = getStrapiMedia(rawPhotoUrl);

               return (
                  <div
                     key={item.id || index}
                     className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group"
                  >
                     {/* A. FOTO (Landscape aspect-[4/3]) */}
                     <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-100 group-hover:bg-gray-100 transition-colors">
                        {photoUrl ? (
                           <Image
                              src={photoUrl}
                              alt={item.headline}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <User size={48} strokeWidth={1.5} />
                           </div>
                        )}
                     </div>

                     {/* B. CONTENT BODY */}
                     <div className="p-6 flex flex-col flex-grow">
                        {/* Headline (Center) */}
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-3 group-hover:text-[#005320] transition-colors line-clamp-2">
                           {item.headline}
                        </h3>

                        {/* Description (Justify) */}
                        <p className="text-sm text-gray-600 leading-relaxed text-justify line-clamp-4">
                           {item.description}
                        </p>
                     </div>
                  </div>
               );
            })}
         </div>
      </section>
   );
}