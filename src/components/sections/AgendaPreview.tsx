// File: src/components/sections/AgendaPreview.tsx
import React from "react";
import Link from "next/link";
import AgendaCard from "@/components/features/AgendaCard";
import { Agenda } from "@/types/agenda";
import { FaArrowLeft } from "react-icons/fa";

interface AgendaPreviewProps {
   data: {
      title: string;
      subtitle?: string;
      linkText?: string;
      linkUrl?: string;
   };
   events: Agenda[];
   locale: string;
}

export default function AgendaPreview({ data, events, locale }: AgendaPreviewProps) {
   // Jika tidak ada event, sembunyikan section
   if (!events || events.length === 0) return null;

   // --- PERBAIKAN LOGIC URL ---
   // Fungsi ini memastikan URL selalu memiliki format /locale/path
   // Menghindari bug seperti "/idinformasi" (kurang slash)
   const getSafeUrl = (url: string) => {
      // Hapus slash di awal path jika ada, biar kita handle manual
      const cleanPath = url.startsWith("/") ? url.slice(1) : url;
      return `/${locale}/${cleanPath}`;
   };

   return (
      <section className="py-12 bg-white border-t border-gray-50">
         {/* 1. CONTAINER: Padding disamakan dengan NewsDashboard */}
         <div className="container mx-auto px-4 md:px-12 lg:px-24">

            {/* 2. HEADER SECTION */}
            <div className="flex flex-row justify-between items-end mb-8 gap-4 border-b border-gray-100 pb-4">

               {/* Judul & Subjudul */}
               <div className="flex flex-col gap-1">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#005320] border-l-4 border-yellow-400 pl-4 leading-none">
                     {data.title || "Agenda Terbaru"}
                  </h2>
                  {data.subtitle && (
                     <p className="text-gray-500 text-sm md:text-base pl-5 mt-1">
                        {data.subtitle}
                     </p>
                  )}
               </div>

               {/* Tombol Lihat Semua (Desktop Only) */}
               {data.linkUrl && (
                  <Link
                     // GUNAKAN FUNGSI GETSAFEURL DI SINI
                     href={getSafeUrl(data.linkUrl)}
                     className="hidden md:flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-4 py-2 rounded-full hover:bg-green-100 shrink-0"
                  >
                     {data.linkText || "Lihat Semua Agenda"}
                     <FaArrowLeft className="rotate-180" />
                  </Link>
               )}
            </div>

            {/* 3. GRID AGENDA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {events.map((event) => (
                  <AgendaCard
                     key={event.id}
                     data={event}
                     locale={locale}
                  />
               ))}
            </div>

            {/* 4. Tombol Lihat Semua (Mobile Only) */}
            {data.linkUrl && (
               <div className="mt-8 flex justify-center md:hidden">
                  <Link
                     // GUNAKAN FUNGSI GETSAFEURL DI SINI JUGA
                     href={getSafeUrl(data.linkUrl)}
                     className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                     {data.linkText || "Lihat Semua Agenda"}
                     <FaArrowLeft className="rotate-180" />
                  </Link>
               </div>
            )}

         </div>
      </section>
   );
}