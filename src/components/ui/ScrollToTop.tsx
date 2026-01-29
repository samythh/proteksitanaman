// File: src/components/ui/ScrollToTop.tsx
"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn"; 

export default function ScrollToTop() {
   const [isVisible, setIsVisible] = useState(false);
   const t = useTranslations("UI"); // Ambil teks dari namespace UI

   // Fungsi toggle visibilitas
   const toggleVisibility = () => {
      if (window.scrollY > 300) {
         setIsVisible(true);
      } else {
         setIsVisible(false);
      }
   };

   // Fungsi scroll smooth
   const scrollToTop = () => {
      window.scrollTo({
         top: 0,
         behavior: "smooth",
      });
   };

   useEffect(() => {
      window.addEventListener("scroll", toggleVisibility);
      return () => {
         window.removeEventListener("scroll", toggleVisibility);
      };
   }, []);

   return (
      <button
         type="button"
         onClick={scrollToTop}
         aria-label={t("scroll_top")}
         className={cn(
            // 1. Base Styles
            "fixed bottom-24 right-6 z-40 p-3 rounded-full shadow-lg border-2 transition-all duration-300 transform",

            // 2. Color Styles (Sesuai request: Hijau Pucat)
            "bg-[#749F74] border-[#749F74] text-white hover:bg-white hover:text-[#749F74]",

            // 3. Conditional Visibility (Logic opacity & pointer)
            isVisible
               ? "opacity-100 translate-y-0 pointer-events-auto"
               : "opacity-0 translate-y-10 pointer-events-none"
         )}
      >
         <ChevronUp size={24} strokeWidth={3} />
      </button>
   );
}