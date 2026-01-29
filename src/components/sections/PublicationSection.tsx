// File: src/components/sections/PublicationSection.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { createPortal } from "react-dom";
import { X, BookOpen, ExternalLink, Award, FileText } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface StrapiImage {
   url?: string;
   data?: {
      attributes?: { url: string };
      url?: string;
   };
}

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
   image: StrapiImage;
}

interface PublicationSectionData {
   title?: string;
   subtitle?: string;
   items: PublicationItem[];
}

interface PublicationSectionProps {
   data: PublicationSectionData;
}

// --- SUB-COMPONENTS (Cards) ---

// 1. JURNAL CARD
const JournalCard = React.memo(({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="col-span-1 md:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row gap-5 hover:border-green-500 hover:shadow-md transition-all duration-300 group">
      <div
         className={`w-full md:w-36 h-48 flex-shrink-0 relative rounded-lg bg-gray-100 overflow-hidden border border-gray-100 ${imgUrl ? 'cursor-pointer' : ''}`}
         onClick={onOpen}
      >
         {imgUrl ? (
            <Image
               src={imgUrl} alt={item.title} fill
               loading="lazy" sizes="(max-width: 768px) 100vw, 150px"
               className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
         ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xs flex-col gap-2">
               <FileText size={24} />
               <span>NO IMAGE</span>
            </div>
         )}
      </div>
      <div className="flex-1 flex flex-col min-h-[160px]">
         <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase border border-blue-100 tracking-wide">
               Jurnal
            </span>
            <span className="text-xs text-gray-500 font-mono">{item.year}</span>
         </div>
         <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
            {item.title}
         </h3>
         <p className="text-xs font-semibold text-gray-600 mb-3">{item.subtitle}</p>
         <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow text-justify leading-relaxed">
            {item.description}
         </p>

         {item.url && (
            <a
               href={item.url} target="_blank" rel="noreferrer"
               className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#005320] text-white text-xs font-bold rounded-lg hover:bg-green-800 transition-colors shadow-sm w-full md:w-fit"
            >
               <span>Buka Jurnal</span>
               <ExternalLink size={12} />
            </a>
         )}
      </div>
   </div>
));
JournalCard.displayName = "JournalCard";

// 2. BOOK CARD
const BookCard = React.memo(({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-full flex flex-col hover:border-green-500 hover:shadow-md transition-all duration-300 group">
      <div
         className={`relative w-full aspect-[3/4] bg-gray-100 overflow-hidden ${imgUrl ? 'cursor-pointer' : ''}`}
         onClick={onOpen}
      >
         {imgUrl ? (
            <Image
               src={imgUrl} alt={item.title} fill
               loading="lazy" sizes="(max-width: 768px) 50vw, 20vw"
               className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
         ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
               <BookOpen size={48} />
            </div>
         )}
         <div className="absolute top-0 right-0 bg-white/95 text-gray-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm border-b border-l border-gray-100">
            {item.year}
         </div>
      </div>
      <div className="p-4 flex-grow flex flex-col bg-white">
         <h3 className="text-sm font-bold text-gray-900 mb-3 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
            {item.title}
         </h3>
         <div className="mt-auto space-y-1 text-xs text-gray-500">
            <p><span className="font-semibold text-gray-700">Penulis:</span> {item.subtitle}</p>
            <p><span className="font-semibold text-gray-700">Penerbit:</span> {item.extra_info}</p>
         </div>
      </div>
   </div>
));
BookCard.displayName = "BookCard";

// 3. PATENT CARD
const PatentCard = React.memo(({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="bg-white border border-orange-200 rounded-xl p-4 h-full flex flex-col relative overflow-hidden hover:border-orange-400 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start gap-3 mb-3">
         <div
            className={`w-14 h-14 relative rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-white ${imgUrl ? 'cursor-pointer' : ''}`}
            onClick={onOpen}
         >
            {imgUrl ? (
               <Image
                  src={imgUrl} alt="Sertifikat" fill
                  loading="lazy" sizes="64px"
                  className="object-cover"
               />
            ) : (
               <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-300">
                  <Award size={24} />
               </div>
            )}
         </div>
         <div>
            {item.tag && (
               <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-700 text-[9px] font-bold uppercase rounded mb-1 border border-orange-100">
                  {item.tag}
               </span>
            )}
            <h4 className="text-[10px] font-mono text-gray-400 break-all">{item.subtitle}</h4>
         </div>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-3 leading-snug relative z-10 line-clamp-3 group-hover:text-orange-700 transition-colors">
         {item.title}
      </h3>
      <div className="text-xs text-gray-500 relative z-10 border-t border-orange-50 pt-3 mt-auto">
         <span className="block font-bold text-gray-700 mb-0.5">Pematen:</span>
         {item.extra_info}
      </div>
   </div>
));
PatentCard.displayName = "PatentCard";

// 4. PROCEEDING CARD
const ProceedingCard = React.memo(({ item }: { item: PublicationItem }) => (
   <div className="bg-white border-l-4 border-l-purple-500 border border-gray-200 rounded-r-xl p-4 flex flex-col h-full hover:bg-gray-50 hover:shadow-sm transition-all duration-300 group">
      <div className="flex justify-between items-start mb-2">
         <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wide bg-purple-50 px-2 py-0.5 rounded">
            Prosiding
         </div>
         <div className="text-[10px] font-mono text-gray-400">{item.year}</div>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">
         {item.title}
      </h3>
      <div className="mt-auto flex items-start gap-2 text-xs text-gray-500">
         <span className="line-clamp-2">📍 {item.subtitle}</span>
      </div>
      {item.url && (
         <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 w-full py-1.5 text-center text-xs font-bold text-purple-600 border border-purple-200 rounded hover:bg-purple-600 hover:text-white transition-all">
            Lihat Artikel
         </a>
      )}
   </div>
));
ProceedingCard.displayName = "ProceedingCard";


// --- MAIN COMPONENT ---

export default function PublicationSection({ data }: PublicationSectionProps) {
   const items = useMemo(() => data.items || [], [data.items]);

   const [activeTab, setActiveTab] = useState<string>("all");
   const [visibleCount, setVisibleCount] = useState(8);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const [selectedCaption, setSelectedCaption] = useState<string>("");

   const handleTabChange = (tabId: string) => {
      setActiveTab(tabId);
      setVisibleCount(8);
   };

   // Jika ada gambar (modal buka) -> Lock scroll.
   // Jika null (modal tutup) -> Unlock scroll.
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

   const getImageUrl = (img: StrapiImage): string | null => {
      const raw = img?.url || img?.data?.attributes?.url || img?.data?.url;
      return getStrapiMedia(raw);
   };

   if (!items.length) return null;

   return (
      <>
         <section className="container mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 bg-white">

            {/* HEADER */}
            <div className="text-center max-w-3xl mx-auto mb-10">
               {data.title && (
                  <h2 className="text-2xl md:text-3xl font-bold text-[#005320] mb-3">
                     {data.title}
                  </h2>
               )}
               {data.subtitle && (
                  <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                     {data.subtitle}
                  </p>
               )}
            </div>

            {/* TABS */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
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
                     className={`
                px-5 py-2 rounded-full text-xs font-bold border transition-all duration-300
                ${activeTab === tab.id
                           ? "bg-[#005320] text-white border-[#005320] shadow-md transform scale-105"
                           : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }
              `}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>

            {/* GRID CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-visibility-auto">
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
               <div className="mt-12 text-center">
                  <button
                     onClick={() => setVisibleCount((prev) => prev + 8)}
                     className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-600 text-sm font-bold rounded-full hover:border-[#005320] hover:text-[#005320] transition-all shadow-sm hover:shadow-md"
                  >
                     Muat Lebih Banyak
                  </button>
               </div>
            )}

         </section>

         {/* LIGHTBOX PORTAL */}
         {selectedImage && typeof document !== "undefined" && createPortal(
            <div
               className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300"
               onClick={closeLightbox}
            >
               <button
                  onClick={closeLightbox}
                  className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
               >
                  <X size={32} />
               </button>

               <div
                  className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="relative w-full h-full pointer-events-auto">
                     <Image
                        src={selectedImage}
                        alt="Popup"
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority
                        quality={100}
                     />
                  </div>
                  {selectedCaption && (
                     <p className="mt-4 text-white text-base font-medium text-center bg-black/50 px-6 py-2 rounded-full backdrop-blur-md pointer-events-auto">
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