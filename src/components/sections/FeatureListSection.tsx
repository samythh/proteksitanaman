"use client";

import React from "react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- TYPE DEFINITIONS ---
interface FeatureItem {
   id: number;
   text: string;
   title?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   icon: any;
}

interface FeatureListSectionData {
   title?: string;
   subtitle?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   image: any;
   items: FeatureItem[];
}

interface FeatureListSectionProps {
   data: FeatureListSectionData;
}

export default function FeatureListSection({ data }: FeatureListSectionProps) {
   // Helper untuk mengekstrak URL gambar
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

   const rawImgUrl = getRawUrl(data.image);
   const imgUrl = getStrapiMedia(rawImgUrl);
   const altText =
      data.image?.alternativeText ||
      data.image?.data?.attributes?.alternativeText ||
      "Feature Image";

   if (!items.length) return null;

   return (
      <section className="container mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24">

         {/* 1. Header Section */}
         <div className="max-w-3xl mb-12 md:mb-16">
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

         {/* Grid Layout */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
            {/* 2. Left Column: Image */}
            <div className="lg:col-span-7 relative w-full">
               {imgUrl ? (
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-[16/10] group">
                     <Image
                        src={imgUrl}
                        alt={altText}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  </div>
               ) : (
                  <div className="w-full aspect-[4/3] bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col gap-2 items-center justify-center text-gray-400">
                     <span className="text-4xl">🖼️</span>
                     <span className="text-sm font-medium">No Image Found</span>
                  </div>
               )}
            </div>

            {/* 3. Right Column: List Kotak */}
            <div className="lg:col-span-5 flex flex-col gap-3">
               {items.map((item, index) => {
                  const rawIconUrl = getRawUrl(item.icon);
                  const iconUrl = getStrapiMedia(rawIconUrl);

                  return (
                     <div
                        key={item.id || index}
                        className="flex items-center gap-5 px-6 py-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg hover:border-green-100 transition-all duration-300 transform hover:-translate-x-1"
                     >
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 relative">
                           {iconUrl ? (
                              <Image
                                 src={iconUrl}
                                 alt="Icon"
                                 fill
                                 className="object-contain"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-full">
                                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                           )}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1">
                           {item.title && (
                              <h4 className="font-bold text-gray-900 text-lg mb-1">
                                 {item.title}
                              </h4>
                           )}
                           <p className="text-gray-600 text-sm leading-relaxed">
                              {item.text}
                           </p>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </section>
   );
}