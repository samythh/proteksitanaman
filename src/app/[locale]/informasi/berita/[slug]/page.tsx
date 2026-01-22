// File: src/app/[locale]/informasi/berita/[slug]/page.tsx

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ChevronRight } from "lucide-react";
import qs from "qs";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

import ShareButton from "@/components/features/ShareButton";
import NewsCoverImage from "@/components/ui/NewsCoverImage";

// --- KAMUS TERJEMAHAN (DICTIONARY) ---
const DICTIONARY = {
   id: {
      relatedNews: "Berita Lainnya",
      loadMore: "Lebih banyak",
      defaultAuthor: "Departemen Proteksi Tanaman",
      categoryDefault: "Berita"
   },
   en: {
      relatedNews: "Related News",
      loadMore: "View more",
      defaultAuthor: "Department of Plant Protection",
      categoryDefault: "News"
   }
};

const CATEGORY_COLORS: Record<string, string> = {
   "Strong-Blue": "#1E3A8A",
   "Soft-Blue": "#3B82F6",
   "Sky-Blue": "#0EA5E9",
   "Pastel-Yellow": "#FCD34D",
   "Pure-Red": "#EF4444",
   "Dark-Red": "#7F1D1D",
   "Green-Default": "#005320"
};

interface ArticleDetail {
   id: number;
   title: string;
   content: BlocksContent;
   publishedAt: string;
   publishedDate?: string;
   author?: string;
   cover: { url: string; alternativeText?: string };
   category?: { name: string; color?: string };
}

interface RelatedArticle {
   id: number;
   title: string;
   slug: string;
   publishedAt: string;
   publishedDate?: string;
   cover?: {
      url: string;
      alternativeText?: string;
   };
   category?: {
      name: string;
      color?: string;
   };
}

interface PageProps {
   params: Promise<{ locale: string; slug: string }>;
}

async function getArticleBySlug(slug: string, locale: string) {
   const query = qs.stringify({
      locale,
      filters: { slug: { $eq: slug } },
      fields: ["title", "content", "publishedAt", "publishedDate", "author"],
      populate: {
         cover: { fields: ["url", "alternativeText"] },
         category: { fields: ["name", "color", "slug"] },
      },
   });

   const res = await fetchAPI(`/articles?${query}`);
   const data = res?.data?.[0];

   if (!data) return null;

   return {
      id: data.id,
      title: data.title,
      content: data.content,
      publishedAt: data.publishedDate || data.publishedAt,
      author: data.author,
      cover: {
         url: data.cover?.url || "",
         alternativeText: data.cover?.alternativeText || "",
      },
      category: data.category,
   } as ArticleDetail;
}

async function getRelatedArticles(locale: string, currentId: number) {
   const query = qs.stringify({
      locale,
      filters: { id: { $ne: currentId } },
      sort: ["publishedDate:desc", "publishedAt:desc"],
      pagination: { limit: 3 },
      populate: {
         cover: { fields: ["url"] },
         category: { fields: ["name", "color"] },
      },
      fields: ["title", "slug", "publishedAt", "publishedDate"],
   });

   const res = await fetchAPI(`/articles?${query}`);
   return res?.data || [];
}

const formatDate = (dateString: string, locale: string) => {
   if (!dateString) return "-";
   return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
      day: "numeric",
      month: "long",
      year: "numeric",
   });
};

const getTextColor = (colorName: string | undefined) => {
   if (colorName === "Pastel-Yellow") return "text-black";
   return "text-white";
};

// --- COMPONENT UTAMA ---
export default async function BeritaDetailPage({ params }: PageProps) {
   const { locale, slug } = await params;
   const lang = (locale === 'en' ? 'en' : 'id');
   const t = DICTIONARY[lang];

   const article = await getArticleBySlug(slug, locale);
   if (!article) return notFound();

   const relatedArticles = await getRelatedArticles(locale, article.id);

   const authorName = article.author || t.defaultAuthor;
   const coverUrl = getStrapiMedia(article.cover.url);

   return (
      <div className="w-full min-h-screen bg-white pb-20 pt-24 md:pt-32">

         <article className="container mx-auto px-4 md:px-0 max-w-4xl">
            <header className="mb-8">
               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                  {article.title}
               </h1>
               <div className="flex flex-wrap items-center text-sm md:text-base text-gray-500 gap-2 mb-4">
                  <span className="font-semibold text-gray-700">{authorName}</span>
                  <span className="text-gray-300">|</span>
                  <span>{formatDate(article.publishedAt, lang)}</span>
               </div>
               <div className="w-16 h-1 bg-[#005320] rounded-full"></div>
            </header>

            {coverUrl && (
               <div className="relative w-full h-[300px] md:h-[500px] mb-8 rounded-xl overflow-hidden shadow-lg">
                  <NewsCoverImage
                     src={coverUrl}
                     alt={article.title}
                  />
               </div>
            )}

            {/* ✅ UPDATED: Ditambahkan class 'text-justify' */}
            <div className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed mb-12 text-justify">
               <BlocksRenderer content={article.content} />
            </div>

            {/* --- BAGIAN SHARE DI KANAN BAWAH --- */}
            <div className="border-t border-gray-200 pt-6 mt-12 flex justify-end">
               <ShareButton title={article.title} />
            </div>
         </article>

         {/* BERITA LAINNYA */}
         <div className="container mx-auto px-4 max-w-6xl mt-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
               {t.relatedNews}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
               {relatedArticles.map((item: RelatedArticle) => {
                  const imgUrl = getStrapiMedia(item.cover?.url || null);
                  const categoryName = item.category?.name || t.categoryDefault;

                  const strapiColorValue = item.category?.color || "Green-Default";
                  const backgroundColorHex = CATEGORY_COLORS[strapiColorValue] || CATEGORY_COLORS["Green-Default"];
                  const textColorClass = getTextColor(strapiColorValue);

                  return (
                     <Link
                        href={`/${locale}/informasi/berita/${item.slug}`}
                        key={item.id}
                        className="group flex flex-col h-full bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                     >
                        <div className="relative w-full h-48 overflow-hidden">
                           {imgUrl ? (
                              <Image src={imgUrl} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                           ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                           )}
                           <span
                              className={`absolute top-3 left-3 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full shadow-md z-10 ${textColorClass}`}
                              style={{ backgroundColor: backgroundColorHex, boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
                           >
                              {categoryName}
                           </span>
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                           <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.publishedDate || item.publishedAt, lang)}
                           </div>
                           <h4 className="text-lg font-bold text-gray-800 group-hover:text-[#005320] line-clamp-2 leading-snug mb-3">{item.title}</h4>
                        </div>
                     </Link>
                  )
               })}
            </div>

            <div className="flex justify-end">
               <Link
                  href={`/${locale}/informasi/berita`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#005320] text-white rounded-full hover:bg-yellow-400 hover:text-[#005320] transition-all font-semibold text-sm shadow-md"
               >
                  {t.loadMore}
                  <ChevronRight className="w-4 h-4" />
               </Link>
            </div>

         </div>

      </div>
   );
}