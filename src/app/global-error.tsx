// File: src/app/global-error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
   error,
   reset,
}: {
   error: Error & { digest?: string };
   reset: () => void;
}) {
   useEffect(() => {
      console.error("💥 CRITICAL ROOT ERROR:", error);
   }, [error]);

   return (
      // [PERBAIKAN 1]: Menambahkan atribut lang="id"
      <html lang="id">
         <body className="bg-gray-50 text-gray-900 font-sans min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl text-center">
               <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     width="32"
                     height="32"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                  >
                     <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                     <line x1="12" y1="9" x2="12" y2="13" />
                     <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
               </div>

               <h2 className="text-2xl font-bold mb-2">Sistem Tidak Merespons</h2>
               <p className="text-gray-500 mb-8">
                  Terjadi kesalahan fatal pada struktur utama website. Silakan coba muat ulang.
               </p>

               {/* [PERBAIKAN 2]: Menggunakan fungsi reset() agar variabel terpakai */}
               <button
                  onClick={() => reset()}
                  className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
               >
                  Coba Pulihkan Halaman
               </button>

               {process.env.NODE_ENV === "development" && (
                  <div className="mt-8 p-4 bg-gray-100 rounded text-left overflow-auto max-h-40 text-xs font-mono text-red-600">
                     {error.message}
                  </div>
               )}
            </div>
         </body>
      </html>
   );
}