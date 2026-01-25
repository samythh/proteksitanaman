// File: src/app/[locale]/error.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation"; // ✅ Import useParams
import ErrorState from "@/components/ui/ErrorState";

// --- KAMUS BAHASA ---
const DICTIONARY = {
  id: {
    title: "Oops! Ada Masalah Teknis",
    desc: "Sistem kami mengalami kendala saat memuat konten ini. Jangan khawatir, tim teknis kami bisa memperbaikinya.",
    btn: "Coba Lagi"
  },
  en: {
    title: "Oops! Something Went Wrong",
    desc: "Our system encountered an issue while loading this content. Don't worry, this is likely temporary.",
    btn: "Try Again"
  }
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  // Deteksi locale, default ke 'id' jika tidak terbaca
  const locale = (params?.locale as "id" | "en") || "id";
  const t = DICTIONARY[locale] || DICTIONARY.id;

  useEffect(() => {
    console.error("⚠️ Aplikasi Error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 mt-20">
      <ErrorState
        title={t.title}      // ✅ Teks Dinamis
        description={t.desc} // ✅ Teks Dinamis
        code={process.env.NODE_ENV === "development" ? error.message : undefined}
        onRetry={() => reset()}
      />
    </div>
  );
}