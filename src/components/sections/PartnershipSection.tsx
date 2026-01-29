// File: src/components/sections/PartnershipSection.tsx
"use client";

import Image from "next/image";

// --- TIPE DATA ---
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

   // --- PERSIAPAN DATA MARQUEE ---
   const MIN_ITEMS_ON_SCREEN = 15;
   const repeatCount = Math.ceil(MIN_ITEMS_ON_SCREEN / data.length);
   const BASE_SET = Array(repeatCount).fill(data).flat();

   // Duplikasi untuk looping mulus
   const FULL_MARQUEE_SET = [...BASE_SET, ...BASE_SET];

   // Durasi animasi
   const animationDuration = Math.max(40, FULL_MARQUEE_SET.length * 2);

   return (
      <section className="bg-[#749F74] pt-16 pb-40 md:pb-64 overflow-hidden relative group/section">

         {/* HEADER */}
         <div className="container mx-auto px-6 md:px-12 lg:px-24 relative mb-12">
            <div className="text-center">
               <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm">
                  {title || "Kerja Sama"}
               </h2>
               <div className="w-20 h-1 bg-white/50 mx-auto rounded-full mt-4"></div>
            </div>
         </div>

         {/* MARQUEE TRACK AREA */}
         <div
            className="w-full overflow-hidden relative"
            style={{
               maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
               WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}
            
         >
            <div
               className="flex gap-6 py-4 animate-marquee-smooth w-max pause-on-hover items-center"
               style={{ animationDuration: `${animationDuration}s` }}
            >
               {FULL_MARQUEE_SET.map((item, index) => (
                  // KARTU PARTNER
                  <div
                     key={`partner-${item.id}-${index}`}
                     className="relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-xl shadow-lg overflow-hidden group/card cursor-pointer transform transition-transform duration-300 hover:scale-105 flex-shrink-0 border border-green-100"
                  >
                     {/* Logo Image */}
                     <div className="absolute inset-0 flex items-center justify-center p-6">
                        <div className="relative w-full h-full">
                           {item.logoUrl ? (
                              <Image
                                 src={item.logoUrl}
                                 alt={item.name}
                                 fill
                                 sizes="(max-width: 768px) 128px, 160px"
                                 className="object-contain"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium bg-gray-50 rounded">
                                 No Logo
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Overlay Hijau Tua saat Hover */}
                     <div className="absolute inset-0 bg-[#005700]/90 flex items-center justify-center p-4 text-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                        <span className="text-white font-bold text-xs md:text-sm leading-tight">
                           {item.name}
                        </span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* CSS ANIMASI */}
         <style jsx global>{`
        @keyframes marquee-smooth {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-marquee-smooth {
          animation-name: marquee-smooth;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        /* ✅ UPDATE LOGIC PAUSE:
           Saat class .pause-on-hover di-hover (oleh mouse),
           maka state animasi berubah menjadi 'paused'.
           Karena card ada di dalam div ini, hover card = hover div ini.
        */
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>
      </section>
   );
}