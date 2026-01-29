// File: src/components/sections/AccreditationSection.tsx
"use client";

import PosterLightBox from "@/components/ui/PosterLightBox";
import { cn } from "@/lib/utils/cn";

export interface CertificateItemData {
   id: number;
   title: string;
   imageUrl: string;
}

interface AccreditationSectionProps {
   title: string;
   data: CertificateItemData[];
}

export default function AccreditationSection({ title, data }: AccreditationSectionProps) {
   if (!data || data.length === 0) return null;

   const count = data.length;

   // --- LOGIKA DINAMIS UKURAN GRID (SESUAI DESAIN LAMA) ---
   const getGridConfig = (totalItems: number) => {
      // Kasus 1: Cuma 1 sertifikat (Besar, max-w-md)
      if (totalItems === 1) {
         return "grid-cols-1 max-w-md";
      }
      // Kasus 2: 2 sertifikat (Bagi 2 rata, max-w-4xl)
      if (totalItems === 2) {
         return "grid-cols-1 md:grid-cols-2 max-w-4xl";
      }
      // Kasus 3: 3 sertifikat (Bagi 3 rata, max-w-6xl)
      if (totalItems === 3) {
         return "grid-cols-1 md:grid-cols-3 max-w-6xl";
      }
      // Kasus 4: 4 sertifikat (Bagi 4 rata, full width 7xl)
      if (totalItems === 4) {
         return "grid-cols-2 md:grid-cols-4 max-w-7xl";
      }
      // Kasus 5+: 5 sertifikat (Bagi 5, full width extra)
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-[1400px]";
   };

   const gridConfig = getGridConfig(count);

   return (
      <section className="bg-[#749F74] pb-12 md:pb-20 relative z-10">
         {/* Container dengan negative margin untuk overlapping effect */}
         <div className="container mx-auto px-4 md:px-8 pt-40 -mt-20 text-center">

            {/* Judul Section (Desain Lama: mb-10) */}
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-10">
               {title || "Akreditasi"}
            </h2>

            {/* Grid Container */}
            <div className={cn(
               "grid gap-6 md:gap-8 items-start justify-center mx-auto transition-all duration-300",
               gridConfig
            )}>
               {data.map((cert) => (
                  <div key={cert.id} className="flex flex-col items-center gap-3 group w-full">

                     {/* WRAPPER LIGHTBOX*/}
                     <div className="w-full aspect-[4/3] relative">
                        <PosterLightBox
                           src={cert.imageUrl}
                           alt={cert.title}
                           className="bg-white/10 border border-white/10 rounded-xl shadow-sm drop-shadow-md hover:drop-shadow-xl hover:scale-105 transition-all duration-300 p-3 w-full h-full object-contain"
                        />
                     </div>

                     {/* Judul Sertifikat */}
                     <p className="text-white font-medium text-sm md:text-base leading-tight px-1 drop-shadow-sm">
                        {cert.title}
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}