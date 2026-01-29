// File: src/components/ui/PageHeader.tsx
import React from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { ChevronRight, Home } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- TIPE DATA ---
export interface BreadcrumbItem {
   label: string;
   url: string;
}

interface PageHeaderProps {
   title: string;
   breadcrumb: string | BreadcrumbItem[];
   backgroundImageUrl?: string | null;
   sectionTitle?: string;
   sectionSubtitle?: string;
}

export default function PageHeader({
   title,
   breadcrumb,
   backgroundImageUrl,
   sectionTitle,
   sectionSubtitle
}: PageHeaderProps) {

   const finalImage = getStrapiMedia(backgroundImageUrl || null);
   const hasBottomSection = sectionTitle || sectionSubtitle;

   return (
      <>
         {/* --- BAGIAN 1: HERO IMAGE --- */}
         <div className="relative h-[40vh] min-h-[300px] w-full bg-gray-900 overflow-hidden">

            {/* Background Image dengan Overlay */}
            {finalImage ? (
               <>
                  <Image
                     src={finalImage}
                     alt={title}
                     fill
                     priority
                     className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 md:bg-black/50" />
               </>
            ) : (
               <div className="absolute inset-0 bg-gradient-to-br from-[#005320] to-[#002e12]" />
            )}

            {/* Content Tengah */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4 mt-8 md:mt-16 z-10">
               <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700">
                  {title}
               </h1>

               {/* LOGIKA BREADCRUMB */}
               <div className="text-sm md:text-base text-gray-200 font-medium tracking-wide flex items-center justify-center gap-2 animate-in fade-in delay-200 duration-700 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">

                  {Array.isArray(breadcrumb) ? (
                     // OPSI A: Breadcrumb Interaktif
                     <nav aria-label="Breadcrumb" className="flex items-center gap-2">
                        {breadcrumb.map((item, index) => (
                           <React.Fragment key={index}>
                              {item.url !== "#" ? (
                                 <Link
                                    href={item.url}
                                    className="hover:text-yellow-400 hover:underline transition-colors flex items-center gap-1"
                                 >
                                    {(item.label.toLowerCase() === 'beranda' || item.label.toLowerCase() === 'home') && <Home size={14} className="mb-0.5" />}
                                    {item.label}
                                 </Link>
                              ) : (
                                 <span className="cursor-default font-semibold text-yellow-400">
                                    {item.label}
                                 </span>
                              )}

                              {/* Separator Panah */}
                              {index < breadcrumb.length - 1 && (
                                 <ChevronRight size={14} className="opacity-50" />
                              )}
                           </React.Fragment>
                        ))}
                     </nav>
                  ) : (
                     // OPSI B: Teks Statis
                     <span className="capitalize">{breadcrumb}</span>
                  )}

               </div>
            </div>
         </div>

         {/* --- BAGIAN 2: JUDUL SEKSI (Opsional) --- */}
         {hasBottomSection && (
            <div className="container mx-auto px-4 -mb-6 mt-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
               <div className="text-center mb-10">
                  {/* 1. Judul Utama */}
                  {sectionTitle && (
                     <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-wide">
                        {sectionTitle}
                     </h2>
                  )}

                  {/* 2. Sub-judul */}
                  {sectionSubtitle && (
                     <h3 className="text-lg md:text-xl font-medium text-[#005320] mt-2">
                        {sectionSubtitle}
                     </h3>
                  )}

                  {/* 3. Dekorasi Garis */}
                  <div className="w-20 h-1.5 bg-[#005320] mx-auto mt-4 rounded-full"></div>
               </div>
            </div>
         )}
      </>
   );
}