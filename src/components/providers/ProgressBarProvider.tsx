// File: src/components/providers/ProgressBarProvider.tsx 
"use client";

import NextTopLoader from "nextjs-toploader";

export default function ProgressBarProvider() {
   return (
      <NextTopLoader
         color="#fbbf24"       // Kuning (Kontras dengan Hijau)
         initialPosition={0.08}
         crawlSpeed={200}
         height={3}
         crawl={true}
         showSpinner={false}   // Matikan spinner jika ingin bersih
         easing="ease"
         speed={200}
         shadow="0 0 10px #fbbf24,0 0 5px #fbbf24"
         zIndex={99999}
      />
   );
}