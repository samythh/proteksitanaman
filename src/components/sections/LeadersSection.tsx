"use client";

import { useState } from "react";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";
import PosterLightBox from "@/components/ui/PosterLightBox";

// --- TIPE DATA ---
interface LeaderItem {
   id: number;
   name: string;
   period: string;
   photo?: {
      url: string;
   };
}

interface LeaderGroup {
   id: number;
   tab_label: string;
   current_leader?: LeaderItem;
   past_leaders: LeaderItem[];
}

interface LeadersSectionProps {
   data: {
      title?: string;
      groups: LeaderGroup[];
   };
}

export default function LeadersSection({ data }: LeadersSectionProps) {
   const [activeTab, setActiveTab] = useState(0);
   const t = useTranslations("LeadersSection");

   if (!data?.groups || data.groups.length === 0) return null;

   const activeGroup = data.groups[activeTab];

   return (
      <section className="py-20 md:py-28 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">

         {/* Background Decor */}
         <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

         <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">

            {/* JUDUL UTAMA */}
            {data.title && (
               <div className="text-center mb-12 md:mb-16">
                  <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
                     {data.title}
                  </h2>
                  <div className="h-1.5 w-24 bg-[#005320] mx-auto rounded-full opacity-80"></div>
               </div>
            )}

            {/* --- CONTAINER UTAMA --- */}
            <div className="max-w-6xl mx-auto">

               {/* A. TABS HEADER */}
               <div className="flex justify-center mb-10">
                  <div className="inline-flex flex-wrap justify-center gap-2 p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-full border border-gray-200">
                     {data.groups.map((group, idx) => {
                        const isActive = idx === activeTab;
                        return (
                           <button
                              key={group.id}
                              onClick={() => setActiveTab(idx)}
                              className={`
                                 px-6 py-2.5 rounded-full text-sm md:text-base font-bold transition-all duration-300
                                 ${isActive
                                    ? "bg-[#005320] text-white shadow-lg transform scale-105"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-white"
                                 }
                              `}
                           >
                              {group.tab_label}
                           </button>
                        );
                     })}
                  </div>
               </div>

               {/* B. CONTENT BOX */}
               <div
                  key={activeGroup.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-700"
               >

                  {/* 1. PEMIMPIN SEKARANG */}
                  {activeGroup.current_leader && (
                     <div className="flex flex-col items-center justify-center mb-20 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-80 md:h-80 bg-green-100 rounded-full blur-3xl opacity-60 -z-10 animate-pulse"></div>

                        <div className="group relative w-56 h-72 md:w-64 md:h-80 mb-6 perspective-1000">
                           <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-[6px] border-white ring-1 ring-gray-100 transition-transform duration-500 group-hover:scale-[1.02] group-hover:rotate-1">

                              {activeGroup.current_leader.photo?.url ? (
                                 <PosterLightBox
                                    src={getStrapiMedia(activeGroup.current_leader.photo.url) || ""}
                                    alt={activeGroup.current_leader.name}
                                    className="w-full h-full rounded-none border-none shadow-none bg-transparent"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                    <User size={80} />
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="text-center space-y-2">
                           <h4 className="text-3xl font-extrabold text-[#005320] leading-tight">
                              {activeGroup.current_leader.name}
                           </h4>
                           <div className="inline-block bg-yellow-100 text-yellow-800 px-5 py-1.5 rounded-full text-sm font-bold shadow-sm border border-yellow-200">
                              {activeGroup.current_leader.period}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Garis Pemisah */}
                  {activeGroup.past_leaders.length > 0 && (
                     <div className="relative flex items-center justify-center mb-12">
                        <div className="absolute inset-0 flex items-center">
                           <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative bg-gray-50 px-6 py-2 rounded-full border border-gray-200 shadow-sm">
                           <span className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-widest">
                              {t("past_period")}
                           </span>
                        </div>
                     </div>
                  )}

                  {/* 2. MANTAN PEMIMPIN */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 justify-items-center">
                     {activeGroup.past_leaders.map((leader, idx) => (
                        <div
                           key={idx}
                           className="group flex flex-col items-center text-center w-full animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards"
                           style={{ animationDelay: `${idx * 150}ms` }}
                        >
                           <div className="relative w-36 h-48 md:w-44 md:h-56 mb-4 rounded-xl overflow-hidden shadow-md bg-white border border-gray-100 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl">
                              {leader.photo?.url ? (
                                 <PosterLightBox
                                    src={getStrapiMedia(leader.photo.url) || ""}
                                    alt={leader.name}
                                    className="w-full h-full rounded-none border-none shadow-none"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                    <User size={48} />
                                 </div>
                              )}
                           </div>

                           <h5 className="text-sm md:text-base font-bold text-gray-700 leading-tight group-hover:text-[#005320] mb-1.5 transition-colors px-2">
                              {leader.name}
                           </h5>
                           <span className="text-[10px] md:text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                              {leader.period}
                           </span>
                        </div>
                     ))}
                  </div>

               </div>
            </div>
         </div>
      </section>
   );
}