// File: src/components/ui/PageHeader.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- TIPE DATA ---
interface BreadcrumbItem {
   label: string;
   url: string;
}

interface PageHeaderProps {
   title: string;
   // ✅ UPDATE: Breadcrumb bisa String (lama) atau Array Object (baru)
   breadcrumb: string | BreadcrumbItem[];
   backgroundImageUrl?: string | null;
   sectionTitle?: string;    // Contoh: "Staf Akademik"
   sectionSubtitle?: string; // Contoh: "Departemen..."
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

            {/* Background Image */}
            {finalImage ? (
               <Image
                  src={finalImage}
                  alt={title}
                  fill
                  priority
                  className="object-cover opacity-60"
               />
            ) : (
               <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-100" />
            )}

            {/* Content Tengah */}
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4 mt-8 md:mt-16 z-10">
               <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-md animate-in fade-in slide-in-from-bottom-3 duration-700">
                  {title}
               </h1>

               {/* LOGIKA BREADCRUMB HYBRID */}
               <div className="text-sm md:text-base opacity-90 font-medium tracking-wide flex items-center justify-center gap-2 animate-in fade-in delay-200 duration-700">

                  {Array.isArray(breadcrumb) ? (
                     // OPSI A: Jika Array (Bisa diklik)
                     <nav className="flex items-center gap-2">
                        {breadcrumb.map((item, index) => (
                           <React.Fragment key={index}>
                              {item.url !== "#" ? (
                                 <Link
                                    href={item.url}
                                    className="hover:text-green-400 hover:underline transition-colors"
                                 >
                                    {item.label}
                                 </Link>
                              ) : (
                                 <span className="cursor-default">{item.label}</span>
                              )}

                              {/* Separator Panah */}
                              {index < breadcrumb.length - 1 && (
                                 <ChevronRight size={14} className="opacity-70" />
                              )}
                           </React.Fragment>
                        ))}
                     </nav>
                  ) : (
                     // OPSI B: Jika String (Teks biasa - Lowercase sesuai desain lama)
                     <span className="lowercase">{breadcrumb}</span>
                  )}

               </div>
            </div>
         </div>

         {/* --- BAGIAN 2: JUDUL SEKSI (Desain Lama) --- */}
         {hasBottomSection && (
            <div className="container mx-auto px-4 mt-14 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
               <div className="text-center mb-10">

                  {/* 1. Judul Hitam */}
                  {sectionTitle && (
                     <h2 className="text-2xl font-bold text-gray-800">
                        {sectionTitle}
                     </h2>
                  )}

                  {/* 2. Sub-judul Hijau */}
                  {sectionSubtitle && (
                     <h3 className="text-xl font-medium text-green-600 mt-1">
                        {sectionSubtitle}
                     </h3>
                  )}

                  {/* 3. Garis Hijau */}
                  <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full mb-6"></div>

               </div>
            </div>
         )}
      </>
   );
}