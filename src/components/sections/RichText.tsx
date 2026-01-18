// File: src/components/sections/RichText.tsx
"use client";

import React from "react";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import Image from "next/image";

interface RichTextProps {
   data: {
      content: BlocksContent;
   };
}

export default function RichText({ data }: RichTextProps) {
   if (!data?.content) return null;

   return (
      <section className="py-12 bg-white">
         <div className="container mx-auto px-4 md:px-8">

            {/* WRAPPER PROSE */}
            <div className="
          max-w-4xl mx-auto w-full 
          prose prose-lg 
          text-gray-700 
          text-justify 
          prose-p:text-justify 
          prose-headings:font-bold 
          prose-headings:text-gray-900 
          prose-headings:text-center
          prose-a:text-[#005320] 
          prose-a:no-underline 
          hover:prose-a:underline
          prose-img:m-0
        ">

               <BlocksRenderer
                  content={data.content}
                  blocks={{
                     // ✅ 1. CUSTOM GAMBAR (CENTER & NEXT/IMAGE)
                     image: ({ image }) => (
                        <div className="flex flex-col items-center justify-center my-10 w-full not-prose">
                           <div className="relative w-full h-auto max-w-full flex justify-center">
                              <Image
                                 src={image.url}
                                 width={image.width}
                                 height={image.height}
                                 alt={image.alternativeText || "Article Image"}
                                 className="rounded-xl shadow-lg object-contain h-auto max-w-full"
                                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1000px"
                              />
                           </div>
                           {image.caption && (
                              <p className="text-center text-sm text-gray-500 mt-3 italic">
                                 {image.caption}
                              </p>
                           )}
                        </div>
                     ),

                     // ✅ 2. CUSTOM PARAGRAF (JUSTIFY)
                     paragraph: ({ children }) => (
                        <p className="text-justify mb-4 leading-relaxed">
                           {children}
                        </p>
                     ),

                     // ✅ 3. CUSTOM LINK (WARNA HIJAU)
                     link: ({ children, url }) => (
                        <a href={url} className="text-[#005320] hover:underline font-semibold transition-colors">
                           {children}
                        </a>
                     ),

                     // ✅ 4. CUSTOM HEADING (CENTER) - FIX TYPESCRIPT
                     heading: ({ children, level }) => {
                        // FIX: Definisikan tipe secara eksplisit sebagai Union String
                        // Ini memberitahu TS bahwa Tag PASTI salah satu dari h1-h6
                        const Tag = (`h${level}`) as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

                        const styles = {
                           1: "text-3xl md:text-4xl",
                           2: "text-2xl md:text-3xl",
                           3: "text-xl md:text-2xl",
                           4: "text-lg md:text-xl",
                           5: "text-lg",
                           6: "text-base",
                        };

                        return (
                           <Tag className={`${styles[level]} font-bold text-gray-900 mt-10 mb-6 text-center leading-tight`}>
                              {children}
                           </Tag>
                        );
                     },
                  }}
               />

            </div>
         </div>
      </section>
   );
}