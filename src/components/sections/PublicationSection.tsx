// File: src/components/sections/PublicationSection.tsx
"use client";

import React, { useState, useEffect, useTransition, useCallback } from "react";
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { createPortal } from "react-dom";
import { X, BookOpen, ExternalLink, Award, FileText, Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getPublications } from "@/lib/strapi/actions";
import { useTranslations } from "next-intl";

// --- TYPE DEFINITIONS ---
interface StrapiImage {
   url?: string;
   data?: { attributes?: { url: string }; url?: string; };
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

interface PublicationSectionProps {
   initialData: PublicationItem[];
   config?: { title?: string; subtitle?: string; };
   locale: string;
   initialMeta?: { page: number; pageCount: number; };
}

type TranslateFn = (key: string) => string;

// --- SUB-COMPONENTS (Cards) ---

// 1. Journal Card
const JournalCard = React.memo(({ item, imgUrl, onOpen, t }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void, t: TranslateFn }) => (
   <div className="col-span-1 md:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row gap-5 hover:border-green-500 hover:shadow-md transition-all duration-300 group">
      <div className={`w-full md:w-36 h-48 flex-shrink-0 relative rounded-lg bg-gray-100 overflow-hidden border border-gray-100 ${imgUrl ? 'cursor-pointer' : ''}`} onClick={onOpen}>
         {imgUrl ? (
            <Image src={imgUrl} alt={item.title} fill loading="lazy" sizes="(max-width: 768px) 100vw, 150px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
         ) : (
            <div className="flex items-center justify-center h-full text-gray-400 font-bold text-xs flex-col gap-2"><FileText size={24} /><span>{t('noImage')}</span></div>
         )}
      </div>
      <div className="flex-1 flex flex-col min-h-[160px]">
         <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase border border-blue-100 tracking-wide">{t('journalBadge')}</span>
            <span className="text-xs text-gray-500 font-mono">{item.year}</span>
         </div>
         <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">{item.title}</h3>
         <p className="text-xs font-semibold text-gray-600 mb-3">{item.subtitle}</p>
         <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow text-justify leading-relaxed">{item.description}</p>
         {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="mt-auto inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#005320] text-white text-xs font-bold rounded-lg hover:bg-green-800 transition-colors shadow-sm w-full md:w-fit">
               <span>{t('openJournal')}</span><ExternalLink size={12} />
            </a>
         )}
      </div>
   </div>
));
JournalCard.displayName = "JournalCard";

// 2. Book Card
const BookCard = React.memo(({ item, imgUrl, onOpen, t }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void, t: TranslateFn }) => (
   <div className="bg-white border border-gray-200 rounded-xl overflow-hidden h-full flex flex-col hover:border-green-500 hover:shadow-md transition-all duration-300 group">
      <div className={`relative w-full aspect-[3/4] bg-gray-100 overflow-hidden ${imgUrl ? 'cursor-pointer' : ''}`} onClick={onOpen}>
         {imgUrl ? (
            <Image src={imgUrl} alt={item.title} fill loading="lazy" sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
         ) : (
            <div className="flex items-center justify-center h-full text-gray-300"><BookOpen size={48} /></div>
         )}
         <div className="absolute top-0 right-0 bg-white/95 text-gray-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm border-b border-l border-gray-100">{item.year}</div>
      </div>
      <div className="p-4 flex-grow flex flex-col bg-white">
         <h3 className="text-sm font-bold text-gray-900 mb-3 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">{item.title}</h3>
         <div className="mt-auto space-y-1 text-xs text-gray-500"><p><span className="font-semibold text-gray-700">{t('author')}:</span> {item.subtitle}</p><p><span className="font-semibold text-gray-700">{t('publisher')}:</span> {item.extra_info}</p></div>
      </div>
   </div>
));
BookCard.displayName = "BookCard";

// 3. Patent Card
const PatentCard = React.memo(({ item, imgUrl, onOpen, t }: { item: PublicationItem, imgUrl: string | null, onOpen: () => void, t: TranslateFn }) => (
   <div className="bg-white border border-orange-200 rounded-xl p-4 h-full flex flex-col relative overflow-hidden hover:border-orange-400 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start gap-3 mb-3">
         <div className={`w-14 h-14 relative rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 bg-white ${imgUrl ? 'cursor-pointer' : ''}`} onClick={onOpen}>
            {imgUrl ? (<Image src={imgUrl} alt="Sertifikat" fill loading="lazy" sizes="64px" className="object-cover" />) : (<div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-300"><Award size={24} /></div>)}
         </div>
         <div>{item.tag && (<span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-700 text-[9px] font-bold uppercase rounded mb-1 border border-orange-100">{item.tag}</span>)}<h4 className="text-[10px] font-mono text-gray-400 break-all">{item.subtitle}</h4></div>
      </div>
      <h3 className="text-sm font-bold text-gray-900 mb-3 leading-snug relative z-10 line-clamp-3 group-hover:text-orange-700 transition-colors">{item.title}</h3>
      <div className="text-xs text-gray-500 relative z-10 border-t border-orange-50 pt-3 mt-auto"><span className="block font-bold text-gray-700 mb-0.5">{t('patentOwner')}:</span>{item.extra_info}</div>
   </div>
));
PatentCard.displayName = "PatentCard";

// 4. Proceeding Card
const ProceedingCard = React.memo(({ item, t }: { item: PublicationItem, t: TranslateFn }) => (
   <div className="bg-white border-l-4 border-l-purple-500 border border-gray-200 rounded-r-xl p-4 flex flex-col h-full hover:bg-gray-50 hover:shadow-sm transition-all duration-300 group">
      <div className="flex justify-between items-start mb-2"><div className="text-[10px] font-bold text-purple-600 uppercase tracking-wide bg-purple-50 px-2 py-0.5 rounded">{t('proceedingBadge')}</div><div className="text-[10px] font-mono text-gray-400">{item.year}</div></div>
      <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-purple-700 transition-colors">{item.title}</h3>
      <div className="mt-auto flex items-start gap-2 text-xs text-gray-500"><span className="line-clamp-2">📍 {item.subtitle}</span></div>
      <a href={item.url || "#"} target={item.url ? "_blank" : "_self"} rel="noreferrer" className={`mt-3 w-full py-1.5 text-center text-xs font-bold border rounded transition-all flex items-center justify-center gap-2 ${item.url ? "text-purple-600 border-purple-200 hover:bg-purple-600 hover:text-white cursor-pointer" : "text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed"}`} onClick={(e) => !item.url && e.preventDefault()}>
         {item.url ? t('viewArticle') : t('linkNotAvailable')}
      </a>
   </div>
));
ProceedingCard.displayName = "ProceedingCard";


// --- MAIN COMPONENT ---
export default function PublicationSection({ initialData, config = { title: "", subtitle: "" }, locale, initialMeta }: PublicationSectionProps) {
   const [items, setItems] = useState<PublicationItem[]>(initialData || []);
   const [activeTab, setActiveTab] = useState<string>("all");
   const [page, setPage] = useState(initialMeta?.page || 1);
   const [hasMore, setHasMore] = useState((initialMeta?.page || 1) < (initialMeta?.pageCount || 1));
   const [isPending, startTransition] = useTransition(); 
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   const [selectedCaption, setSelectedCaption] = useState<string>("");
   const { ref, inView } = useInView({ threshold: 0, rootMargin: "200px" });

   // HOOK TRANSLATIONS
   const t = useTranslations("Publication"); 
   const tLabels = useTranslations("Publication.labels");

   const handleLoadMore = useCallback(() => {
      const nextPage = page + 1;
      startTransition(async () => {
         const res = await getPublications(nextPage, activeTab, locale);
         if (res?.data && res.data.length > 0) { 
            setItems((prev) => [...prev, ...res.data]); 
            setPage(nextPage); 
            if (res.meta?.pagination) setHasMore(nextPage < res.meta.pagination.pageCount); 
         } else { 
            setHasMore(false); 
         }
      });
   }, [page, activeTab, locale]);

   useEffect(() => { 
      if (inView && hasMore && !isPending) {
         handleLoadMore();
      } 
   }, [inView, hasMore, isPending, handleLoadMore]); 

   const handleTabChange = (tabId: string) => {
      if (tabId === activeTab || isPending) return;
      setActiveTab(tabId);
      startTransition(async () => {
         const res = await getPublications(1, tabId, locale);
         if (res?.data) { setItems(res.data); setPage(1); if (res.meta?.pagination) setHasMore(1 < res.meta.pagination.pageCount); } else { setItems([]); setHasMore(false); }
      });
   };

   const openLightbox = (imgUrl: string | null, caption: string) => { if (!imgUrl) return; setSelectedImage(imgUrl); setSelectedCaption(caption); };
   const closeLightbox = () => { setSelectedImage(null); setSelectedCaption(""); };
   const getImageUrl = (img: StrapiImage): string | null => { const raw = img?.url || img?.data?.attributes?.url || img?.data?.url; return getStrapiMedia(raw); };

   return (
      <>
         <section className="container mx-auto px-4 md:px-8 lg:px-12 pt-0 pb-16 md:pb-24 bg-white">
            {config?.title && (
               <div className="text-center max-w-3xl mx-auto mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#005320] mb-3">{config.title}</h2>
                  {config?.subtitle && (<p className="text-gray-500 text-sm md:text-base leading-relaxed">{config.subtitle}</p>)}
               </div>
            )}

            <div className="flex flex-wrap justify-center gap-2 mb-10">
               {[
                  { id: "all", label: t("tabs.all") }, 
                  { id: "journal", label: t("tabs.journal") }, 
                  { id: "book", label: t("tabs.book") }, 
                  { id: "patent", label: t("tabs.patent") }, 
                  { id: "proceeding", label: t("tabs.proceeding") }
               ].map((tab) => (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)} disabled={isPending}
                     className={`px-5 py-2 rounded-full text-xs font-bold border transition-all duration-300 ${activeTab === tab.id ? "bg-[#005320] text-white border-[#005320] shadow-md transform scale-105" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"} ${isPending ? "opacity-70 cursor-wait" : ""}`}>
                     {tab.label}
                  </button>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-visibility-auto min-h-[300px]">
               {isPending && items.length === 0 ? (
                  <div className="col-span-full flex justify-center items-center py-20"><Loader2 className="animate-spin text-[#005320]" size={40} /></div>
               ) : (
                  items.map((item, index) => {
                     const imgUrl = getImageUrl(item.image);
                     return (
                        <React.Fragment key={`${item.id}-${index}`}>
                           {item.category === "journal" && (<JournalCard item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} t={tLabels} />)}
                           {item.category === "book" && (<BookCard item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} t={tLabels} />)}
                           {item.category === "patent" && (<PatentCard item={item} imgUrl={imgUrl} onOpen={() => openLightbox(imgUrl, item.title)} t={tLabels} />)}
                           {item.category === "proceeding" && (<ProceedingCard item={item} t={tLabels} />)}
                        </React.Fragment>
                     );
                  })
               )}
            </div>
            
            {items.length === 0 && !isPending && (<div className="text-center py-12 text-gray-400 col-span-full"><p>{t("states.empty")}</p></div>)}
            {hasMore && (<div ref={ref} className="mt-12 flex justify-center items-center w-full min-h-[50px]">{isPending ? (<div className="flex items-center gap-2 text-gray-500 text-sm font-medium"><Loader2 className="animate-spin text-[#005320]" size={20} />{t("states.loading")}</div>) : (<div className="h-4 w-full opacity-0">Trigger</div>)}</div>)}
         </section>
         
         {selectedImage && typeof document !== "undefined" && createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={closeLightbox}>
               <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/70 hover:text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X size={32} /></button>
               <div className="relative w-full max-w-5xl h-[85vh] flex flex-col items-center justify-center pointer-events-none" onClick={(e) => e.stopPropagation()}>
                  <div className="relative w-full h-full pointer-events-auto"><Image src={selectedImage} alt="Popup" fill className="object-contain" sizes="100vw" priority quality={100} /></div>
                  {selectedCaption && (<p className="mt-4 text-white text-base font-medium text-center bg-black/50 px-6 py-2 rounded-full backdrop-blur-md pointer-events-auto">{selectedCaption}</p>)}
               </div>
            </div>, document.body
         )}
      </>
   );
}