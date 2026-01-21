// File: src/components/sections/PublicationSection.tsx

"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- TYPE DEFINITIONS ---
// (Tidak ada perubahan di sini, dilewati agar lebih singkat)
interface PublicationItem {
   id: number;
   category: "journal" | "book" | "patent" | "proceeding";
   title: string;
   year: string;
   subtitle?: string;
   extra_info?: string;
   description?: string;
   tag?: string;
   url?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   image: any;
}

interface PublicationSectionData {
   title?: string;
   subtitle?: string;
   items: PublicationItem[];
}

interface PublicationSectionProps {
   data: PublicationSectionData;
}

export default function PublicationSection({ data }: PublicationSectionProps) {
   // (Logic di atas tidak berubah, dilewati agar fokus ke perubahan)
   const items = data.items || [];
   const [activeTab, setActiveTab] = useState<string>("all");
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const [selectedCaption, setSelectedCaption] = useState<string>("");

   useEffect(() => {
      if (selectedImage) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "auto";
      }
      return () => {
         document.body.style.overflow = "auto";
      };
   }, [selectedImage]);

   const openLightbox = (imgUrl: string, caption: string) => {
      if (!imgUrl) return;
      setSelectedImage(imgUrl);
      setSelectedCaption(caption);
   };

   const closeLightbox = () => {
      setSelectedImage(null);
      setSelectedCaption("");
   };

   if (!items.length) return null;

   const filteredItems = activeTab === "all"
      ? items
      : items.filter(item => item.category === activeTab);

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const getImageUrl = (img: any) => {
      const raw = img?.url || img?.data?.attributes?.url;
      return getStrapiMedia(raw);
   };

   return (
      <>
         <section className="container mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20 bg-white">

            {/* 1. HEADER & 2. TABS (Tidak berubah) */}
            <div className="text-center max-w-3xl mx-auto mb-12">
               {data.title && (
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                     {data.title}
                  </h2>
               )}
               {data.subtitle && (
                  <p className="text-gray-600 text-lg">{data.subtitle}</p>
               )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-12">
               {[
                  { id: "all", label: "Semua" },
                  { id: "journal", label: "Jurnal Ilmiah" },
                  { id: "book", label: "Buku Teks" },
                  { id: "patent", label: "HKI & Paten" },
                  { id: "proceeding", label: "Prosiding" },
               ].map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                ${activeTab === tab.id
                           ? "bg-green-600 text-white shadow-md transform scale-105"
                           : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }
              `}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>

            {/* 3. GRID CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredItems.map((item, index) => {
                  const imgUrl = getImageUrl(item.image);

                  // --- A. JURNAL CARD (Tidak berubah) ---
                  if (item.category === "journal") {
                     return (
                        <div key={index} className="col-span-1 md:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row gap-6 group">
                           <div
                              className={`w-full md:w-40 h-56 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 shadow-inner group/img ${imgUrl ? 'cursor-pointer' : ''}`}
                              onClick={() => imgUrl && openLightbox(imgUrl, item.title)}
                           >
                              {imgUrl ? (
                                 <>
                                    <Image src={imgUrl} alt={item.title} fill className="object-cover group-hover/img:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                                    </div>
                                 </>
                              ) : (
                                 <div className="flex items-center justify-center h-full text-gray-300 font-bold">JURNAL</div>
                              )}
                           </div>
                           <div className="flex-1 flex flex-col">
                              <div className="flex items-center gap-2 mb-2">
                                 <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded uppercase">Jurnal</span>
                                 <span className="text-xs text-gray-500">{item.year}</span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{item.title}</h3>
                              <p className="text-sm font-semibold text-gray-700 mb-3">{item.subtitle}</p>
                              <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-grow text-justify">
                                 {item.description}
                              </p>
                              {item.url && (
                                 <a href={item.url} target="_blank" rel="noreferrer" className="self-start inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-800 transition-colors">
                                    Kunjungi Website Jurnal →
                                 </a>
                              )}
                           </div>
                        </div>
                     );
                  }

                  // --- B. BUKU CARD (Tidak berubah) ---
                  if (item.category === "book") {
                     return (
                        <div key={index} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group h-full flex flex-col">
                           <div
                              className={`relative w-full aspect-[3/4] bg-gray-100 overflow-hidden group/img ${imgUrl ? 'cursor-pointer' : ''}`}
                              onClick={() => imgUrl && openLightbox(imgUrl, item.title)}
                           >
                              {imgUrl ? (
                                 <>
                                    <Image src={imgUrl} alt={item.title} fill className="object-cover group-hover/img:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                                       <div className="bg-black/50 p-2 rounded-full opacity-0 group-hover/img:opacity-100 transition-all transform translate-y-4 group-hover/img:translate-y-0">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
                                       </div>
                                    </div>
                                 </>
                              ) : (
                                 <div className="flex items-center justify-center h-full text-4xl">📚</div>
                              )}
                              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-gray-800 text-xs font-bold px-2 py-1 rounded shadow pointer-events-none">
                                 {item.year}
                              </div>
                           </div>
                           <div className="p-5 flex-grow flex flex-col">
                              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{item.title}</h3>
                              <div className="mt-auto space-y-1 text-sm text-gray-600">
                                 <p><span className="font-semibold text-gray-900">Penulis:</span> {item.subtitle}</p>
                                 <p><span className="font-semibold text-gray-900">Penerbit:</span> {item.extra_info}</p>
                              </div>
                           </div>
                        </div>
                     );
                  }

                  // --- C. PATEN CARD (✅ PERUBAHAN DI SINI) ---
                  if (item.category === "patent") {
                     return (
                        <div key={index} className="bg-white border-2 border-orange-50 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all relative overflow-hidden h-full">
                           {/* Watermark Icon */}
                           <div className="absolute -right-4 -bottom-4 text-orange-50 opacity-50 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                           </div>

                           <div className="flex items-start gap-4 mb-4">
                              {/* Sertifikat Paten (Clickable) - UKURAN DIPERBESAR */}
                              <div
                                 // ✅ UBAH w-16 h-16 MENJADI w-24 h-24
                                 className={`w-24 h-24 relative rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-white group/img ${imgUrl ? 'cursor-pointer hover:ring-2 ring-orange-200' : ''}`}
                                 onClick={() => imgUrl && openLightbox(imgUrl, item.title)}
                              >
                                 {imgUrl ? (
                                    <Image src={imgUrl} alt="Sertifikat" fill className="object-cover" />
                                 ) : (
                                    <div className="w-full h-full bg-orange-100 flex items-center justify-center text-xl">📜</div>
                                 )}
                              </div>
                              <div>
                                 {item.tag && (
                                    <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider rounded mb-1">
                                       {item.tag}
                                    </span>
                                 )}
                                 <h4 className="text-xs font-mono text-gray-500">{item.subtitle}</h4>
                              </div>
                           </div>

                           <h3 className="text-base font-bold text-gray-900 mb-3 leading-tight relative z-10">
                              {item.title}
                           </h3>

                           <div className="text-xs text-gray-600 relative z-10 border-t border-orange-100 pt-3 mt-auto">
                              <span className="block font-bold text-gray-900 mb-0.5">Pematen:</span>
                              {item.extra_info}
                           </div>
                        </div>
                     )
                  }

                  // --- D. PROSIDING CARD (Tidak berubah) ---
                  return (
                     <div key={index} className="bg-white border-l-4 border-l-purple-500 border border-gray-200 rounded-r-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                        <div className="flex justify-between items-start mb-3">
                           <div className="text-xs font-bold text-purple-600 uppercase tracking-wide">Prosiding</div>
                           <div className="text-xs font-mono text-gray-400">{item.year}</div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                        <div className="mt-auto space-y-2">
                           <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                              {item.subtitle}
                           </div>
                        </div>
                        {item.url && (
                           <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 w-full py-2 text-center text-xs font-bold text-purple-600 border border-purple-200 rounded hover:bg-purple-50 transition-colors">
                              Lihat Artikel
                           </a>
                        )}
                     </div>
                  );
               })}
            </div>
         </section>

         {/* --- LIGHTBOX PORTAL (Tidak berubah) --- */}
         {selectedImage && typeof document !== "undefined" && createPortal(
            <div
               className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
               onClick={closeLightbox}
            >
               <button
                  onClick={closeLightbox}
                  className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 p-2 bg-white/10 rounded-full cursor-pointer"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <line x1="18" y1="6" x2="6" y2="18"></line>
                     <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
               </button>

               <div
                  className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="relative w-full h-full pointer-events-auto">
                     <Image
                        src={selectedImage}
                        alt="Popup Image"
                        fill
                        className="object-contain"
                     />
                  </div>

                  {selectedCaption && (
                     <p className="mt-4 text-white text-lg font-medium text-center bg-black/50 px-6 py-2 rounded-full pointer-events-auto">
                        {selectedCaption}
                     </p>
                  )}
               </div>
            </div>,
            document.body
         )}
      </>
   );
}