// File: src/components/sections/LeadersSection.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { X } from "lucide-react";

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
   const [zoomedImage, setZoomedImage] = useState<string | null>(null);
   const [mounted, setMounted] = useState(false);

   // ✅ FIX ESLINT: Gunakan setTimeout agar update state tidak dianggap sinkron blocking
   // Ini tetap menjamin kode dijalankan di client-side (setelah hydration)
   useEffect(() => {
      const timer = setTimeout(() => {
         setMounted(true);
      }, 0);
      return () => clearTimeout(timer);
   }, []);

   if (!data?.groups || data.groups.length === 0) return null;

   const activeGroup = data.groups[activeTab];

   return (
      <section className="py-20 bg-gray-50 relative overflow-hidden font-sans">

         {/* Background Decor */}
         <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#005320_1px,transparent_1px)] [background-size:24px_24px]"></div>

         <div className="container mx-auto px-4 md:px-12 lg:px-24 relative z-10">

            {/* JUDUL UTAMA */}
            {data.title && (
               <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 drop-shadow-sm">
                     {data.title}
                  </h2>
                  <div className="h-1 w-20 bg-[#749F74] mx-auto rounded-full"></div>
               </div>
            )}

            {/* --- CONTAINER UTAMA --- */}
            <div className="max-w-6xl mx-auto">

               {/* A. TABS HEADER */}
               <div className="flex items-end overflow-x-auto scrollbar-hide w-full pl-0 relative z-30">
                  {data.groups.map((group, idx) => {
                     const isActive = idx === activeTab;

                     return (
                        <button
                           key={group.id}
                           onClick={() => setActiveTab(idx)}
                           className={`
                    relative px-10 font-bold text-sm md:text-base transition-all duration-200 whitespace-nowrap
                    border-t border-l border-r rounded-t-xl
                    -ml-8
                    
                    ${isActive
                                 ? "bg-white text-[#005320] border-gray-200 border-b-white z-30 py-4 -mb-[1px] shadow-[0_-2px_5px_rgba(0,0,0,0.02)]"
                                 : "bg-gray-100 text-gray-500 border-gray-300 border-b-transparent z-10 hover:bg-gray-50 py-3 mb-0 hover:z-20"}
                  `}
                           style={{
                              marginLeft: idx === 0 ? '0px' : '-32px'
                           }}
                        >
                           <span className="relative z-10">{group.tab_label}</span>
                        </button>
                     );
                  })}
               </div>

               {/* B. CONTENT BOX */}
               <div className="relative bg-white border border-gray-200 rounded-b-xl rounded-tr-xl rounded-tl-none shadow-sm p-8 md:p-12 min-h-[600px] z-20 border-t-0">

                  {/* Judul Tab */}
                  <div className="mb-12 text-center border-b border-gray-100 pb-6 animate-enter">
                     <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                        {activeGroup.tab_label}
                     </h3>
                  </div>

                  {/* 1. PEMIMPIN SEKARANG */}
                  {activeGroup.current_leader && (
                     <div key={`current-${activeGroup.id}`} className="flex flex-col items-center justify-center mb-16 animate-enter" style={{ animationDelay: '0.1s' }}>
                        <div
                           className="relative w-48 h-64 md:w-56 md:h-72 mb-6 shadow-xl rounded-lg overflow-hidden border-[6px] border-white ring-1 ring-gray-200 bg-gray-100 group transition-transform duration-500 hover:scale-[1.02] cursor-zoom-in"
                           // ✅ FIX TS: Tambahkan "?? null" untuk mengkonversi undefined ke null
                           onClick={() => setZoomedImage(getStrapiMedia(activeGroup.current_leader?.photo?.url ?? null))}
                        >
                           {activeGroup.current_leader.photo?.url ? (
                              <Image
                                 src={getStrapiMedia(activeGroup.current_leader.photo.url) || ""}
                                 alt={activeGroup.current_leader.name}
                                 fill
                                 className="object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">👤</div>
                           )}
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center"></div>
                        </div>

                        <h4 className="text-2xl font-bold text-[#005320] text-center mb-2">
                           {activeGroup.current_leader.name}
                        </h4>
                        <div className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                           {activeGroup.current_leader.period}
                        </div>
                     </div>
                  )}

                  {/* Garis Pemisah */}
                  {activeGroup.past_leaders.length > 0 && (
                     <div className="relative flex py-5 items-center mb-10 animate-enter" style={{ animationDelay: '0.2s' }}>
                        <div className="flex-grow border-t border-dashed border-gray-300"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
                           Periode Sebelumnya
                        </span>
                        <div className="flex-grow border-t border-dashed border-gray-300"></div>
                     </div>
                  )}

                  {/* 2. MANTAN PEMIMPIN */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 justify-items-center">
                     {activeGroup.past_leaders.map((leader, idx) => (
                        <div
                           key={idx}
                           className="flex flex-col items-center text-center group animate-enter w-full"
                           style={{ animationDelay: `${0.3 + (idx * 0.1)}s` }}
                        >
                           <div
                              className="relative w-40 h-52 md:w-44 md:h-56 mb-4 rounded-lg overflow-hidden shadow-md border-4 border-white ring-1 ring-gray-100 bg-gray-100 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl cursor-zoom-in"
                              // ✅ FIX TS: Tambahkan "?? null" untuk mengkonversi undefined ke null
                              onClick={() => setZoomedImage(getStrapiMedia(leader.photo?.url ?? null))}
                           >
                              {leader.photo?.url ? (
                                 <Image
                                    src={getStrapiMedia(leader.photo.url) || ""}
                                    alt={leader.name}
                                    fill
                                    className="object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-300">👤</div>
                              )}
                           </div>

                           <h5 className="text-base font-bold text-gray-700 leading-tight group-hover:text-[#005320] mb-1.5 px-1">
                              {leader.name}
                           </h5>
                           <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                              {leader.period}
                           </span>
                        </div>
                     ))}
                  </div>

               </div>
            </div>

            {/* --- MODAL POPUP (PORTAL) --- */}
            {/* createPortal memindahkan modal ke document.body agar tidak tertutup navbar */}
            {mounted && zoomedImage && createPortal(
               <div
                  className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
                  onClick={() => setZoomedImage(null)}
               >
                  {/* Tombol Close */}
                  <button
                     className="absolute top-4 right-4 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full z-[100000]"
                     onClick={() => setZoomedImage(null)}
                  >
                     <X className="w-8 h-8" />
                  </button>

                  {/* Gambar Full */}
                  <div
                     className="relative w-full h-full max-w-7xl max-h-[90vh] pointer-events-auto"
                     onClick={(e) => e.stopPropagation()}
                  >
                     <Image
                        src={zoomedImage}
                        alt="Zoomed Leader"
                        fill
                        className="object-contain rounded-lg shadow-2xl"
                        sizes="100vw"
                        quality={100}
                        priority
                     />
                  </div>
               </div>,
               document.body
            )}

            <style jsx global>{`
          .animate-enter {
            opacity: 0;
            transform: translateY(20px) scale(0.99);
            animation: easeInPop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          @keyframes easeInPop {
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

         </div>
      </section>
   );
}