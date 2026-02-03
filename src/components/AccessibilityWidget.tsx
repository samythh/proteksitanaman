// File: src/components/AccessibilityWidget.tsx
"use client";

import { useEffect } from "react";

export default function AccessibilityWidget() {
   useEffect(() => {
      // 1. Cek apakah script sudah ada (mencegah duplikasi saat re-render)
      if (document.getElementById("aioa-adawidget")) return;

      // 2. Gunakan setTimeout untuk menunda loading selama 3 detik
      const timer = setTimeout(() => {
         // --- KONFIGURASI ---
         const BASE_URL = "https://www.skynettechnologies.com/accessibility/js/all-in-one-accessibility-js-widget-minify.js";
         const colorCode = "#005320";
         const position = "bottom_right";
         const token = process.env.NEXT_PUBLIC_AIOA_TOKEN || "null";

         // Membuat elemen script secara manual
         const script = document.createElement("script");
         script.src = `${BASE_URL}?colorcode=${encodeURIComponent(colorCode)}&token=${token}&position=${position}`;
         script.id = "aioa-adawidget";
         script.defer = true; // Sesuai request Anda

         // Menambahkan script ke dalam body
         document.body.appendChild(script);

      }, 3000); // Delay 3000ms (3 detik)

      // 3. Cleanup function (membersihkan timer jika user pindah halaman sebelum 3 detik)
      return () => clearTimeout(timer);
   }, []);

   // Komponen ini tidak me-render elemen visual apapun di DOM, hanya logic
   return null;
}