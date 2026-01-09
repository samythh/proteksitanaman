// File: src/components/sections/NewsDashboard.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronRight, Filter, Loader2 } from "lucide-react";
import { getStrapiMedia } from "@/lib/strapi/utils";
import qs from "qs";

const CATEGORY_COLORS: Record<string, string> = {
   "Strong-Blue": "#1E3A8A",
   "Soft-Blue": "#3B82F6",
   "Sky-Blue": "#0EA5E9",
   "Pastel-Yellow": "#FCD34D",
   "Pure-Red": "#EF4444",
   "Dark-Red": "#7F1D1D",
   "Green-Default": "#005320"
};

// --- TYPES ---
export interface NewsItem {
   id: number;
   title: string;
   slug: string;
   publishedAt: string;
   publishedDate?: string;
   excerpt?: string;
   cover: {
      url: string;
      alternativeText?: string;
   };
   category?: {
      name: string;
      color?: string;
   };
}

interface StrapiRawItem {
   id: number;
   title: string;
   slug: string;
   publishedAt: string;
   publishedDate?: string;
   excerpt?: string;
   cover?: {
      url: string;
      alternativeText?: string;
   };
   category?: {
      name: string;
      color?: string;
      slug: string;
   };
}

interface NewsDashboardProps {
   initialData: NewsItem[];
   locale: string;
}

const TEXTS = {
   id: {
      title: "Berita Terkini",
      newest: "Terbaru",
      oldest: "Terlama",
      loadMore: "Lebih Banyak Berita",
      loading: "Memuat...",
      noData: "Tidak ada berita ditemukan."
   },
   en: {
      title: "Latest News",
      newest: "Newest",
      oldest: "Oldest",
      loadMore: "Load More News",
      loading: "Loading...",
      noData: "No news found."
   }
};

export default function NewsDashboard({ initialData, locale }: NewsDashboardProps) {
   const [articles, setArticles] = useState<NewsItem[]>(initialData);
   const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
   const [page, setPage] = useState(1);
   const [loading, setLoading] = useState(false);
   const [hasMore, setHasMore] = useState(true);

   const lang = locale === "en" ? "en" : "id";
   const t = TEXTS[lang];

   const getTextColor = (colorName: string | undefined) => {
      if (colorName === "Pastel-Yellow") return "text-black";
      return "text-white";
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
         day: "numeric", month: "long", year: "numeric"
      });
   };

   const fetchNews = async (pageNum: number, sort: "desc" | "asc", append: boolean) => {
      setLoading(true);
      try {
         const query = qs.stringify({
            locale: locale,
            sort: [`publishedDate:${sort}`, `publishedAt:${sort}`],
            pagination: {
               page: pageNum,
               pageSize: 9,
            },
            populate: {
               cover: { fields: ["url", "alternativeText"] },
               category: { fields: ["name", "color", "slug"] },
            },
            fields: ["title", "slug", "publishedAt", "publishedDate", "excerpt"],
         });

         const apiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
         const res = await fetch(`${apiUrl}/api/articles?${query}`);
         const json = await res.json();

         const newItems = json.data.map((item: StrapiRawItem) => ({
            id: item.id,
            title: item.title,
            slug: item.slug,
            publishedAt: item.publishedDate || item.publishedAt,
            excerpt: item.excerpt,
            cover: { url: item.cover?.url || "" },
            category: item.category ? { name: item.category.name, color: item.category.color } : undefined
         }));

         if (newItems.length === 0) {
            setHasMore(false);
         } else {
            if (append) {
               setArticles((prev) => [...prev, ...newItems]);
            } else {
               setArticles(newItems);
            }
         }
      } catch (error) {
         console.error("Error fetching news:", error);
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

   // --- PEMBAGIAN DATA ---
   const topNews = articles.slice(0, 5);
   const gridNews = articles.slice(5);
   const mainNews = topNews[0];
   const sideNews = topNews.slice(1, 5);

   return (
      <section className="bg-white py-8 md:py-12">
         <div className="container mx-auto px-4 md:px-12 lg:px-24">

            {/* HEADER & FILTER */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
               <h2 className="text-2xl md:text-3xl font-bold text-[#005320] border-l-4 border-yellow-400 pl-4">
                  {t.title}
               </h2>

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
            </div>

            {/* --- BAGIAN 1: DASHBOARD (1 BESAR + 4 KECIL) --- */}
            {mainNews && (
               <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10 items-stretch">

                  {/* === MAIN NEWS (KIRI - 60%) === */}
                  <Link href={`/${locale}/informasi/berita/${mainNews.slug}`} className="lg:col-span-3 group/main h-full">
                     <div className="bg-[#749F74] p-4 md:p-5 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col border border-[#749F74]">

                        {/* CONTAINER GAMBAR (aspect-video) */}
                        <div className="relative w-full aspect-video shrink-0 rounded-xl overflow-hidden mb-4">
                           <Image
                              src={getStrapiMedia(mainNews.cover.url) || ""}
                              alt={mainNews.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover/main:scale-105"
                           />
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80"></div>

                           {/* BADGES */}
                           <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
                              <span
                                 className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase shadow-sm ${getTextColor(mainNews.category?.color)}`}
                                 style={{ backgroundColor: CATEGORY_COLORS[mainNews.category?.color || "Green-Default"] }}
                              >
                                 {mainNews.category?.name || "Berita"}
                              </span>
                           </div>
                           <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border border-white/20">
                              <Calendar size={12} className="text-white/90" />
                              {formatDate(mainNews.publishedAt)}
                           </div>
                        </div>

                        {/* KONTEN TEKS */}
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

                  {/* === SIDE NEWS (KANAN - 40%) === */}
                  {/* Gap diperbesar dikit: gap-4 agar tidak terlalu rapat */}
                  <div className="lg:col-span-2 flex flex-col gap-4 justify-between h-full">
                     {sideNews.map((item) => (
                        <Link
                           key={item.id}
                           href={`/${locale}/informasi/berita/${item.slug}`}
                           // Padding p-3
                           className="group flex gap-4 bg-white p-3 rounded-xl hover:bg-green-50 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all items-start"
                        >

                           {/* Image Kecil Diperbesar: w-32 h-24 (128px x 96px) */}
                           <div className="relative w-32 h-24 shrink-0 rounded-lg overflow-hidden">
                              <Image
                                 src={getStrapiMedia(item.cover.url) || ""}
                                 alt={item.title}
                                 fill
                                 className="object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                           </div>

                           {/* Text Container */}
                           <div className="flex flex-col w-full h-full justify-between py-0.5">
                              {/* Judul Diperbesar: text-base */}
                              <h4 className="text-base font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#005320] transition-colors mb-1">
                                 {item.title}
                              </h4>

                              {/* Badges */}
                              <div className="flex flex-wrap items-center gap-2 mt-auto">
                                 <span
                                    className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase shadow-sm ${getTextColor(item.category?.color)}`}
                                    style={{ backgroundColor: CATEGORY_COLORS[item.category?.color || "Green-Default"] }}
                                 >
                                    {item.category?.name || "Berita"}
                                 </span>
                                 <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    <Calendar size={10} /> {formatDate(item.publishedAt)}
                                 </span>
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            )}

            {/* --- BAGIAN 2: GRID BERITA LAINNYA --- */}
            {gridNews.length > 0 && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  {gridNews.map((item) => (
                     <Link
                        key={item.id}
                        href={`/${locale}/informasi/berita/${item.slug}`}
                        className="group flex flex-col bg-white rounded-xl overflow-hidden hover:shadow-xl hover:bg-green-50 border border-gray-100 hover:border-green-200 transition-all duration-300"
                     >
                        <div className="relative w-full h-44 overflow-hidden">
                           <Image
                              src={getStrapiMedia(item.cover.url) || ""}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                           />
                           <span
                              className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase shadow-md ${getTextColor(item.category?.color)}`}
                              style={{ backgroundColor: CATEGORY_COLORS[item.category?.color || "Green-Default"] }}
                           >
                              {item.category?.name || "Berita"}
                           </span>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                           <div className="mb-2">
                              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                 <Calendar size={10} /> {formatDate(item.publishedAt)}
                              </span>
                           </div>

                           <h4 className="text-base font-bold text-gray-800 group-hover:text-[#005320] line-clamp-2 leading-snug">
                              {item.title}
                           </h4>
                        </div>
                     </Link>
                  ))}
               </div>
            )}

            {/* --- BAGIAN 3: LOAD MORE BUTTON --- */}
            {hasMore && (
               <div className="relative flex items-center justify-center mt-6 py-2">
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
            )}

            {!hasMore && gridNews.length > 0 && (
               <p className="text-center text-gray-400 text-xs mt-4 italic">-- {lang === 'id' ? 'Anda sudah mencapai akhir berita' : 'You have reached the end of the news'} --</p>
            )}

         </div>
      </section>
   );
}