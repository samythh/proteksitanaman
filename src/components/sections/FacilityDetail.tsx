// File: src/components/sections/FacilityDetail.tsx

"use client";

import React, { useRef, useState, ElementType } from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

// --- TYPE DEFINITIONS ---

interface TextChild {
   text: string;
   bold?: boolean;
   italic?: boolean;
   underline?: boolean;
   strikethrough?: boolean;
   code?: boolean;
}

interface ListItem {
   type: 'list-item';
   children: TextChild[];
}

interface BlockImage {
   url: string;
   alternativeText?: string;
   caption?: string;
}

interface ContentBlock {
   type: 'paragraph' | 'heading' | 'list' | 'quote' | 'image';
   level?: number;
   format?: 'ordered' | 'unordered';
   // Children bisa berupa TextChild (untuk paragraf) atau ListItem (untuk list)
   children?: TextChild[] | ListItem[];
   image?: BlockImage;
}

interface FacilityDetailProps {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   data: any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   others: any[];
   locale: string;
}

export default function FacilityDetail({ data, others, locale }: FacilityDetailProps) {
   const attr = data.attributes || data;
   const galleryRef = useRef<HTMLDivElement>(null);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);

   // Data Extraction
   const images = attr.images?.data || attr.images || [];
   const youtubeId = attr.youtube_id;
   const description = attr.description;

   // --- FUNGSI SCROLL GALERI ---
   const scrollGallery = (direction: "left" | "right") => {
      if (galleryRef.current) {
         const scrollAmount = 300;
         galleryRef.current.scrollBy({
            left: direction === "right" ? scrollAmount : -scrollAmount,
            behavior: "smooth",
         });
      }
   };

   // --- HELPER: RENDER TEXT NODE ---
   const renderChild = (child: TextChild, index: number) => {
      let text = <span key={index}>{child.text}</span>;

      if (child.bold) {
         text = <strong key={index} className="font-bold">{text}</strong>;
      }
      if (child.italic) {
         text = <em key={index} className="italic">{text}</em>;
      }
      if (child.underline) {
         text = <u key={index} className="underline">{text}</u>;
      }
      if (child.strikethrough) {
         text = <s key={index} className="line-through">{text}</s>;
      }
      if (child.code) {
         text = <code key={index} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-500">{text}</code>;
      }

      return text;
   };

   // --- FUNGSI RENDER RICH TEXT (BLOCKS) ---
   const renderBlocks = () => {
      const content = attr.content;

      // 1. Jika String
      if (typeof content === "string" && content.trim() !== "") {
         return <div dangerouslySetInnerHTML={{ __html: content }} className="space-y-4 text-justify" />;
      }

      // 2. Jika Array (Blocks JSON)
      if (Array.isArray(content)) {
         return (
            <div className="space-y-5 text-gray-700 leading-relaxed">
               {content.map((block: ContentBlock, index: number) => {

                  // Paragraph
                  if (block.type === 'paragraph') {
                     // Kita casting children sebagai TextChild[]
                     const children = block.children as TextChild[] | undefined;
                     return (
                        <p key={index} className="mb-4 text-justify">
                           {children?.map((child, i) => renderChild(child, i))}
                        </p>
                     );
                  }

                  // Heading
                  if (block.type === 'heading') {
                     const level = block.level || 2;
                     const Tag = `h${level}` as ElementType;
                     const children = block.children as TextChild[] | undefined;

                     const sizes: Record<number, string> = { 1: "text-3xl", 2: "text-2xl", 3: "text-xl", 4: "text-lg", 5: "text-base", 6: "text-sm" };
                     const fontSize = sizes[level] || "text-xl";

                     return (
                        <Tag key={index} className={`font-bold text-gray-900 mt-8 mb-3 ${fontSize}`}>
                           {children?.map((child, i) => renderChild(child, i))}
                        </Tag>
                     );
                  }

                  // List (FIXED TYPE ERROR HERE)
                  if (block.type === 'list') {
                     const Tag = (block.format === 'ordered' ? 'ol' : 'ul') as ElementType;
                     const listStyle = block.format === 'ordered' ? 'list-decimal' : 'list-disc';

                     // Casting children sebagai ListItem[] agar TypeScript tidak marah
                     const items = block.children as ListItem[] | undefined;

                     return (
                        <Tag key={index} className={`${listStyle} list-outside ml-5 mb-4 space-y-1 text-justify`}>
                           {items?.map((item, i) => (
                              <li key={i} className="pl-1">
                                 {item.children?.map((c, ci) => renderChild(c, ci))}
                              </li>
                           ))}
                        </Tag>
                     )
                  }

                  // Quote
                  if (block.type === 'quote') {
                     const children = block.children as TextChild[] | undefined;
                     return (
                        <blockquote key={index} className="border-l-4 border-green-500 pl-4 italic text-gray-600 my-6 bg-gray-50 py-2 pr-2 rounded-r text-justify">
                           {children?.map((child, i) => renderChild(child, i))}
                        </blockquote>
                     );
                  }

                  // Image
                  if (block.type === 'image' && block.image) {
                     return (
                        <div key={index} className="my-6 relative h-64 w-full rounded-lg overflow-hidden">
                           <Image
                              src={block.image.url}
                              alt={block.image.alternativeText || "Content Image"}
                              fill
                              className="object-cover"
                           />
                        </div>
                     )
                  }

                  return null;
               })}
            </div>
         );
      }
      return null;
   };

   return (
      <>
         <section className="container mx-auto px-4 py-12 relative z-10">
            <div className="flex flex-col lg:flex-row gap-12">

               {/* === KIRI: KONTEN UTAMA (2/3) === */}
               <div className="w-full lg:w-2/3">

                  {/* 1. VIDEO PLAYER */}
                  {youtubeId && (
                     <div className="mb-8 rounded-xl overflow-hidden shadow-lg border border-gray-100 aspect-video bg-black relative z-10">
                        <iframe
                           src={`https://www.youtube.com/embed/${youtubeId}`}
                           title="YouTube video player"
                           className="absolute top-0 left-0 w-full h-full"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                           allowFullScreen
                        ></iframe>
                     </div>
                  )}

                  <div className="mb-12">
                     {/* JUDUL */}
                     <h2 className="text-3xl font-bold text-gray-900 mb-6">{attr.name}</h2>

                     {/* 2. DESCRIPTION */}
                     {description && (
                        <div className="text-gray-700 leading-relaxed mb-6 text-justify">
                           {description}
                        </div>
                     )}

                     {/* 3. RICH TEXT / CONTENT */}
                     <div className="prose max-w-none prose-headings:text-green-800 prose-a:text-green-600 text-gray-700">
                        {renderBlocks()}
                     </div>
                  </div>

                  {/* 4. GALERI FOTO */}
                  {images.length > 0 && (
                     <div className="pt-8 border-t border-gray-100 relative group">
                        <h3 className="text-xl font-bold text-gray-900 border-l-4 border-green-600 pl-4 mb-6">
                           {locale === "en" ? "Gallery" : "Galeri Foto"}
                        </h3>

                        <div className="relative">
                           {/* Tombol Kiri */}
                           <button
                              onClick={() => scrollGallery("left")}
                              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-r-xl bg-white/90 shadow-md text-gray-700 hover:text-green-600 hover:bg-white transition-all transform -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 duration-300 border border-gray-100"
                           >
                              <FaChevronLeft size={20} />
                           </button>

                           {/* Slider */}
                           <div
                              ref={galleryRef}
                              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1"
                              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                           >
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {images.map((img: any, idx: number) => {
                                 const imgUrl = getStrapiMedia(img.attributes?.url || img.url);
                                 return (
                                    <div
                                       key={idx}
                                       onClick={() => setSelectedImage(imgUrl || null)}
                                       className="relative h-40 w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-sm border border-gray-200 snap-center cursor-pointer hover:opacity-90 transition-opacity"
                                    >
                                       <Image
                                          src={imgUrl || ""}
                                          alt={attr.name || "Facility Image"}
                                          fill
                                          className="object-cover transition-transform duration-500 hover:scale-105"
                                          sizes="(max-width: 768px) 50vw, 25vw"
                                       />
                                    </div>
                                 );
                              })}
                           </div>

                           {/* Tombol Kanan */}
                           <button
                              onClick={() => scrollGallery("right")}
                              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-l-xl bg-white/90 shadow-md text-gray-700 hover:text-green-600 hover:bg-white transition-all transform translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 duration-300 border border-gray-100"
                           >
                              <FaChevronRight size={20} />
                           </button>
                        </div>
                     </div>
                  )}
               </div>

               {/* === KANAN: SIDEBAR (1/3) === */}
               <div className="w-full lg:w-1/3">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-28">
                     <h3 className="text-lg font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                        {locale === "en" ? "Other Facilities" : "Fasilitas Lainnya"}
                     </h3>

                     <ul className="space-y-4">
                        {others.map((item) => {
                           const itemAttr = item.attributes || item;
                           const itemLink = `/${locale}/profil/fasilitas/${itemAttr.slug}`;

                           const firstImage = itemAttr.images?.data?.[0] || itemAttr.images?.[0];
                           const rawSideImg = firstImage?.attributes?.url || firstImage?.url;
                           const sideImgUrl = getStrapiMedia(rawSideImg);

                           return (
                              <li key={item.id}>
                                 <Link
                                    href={itemLink}
                                    className="group flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md hover:bg-green-50 transition-all border border-transparent hover:border-green-100"
                                 >
                                    <div className="relative w-20 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-200 border border-gray-100">
                                       {sideImgUrl ? (
                                          <Image
                                             src={sideImgUrl}
                                             alt={itemAttr.name}
                                             fill
                                             className="object-cover group-hover:scale-105 transition-transform"
                                          />
                                       ) : (
                                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                             <span className="text-[10px] text-gray-400 font-medium">No Image</span>
                                          </div>
                                       )}
                                    </div>
                                    <span className="font-semibold text-gray-700 group-hover:text-green-700 transition-colors line-clamp-2 text-sm leading-snug">
                                       {itemAttr.name}
                                    </span>
                                 </Link>
                              </li>
                           );
                        })}
                     </ul>
                  </div>
               </div>

            </div>

            {/* TOMBOL KEMBALI */}
            <div className="text-center mt-16 mb-8 pt-8 border-t border-gray-100">
               <Link
                  href={`/${locale}/profil/fasilitas`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-green-200 text-green-700 font-semibold rounded-full shadow-sm hover:shadow-md hover:bg-green-50 hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 group"
               >
                  <FaArrowLeft className="text-sm transition-transform duration-300 group-hover:-translate-x-1" />
                  <span>
                     {locale === "en" ? "Back to Facilities" : "Kembali ke Daftar Fasilitas"}
                  </span>
               </Link>
            </div>
         </section>

         {/* === MODAL POPUP GALERI === */}
         {selectedImage && (
            <div
               className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fadeIn"
               onClick={() => setSelectedImage(null)}
            >
               <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 z-50"
               >
                  <FaTimes size={32} />
               </button>

               <div
                  className="relative w-full max-w-6xl h-[85vh] rounded-lg overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
               >
                  <Image
                     src={selectedImage}
                     alt="Facility Fullscreen"
                     fill
                     className="object-contain"
                     quality={100}
                  />
               </div>
            </div>
         )}
      </>
   );
}