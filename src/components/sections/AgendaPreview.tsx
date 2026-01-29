// File: src/components/sections/AgendaPreview.tsx
import React from "react";
import { Link } from "@/i18n/routing";
import AgendaCard from "@/components/features/AgendaCard";
import { Agenda } from "@/types/agenda";
import { ArrowRight } from "lucide-react";

// --- TYPE DEFINITIONS ---
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
   if (!events || events.length === 0) return null;

   return (
      <section className="bg-white py-8 md:py-12 border-t border-gray-100">

         <div className="container mx-auto px-4 md:px-12 lg:px-24">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-row justify-between items-end mb-8 gap-4 border-b border-gray-100 pb-4">
               <div className="flex flex-col gap-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#005320] border-l-4 border-yellow-400 pl-4 leading-none">
                     {data.title || "Agenda Terbaru"}
                  </h2>
                  {data.subtitle && (
                     <p className="text-gray-500 text-sm md:text-base pl-5 mt-1 max-w-2xl">
                        {data.subtitle}
                     </p>
                  )}
               </div>

               {/* Tombol Lihat Semua (Desktop) */}
               {data.linkUrl && (
                  <Link
                     href={data.linkUrl}
                     className="hidden md:flex items-center gap-2 text-sm font-bold text-[#005320] hover:text-yellow-600 transition-colors bg-green-50 px-5 py-2.5 rounded-full hover:bg-green-100 shrink-0 group"
                  >
                     {data.linkText || "Lihat Semua Agenda"}
                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               )}
            </div>

            {/* --- GRID AGENDA --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               {events.map((event) => (
                  <AgendaCard
                     key={event.id}
                     data={{
                        ...event,
                        endDate: event.endDate || event.startDate || "",
                        image: event.image as unknown as { url: string; alternativeText?: string },
                        tags: event.tags as unknown as { id: number; name: string }[]
                     }}
                     locale={locale}
                  />
               ))}
            </div>

            {/* --- FOOTER SECTION (Mobile Only) --- */}
            {data.linkUrl && (
               <div className="mt-8 flex justify-center md:hidden">
                  <Link
                     href={data.linkUrl}
                     className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors group"
                  >
                     {data.linkText || "Lihat Semua Agenda"}
                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            )}
         </div>
      </section>
   );
}