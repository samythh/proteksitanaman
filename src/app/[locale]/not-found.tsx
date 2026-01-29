// File: src/app/[locale]/not-found.tsx
"use client";

import { useTranslations } from "next-intl";
import ErrorState from "@/components/ui/ErrorState";

export default function NotFound() {
   // 1. Integrasi i18n
   // Kita panggil namespace "Error" yang sudah kita buat di JSON.
   // Tidak perlu manual baca params locale, hook ini sudah pintar.
   const t = useTranslations("Error");

   return (
      // Container dibuat fleksibel agar ErrorState berada di tengah vertikal
      <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
         <ErrorState
            isNotFound={true}
            // Ambil teks dari messages/id.json
            title={t("not_found_title")}
            description={t("not_found_desc")}
         />
      </div>
   );
}