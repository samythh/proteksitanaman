// File: src/components/ui/SmoothScrolling.tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrolling() {
   useEffect(() => {
      // Inisialisasi Lenis
      const lenis = new Lenis({
         duration: 1.2, // Durasi scroll (semakin besar semakin lambat/halus)
         easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Kurva fisika (default yang enak)
         orientation: "vertical",
         gestureOrientation: "vertical",
         smoothWheel: true, // Aktifkan untuk mouse wheel
         // smoothTouch: false, // Biasanya dimatikan untuk layar sentuh (HP) agar tetap natural
         // touchMultiplier: 2,
      });

      // Loop animasi (Request Animation Frame)
      // Ini wajib agar Lenis berjalan sinkron dengan refresh rate layar
      function raf(time: number) {
         lenis.raf(time);
         requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      // Cleanup saat pindah halaman/unmount
      return () => {
         lenis.destroy();
      };
   }, []);

   return null; // Komponen ini tidak merender UI apa-apa
}