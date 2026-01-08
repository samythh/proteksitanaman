// File: src/components/AccessibilityWidget.tsx
"use client";

import Script from "next/script";

export default function AccessibilityWidget() {
   return (
      <Script
         id="aioa-adawidget"
         // Ini URL dari kode yang Anda berikan
         src="https://www.skynettechnologies.com/accessibility/js/all-in-one-accessibility-js-widget-minify.js?colorcode=#005320&token=null&position=bottom_right"

         // strategy="lazyOnload" artinya script ini akan dimuat belakangan 
         // agar tidak memperlambat loading awal website (mirip fungsi setTimeout 3000ms)
         strategy="lazyOnload"
      />
   ); 
}