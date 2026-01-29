// File: src/components/strapi/rich-text.tsx
"use client";

import React from "react";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { cn } from "@/lib/utils/cn";

interface RichTextProps {
   content: BlocksContent;
   className?: string; // Agar bisa ditimpa style-nya dari luar jika perlu
}

export default function RichText({ content, className }: RichTextProps) {
   if (!content) return null;

   return (
      <div className={cn("w-full text-gray-800 leading-relaxed font-sans", className)}>
         <BlocksRenderer
            content={content}
            blocks={{
               // --- A. GAMBAR (Center & Responsive) ---
               image: ({ image }) => {
                  const imageUrl = getStrapiMedia(image.url);
                  if (!imageUrl) return null;

                  return (
                     <div className="flex flex-col items-center justify-center my-8 w-full not-prose">
                        <div className="relative w-full h-auto flex justify-center">
                           <Image
                              src={imageUrl}
                              width={image.width}
                              height={image.height}
                              alt={image.alternativeText || "Article Image"}
                              className="rounded-lg shadow-md object-contain h-auto max-w-full"
                              sizes="(max-width: 768px) 100vw, 1200px"
                           />
                        </div>
                        {image.caption && (
                           <p className="text-center text-sm text-gray-500 mt-2 italic">
                              {image.caption}
                           </p>
                        )}
                     </div>
                  );
               },

               // --- B. PARAGRAF (Justify & Spasi) ---
               paragraph: ({ children }) => (
                  <p className="text-justify mb-4 text-base md:text-lg text-gray-700 leading-7">
                     {children}
                  </p>
               ),

               // --- C. LIST (Padding manual agar angka tidak hilang) ---
               list: ({ children, format }) => {
                  if (format === "ordered") {
                     return (
                        <ol className="list-decimal pl-6 mb-6 space-y-2 text-base md:text-lg text-gray-700 marker:font-bold marker:text-gray-900 text-justify">
                           {children}
                        </ol>
                     );
                  }
                  return (
                     <ul className="list-disc pl-6 mb-6 space-y-2 text-base md:text-lg text-gray-700 marker:text-[#005320] text-justify">
                        {children}
                     </ul>
                  );
               },
               "list-item": ({ children }) => <li className="pl-1">{children}</li>,

               // --- D. HEADING ---
               heading: ({ children, level }) => {
                  const Tag = (`h${level}`) as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
                  const styles = {
                     1: "text-3xl md:text-4xl mt-10 mb-6 font-bold text-[#005320]",
                     2: "text-2xl md:text-3xl mt-8 mb-4 font-bold text-gray-900",
                     3: "text-xl md:text-2xl mt-6 mb-3 font-semibold text-gray-800",
                     4: "text-lg md:text-xl mt-5 mb-2 font-medium text-gray-800",
                     5: "text-lg mt-4 mb-2 font-medium",
                     6: "text-base mt-4 mb-2 font-bold uppercase tracking-wide",
                  };
                  return <Tag className={styles[level]}>{children}</Tag>;
               },

               // --- E. QUOTE ---
               quote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#005320] bg-green-50/50 p-4 my-6 italic text-gray-700 rounded-r-lg">
                     {children}
                  </blockquote>
               ),

               // --- F. LINK ---
               link: ({ children, url }) => {
                  const isExternal = url.startsWith("http");
                  return (
                     <Link
                        href={url}
                        className="text-[#005320] font-semibold hover:underline decoration-2 underline-offset-2 transition-colors"
                        target={isExternal ? "_blank" : "_self"}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                     >
                        {children}
                     </Link>
                  );
               },

               // --- G. CODE BLOCK ---
               code: ({ children }) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 font-mono text-sm border border-gray-700">
                     <code>{children}</code>
                  </pre>
               ),
            }}

            modifiers={{
               bold: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
               italic: ({ children }) => <em className="italic text-gray-600">{children}</em>,
               underline: ({ children }) => <u className="decoration-yellow-400 decoration-2 underline-offset-2">{children}</u>,
               code: ({ children }) => (
                  <code className="bg-gray-100 text-[#005320] px-1.5 py-0.5 rounded text-sm font-mono border border-gray-200">
                     {children}
                  </code>
               ),
            }}
         />
      </div>
   );
}