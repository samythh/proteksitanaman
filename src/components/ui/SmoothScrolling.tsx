// File: src/components/ui/SmoothScrolling.tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrolling() {
   useEffect(() => {
      // 1. Inisialisasi Lenis
      const lenis = new Lenis({
         duration: 1.2,
         easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
         orientation: "vertical",
         gestureOrientation: "vertical",
         smoothWheel: true,
         // PENTING: Matikan smooth scroll di HP (Touch Device)
         // Native scroll di HP sudah sangat bagus. Smooth scroll JS di HP sering terasa "berat" atau "laggy".
         touchMultiplier: 2,
      });

      // 2. Variable untuk menyimpan ID animasi agar bisa dibatalkan
      let rafId: number;

      // 3. Loop Animasi
      function raf(time: number) {
         lenis.raf(time);
         rafId = requestAnimationFrame(raf);
      }

      // Mulai loop
      rafId = requestAnimationFrame(raf);

      // 4. Cleanup (Pembersihan) saat unmount
      return () => {
         // Hentikan loop animasi DULUAN
         cancelAnimationFrame(rafId);
         // Baru hancurkan instance Lenis
         lenis.destroy();
      };
   }, []);

   return null;
}