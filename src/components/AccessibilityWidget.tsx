// File: src/components/AccessibilityWidget.tsx
"use client";

import Script from "next/script";

export default function AccessibilityWidget() {
   const BASE_URL = "https://www.skynettechnologies.com/accessibility/js/all-in-one-accessibility-js-widget-minify.js";

   const colorCode = "FFFF00";

   const position = "bottom_right";

   const iconSize = "aioa-extra-small-icon";

   const iconType = "aioaicontype1";

   // Token (null jika free version)
   const token = process.env.NEXT_PUBLIC_AIOA_TOKEN || "null";

   const scriptSrc = `${BASE_URL}?colorcode=#${colorCode}&token=${token}&position=${position}.${iconType}&aioa_icon_size=${iconSize}`;

   return (
      <Script
         id="aioa-adawidget"
         src={scriptSrc}
         strategy="lazyOnload"
         onError={(e) => console.warn("⚠️ AIOA Widget Error:", e)}
      />
   );
}