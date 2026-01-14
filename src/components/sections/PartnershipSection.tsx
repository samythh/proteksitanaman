// File: src/components/sections/PartnershipSection.tsx
"use client";

import Image from "next/image";

// Tipe data bersih
export interface PartnerItemData {
   id: number;
   name: string;
   logoUrl: string;
}

interface PartnershipSectionProps {
   title: string;
   data: PartnerItemData[];
}

export default function PartnershipSection({ title, data }: PartnershipSectionProps) {
   if (!data || data.length === 0) return null;

   // Duplikasi data diperbanyak (10x lipat)
   const MARQUEE_SET = Array(10).fill(data).flat();

   return (
      // PERBAIKAN DISINI:
      // pb-20 diubah menjadi pb-40 (Mobile) dan md:pb-64 (Laptop)
      // Ini akan membuat background hijau memanjang jauh ke bawah
      <section className="bg-[#749F74] pt-16 pb-40 md:pb-64 overflow-hidden relative group/section">

         {/* 1. HEADER */}
         <div className="container mx-auto px-6 md:px-12 lg:px-24 relative mb-12">
            <div className="text-center">
               <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                  {title || "Kerja Sama"}
               </h2>
            </div>
         </div>

         {/* 2. MARQUEE TRACK AREA */}
         <div className="w-full overflow-hidden">

            <div
               className="w-full"
               style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
            >
               <div className="flex w-full hover:pause-animation">

                  {/* Loop 2x div untuk efek infinite scroll */}
                  {[1, 2].map((groupIndex) => (
                     <div
                        key={groupIndex}
                        // gap-3 dan pr-3 untuk jarak antar item
                        className="flex gap-3 py-4 animate-marquee min-w-full flex-shrink-0 items-center justify-start pr-3"
                        aria-hidden={groupIndex === 2 ? "true" : undefined}
                     >
                        {MARQUEE_SET.map((item, index) => (
                           <div
                              // Key unik kombinasi index
                              key={`${groupIndex}-${item.id}-${index}`}
                              className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl shadow-lg overflow-hidden group/card cursor-pointer transform transition-transform hover:scale-105 flex-shrink-0 border border-green-100"
                           >
                              <div className="absolute inset-0 flex items-center justify-center p-6">
                                 <div className="relative w-full h-full">
                                    {item.logoUrl ? (
                                       <Image
                                          src={item.logoUrl}
                                          alt={item.name}
                                          fill
                                          className="object-contain"
                                          sizes="(max-width: 768px) 100vw, 33vw"
                                       />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                          No Logo
                                       </div>
                                    )}
                                 </div>
                              </div>

                              <div className="absolute inset-0 bg-[#005700]/90 flex items-center justify-center p-4 text-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                                 <span className="text-white font-bold text-xs md:text-sm leading-tight">
                                    {item.name}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Kecepatan animasi */}
         <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 120s linear infinite; 
        }
        .pause-animation:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
      </section>
   );
}