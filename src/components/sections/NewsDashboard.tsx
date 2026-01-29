"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Calendar, ChevronRight, Filter, Loader2, ArrowRight } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { useTranslations } from "next-intl"; 
import qs from "qs";

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
}

export default function NewsDashboard({ initialData, locale, isHomePage = false }: NewsDashboardProps) {
   //  Panggil Hook Translation
   const t = useTranslations("NewsDashboard");

   const [articles, setArticles] = useState<NewsItem[]>(initialData || []);
   const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
   const [page, setPage] = useState(1);
   const [loading, setLoading] = useState(false);
   const [hasMore, setHasMore] = useState(true);

   // Helper: Format Tanggal
   const formatDate = (dateString: string) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
         day: "numeric",
         month: "long",
         year: "numeric",
      });
   };

   // Helper: Warna Kategori
   const getCategoryStyle = (colorName?: string) => {
      const bg = COLOR_MAP[colorName || ""] || DEFAULT_COLOR;
      const text = colorName === "Pastel-Yellow" ? "text-black" : "text-white";
      return { backgroundColor: bg, className: text };
   };

   // --- FETCH DATA (Logic Aman & Anti-Duplikat) ---
   const fetchNews = async (pageNum: number, sort: "desc" | "asc", append: boolean) => {
      setLoading(true);
      try {
         const pageSize = 5;
         const query = qs.stringify({
            locale,
            sort: sort === 'desc' ? ['publishedAt:desc'] : ['publishedAt:asc'],
            pagination: { page: pageNum, pageSize },
            populate: {
               cover: { fields: ["url"] },
               category: { fields: ["name", "color"] },
            },
            fields: ["title", "slug", "publishedAt", "excerpt"],
         }, { encodeValuesOnly: true });

         const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/articles?${query}`);

         if (!res.ok) {
            if (res.status === 404) {
               setHasMore(false);
               return;
            }
            throw new Error("Failed to fetch");
         }

         const json = await res.json();
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const rawData = json.data as any[];

         // Normalisasi Data Baru
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const newArticles: NewsItem[] = rawData.map((item: any) => {
            const attr = item.attributes || item;
            const coverData = attr.cover?.data?.attributes || attr.cover || null;
            const coverUrl = coverData?.url || "";
            const catData = attr.category?.data?.attributes || attr.category || null;

            return {
               id: item.id,
               title: attr.title || "",
               slug: attr.slug || "",
               publishedAt: attr.publishedAt,
               excerpt: attr.excerpt || "",
               cover: { url: coverUrl },
               category: catData ? {
                  name: catData.name,
                  color: catData.color
               } : undefined
            };
         });

         if (newArticles.length < pageSize) setHasMore(false);

         setArticles(prev => {
            if (append) {
               // FILTER DUPLIKASI
               const uniqueNewArticles = newArticles.filter(
                  newItem => !prev.some(existingItem => existingItem.id === newItem.id)
               );
               return [...prev, ...uniqueNewArticles];
            } else {
               return newArticles;
            }
         });

      } catch (error) {
         console.error("News Load Error:", error);
         setHasMore(false);
      } finally {
         setLoading(false);
      }
   };

   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSort = e.target.value as "desc" | "asc";
      setSortOrder(newSort);
      setPage(1);
      setHasMore(true);
      fetchNews(1, newSort, false);
   };

   const handleLoadMore = () => {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(nextPage, sortOrder, true);
   };

   // Slicing Data
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
                        className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                     >
                        <option value="desc">{t('sort_newest')}</option>
                        <option value="asc">{t('sort_oldest')}</option>
                     </select>
                  </div>
               )}
            </div>

            {articles.length === 0 && !loading ? (
               <div className="text-center py-10 text-gray-500 italic">{t('no_data')}</div>
            ) : (
               <>
                  {/* DASHBOARD LAYOUT */}
                  {mainNews && (
                     <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10 items-stretch">

                        {/* 1. BERITA UTAMA (BESAR)  */}
                        <Link href={`/informasi/berita/${mainNews.slug}`} className="lg:col-span-3 group/main h-full">
                           <div className="bg-[#749F74] p-4 md:p-5 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col border border-[#749F74]">

                              {/* Image Container */}
                              <div className="relative w-full aspect-video shrink-0 rounded-xl overflow-hidden mb-4">
                                 <Image
                                    src={getStrapiMedia(mainNews.cover.url) || ""}
                                    alt={mainNews.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover/main:scale-105"
                                 />

                                 {/* Category Badge */}
                                 <span
                                    className={`absolute top-3 left-3 px-3 py-1 rounded text-xs font-bold shadow-md ${getCategoryStyle(mainNews.category?.color).className}`}
                                    style={{ backgroundColor: getCategoryStyle(mainNews.category?.color).backgroundColor }}
                                 >
                                    {mainNews.category?.name || "News"}
                                 </span>

                                 {/* Date Badge */}
                                 <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium flex items-center gap-2 shadow-sm border border-white/10">
                                    <Calendar size={14} />
                                    <span>{formatDate(mainNews.publishedAt)}</span>
                                 </div>
                              </div>

                              {/* Content Container */}
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

                        {/* 2. LIST BERITA SAMPING */}
                        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                           {sideNews.map((item) => (
                              <Link
                                 key={item.id}
                                 href={`/informasi/berita/${item.slug}`}
                                 className="group flex gap-4 bg-white p-3 rounded-xl hover:bg-green-50 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all items-start shadow-sm"
                              >
                                 {/* Thumbnail Kecil */}
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

                  {/* 3. GRID BERITA BAWAH (Hanya jika BUKAN Homepage)  */}
                  {!isHomePage && gridNews.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {gridNews.map((item) => (
                           <Link
                              key={item.id}
                              href={`/informasi/berita/${item.slug}`}
                              className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 h-full shadow-sm"
                           >
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
                        ))}
                     </div>
                  )}

                  {/* FOOTER ACTIONS */}
                  <div className="mt-8 flex w-full">
                     {isHomePage ? (
                        // BUTTON MOBILE ONLY (DI TENGAH)
                        <div className="w-full flex justify-center md:hidden">
                           <Link
                              href={`/informasi/berita`}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 shadow-sm"
                           >
                              {t('view_all')} <ArrowRight size={16} />
                           </Link>
                        </div>
                     ) : (
                        // LOAD MORE BUTTON
                        hasMore && (
                           <div className="w-full flex justify-center py-2 relative">
                              <div className="absolute inset-0 flex items-center pointer-events-none">
                                 <div className="w-full border-t border-gray-200"></div>
                              </div>
                              <button
                                 onClick={handleLoadMore}
                                 disabled={loading}
                                 className="relative z-10 flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#005320] text-[#005320] hover:bg-[#005320] hover:text-white rounded-full font-bold text-xs md:text-sm transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                              >
                                 {loading ? (
                                    <>
                                       <Loader2 size={14} className="animate-spin" />
                                       {t('loading')}
                                    </>
                                 ) : (
                                    <>
                                       {t('load_more')}
                                       <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                 )}
                              </button>
                           </div>
                        )
                     )}
                  </div>

                  {!hasMore && gridNews.length > 0 && !isHomePage && (
                     <p className="text-center text-gray-400 text-xs mt-4 italic">
                        -- {t('end_list')} --
                     </p>
                  )}
               </>
            )}
         </div>
      </section>
   );
}