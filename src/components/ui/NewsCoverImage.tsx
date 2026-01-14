// File: src/components/ui/NewsCoverImage.tsx
"use client"; // Wajib agar bisa pakai useState/onClick

import { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

interface NewsCoverImageProps {
   src: string;
   alt: string;
}

export default function NewsCoverImage({ src, alt }: NewsCoverImageProps) {
   const [isOpen, setIsOpen] = useState(false);

   return (
      <>
         {/* 1. THUMBNAIL (Gambar di Halaman) */}
         <div
            className="relative w-full h-full group cursor-zoom-in"
            onClick={() => setIsOpen(true)}
         >
            <Image
               src={src}
               alt={alt}
               fill
               className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Hover Hint (Ikon kaca pembesar) */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <div className="bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm shadow-lg">
                  <ZoomIn size={18} />
                  <span className="text-sm font-medium">Perbesar Gambar</span>
               </div>
            </div>
         </div>

         {/* 2. POPUP MODAL (Fullscreen) */}
         {isOpen && (
            <div
               className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
               onClick={() => setIsOpen(false)} // Tutup jika klik background
            >

               {/* Tombol Close */}
               <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-50"
               >
                  <X size={32} />
               </button>

               {/* Gambar Fullscreen */}
               <div className="relative w-full h-full max-w-7xl max-h-[90vh]">
                  <Image
                     src={src}
                     alt={alt}
                     fill
                     className="object-contain" // Agar gambar utuh tidak terpotong
                     quality={100}
                     onClick={(e) => e.stopPropagation()} // Agar klik gambar tidak menutup modal
                  />
               </div>

               {/* Caption */}
               <div className="absolute bottom-6 left-0 w-full text-center px-4 pointer-events-none">
                  <p className="text-white/90 text-sm md:text-base font-medium bg-black/50 inline-block px-4 py-2 rounded-lg backdrop-blur-sm">
                     {alt}
                  </p>
               </div>

            </div>
         )}
      </>
   );
}