// File: src/components/sections/AgendaPreview.tsx
import React from "react";
import Link from "next/link";
import AgendaCard from "@/components/features/AgendaCard"; // Reuse komponen yang sudah ada
import { Agenda } from "@/types/agenda";

interface AgendaPreviewProps {
   data: {
      title: string;
      subtitle?: string;
      linkText?: string;
      linkUrl?: string;
   };
   events: Agenda[]; // Data event dikirim dari parent (SectionRenderer)
   locale: string;
}

export default function AgendaPreview({ data, events, locale }: AgendaPreviewProps) {
   // Jika tidak ada event, sembunyikan section ini agar rapi
   if (!events || events.length === 0) return null;

   return (
      <section className="py-16 bg-white border-t border-gray-100">
         <div className="container mx-auto px-4">

            {/* HEADER SECTION: Judul & Tombol Lihat Semua */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 gap-4">
               <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                     {data.title || "Agenda Terbaru"}
                  </h2>
                  {data.subtitle && (
                     <p className="text-gray-500 text-lg">{data.subtitle}</p>
                  )}
                  <div className="h-1.5 w-20 bg-green-600 rounded-full mt-4"></div>
               </div>

               {/* Tombol Lihat Semua (Desktop & Mobile Friendly) */}
               {data.linkUrl && (
                  <Link
                     href={`/${locale}${data.linkUrl}`}
                     className="group inline-flex items-center gap-2 px-6 py-3 bg-white border border-green-200 text-green-700 font-semibold rounded-full shadow-sm hover:bg-green-600 hover:text-white hover:border-transparent transition-all duration-300"
                  >
                     <span>{data.linkText || "Lihat Semua Agenda"}</span>
                     <span className="group-hover:translate-x-1 transition-transform">
                        &rarr;
                     </span>
                  </Link>
               )}
            </div>

            {/* GRID AGENDA (Reuse AgendaCard) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
               {events.map((event) => (
                  <AgendaCard
                     key={event.id}
                     data={event}
                     locale={locale}
                  />
               ))}
            </div>

         </div>
      </section>
   );
}