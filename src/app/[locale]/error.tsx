// File: src/app/[locale]/error.tsx
"use client"; // Wajib use client untuk error boundary

import { useEffect } from "react";
import ErrorState from "@/components/ui/ErrorState";

export default function Error({
   error,
   reset,
}: {
   error: Error & { digest?: string };
   reset: () => void;
}) {
   useEffect(() => {
      // Di sini Anda bisa mengirim log error ke layanan analitik (Sentry, dll)
      console.error("⚠️ Aplikasi Error:", error);
   }, [error]);

   return (
      <div className="container mx-auto px-4 mt-20">
         <ErrorState
            title="Oops! Ada Masalah Teknis"
            description="Sistem kami mengalami kendala saat memuat konten ini. Jangan khawatir, tim teknis kami (Anda) bisa memperbaikinya."
            // Tampilkan detail error HANYA di mode development agar user tidak bingung
            code={process.env.NODE_ENV === "development" ? error.message : undefined}
            onRetry={
               // Fungsi reset mencoba me-render ulang segmen yang error
               () => reset()
            }
         />
      </div>
   );
}