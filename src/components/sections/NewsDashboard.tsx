// File: src/components/sections/NewsDashboard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, Filter, Loader2, ArrowRight } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";
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

interface StrapiRawItem {
   id: number;
   attributes: {
      title: string;
      slug: string;
      publishedDate?: string;
      publishedAt: string;
      excerpt: string;
      cover: {
         data: {
            attributes: {
               url: string;
            }
         } | null
      };
      category: {
         data: {
            attributes: {
               name: string;
               color: string;
            }
         } | null
      };
   };
}

interface NewsDashboardProps {
   initialData: NewsItem[];
   locale: string;
   isHomePage?: boolean;
}

const TEXTS = {
   id: {
      readMoreLink: "Selengkapnya",
      title: "Berita Terkini",
      newest: "Terbaru",
      oldest: "Terlama",
      loadMore: "Lebih Banyak Berita",
      loading: "Memuat...",
      noData: "Tidak ada berita ditemukan."
   },
   en: {
      readMoreLink: "View All News",
      title: "Latest News",
      newest: "Newest",
      oldest: "Oldest",
      loadMore: "Load More News",
      loading: "Loading...",
      noData: "No news found."
   }
};

export default function NewsDashboard({ initialData, locale, isHomePage = false }: NewsDashboardProps) {
   const [articles, setArticles] = useState<NewsItem[]>(() => {
      return Array.isArray(initialData) ? initialData : [];
   });

   const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
   const [page, setPage] = useState(1);
   const [loading, setLoading] = useState(false);
   const [hasMore, setHasMore] = useState(true);

   const lang = locale === "en" ? "en" : "id";
   const t = TEXTS[lang];

   // Helper: Format Tanggal
   const formatDate = (dateString: string) => {
      try {
         return new Date(dateString).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
            day: "numeric", month: "long", year: "numeric"
         });
      } catch {
         return "";
      }
   };

   // --- LOGIKA WARNA TEKS ---
   const getTextColor = (colorKey: string | undefined) => {
      if (!colorKey) return "text-white";
      if (colorKey === "Pastel-Yellow") return "text-black";
      return "text-white";
   };

   // Helper untuk mendapatkan Hex Code dari Map
   const getBgColor = (colorKey: string | undefined) => {
      if (colorKey && COLOR_MAP[colorKey]) {
         return COLOR_MAP[colorKey];
      }
      return DEFAULT_COLOR;
   };

   // --- FETCH DATA ---
   const fetchNews = async (pageNum: number, sort: "desc" | "asc", append: boolean) => {
      setLoading(true);
      try {
         const query = qs.stringify({
            locale: locale,
            sort: sort === 'desc' ? ['publishedDate:desc', 'publishedAt:desc'] : ['publishedDate:asc', 'publishedAt:asc'],
            pagination: {
               page: pageNum,
               pageSize: 5,
            },
            populate: {
               cover: { fields: ["url"] },
               category: { fields: ["name", "color"] },
            },
            fields: ["title", "slug", "publishedAt", "publishedDate", "excerpt"],
         }, { encodeValuesOnly: true });

         const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337/api"}/articles?${query}`);
         const json = await res.json();

         const rawData: StrapiRawItem[] = json.data;

         const newArticles: NewsItem[] = rawData.map((item) => ({
            id: item.id,
            title: item.attributes.title,
            slug: item.attributes.slug,
            publishedAt: item.attributes.publishedDate || item.attributes.publishedAt,
            excerpt: item.attributes.excerpt,
            cover: { url: item.attributes.cover.data?.attributes.url || "" },
            category: item.attributes.category.data ? {
               name: item.attributes.category.data.attributes.name,
               color: item.attributes.category.data.attributes.color
            } : undefined
         }));

         if (newArticles.length === 0) {
            setHasMore(false);
         } else {
            setArticles(prev => append ? [...prev, ...newArticles] : newArticles);
         }

      } catch (error) {
         console.error("Error loading news:", error);
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

   const safeArticles = Array.isArray(articles) ? articles : [];
   const topNews = safeArticles.slice(0, 5);
   const mainNews = topNews[0];
   const sideNews = topNews.slice(1, 5);
   const gridNews = safeArticles.slice(5);

   return (
      <section className="bg-white py-8 md:py-12">
         <div className="container mx-auto px-4 md:px-12 lg:px-24">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
               <h2 className="text-2xl md:text-3xl font-bold text-[#005320] border-l-4 border-yellow-400 pl-4">
                  {t.title}
               </h2>

               {!isHomePage && (
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-200">
                     <Filter size={14} className="text-gray-500" />
                     <select
                        value={sortOrder}
                        onChange={handleSortChange}
                        className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer"
                     >
                        <option value="desc">{t.newest}</option>
                        <option value="asc">{t.oldest}</option>
                     </select>
                  </div>
               )}
            </div>

            {safeArticles.length === 0 && !loading ? (
               <div className="text-center py-10 text-gray-500 italic">{t.noData}</div>
            ) : (
               <>
                  {/* DASHBOARD LAYOUT */}
                  {mainNews && (
                     <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10 items-stretch">

                        {/* 1. BERITA UTAMA (BESAR) */}
                        <Link href={`/${locale}/informasi/berita/${mainNews.slug}`} className="lg:col-span-3 group/main h-full">
                           <div className="bg-[#749F74] p-4 md:p-5 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col border border-[#749F74]">

                              <div className="relative w-full aspect-video shrink-0 rounded-xl overflow-hidden mb-4">
                                 <Image
                                    src={getStrapiMedia(mainNews.cover.url) || ""}
                                    alt={mainNews.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover/main:scale-105"
                                 />

                                 {/* BADGE KATEGORI */}
                                 {/* PERBAIKAN: Mengganti 'rounded-full' menjadi 'rounded' agar sama dengan kotak kecil */}
                                 <span
                                    className={`absolute top-3 left-3 px-3 py-1 rounded text-xs font-bold shadow-md ${getTextColor(mainNews.category?.color)}`}
                                    style={{ backgroundColor: getBgColor(mainNews.category?.color) }}
                                 >
                                    {mainNews.category?.name || "Umum"}
                                 </span>

                                 {/* TANGGAL (Overlay) */}
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

                        {/* 2. LIST BERITA SAMPING */}
                        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                           {sideNews.map((item) => (
                              <Link
                                 key={item.id}
                                 href={`/${locale}/informasi/berita/${item.slug}`}
                                 className="group flex gap-4 bg-white p-3 rounded-xl hover:bg-green-50 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all items-start"
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

                                       {/* Badge Kategori Samping */}
                                       <span
                                          className={`px-2 py-1 rounded text-[10px] font-bold ${getTextColor(item.category?.color)}`}
                                          style={{ backgroundColor: getBgColor(item.category?.color) }}
                                       >
                                          {item.category?.name || "Umum"}
                                       </span>

                                       <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-[10px] font-semibold flex items-center gap-1 border border-gray-200">
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

                  {/* GRID BAWAH (Jika BUKAN Homepage) */}
                  {!isHomePage && gridNews.length > 0 && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {gridNews.map((item) => (
                           <Link
                              key={item.id}
                              href={`/${locale}/informasi/berita/${item.slug}`}
                              className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100 h-full"
                           >
                              <div className="relative w-full aspect-video overflow-hidden">
                                 <Image
                                    src={getStrapiMedia(item.cover.url) || ""}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                 />
                                 {/* Badge Kategori Grid */}
                                 <span
                                    className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold shadow-sm ${getTextColor(item.category?.color)}`}
                                    style={{ backgroundColor: getBgColor(item.category?.color) }}
                                 >
                                    {item.category?.name || "Umum"}
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
                                    Baca Selengkapnya <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                 </span>
                              </div>
                           </Link>
                        ))}
                     </div>
                  )}

                  {/* FOOTER ACTIONS */}
                  <div className="mt-8 flex w-full">
                     {isHomePage ? (
                        <div className="w-full flex justify-end">
                           <Link
                              href={`/${locale}/informasi/berita`}
                              className="group flex items-center gap-2 text-[#005320] font-bold text-base md:text-lg hover:text-[#003d17] transition-colors"
                           >
                              <span>{t.readMoreLink}</span>
                              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                           </Link>
                        </div>
                     ) : (
                        hasMore && (
                           <div className="w-full flex justify-center py-2 relative">
                              <div className="absolute inset-0 flex items-center pointer-events-none">
                                 <div className="w-full border-t border-gray-200"></div>
                              </div>
                              <button
                                 onClick={handleLoadMore}
                                 disabled={loading}
                                 className="relative z-10 flex items-center gap-2 px-6 py-2 bg-white border-2 border-[#005320] text-[#005320] hover:bg-[#005320] hover:text-white rounded-full font-bold text-xs md:text-sm transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                 {loading ? (
                                    <>
                                       <Loader2 size={14} className="animate-spin" />
                                       {t.loading}
                                    </>
                                 ) : (
                                    <>
                                       {t.loadMore}
                                       <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                 )}
                              </button>
                           </div>
                        )
                     )}
                  </div>

                  {!hasMore && safeArticles.length > 0 && !isHomePage && (
                     <p className="text-center text-gray-400 text-xs mt-4 italic">
                        -- {lang === 'id' ? 'Anda sudah mencapai akhir berita' : 'You have reached the end of the news'} --
                     </p>
                  )}
               </>
            )}
         </div>
      </section>
   );
}