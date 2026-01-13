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

   return (
      <>
         <section className="bg-[#749F74] pb-12 md:pb-20 relative z-10">

            <div className="container mx-auto px-6 md:px-12 lg:px-32 pt-40 -mt-20 text-center">

               <h2 className="text-2xl md:text-4xl font-bold text-white mb-12">
                  {title || "Akreditasi"}
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center justify-center max-w-5xl mx-auto">

                  {data.map((cert) => (
                     <div key={cert.id} className="flex flex-col items-center gap-4 group">

                        {/* PERBAIKAN CONTAINER GAMBAR:
                                    - Dihapus: bg-white, p-2, rounded-lg, shadow-lg (bingkai putih)
                                    - Ditambah: drop-shadow-lg (bayangan pada gambar), hover:scale-105 (efek zoom)
                                */}
                        <div
                           className="relative w-full aspect-[4/3] transition-transform duration-300 group-hover:scale-105 cursor-pointer drop-shadow-lg"
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
                                 // PERBAIKAN IMAGE: Dihapus border dan rounded
                                 className="object-contain"
                              />
                           ) : (
                              // Fallback dibuat transparan
                              <div className="w-full h-full flex items-center justify-center text-white/50 border-2 border-dashed border-white/30 rounded-lg">
                                 No Image
                              </div>
                           )}
                        </div>
                        <p className="text-white font-semibold text-lg tracking-wide mt-2">
                           {cert.title}
                        </p>
                     </div>
                  ))}

               </div>
            </div>
         </section>

         {/* --- MODAL POPUP FULLSCREEN (Tidak ada perubahan) --- */}
         {selectedImage && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300"
               onClick={() => setSelectedImage(null)}
            >
               <div
                  className="relative w-full max-w-5xl h-[80vh] bg-transparent flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
               >
                  <button
                     onClick={() => setSelectedImage(null)}
                     className="absolute top-0 right-0 z-10 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors m-4"
                  >
                     <X size={24} />
                  </button>

                  <Image
                     src={selectedImage}
                     alt="Sertifikat Fullscreen"
                     fill
                     className="object-contain"
                     priority
                  />
               </div>
            </div>
         )}
      </>
   );
}