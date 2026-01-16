// File: src/components/sections/RichText.tsx
"use client";

import React from "react";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

interface RichTextProps {
   data: {
      // Sesuaikan 'content' dengan nama field di Strapi Anda
      content: BlocksContent;
   };
}

export default function RichText({ data }: RichTextProps) {
   if (!data?.content) return null;

   return (
      <section className="py-10 bg-white">
         {/* Container utama: membatasi lebar agar tidak mentok kiri-kanan layar */}
         <div className="container mx-auto px-4 md:px-8">

            <div className="
          prose prose-lg 
          max-w-4xl 
          mx-auto 
          w-full 
          break-words 
          text-gray-700 
          prose-headings:font-bold 
          prose-headings:text-gray-900 
          prose-a:text-green-600 
          hover:prose-a:text-green-700 
          prose-img:rounded-xl 
          prose-img:w-full"
            >
               {/* BlocksRenderer akan merender JSON menjadi HTML */}
               <BlocksRenderer content={data.content} />

            </div>
         </div>
      </section>
   );
}