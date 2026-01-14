// File: src/components/sections/OtherLinkSection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export interface LinkItemData {
   id: number;
   title: string;
   url: string;
   imageUrl: string;
}

interface OtherLinkSectionProps {
   title: string;
   data: LinkItemData[];
}

export default function OtherLinkSection({ title, data }: OtherLinkSectionProps) {
   if (!data || data.length === 0) return null;

   return (
      <section className="py-16 bg-white">
         <div className="container mx-auto px-6 md:px-12 lg:px-24">

            {/* KOTAK KONTAINER UTAMA */}
            {/* bg-[#749F74]: Hijau sama persis dengan Partnership */}
            {/* text-white: Judul diubah jadi putih agar terbaca */}
            <div className="bg-[#749F74] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-lg">

               {/* Dekorasi Background Halus (Putih Transparan) */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-0"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 -z-0"></div>

               {/* Header Section */}
               <div className="text-center mb-8 md:mb-10 relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-sm">
                     {title || "Tautan Terkait"}
                  </h2>
                  {/* Garis putih pemanis */}
                  <div className="w-16 h-1 bg-white mx-auto rounded-full opacity-80"></div>
               </div>

               {/* Grid Links */}
               {/* gap-3 md:gap-4: Jarak antar kartu rapat */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 relative z-10">
                  {data.map((item, index) => (
                     <Link
                        key={`${item.id}-${index}`}
                        href={item.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group h-full"
                     >
                        {/* KARTU ITEM (Tetap Putih) */}
                        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-transparent h-full flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-green-200">

                           {/* Icon Wrapper */}
                           {/* Ikon tetap menggunakan nuansa hijau agar senada */}
                           <div className="relative w-14 h-14 mb-4 bg-green-50 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-green-100 text-[#749F74]">
                              {item.imageUrl ? (
                                 <div className="relative w-8 h-8">
                                    <Image
                                       src={item.imageUrl}
                                       alt={item.title}
                                       fill
                                       className="object-contain"
                                    />
                                 </div>
                              ) : (
                                 <ExternalLink className="w-6 h-6" />
                              )}
                           </div>

                           {/* Title */}
                           {/* Text Gray agar kontras di atas kartu putih */}
                           <h3 className="text-gray-800 font-semibold text-sm md:text-base leading-snug group-hover:text-[#749F74] transition-colors line-clamp-2">
                              {item.title}
                           </h3>

                        </div>
                     </Link>
                  ))}
               </div>

            </div>

         </div>
      </section>
   );
}