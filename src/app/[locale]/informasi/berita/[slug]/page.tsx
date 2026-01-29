// File: src/app/[locale]/informasi/berita/[slug]/page.tsx

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, ArrowRight } from "lucide-react";
import qs from "qs";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import { Metadata } from "next";

import ShareButton from "@/components/features/ShareButton";
import ArticleCard, { ArticleItem } from "@/components/features/ArticleCard";

// --- KAMUS TERJEMAHAN (DICTIONARY) ---
const DICTIONARY = {
   id: {
      relatedNews: "Berita Lainnya",
      loadMore: "Lebih banyak",
      defaultAuthor: "Departemen Proteksi Tanaman",
      backToNews: "Kembali"
   },
   en: {
      relatedNews: "Related News",
      loadMore: "View more",
      defaultAuthor: "Department of Plant Protection",
      backToNews: "Back"
   }
};

// --- TYPES ---
interface StrapiEntity {
   id: number;
   attributes: Record<string, unknown>;
   [key: string]: unknown;
}

interface StrapiResponse<T> {
   data: T;
   meta?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StrapiData = any;

interface ArticleDetail {
   id: number;
   title: string;
   slug: string;
   content: BlocksContent | null;
   publishedAt: string;
   author?: string;
   cover?: { url: string; alternativeText?: string };
   category?: { name: string; color?: string; slug: string };
   seo?: { metaTitle: string; metaDescription: string; shareImage?: { url: string } };
}

interface PageProps {
   params: Promise<{ locale: string; slug: string }>;
}

// --- HELPERS ---
const extractData = (data: StrapiData) => {
   if (!data) return null;
   if (data.attributes) return data.attributes;
   if (data.data && data.data.attributes) return data.data.attributes;
   if (data.data && Array.isArray(data.data)) return data.data;
   return data;
};

const formatDate = (dateString: string, locale: string) => {
   if (!dateString) return "-";
   try {
      return new Date(dateString).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
         day: "numeric",
         month: "long",
         year: "numeric",
      });
   } catch {
      return dateString;
   }
};

// --- GENERATE METADATA ---
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
   const { slug, locale } = await params;
   const query = qs.stringify({
      filters: { slug: { $eq: slug } },
      populate: "*",
      locale,
   });

   const res = await fetchAPI(`/articles?${query}`) as StrapiResponse<StrapiEntity[]>;
   const rawItem = res?.data?.[0];

   if (!rawItem) return { title: "Berita Tidak Ditemukan" };

   const article = extractData(rawItem);
   const seo = extractData(article.seo);
   const cover = extractData(article.cover);

   let shareImageUrl = seo?.shareImage?.data?.attributes?.url || seo?.shareImage?.url;
   if (!shareImageUrl) {
      shareImageUrl = cover?.url;
   }

   return {
      title: seo?.metaTitle || article.title,
      description: seo?.metaDescription || article.excerpt || "",
      openGraph: {
         images: getStrapiMedia(shareImageUrl) ? [getStrapiMedia(shareImageUrl)!] : [],
      },
   };
}

// --- COMPONENT UTAMA ---
export default async function BeritaDetailPage({ params }: PageProps) {
   const { locale, slug } = await params;
   const lang = (locale === 'en' ? 'en' : 'id');
   const t = DICTIONARY[lang];

   // 1. FETCH ARTIKEL
   const query = qs.stringify({
      locale,
      filters: { slug: { $eq: slug } },
      populate: "*",
   });

   const res = await fetchAPI(`/articles?${query}`) as StrapiResponse<StrapiEntity[]>;
   const rawData = res?.data?.[0];

   if (!rawData) return notFound();

   const attr = extractData(rawData);
   const coverData = extractData(attr.cover);
   const categoryData = extractData(attr.category);

   const article: ArticleDetail = {
      id: rawData.id,
      title: attr.title,
      slug: attr.slug,
      content: attr.content,
      publishedAt: attr.publishedDate || attr.publishedAt,
      author: attr.author?.data?.attributes?.name || attr.author,
      cover: coverData ? {
         url: coverData.url,
         alternativeText: coverData.alternativeText
      } : undefined,
      category: categoryData ? {
         name: categoryData.name,
         color: categoryData.color,
         slug: categoryData.slug
      } : undefined,
   };

   // 2. FETCH RELATED
   const relatedQuery = qs.stringify({
      locale,
      filters: { id: { $ne: article.id } },
      sort: ["publishedDate:desc", "publishedAt:desc"],
      pagination: { limit: 3 },
      fields: ["title", "slug", "publishedAt", "publishedDate", "excerpt"],
      populate: {
         cover: { fields: ["url", "alternativeText"] },
         category: { fields: ["name", "color", "slug"] }
      },
   });

   const relatedRes = await fetchAPI(`/articles?${relatedQuery}`) as StrapiResponse<StrapiEntity[]>;

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const relatedArticles: ArticleItem[] = (relatedRes?.data || []).map((item: any) => {
      const rAttr = extractData(item);
      const rCover = extractData(rAttr.cover);
      const rCategory = extractData(rAttr.category);

      return {
         id: item.id,
         title: rAttr.title,
         slug: rAttr.slug,
         publishedAt: rAttr.publishedDate || rAttr.publishedAt,
         image: rCover ? { url: rCover.url } : null,
         category: rCategory,
         description: rAttr.excerpt || ""
      };
   });

   const authorName = article.author || t.defaultAuthor;
   const coverUrl = getStrapiMedia(article.cover?.url);

   return (
      <div className="w-full min-h-screen bg-white pb-20 pt-24 md:pt-32 font-sans">

         <article className="container mx-auto px-4 md:px-0 max-w-4xl">
            {/* HEADER */}
            <header className="mb-8">
               <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                  {article.title}
               </h1>
               <div className="flex flex-wrap items-center text-sm md:text-base text-gray-500 gap-2 mb-4">
                  <span className="font-semibold text-gray-700">{authorName}</span>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1">
                     <Calendar size={14} />
                     <span>{formatDate(article.publishedAt, lang)}</span>
                  </div>
               </div>
               <div className="w-16 h-1 bg-[#005320] rounded-full"></div>
            </header>

            {/* COVER IMAGE */}
            {coverUrl && (
               <div className="relative w-full h-[300px] md:h-[500px] mb-8 rounded-xl overflow-hidden shadow-lg border border-gray-100">
                  <Image
                     src={coverUrl}
                     alt={article.cover?.alternativeText || article.title}
                     fill
                     className="object-cover"
                     priority
                  />
               </div>
            )}

            {/* CONTENT */}
            <div className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed mb-12 text-justify">
               {article.content ? (
                  <BlocksRenderer content={article.content} />
               ) : (
                  <p className="text-gray-400 italic">
                     {locale === 'en' ? 'No content available.' : 'Konten berita belum tersedia.'}
                  </p>
               )}
            </div>

            {/* SHARE */}
            <div className="border-t border-gray-200 pt-6 mt-12 flex justify-end">
               <ShareButton title={article.title} />
            </div>
         </article>

         {/* RELATED NEWS */}
         {relatedArticles.length > 0 && (
            <div className="container mx-auto px-4 max-w-6xl mt-12">
               <h3 className="text-3xl font-bold text-gray-900 mb-8">
                  {t.relatedNews}
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  {relatedArticles.map((item) => (
                     <ArticleCard
                        key={item.id}
                        data={item}
                        locale={locale}
                     />
                  ))}
               </div>

               <div className="flex justify-end">
                  <Link
                     href={`/${locale}/informasi/berita`}
                     className="flex items-center gap-2 text-sm font-bold text-[#005320] hover:text-yellow-600 transition-colors bg-green-50 px-5 py-2.5 rounded-full hover:bg-green-100 shadow-sm hover:shadow-md group"
                  >
                     {t.loadMore}
                     <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>
         )}

      </div>
   );
}