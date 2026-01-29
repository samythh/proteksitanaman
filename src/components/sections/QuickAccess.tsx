// File: src/components/sections/QuickAccess.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { ExternalLink } from "lucide-react"; 

// --- KONFIGURASI TEMA ---
const COLOR_THEMES: Record<string, { title: string; bg: string; border: string }> = {
   blue: { title: "group-hover:text-blue-700", bg: "bg-blue-50 group-hover:bg-blue-100", border: "group-hover:border-blue-200" },
   green: { title: "group-hover:text-green-700", bg: "bg-green-50 group-hover:bg-green-100", border: "group-hover:border-green-200" },
   orange: { title: "group-hover:text-orange-700", bg: "bg-orange-50 group-hover:bg-orange-100", border: "group-hover:border-orange-200" },
   purple: { title: "group-hover:text-purple-700", bg: "bg-purple-50 group-hover:bg-purple-100", border: "group-hover:border-purple-200" },
   teal: { title: "group-hover:text-teal-700", bg: "bg-teal-50 group-hover:bg-teal-100", border: "group-hover:border-teal-200" },
   default: { title: "group-hover:text-gray-900", bg: "bg-gray-50 group-hover:bg-gray-100", border: "group-hover:border-gray-200" },
};

// --- TYPE DEFINITIONS ---
interface StrapiImage {
   url?: string;
   data?: {
      attributes: { url: string };
      url?: string;
   };
}

interface QuickLinkItem {
   id: number;
   title: string;
   url: string;
   theme: string;
   icon?: StrapiImage;
}

interface QuickAccessData {
   sectionTitle?: string;
   links?: QuickLinkItem[];
}

interface QuickAccessProps {
   data: QuickAccessData;
}

export default function QuickAccess({ data }: QuickAccessProps) {
   const { sectionTitle, links = [] } = data;

   if (!links || links.length === 0) return null;

   // Helper untuk URL Gambar
   const getIconUrl = (img?: StrapiImage) => {
      const raw = img?.url || img?.data?.attributes?.url;
      return getStrapiMedia(raw);
   };

   return (
      <section className="bg-[#749F74] py-16 -mt-2">
         <div className="container mx-auto px-4">

            {/* Container Putih */}
            <div className="bg-white max-w-6xl mx-auto rounded-[2rem] shadow-2xl p-8 md:p-12 relative z-10 border border-white/20">

               {/* Header Section */}
               <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 relative inline-block">
                     {sectionTitle || "Akses Cepat"}
                     <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-[#749F74] rounded-full"></span>
                  </h2>
               </div>

               {/* Grid Links */}
               {/* Layout Responsif: 2 kolom (HP) -> 3 kolom (Tablet) -> 5 kolom (PC) */}
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 justify-items-center">
                  {links.map((item) => {
                     const theme = COLOR_THEMES[item.theme] || COLOR_THEMES['default'];
                     const iconUrl = getIconUrl(item.icon);
                     const isExternal = item.url?.startsWith("http");

                     return (
                        <Link
                           key={item.id}
                           href={item.url || "#"}
                           target={isExternal ? "_blank" : "_self"}
                           rel={isExternal ? "noopener noreferrer" : undefined}
                           className="group flex flex-col items-center gap-4 w-full p-2 rounded-xl transition-all duration-300"
                        >
                           {/* ICON CONTAINER (BOX) */}
                           <div
                              className={`
                      relative flex items-center justify-center 
                      w-24 h-24 md:w-32 md:h-32 
                      rounded-3xl shadow-sm border border-gray-100
                      transition-all duration-300 
                      group-hover:scale-105 group-hover:shadow-lg group-hover:-translate-y-1
                      ${theme.bg} ${theme.border}
                    `}
                           >
                              <div className="relative w-10 h-10 md:w-14 md:h-14">
                                 {iconUrl ? (
                                    <Image
                                       src={iconUrl}
                                       alt={item.title}
                                       fill
                                       sizes="64px" 
                                       className="object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-110"
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                       <ExternalLink size={32} />
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* LABEL TEXT */}
                           <span
                              className={`
                      text-sm md:text-base font-bold text-gray-600 text-center leading-tight px-1 transition-colors duration-300
                      ${theme.title}
                    `}
                           >
                              {item.title}
                           </span>
                        </Link>
                     );
                  })}
               </div>

            </div>
         </div>
      </section>
   );
}