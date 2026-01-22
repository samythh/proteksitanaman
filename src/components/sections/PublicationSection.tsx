// File: src/components/sections/PublicationSection.tsx

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- TYPE DEFINITIONS ---
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

// --- OPTIMIZED SUB-COMPONENTS ---

// 1. JURNAL CARD (Updated: Dengan Tombol Hijau Solid)
const JournalCard = React.memo(({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="col-span-1 md:col-span-2 bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 hover:border-green-500 transition-colors duration-200">
      <div
         className={`w-full md:w-32 h-44 flex-shrink-0 relative rounded bg-gray-100 overflow-hidden ${imgUrl ? 'cursor-pointer' : ''}`}
         onClick={onOpen}
      >
         {imgUrl ? (
            <Image
               src={imgUrl} alt={item.title} fill
               loading="lazy"
               sizes="(max-width: 768px) 100vw, 150px"
               className="object-cover"
            />
         ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-bold text-[10px]">NO IMAGE</div>
         )}
      </div>
      <div className="flex-1 flex flex-col min-h-[160px]">
         <div className="flex items-center gap-2 mb-1">
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-bold rounded uppercase border border-blue-100">Jurnal</span>
            <span className="text-[10px] text-gray-500 font-mono">{item.year}</span>
         </div>
         <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight line-clamp-2">{item.title}</h3>
         <p className="text-[10px] font-semibold text-gray-600 mb-2">{item.subtitle}</p>
         <p className="text-xs text-gray-500 line-clamp-3 mb-3 flex-grow text-justify leading-relaxed">
            {item.description}
         </p>

         {/* TOMBOL BUKA JURNAL */}
         {item.url && (
            <a
               href={item.url}
               target="_blank"
               rel="noreferrer"
               className="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 w-full md:w-fit shadow-sm"
            >
               <span>Buka Jurnal</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
               </svg>
            </a>
         )}
      </div>
   </div>
));
JournalCard.displayName = "JournalCard";

// 2. BOOK CARD (Optimized: No Blur)
const BookCard = React.memo(({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-full flex flex-col hover:border-green-500 transition-colors duration-200">
      <div
         className={`relative w-full aspect-[3/4] bg-gray-100 overflow-hidden ${imgUrl ? 'cursor-pointer' : ''}`}
         onClick={onOpen}
      >
         {imgUrl ? (
            <Image
               src={imgUrl} alt={item.title} fill
               loading="lazy"
               sizes="(max-width: 768px) 50vw, 20vw"
               className="object-cover"
            />
         ) : (
            <div className="flex items-center justify-center h-full text-2xl opacity-30">📚</div>
         )}
         <div className="absolute top-0 right-0 bg-white/90 text-gray-900 text-[9px] font-bold px-2 py-1 rounded-bl shadow-sm">
            {item.year}
         </div>
      </div>
      <div className="p-3 flex-grow flex flex-col">
         <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{item.title}</h3>
         <div className="mt-auto space-y-0.5 text-[10px] text-gray-500">
            <p><span className="font-semibold text-gray-700">Penulis:</span> {item.subtitle}</p>
            <p><span className="font-semibold text-gray-700">Penerbit:</span> {item.extra_info}</p>
         </div>
      </div>
   </div>
));
BookCard.displayName = "BookCard";

// 3. PATENT CARD (Optimized: No Heavy Shadow)
const PatentCard = React.memo(({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="bg-white border border-orange-200 rounded-lg p-3 h-full flex flex-col relative overflow-hidden hover:border-orange-400 transition-colors duration-200">
      <div className="flex items-start gap-3 mb-2">
         <div
            className={`w-16 h-16 relative rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-white ${imgUrl ? 'cursor-pointer' : ''}`}
            onClick={onOpen}
         >
            {imgUrl ? (
               <Image
                  src={imgUrl} alt="Sertifikat" fill
                  loading="lazy"
                  sizes="64px"
                  className="object-cover"
               />
            ) : (
               <div className="w-full h-full bg-orange-50 flex items-center justify-center text-sm opacity-50">📜</div>
            )}
         </div>
         <div>
            {item.tag && (
               <span className="inline-block px-1.5 py-0.5 bg-orange-50 text-orange-700 text-[9px] font-bold uppercase rounded mb-1 border border-orange-100">
                  {item.tag}
               </span>
            )}
            <h4 className="text-[9px] font-mono text-gray-400 break-all">{item.subtitle}</h4>
         </div>
      </div>
      <h3 className="text-xs font-bold text-gray-900 mb-2 leading-snug relative z-10 line-clamp-3">
         {item.title}
      </h3>
      <div className="text-[9px] text-gray-500 relative z-10 border-t border-orange-50 pt-2 mt-auto">
         <span className="block font-bold text-gray-700">Pematen:</span>
         {item.extra_info}
      </div>
   </div>
));
PatentCard.displayName = "PatentCard";

// 4. PROCEEDING CARD
const ProceedingCard = React.memo(({ item }: { item: PublicationItem }) => (
   <div className="bg-white border-l-4 border-l-purple-500 border border-gray-200 rounded-r-lg p-3 flex flex-col h-full hover:bg-gray-50 transition-colors duration-200">
      <div className="flex justify-between items-start mb-1">
         <div className="text-[9px] font-bold text-purple-600 uppercase">Prosiding</div>
         <div className="text-[9px] font-mono text-gray-400">{item.year}</div>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
      <div className="mt-auto flex items-center gap-2 text-[10px] text-gray-500">
         <span>📍 {item.subtitle}</span>
      </div>
      {item.url && (
         <a href={item.url} target="_blank" rel="noreferrer" className="mt-2 w-full py-1 text-center text-[10px] font-bold text-purple-600 border border-purple-200 rounded hover:bg-purple-50 transition-colors">
            Lihat Artikel
         </a>
      )}
   </div>
));
ProceedingCard.displayName = "ProceedingCard";


// --- MAIN COMPONENT ---

export default function PublicationSection({ data }: PublicationSectionProps) {
   // Memoize Items agar tidak dihitung ulang tiap render (Fix ESLint Dependency)
   const items = useMemo(() => data.items || [], [data.items]);

   const [activeTab, setActiveTab] = useState<string>("all");
   const [visibleCount, setVisibleCount] = useState(8);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const [selectedCaption, setSelectedCaption] = useState<string>("");

   const handleTabChange = (tabId: string) => {
      setActiveTab(tabId);
      setVisibleCount(8);
   };

   useEffect(() => {
      if (selectedImage) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "auto";
      }
      return () => { document.body.style.overflow = "auto"; };
   }, [selectedImage]);

   const filteredItems = useMemo(() => {
      return activeTab === "all"
         ? items
         : items.filter(item => item.category === activeTab);
   }, [activeTab, items]);

   const visibleItems = filteredItems.slice(0, visibleCount);
   const hasMore = visibleCount < filteredItems.length;

   const openLightbox = (imgUrl: string | null, caption: string) => {
      if (!imgUrl) return;
      setSelectedImage(imgUrl);
      setSelectedCaption(caption);
   };

   const closeLightbox = () => {
      setSelectedImage(null);
      setSelectedCaption("");
   };

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const getImageUrl = (img: any) => {
      const raw = img?.url || img?.data?.attributes?.url;
      return getStrapiMedia(raw);
   };

   if (!items.length) return null;

   return (
      <>
         <section className="container mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20 bg-white">

            {/* HEADER */}
            <div className="text-center max-w-3xl mx-auto mb-8">
               {data.title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{data.title}</h2>}
               {data.subtitle && <p className="text-gray-500 text-sm md:text-base">{data.subtitle}</p>}
            </div>

            {/* TABS */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
               {[
                  { id: "all", label: "Semua" },
                  { id: "journal", label: "Jurnal" },
                  { id: "book", label: "Buku" },
                  { id: "patent", label: "HKI & Paten" },
                  { id: "proceeding", label: "Prosiding" },
               ].map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => handleTabChange(tab.id)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors duration-200
                ${activeTab === tab.id
                           ? "bg-green-600 text-white border-green-600"
                           : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }
              `}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>

            {/* GRID CONTENT (Optimized Rendering) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" style={{ contentVisibility: 'auto' }}>
               {visibleItems.map((item, index) => {
                  const imgUrl = getImageUrl(item.image);

                  return (
                     <React.Fragment key={item.id || index}>
                        {item.category === "journal" && (
                           <JournalCard item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} />
                        )}
                        {item.category === "book" && (
                           <BookCard item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} />
                        )}
                        {item.category === "patent" && (
                           <PatentCard item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} />
                        )}
                        {item.category === "proceeding" && (
                           <ProceedingCard item={item} />
                        )}
                     </React.Fragment>
                  );
               })}
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMore && (
               <div className="mt-10 text-center">
                  <button
                     onClick={() => setVisibleCount((prev) => prev + 8)}
                     className="px-5 py-2.5 bg-white border border-gray-300 text-gray-600 text-xs font-bold rounded-full hover:border-green-500 hover:text-green-600 transition-colors"
                  >
                     Muat Lebih Banyak
                  </button>
               </div>
            )}

         </section>

         {/* LIGHTBOX PORTAL */}
         {selectedImage && typeof document !== "undefined" && createPortal(
            <div
               className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4"
               onClick={closeLightbox}
            >
               <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>

               <div
                  className="relative w-full max-w-4xl h-[80vh] flex flex-col items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="relative w-full h-full">
                     <Image src={selectedImage} alt="Popup" fill className="object-contain" sizes="100vw" priority />
                  </div>
                  {selectedCaption && (
                     <p className="mt-4 text-white text-sm text-center">{selectedCaption}</p>
                  )}
               </div>
            </div>,
            document.body
         )}
      </>
   );
}