// File: src/components/ui/ErrorState.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation"; // ✅ Import ini
import { AlertTriangle, Home, RefreshCw, FileQuestion } from "lucide-react";

// Kamus kecil khusus tombol
const BTN_TEXT = {
   id: { retry: "Coba Lagi", home: "Kembali ke Beranda" },
   en: { retry: "Try Again", home: "Back to Home" }
};

interface ErrorStateProps {
   title: string;       // Wajib diisi (dikirim dari parent)
   description: string; // Wajib diisi (dikirim dari parent)
   code?: string;
   onRetry?: () => void;
   isNotFound?: boolean;
}

export default function ErrorState({
   title,
   description,
   code,
   onRetry,
   isNotFound = false,
}: ErrorStateProps) {

   // ✅ Deteksi bahasa untuk label tombol
   const params = useParams();
   const locale = (params?.locale as "id" | "en") || "id";
   const btn = BTN_TEXT[locale] || BTN_TEXT.id;

   return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-16 animate-in fade-in zoom-in duration-500">

         {/* Icon Wrapper */}
         <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm ${isNotFound ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'}`}>
            {isNotFound ? <FileQuestion size={48} /> : <AlertTriangle size={48} />}
         </div>

         <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {title}
         </h2>

         <p className="text-gray-500 max-w-md mb-8 leading-relaxed text-lg">
            {description}
         </p>

         {code && (
            <div className="bg-gray-100 border border-gray-200 p-4 rounded-lg text-xs font-mono text-left text-gray-600 mb-8 max-w-lg w-full overflow-x-auto">
               <span className="font-bold text-red-500">Error Detail:</span> {code}
            </div>
         )}

         <div className="flex flex-col sm:flex-row gap-4">
            {!isNotFound && onRetry && (
               <button
                  onClick={onRetry}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-[#005320] text-white rounded-full font-bold hover:bg-[#004218] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
               >
                  <RefreshCw size={20} />
                  {btn.retry} {/* ✅ Teks Tombol Dinamis */}
               </button>
            )}

            <Link
               href={`/${locale}`} // ✅ Redirect ke Home sesuai bahasa aktif
               className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold border transition-all hover:-translate-y-1 active:scale-95
            ${isNotFound
                     ? "bg-[#005320] text-white hover:bg-[#004218] shadow-lg"
                     : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-black shadow-sm"
                  }`}
            >
               <Home size={20} />
               {btn.home} {/* ✅ Teks Tombol Dinamis */}
            </Link>
         </div>
      </div>
   );
}