// File: src/app/[locale]/not-found.tsx
"use client"; // ✅ Ubah jadi Client Component agar bisa baca params bahasa

import { useParams } from "next/navigation";
import ErrorState from "@/components/ui/ErrorState";

const DICTIONARY = {
   id: {
      title: "Halaman Tidak Ditemukan",
      desc: "Sepertinya Anda tersesat. Halaman yang Anda cari mungkin sudah dihapus, dipindahkan, atau tautan yang Anda tuju salah."
   },
   en: {
      title: "Page Not Found",
      desc: "It looks like you're lost. The page you are looking for might have been removed, renamed, or is temporarily unavailable."
   }
};

export default function NotFound() {
   const params = useParams();
   const locale = (params?.locale as "id" | "en") || "id";
   const t = DICTIONARY[locale] || DICTIONARY.id;

   return (
      <div className="container mx-auto px-4 mt-20">
         <ErrorState
            isNotFound={true}
            title={t.title}      // ✅ Teks Dinamis
            description={t.desc} // ✅ Teks Dinamis
         />
      </div>
   );
}