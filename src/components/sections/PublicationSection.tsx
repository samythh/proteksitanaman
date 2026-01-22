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

// --- SUB-COMPONENTS (Static & Ringan) ---

const JournalCard = ({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="col-span-1 md:col-span-2 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-5">
      <div
         className={`w-full md:w-36 h-48 flex-shrink-0 relative rounded bg-gray-50 overflow-hidden ${imgUrl ? 'cursor-pointer' : ''}`}
         onClick={onOpen}
      >
         {imgUrl ? (
            <Image
               src={imgUrl} alt={item.title} fill
               sizes="(max-width: 768px) 100vw, 200px"
               className="object-cover hover:scale-105 transition-transform duration-500"
            />
         ) : (
            <div className="flex items-center justify-center h-full text-gray-300 font-bold text-xs">NO COVER</div>
         )}
      </div>
      <div className="flex-1 flex flex-col">
         <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase">Jurnal</span>
            <span className="text-xs text-gray-500">{item.year}</span>
         </div>
         <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug">{item.title}</h3>
         <p className="text-xs font-semibold text-gray-700 mb-2">{item.subtitle}</p>
         <p className="text-sm text-gray-600 line-clamp-3 mb-3 flex-grow text-justify leading-relaxed">
            {item.description}
         </p>
         {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="self-start text-xs font-bold text-green-600 hover:text-green-800">
               Buka Jurnal →
            </a>
         )}
      </div>
   </div>
);

const BookCard = ({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <div
         className={`relative w-full aspect-[3/4] bg-gray-50 overflow-hidden ${imgUrl ? 'cursor-pointer' : ''}`}
         onClick={onOpen}
      >
         {imgUrl ? (
            <Image
               src={imgUrl} alt={item.title} fill
               sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
               className="object-cover hover:scale-105 transition-transform duration-500"
            />
         ) : (
            <div className="flex items-center justify-center h-full text-2xl">📚</div>
         )}
         <div className="absolute top-2 right-2 bg-white/90 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none">
            {item.year}
         </div>
      </div>
      <div className="p-4 flex-grow flex flex-col">
         <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{item.title}</h3>
         <div className="mt-auto space-y-0.5 text-xs text-gray-600">
            <p><span className="font-semibold text-gray-900">Penulis:</span> {item.subtitle}</p>
            <p><span className="font-semibold text-gray-900">Penerbit:</span> {item.extra_info}</p>
         </div>
      </div>
   </div>
);

const PatentCard = ({ item, imgUrl, onOpen }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void }) => (
   <div className="bg-white border border-orange-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col relative overflow-hidden">
      <div className="flex items-start gap-3 mb-3">
         <div
            className={`w-20 h-20 relative rounded border border-gray-200 overflow-hidden flex-shrink-0 bg-white ${imgUrl ? 'cursor-pointer' : ''}`}
            onClick={onOpen}
         >
            {imgUrl ? (
               <Image
                  src={imgUrl} alt="Sertifikat" fill
                  sizes="100px"
                  className="object-cover hover:opacity-80 transition-opacity"
               />
            ) : (
               <div className="w-full h-full bg-orange-50 flex items-center justify-center text-lg">📜</div>
            )}
         </div>
         <div>
            {item.tag && (
               <span className="inline-block px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-bold uppercase rounded mb-1">
                  {item.tag}
               </span>
            )}
            <h4 className="text-[10px] font-mono text-gray-500">{item.subtitle}</h4>
         </div>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug relative z-10">
         {item.title}
      </h3>
      <div className="text-[10px] text-gray-600 relative z-10 border-t border-orange-50 pt-2 mt-auto">
         <span className="block font-bold text-gray-900">Pematen:</span>
         {item.extra_info}
      </div>
   </div>
);

const ProceedingCard = ({ item }: { item: PublicationItem }) => (
   <div className="bg-white border-l-4 border-l-purple-500 border border-gray-200 rounded-r-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
         <div className="text-[10px] font-bold text-purple-600 uppercase">Prosiding</div>
         <div className="text-[10px] font-mono text-gray-400">{item.year}</div>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-3">{item.title}</h3>
      <div className="mt-auto flex items-center gap-2 text-xs text-gray-600">
         <span>📍 {item.subtitle}</span>
      </div>
      {item.url && (
         <a href={item.url} target="_blank" rel="noreferrer" className="mt-3 w-full py-1.5 text-center text-xs font-bold text-purple-600 border border-purple-200 rounded hover:bg-purple-50 transition-colors">
            Lihat Artikel
         </a>
      )}
   </div>
);

// --- MAIN COMPONENT ---

export default function PublicationSection({ data }: PublicationSectionProps) {
   // ✅ FIX ESLINT: Bungkus inisialisasi items dengan useMemo
   // Ini memastikan variabel 'items' memiliki referensi memori yang stabil (tidak berubah-ubah tiap render)
   // sehingga useMemo di bawah (filteredItems) bekerja dengan benar.
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

   // Memoize Filter
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
            <div className="text-center max-w-3xl mx-auto mb-10">
               {data.title && <h2 className="text-3xl font-bold text-gray-900 mb-3">{data.title}</h2>}
               {data.subtitle && <p className="text-gray-600 text-base">{data.subtitle}</p>}
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
                     className={`px-4 py-2 rounded-full text-xs font-bold transition-colors
                ${activeTab === tab.id
                           ? "bg-green-600 text-white shadow-sm"
                           : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }
              `}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>

            {/* GRID CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
               {visibleItems.map((item, index) => {
                  const imgUrl = getImageUrl(item.image);

                  if (item.category === "journal") {
                     return <JournalCard key={index} item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} />;
                  }
                  if (item.category === "book") {
                     return <BookCard key={index} item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} />;
                  }
                  if (item.category === "patent") {
                     return <PatentCard key={index} item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} />;
                  }
                  return <ProceedingCard key={index} item={item} />;
               })}
            </div>

            {/* LOAD MORE BUTTON */}
            {hasMore && (
               <div className="mt-12 text-center">
                  <button
                     onClick={() => setVisibleCount((prev) => prev + 8)}
                     className="px-6 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-full hover:bg-gray-50 hover:border-green-500 hover:text-green-600 transition-all shadow-sm"
                  >
                     Muat Lebih Banyak ({filteredItems.length - visibleCount} lagi)
                  </button>
               </div>
            )}

         </section>

         {/* LIGHTBOX PORTAL */}
         {selectedImage && typeof document !== "undefined" && createPortal(
            <div
               className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200"
               onClick={closeLightbox}
            >
               <button
                  onClick={closeLightbox}
                  className="absolute top-4 right-4 text-white/70 hover:text-white p-2 bg-white/10 rounded-full"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
               <div
                  className="relative w-full max-w-4xl h-[80vh] flex flex-col items-center justify-center pointer-events-none"
                  onClick={(e) => e.stopPropagation()}
               >
                  <div className="relative w-full h-full pointer-events-auto">
                     <Image src={selectedImage} alt="Popup" fill className="object-contain" sizes="100vw" />
                  </div>
                  {selectedCaption && (
                     <p className="mt-4 text-white text-sm font-medium text-center bg-black/50 px-4 py-1.5 rounded-full pointer-events-auto">
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