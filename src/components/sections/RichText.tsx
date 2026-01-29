// File: src/components/sections/RichText.tsx
"use client";

import React from "react";
import { type BlocksContent } from "@strapi/blocks-react-renderer";
import CoreRichText from "@/components/strapi/rich-text";

interface RichTextProps {
   data: {
      content: BlocksContent;
   };
}

export default function RichText({ data }: RichTextProps) {
   if (!data?.content) return null;

   return (
      <section className="py-12 md:py-16 bg-white">
         {/*
          Jika ingin teks lebih lebar, gunakan max-w-6xl.
          Jika ingin seperti artikel fokus, gunakan max-w-4xl atau 5xl.
        */}
         <div className="container mx-auto px-4 md:px-8 max-w-5xl">
            <CoreRichText content={data.content} />
         </div>
      </section>
   );
}