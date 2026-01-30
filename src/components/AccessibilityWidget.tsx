// File: src/components/AccessibilityWidget.tsx
"use client";

import Script from "next/script";

export default function AccessibilityWidget() {
   // --- KONFIGURASI ---
   const BASE_URL = "https://www.skynettechnologies.com/accessibility/js/all-in-one-accessibility-js-widget-minify.js";
   
   // Warna disesuaikan dengan Brand Identity (#005320)
   const colorCode = "#005320";
   
   // Posisi widget (bottom_right, bottom_left, top_right, top_left)
   const position = "bottom_right";
   
   // Token: Ambil dari .env jika ada, atau 'null' untuk versi gratis
   const token = process.env.NEXT_PUBLIC_AIOA_TOKEN || "null";

   // Construct URL yang bersih
   const scriptSrc = `${BASE_URL}?colorcode=${encodeURIComponent(colorCode)}&token=${token}&position=${position}`;

   return (
      <Script
         id="aioa-adawidget"
         src={scriptSrc}
         
         // ⚡ PERFORMANCE OPTIMIZATION
         // lazyOnload: Script dimuat saat browser idle (tidak sibuk).
         // Ini menjamin skor Lighthouse/PageSpeed tetap hijau (100).
         strategy="lazyOnload"
         
         // 🛡️ ERROR HANDLING
         // Berguna untuk debugging jika widget tiba-tiba tidak muncul
         onError={(e) => {
            console.warn("⚠️ [AccessibilityWidget] Gagal memuat script pihak ketiga:", e);
         }}
      />
   ); 
}