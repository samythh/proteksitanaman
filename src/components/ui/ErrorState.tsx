// File: src/components/ui/ErrorState.tsx
"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, FileQuestion } from "lucide-react";

interface ErrorStateProps {
   title?: string;
   description?: string;
   code?: string; // Untuk debugging (tampil di mode dev)
   onRetry?: () => void;
   isNotFound?: boolean;
}

export default function ErrorState({
   title = "Terjadi Kesalahan",
   description = "Maaf, kami tidak dapat memproses permintaan Anda saat ini.",
   code,
   onRetry,
   isNotFound = false,
}: ErrorStateProps) {
   return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-16 animate-in fade-in zoom-in duration-500">
         {/* Icon Wrapper */}
         <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm ${isNotFound ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500'}`}>
            {isNotFound ? (
               <FileQuestion size={48} />
            ) : (
               <AlertTriangle size={48} />
            )}
         </div>

         {/* Text Content */}
         <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4">
            {title}
         </h2>

         <p className="text-gray-500 max-w-md mb-8 leading-relaxed text-lg">
            {description}
         </p>

         {/* Developer Debug Code (Hanya muncul jika props code diisi) */}
         {code && (
            <div className="bg-gray-100 border border-gray-200 p-4 rounded-lg text-xs font-mono text-left text-gray-600 mb-8 max-w-lg w-full overflow-x-auto">
               <span className="font-bold text-red-500">Error Detail:</span> {code}
            </div>
         )}

         {/* Action Buttons */}
         <div className="flex flex-col sm:flex-row gap-4">
            {/* Tombol Retry (Hanya jika bukan 404 dan fungsi onRetry ada) */}
            {!isNotFound && onRetry && (
               <button
                  onClick={onRetry}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-[#005320] text-white rounded-full font-bold hover:bg-[#004218] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
               >
                  <RefreshCw size={20} />
                  Coba Lagi
               </button>
            )}

            {/* Tombol Home */}
            <Link
               href="/"
               className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-bold border transition-all hover:-translate-y-1 active:scale-95
            ${isNotFound
                     ? "bg-[#005320] text-white hover:bg-[#004218] shadow-lg"
                     : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-black shadow-sm"
                  }`}
            >
               <Home size={20} />
               Kembali ke Beranda
            </Link>
         </div>
      </div>
   );
}