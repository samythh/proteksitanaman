// File: src/components/ui/NewsCoverImage.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NewsCoverImageProps {
   src: string;
   alt: string;
   className?: string;
}

export default function NewsCoverImage({ src, alt, className }: NewsCoverImageProps) {
   const [isOpen, setIsOpen] = useState(false);
   const t = useTranslations("UI");

   // --- 1. UX & ACCESSIBILITY LOGIC ---

   useEffect(() => {
      if (isOpen) {
         // Kunci scroll body saat modal terbuka
         document.body.style.overflow = "hidden";

         // Listener tombol ESC
         const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
         };
         window.addEventListener("keydown", handleKeyDown);

         return () => {
            // Cleanup: Kembalikan scroll & hapus listener
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
         };
      }
   }, [isOpen]);

   return (
      <>
         {/* 2. TRIGGER (THUMBNAIL) */}
         <button
            type="button"
            className={cn("relative w-full h-full group cursor-zoom-in block overflow-hidden rounded-xl", className)}
            onClick={() => setIsOpen(true)}
            aria-label={t("zoom_image")}
         >
            <Image
               src={src}
               alt={alt}
               fill
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Hover Hint Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
               <div className="bg-black/60 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <ZoomIn size={18} />
                  <span className="text-sm font-medium">{t("zoom_image")}</span>
               </div>
            </div>
         </button>

         {/* 3. POPUP MODAL (Fullscreen) */}
         {isOpen && (
            <div
               className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
               role="dialog"
               aria-modal="true"
               aria-label={t("image_modal_label")}
               onClick={() => setIsOpen(false)}
            >
               {/* Tombol Close */}
               <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-50 focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={t("close")}
               >
                  <X size={32} />
               </button>

               {/* Gambar Fullscreen */}
               <div
                  className="relative w-full h-full max-w-7xl max-h-[90vh]"
                  onClick={(e) => e.stopPropagation()}
               >
                  <Image
                     src={src}
                     alt={alt}
                     fill
                     className="object-contain"
                     quality={100}
                     priority
                     sizes="100vw"
                  />
               </div>

               {/* Caption */}
               <div className="absolute bottom-6 left-0 w-full text-center px-4 pointer-events-none">
                  <p className="text-white/90 text-sm md:text-base font-medium bg-black/50 inline-block px-4 py-2 rounded-lg backdrop-blur-sm max-w-2xl truncate">
                     {alt}
                  </p>
               </div>
            </div>
         )}
      </>
   );
}