// File: src/components/ui/ScrollToTop.tsx
"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
   const [isVisible, setIsVisible] = useState(false);

   // Fungsi untuk toggle visibilitas berdasarkan posisi scroll
   const toggleVisibility = () => {
      if (window.scrollY > 300) {
         setIsVisible(true);
      } else {
         setIsVisible(false);
      }
   };

   // Fungsi untuk scroll ke atas dengan smooth
   const scrollToTop = () => {
      window.scrollTo({
         top: 0,
         behavior: "smooth",
      });
   };

   useEffect(() => {
      window.addEventListener("scroll", toggleVisibility);
      // Bersihkan listener saat komponen di-unmount
      return () => {
         window.removeEventListener("scroll", toggleVisibility);
      };
   }, []);

   return (
      <button
         onClick={scrollToTop}
         aria-label="Scroll to top"
         // PERUBAHAN STYLE:
         // 1. 'bottom-24': Geser ke atas (sekitar 96px dari bawah) agar tidak menutupi widget lain
         // 2. 'bg-[#749F74]': Warna hijau pucat sesuai box berita
         // 3. 'hover:text-[#749F74]': Warna teks saat di-hover menyesuaikan
         className={`fixed bottom-24 right-6 z-50 p-3 rounded-full shadow-lg border-2 transition-all duration-300 transform ${isVisible
               ? "opacity-100 translate-y-0 pointer-events-auto"
               : "opacity-0 translate-y-10 pointer-events-none"
            } bg-[#749F74] border-[#749F74] text-white hover:bg-white hover:text-[#749F74]`}
      >
         <ChevronUp size={24} strokeWidth={3} />
      </button>
   );
}