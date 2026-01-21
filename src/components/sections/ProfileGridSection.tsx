// File: src/components/sections/ProfileGridSection.tsx

"use client";

import React from "react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- TYPE DEFINITIONS ---
interface ProfileItem {
   id: number;
   headline: string;
   description: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   photo: any;
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

   // Helper URL
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const getRawUrl = (img: any): string | null => {
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
      <section className="container mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20">

         {/* 1. HEADER SECTION (Di luar Card) */}
         <div className="text-left max-w-3xl mb-10 md:mb-12">
            {title && (
               // ✅ UPDATE: Menambahkan border-l-4 border-green-600 pl-4
               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-4">
                  {title}
               </h2>
            )}
            {data.subtitle && (
               <p className="text-gray-600 text-lg leading-relaxed">{data.subtitle}</p>
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
                     className="flex flex-col bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full group"
                  >

                     {/* A. FOTO (Landscape aspect-[4/3]) */}
                     <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 border-b border-gray-100">
                        {photoUrl ? (
                           <Image
                              src={photoUrl}
                              alt={item.headline}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                              <span className="text-4xl">📷</span>
                           </div>
                        )}
                     </div>

                     {/* B. CONTENT BODY */}
                     <div className="p-5 flex flex-col flex-grow">

                        {/* Headline (Center) */}
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2 group-hover:text-green-700 transition-colors">
                           {item.headline}
                        </h3>

                        {/* Description (Justify) */}
                        <p className="text-sm text-gray-600 leading-relaxed text-justify">
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