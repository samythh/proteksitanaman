"use client";

import { useState, useEffect, useTransition } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Image as ImageIcon, PlayCircle } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { getMoreFacilities } from "@/lib/strapi/actions"; 
import { getStrapiMedia } from "@/lib/strapi/utils";
import { cn } from "@/lib/utils/cn";
import PosterLightBox from "@/components/ui/PosterLightBox";

// --- TYPE DEFINITIONS ---
interface StrapiImageV5 {
   id: number;
   url: string;
   alternativeText?: string;
}

interface FacilityV5 {
   id: number;
   name: string;
   slug: string;
   description: string;
   youtube_id?: string;
   images?: StrapiImageV5[];
}

interface PageConfig {
   section_label?: string;
   title_main?: string;
   title_highlight?: string;
   description?: string;
}

interface FacilitiesListSectionProps {
   initialData: FacilityV5[];
   config?: PageConfig | null;
   locale: string;
   initialMeta?: {
      page: number;
      pageCount: number;
   };
}

interface ItemProps {
   item: FacilityV5;
   index: number;
}

// --- ITEM CARD COMPONENT  ---
const FacilityItemCard = ({ item, index }: ItemProps) => {
   const t = useTranslations("FacilitiesList");
   const { name, slug, description, youtube_id, images } = item;

   const gallery = Array.isArray(images) ? images : [];
   const isEven = index % 2 === 0;

   let coverImage = gallery.length > 0 ? getStrapiMedia(gallery[0].url) : null;
   const isYoutubeThumbnail = !coverImage && youtube_id;

   if (isYoutubeThumbnail) {
      coverImage = `https://img.youtube.com/vi/${youtube_id}/maxresdefault.jpg`;
   }

   const remainingImages = gallery.slice(1, 4);

   return (
      <div className={cn(
         "relative flex flex-col lg:flex-row gap-8 lg:gap-16 items-center py-8 border-b border-gray-100 last:border-0",
         !isEven && "lg:flex-row-reverse"
      )}>
         {/* MEDIA SECTION */}
         <div className="w-full lg:w-1/2 relative">
            <div className={cn(
               "absolute -top-16 -z-10 text-[8rem] md:text-[10rem] font-black text-gray-100 select-none leading-none opacity-50 lg:opacity-100",
               isEven ? "-left-4 lg:-left-10" : "-right-4 lg:-right-10"
            )}>
               {String(index + 1).padStart(2, '0')}
            </div>

            <div className="group/image relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] bg-gray-100 transition-transform duration-500 hover:scale-[1.01] hover:shadow-3xl">
               {coverImage ? (
                  <div className="relative w-full h-full">
                     <PosterLightBox
                        src={coverImage}
                        alt={name}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover/image:scale-110"
                     />
                     <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 backdrop-blur p-4 rounded-full shadow-lg opacity-0 translate-y-4 group-hover/image:opacity-100 group-hover/image:translate-y-0 transition-all duration-300">
                           {isYoutubeThumbnail ? (
                              <PlayCircle className="text-red-600" size={32} />
                           ) : (
                              <ImageIcon className="text-[#005320]" size={24} />
                           )}
                        </div>
                     </div>
                  </div>
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium bg-gray-50">
                     <ImageIcon className="mr-2 opacity-50" />
                     {t("no_media")}
                  </div>
               )}
            </div>

            {/* THUMBNAILS */}
            {remainingImages.length > 0 && (
               <div className={cn(
                  "absolute -bottom-6 flex gap-3 z-10",
                  isEven ? "right-4 lg:-right-12" : "left-4 lg:-left-12"
               )}>
                  {remainingImages.map((img, idx) => {
                     const thumbUrl = getStrapiMedia(img.url);
                     if (!thumbUrl) return null;
                     return (
                        <div key={img.id || idx} className="w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-white shadow-lg overflow-hidden relative bg-gray-200 hover:-translate-y-1 transition-transform">
                           <PosterLightBox
                              src={thumbUrl}
                              alt={img.alternativeText || `Thumb ${idx}`}
                              className="object-cover w-full h-full hover:scale-110 transition-transform cursor-pointer"
                           />
                        </div>
                     );
                  })}
                  {gallery.length > 4 && (
                     <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-white shadow-lg bg-[#005320] text-white flex flex-col items-center justify-center font-bold text-sm hover:-translate-y-1 transition-transform overflow-hidden cursor-pointer">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                           <span>+{gallery.length - 4}</span>
                           <span className="text-[10px] font-normal opacity-80">{t("more_images")}</span>
                        </div>
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* TEXT SECTION */}
         <div className="w-full lg:w-1/2 flex flex-col gap-5 relative z-0 px-2">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-[#005320] rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-green-100 shadow-sm">
                  {t("featured_badge")}
               </div>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
                  {name}
               </h2>
               <div className="w-24 h-1.5 bg-yellow-400 rounded-full mb-6"></div>
               <p className="text-gray-600 text-base md:text-lg leading-relaxed text-justify line-clamp-4">
                  {description}
               </p>
            </div>
            <div className="pt-2">
               <Link
                  href={`/profil/fasilitas/${slug}`}
                  className="inline-flex items-center gap-3 text-[#005320] font-bold text-lg group/link"
               >
                  <span className="border-b-2 border-[#005320] pb-0.5 group-hover/link:border-yellow-400 transition-colors">
                     {t("explore_btn")}
                  </span>
                  <div className="bg-[#005320] text-white p-2 rounded-full group-hover/link:bg-yellow-400 group-hover/link:text-[#005320] transition-all transform group-hover/link:rotate-45 shadow-md">
                     <ArrowUpRight size={20} />
                  </div>
               </Link>
            </div>
         </div>
      </div>
   );
};

// --- MAIN SECTION ---
export default function FacilitiesListSection({ initialData, config, locale, initialMeta }: FacilitiesListSectionProps) {
   const t = useTranslations("FacilitiesList");

   // 1. STATE MANAGEMENT
   const [facilities, setFacilities] = useState<FacilityV5[]>(initialData || []);
   const [page, setPage] = useState(initialMeta?.page || 1);
   const [hasMore, setHasMore] = useState((initialMeta?.page || 1) < (initialMeta?.pageCount || 1));

   // 2. SCROLL & TRANSITION
   const [isPending, startTransition] = useTransition();
   const { ref, inView } = useInView({
      threshold: 0,
      rootMargin: "200px", 
   });

   // 3. EFFECT: TRIGGER LOAD MORE
   useEffect(() => {
      if (inView && hasMore && !isPending) {
         loadMoreData();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [inView, hasMore, isPending]);

   // 4. FUNCTION: LOAD DATA
   const loadMoreData = () => {
      const nextPage = page + 1;

      startTransition(async () => {
         const res = await getMoreFacilities(nextPage, locale);

         if (res?.data && res.data.length > 0) {
            setFacilities((prev) => [...prev, ...res.data]);
            setPage(nextPage);

            if (res.meta?.pagination) {
               setHasMore(nextPage < res.meta.pagination.pageCount);
            }
         } else {
            setHasMore(false);
         }
      });
   };

   if (facilities.length === 0) return null;

   return (
      <section className="bg-white pt-0 pb-24 px-4 md:px-12 relative overflow-hidden">
         {/* Decorative Blobs */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-yellow-50 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

         <div className="container mx-auto max-w-7xl relative z-10">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
               {config?.section_label && (
                  <h2 className="text-sm font-bold tracking-[0.2em] text-yellow-500 uppercase mb-3">
                     {config.section_label}
                  </h2>
               )}
               <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                  {config?.title_main || "Fasilitas"} <br />
                  {config?.title_highlight && (
                     <span className="text-[#005320]">{config.title_highlight}</span>
                  )}
               </h3>
               {config?.description && (
                  <p className="text-gray-500 text-lg md:text-xl">
                     {config.description}
                  </p>
               )}
            </div>

            {/* List Items */}
            <div className="flex flex-col gap-12 md:gap-16">
               {facilities.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards">
                     <FacilityItemCard item={item} index={index} />
                  </div>
               ))}
            </div>

            {/* INFINITE SCROLL TRIGGER / LOADER */}
            <div className="mt-20 flex justify-center">
               {hasMore ? (
                  <div ref={ref} className="flex flex-col items-center gap-3">
                     {isPending && (
                        <>
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005320]"></div>
                           <span className="text-sm text-gray-500 font-medium animate-pulse">
                              {t("load_more") || "Memuat fasilitas lainnya..."}
                           </span>
                        </>
                     )}
                     {!isPending && <div className="h-4 w-full opacity-0">Trigger</div>}
                  </div>
               ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400 opacity-70 animate-in fade-in">
                     <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                     <span className="text-sm font-medium uppercase tracking-widest">
                        {t("end_list")}
                     </span>
                  </div>
               )}
            </div>
         </div>
      </section>
   );
}