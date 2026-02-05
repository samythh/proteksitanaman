"use client";

import { useState, useRef, useCallback, useEffect, useTransition } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Calendar, ChevronRight, Filter, Loader2, ArrowRight } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { useTranslations } from "next-intl";
import { getArticles } from "@/lib/strapi/actions";

// --- 1. KONFIGURASI MAPPING WARNA ---
const COLOR_MAP: Record<string, string> = {
   "Strong-Blue": "#1d4ed8",
   "Soft-Blue": "#60a5fa",
   "Sky-Blue": "#0ea5e9",
   "Pastel-Yellow": "#fcd34d",
   "Pure-Red": "#ef4444",
   "Dark-Red": "#991b1b",
};

const DEFAULT_COLOR = "#005320";

// --- TIPE DATA ---
export interface NewsItem {
   id: number;
   title: string;
   slug: string;
   publishedAt: string;
   excerpt: string;
   cover: {
      url: string;
   };
   category?: {
      name: string;
      color?: string;
   };
}

interface NewsDashboardProps {
   initialData: NewsItem[];
   locale: string;
   isHomePage?: boolean;
   initialMeta?: { pagination: { page: number; pageCount: number } };
}

export default function NewsDashboard({ initialData, locale, isHomePage = false, initialMeta }: NewsDashboardProps) {
   const t = useTranslations("NewsDashboard");

   // --- STATE ---
   const [articles, setArticles] = useState<NewsItem[]>(initialData || []);
   const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
   const [page, setPage] = useState(1);

   // Logic HasMore: Cek apakah page sekarang < total page dari server
   const [hasMore, setHasMore] = useState(
      initialMeta ? initialMeta.pagination.page < initialMeta.pagination.pageCount : true
   );

   const [isPending, startTransition] = useTransition();

   // --- OBSERVER (SCROLL TO LOAD) ---
   const observer = useRef<IntersectionObserver | null>(null);

   const lastArticleRef = useCallback(
      (node: HTMLDivElement) => {
         if (isPending) return;

         if (observer.current) observer.current.disconnect();

         observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
               setPage((prevPage) => prevPage + 1);
            }
         });

         if (node) observer.current.observe(node);
      },
      [isPending, hasMore]
   );

   // --- FETCH DATA ACTION ---
   const loadNewsData = (pageNum: number, sort: "desc" | "asc", append: boolean) => {
      startTransition(async () => {
         const sortParam = sort === 'desc' ? 'newest' : 'oldest';

         // Panggil Server Action
         const res = await getArticles(pageNum, "", sortParam, locale);

         if (res.data) {
            const newArticles = res.data as NewsItem[];

            setArticles((prev) => {
               if (append) {
                  // Logic Append: Filter duplikat ID
                  const uniqueNew = newArticles.filter(
                     (newItem) => !prev.some((existing) => existing.id === newItem.id)
                  );
                  return [...prev, ...uniqueNew];
               } else {
                  // Logic Replace: Ganti total saat sorting berubah
                  return newArticles;
               }
            });

            // Update status hasMore dari meta response terbaru
            if (res.meta?.pagination) {
               const { page: currentPage, pageCount } = res.meta.pagination;
               setHasMore(currentPage < pageCount);
            } else {
               setHasMore(false);
            }
         } else {
            // Jika error atau data kosong
            if (!append) setArticles([]);
            setHasMore(false);
         }
      });
   };

   useEffect(() => {
      if (page > 1) {
         loadNewsData(page, sortOrder, true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [page]);

   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = e.target.value as "desc" | "asc";

      setSortOrder(newSort);
      setPage(1);
      setHasMore(true);

      if (typeof window !== 'undefined') {
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      loadNewsData(1, newSort, false);
   };

   // --- HELPERS ---
   const formatDate = (dateString: string) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
         day: "numeric",
         month: "long",
         year: "numeric",
      });
   };

   const getCategoryStyle = (colorName?: string) => {
      const bg = COLOR_MAP[colorName || ""] || DEFAULT_COLOR;
      const text = colorName === "Pastel-Yellow" ? "text-black" : "text-white";
      return { backgroundColor: bg, className: text };
   };

   // --- SLICING DATA ---
   const mainNews = articles[0];
   const sideNews = articles.slice(1, 5);
   const gridNews = articles.slice(5);

   return (
      <section className="bg-transparent py-8 md:py-12">
         <div className="container mx-auto px-4 md:px-12 lg:px-24">

            {/* HEADER */}
            <div className="flex flex-row justify-between items-center mb-8 gap-4 border-b border-gray-200 pb-4">
               <h2 className="text-2xl md:text-3xl font-bold text-[#005320] border-l-4 border-yellow-400 pl-4">
                  {t('latest_news')}
               </h2>

               {isHomePage ? (
                  <Link
                     href={`/informasi/berita`}
                     className="hidden md:flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 transition-colors bg-green-50 px-4 py-2 rounded-full hover:bg-green-100"
                  >
                     {t('view_all')} <ArrowRight size={16} />
                  </Link>
               ) : (
                  <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                     <Filter size={14} className="text-gray-500" />
                     <select
                        value={sortOrder}
                        onChange={handleSortChange}
                        disabled={isPending}
                        className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer disabled:opacity-50"
                     >
                        <option value="desc">{t('sort_newest')}</option>
                        <option value="asc">{t('sort_oldest')}</option>
                     </select>
                  </div>
               )}
            </div>

            {articles.length === 0 && !isPending ? (
               <div className="text-center py-10 text-gray-500 italic">{t('no_data')}</div>
            ) : (
               <>
                  {/* === LAYOUT UTAMA === */}
                  {mainNews && (
                     <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10 items-stretch">

                        {/* MAIN NEWS */}
                        <Link href={`/informasi/berita/${mainNews.slug}`} className="lg:col-span-3 group/main h-full">
                           <div className="bg-[#749F74] p-4 md:p-5 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col border border-[#749F74]">
                              <div className="relative w-full aspect-video shrink-0 rounded-xl overflow-hidden mb-4">
                                 <Image
                                    src={getStrapiMedia(mainNews.cover.url) || ""}
                                    alt={mainNews.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover/main:scale-105"
                                 />
                                 <span
                                    className={`absolute top-3 left-3 px-3 py-1 rounded text-xs font-bold shadow-md ${getCategoryStyle(mainNews.category?.color).className}`}
                                    style={{ backgroundColor: getCategoryStyle(mainNews.category?.color).backgroundColor }}
                                 >
                                    {mainNews.category?.name || "News"}
                                 </span>
                                 <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 shadow-sm border border-white/10">
                                    <Calendar size={14} />
                                    <span>{formatDate(mainNews.publishedAt)}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col flex-grow">
                                 <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover/main:text-green-100 transition-colors">
                                    {mainNews.title}
                                 </h3>
                                 {mainNews.excerpt && (
                                    <p className="text-white/90 leading-relaxed text-sm md:text-base line-clamp-3">
                                       {mainNews.excerpt}
                                    </p>
                                 )}
                              </div>
                           </div>
                        </Link>

                        {/* SIDE NEWS */}
                        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                           {sideNews.map((item) => (
                              <Link
                                 key={item.id}
                                 href={`/informasi/berita/${item.slug}`}
                                 className="group flex gap-4 bg-white p-3 rounded-xl hover:bg-green-50 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all items-start shadow-sm"
                              >
                                 <div className="relative w-32 h-24 shrink-0 rounded-lg overflow-hidden">
                                    <Image
                                       src={getStrapiMedia(item.cover.url) || ""}
                                       alt={item.title}
                                       fill
                                       className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                 </div>
                                 <div className="flex flex-col w-full h-full justify-between py-0.5">
                                    <h4 className="text-base font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#005320] transition-colors mb-1">
                                       {item.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-auto">
                                       <span
                                          className={`px-2 py-1 rounded text-[10px] font-bold ${getCategoryStyle(item.category?.color).className}`}
                                          style={{ backgroundColor: getCategoryStyle(item.category?.color).backgroundColor }}
                                       >
                                          {item.category?.name || "News"}
                                       </span>
                                       <div className="bg-gray-50 text-gray-600 px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 border border-gray-200">
                                          <Calendar size={10} />
                                          {formatDate(item.publishedAt)}
                                       </div>
                                    </div>
                                 </div>
                              </Link>
                           ))}
                        </div>
                     </div>
                  )}

                  {/* === GRID BERITA BAWAH (SCROLL TARGET) === */}
                  {!isHomePage && gridNews.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {gridNews.map((item, index) => {
                           const isLastItem = gridNews.length === index + 1;

                           return (
                              <div
                                 key={`${item.id}-${index}`}
                                 ref={isLastItem ? lastArticleRef : null} 
                                 className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 h-full shadow-sm"
                              >
                                 <Link href={`/informasi/berita/${item.slug}`} className="flex flex-col h-full">
                                    <div className="relative w-full aspect-video overflow-hidden">
                                       <Image
                                          src={getStrapiMedia(item.cover.url) || ""}
                                          alt={item.title}
                                          fill
                                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                                       />
                                       <span
                                          className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold shadow-sm ${getCategoryStyle(item.category?.color).className}`}
                                          style={{ backgroundColor: getCategoryStyle(item.category?.color).backgroundColor }}
                                       >
                                          {item.category?.name || "News"}
                                       </span>
                                    </div>
                                    <div className="p-4 flex flex-col flex-grow">
                                       <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                                          <Calendar size={12} />
                                          <span>{formatDate(item.publishedAt)}</span>
                                       </div>
                                       <h4 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-[#005320] transition-colors">
                                          {item.title}
                                       </h4>
                                       <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                                          {item.excerpt}
                                       </p>
                                       <span className="text-[#005320] text-sm font-bold flex items-center gap-1 mt-auto">
                                          {t('read_more')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                       </span>
                                    </div>
                                 </Link>
                              </div>
                           );
                        })}
                     </div>
                  )}

                  {/* === LOADING & END STATE === */}
                  <div className="mt-8 flex justify-center w-full">
                     {isHomePage ? (
                        <div className="w-full flex justify-center md:hidden">
                           <Link
                              href={`/informasi/berita`}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm"
                           >
                              {t('view_all')} <ArrowRight size={16} />
                           </Link>
                        </div>
                     ) : (
                        <>
                           {isPending && (
                              <div className="flex items-center gap-2 text-[#005320] font-bold py-4">
                                 <Loader2 size={24} className="animate-spin" />
                                 <span>{t('loading')}...</span>
                              </div>
                           )}

                           {!hasMore && gridNews.length > 0 && (
                              <p className="text-center text-gray-400 text-xs mt-4 italic">
                                 -- {t('end_list')} --
                              </p>
                           )}
                        </>
                     )}
                  </div>
               </>
            )}
         </div>
      </section>
   );
}