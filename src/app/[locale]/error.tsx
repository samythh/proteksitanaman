// File: src/app/[locale]/error.tsx
"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import ErrorState from "@/components/ui/ErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // 1. Integrasi i18n
  // Mengambil teks dari namespace "Error" (server_error_title, dll)
  const t = useTranslations("Error");

  useEffect(() => {
    // 2. Logging
    // Di sinilah tempatnya jika Anda ingin mengirim error ke Sentry / LogRocket
    console.error("🚨 [Global Error Boundary]:", error);
  }, [error]);

  return (
    // Layout centering agar konsisten dengan Not Found page
    <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title={t("server_error_title")}
        description={t("server_error_desc")}
        onRetry={reset}

        // 3. Security & Debugging Logic 🛡️
        // - Development: Tampilkan pesan error asli biar gampang fix bug.
        // - Production: Tampilkan 'digest' (kode unik) agar user bisa lapor ("Error code: X82J"),
        //   tapi TIDAK membocorkan rahasia sistem/stack trace ke publik.
        code={
          process.env.NODE_ENV === "development"
            ? error.message
            : error.digest ? `Digest: ${error.digest}` : undefined
        }
      />
    </div>
  );
}