// File: src/components/AccessibilityWidget.tsx
"use client";

import Script from "next/script";

export default function AccessibilityWidget() {
   // --- KONFIGURASI STANDAR ---
   const BASE_URL = "https://www.skynettechnologies.com/accessibility/js/all-in-one-accessibility-js-widget-minify.js";

   const colorCode = "#005320";

   const position = "bottom_right";

   const token = process.env.NEXT_PUBLIC_AIOA_TOKEN || "null";

   const scriptSrc = `${BASE_URL}?colorcode=${encodeURIComponent(colorCode)}&token=${token}&position=${position}`;

   return (
      <Script
         id="aioa-adawidget"
         src={scriptSrc}
         strategy="lazyOnload"
         onError={(e) => console.warn("⚠️ AIOA Widget Error:", e)}
      />
   );
}