// File: src/components/sections/AccreditationSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

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
   const [selectedImage, setSelectedImage] = useState<string | null>(null);

   if (!data || data.length === 0) return null;

   const count = data.length;

   // --- LOGIKA DINAMIS UKURAN GRID ---
   const getGridConfig = (totalItems: number) => {
      // Kasus 1: Cuma 1 sertifikat (Besar, tapi dibatasi max-w-sm agar tidak pecah/aneh)
      if (totalItems === 1) {
         return "grid-cols-1 max-w-md";
      }
      // Kasus 2: 2 sertifikat (Bagi 2 rata, max-w agak lebar)
      if (totalItems === 2) {
         return "grid-cols-1 md:grid-cols-2 max-w-4xl";
      }
      // Kasus 3: 3 sertifikat (Bagi 3 rata, max-w lebih lebar lagi)
      if (totalItems === 3) {
         return "grid-cols-1 md:grid-cols-3 max-w-6xl";
      }
      // Kasus 4: 4 sertifikat (Bagi 4 rata, full width)
      if (totalItems === 4) {
         return "grid-cols-2 md:grid-cols-4 max-w-7xl";
      }
      // Kasus 5+: 5 sertifikat (Bagi 5, full width extra)
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-[1400px]";
   };

   const gridConfig = getGridConfig(count);

   return (
      <>
         <section className="bg-[#749F74] pb-12 md:pb-20 relative z-10">
            <div className="container mx-auto px-4 md:px-8 pt-40 -mt-20 text-center">

               <h2 className="text-2xl md:text-4xl font-bold text-white mb-10">
                  {title || "Akreditasi"}
               </h2>

               {/* Container Grid Dinamis 
                  - className di-inject dari fungsi getGridConfig
               */}
               <div className={`grid gap-6 md:gap-8 items-start justify-center mx-auto transition-all duration-300 ${gridConfig}`}>

                  {data.map((cert) => (
                     <div key={cert.id} className="flex flex-col items-center gap-3 group w-full">

                        {/* Container Gambar */}
                        <div
                           className="relative w-full aspect-[4/3] bg-white/10 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105 cursor-pointer drop-shadow-md hover:drop-shadow-xl border border-white/10"
                           onClick={() => {
                              if (cert.imageUrl) {
                                 setSelectedImage(cert.imageUrl);
                              }
                           }}
                        >
                           {cert.imageUrl ? (
                              <Image
                                 src={cert.imageUrl}
                                 alt={cert.title}
                                 fill
                                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                 className="object-contain p-3" // Padding agar tidak mepet border
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-white/50 border-2 border-dashed border-white/30">
                                 No Image
                              </div>
                           )}
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

         {/* --- MODAL POPUP FULLSCREEN --- */}
         {selectedImage && (
            <div
               className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
               onClick={() => setSelectedImage(null)}
            >
               <div
                  className="relative w-full max-w-5xl h-[85vh] bg-transparent flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
               >
                  <button
                     onClick={() => setSelectedImage(null)}
                     className="absolute -top-12 right-0 md:top-0 md:-right-12 z-50 bg-white/10 hover:bg-white/30 text-white p-2 rounded-full transition-colors backdrop-blur-md"
                  >
                     <X size={24} />
                  </button>

                  <div className="relative w-full h-full">
                     <Image
                        src={selectedImage}
                        alt="Sertifikat Fullscreen"
                        fill
                        className="object-contain"
                        priority
                     />
                  </div>
               </div>
            </div>
         )}
      </>
   );
}