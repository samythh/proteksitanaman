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
      // Log error ke console browser
      console.error("💥 [GlobalError] CRITICAL ROOT FAILURE:", error);
   }, [error]);

   return (
      <html lang="en">
         <body className="bg-gray-50 text-gray-900 font-sans min-h-screen flex items-center justify-center p-4">

            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl text-center border border-gray-200">

               {/* Icon Error */}
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

               <h2 className="text-2xl font-extrabold mb-2 text-gray-900">
                  Critical System Error
               </h2>
               <p className="text-gray-500 mb-1 font-medium">
                  Terjadi Kesalahan Sistem
               </p>

               <div className="text-gray-500 mb-8 text-sm leading-relaxed">
                  <p>The application has encountered a fatal error and cannot recover.</p>
                  <p className="mt-1 italic text-gray-400">(Aplikasi mengalami kesalahan fatal dan tidak dapat dipulihkan)</p>
               </div>

               {/* Debug Info */}
               {error.digest && (
                  <div className="bg-gray-100 p-3 rounded-lg text-xs font-mono text-gray-600 mb-6 border border-gray-200 break-all">
                     <span className="font-bold block mb-1 text-gray-400 uppercase tracking-wider">Error Reference:</span>
                     {error.digest}
                  </div>
               )}

               <button
                  onClick={() => reset()}
                  className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                  Reload / Muat Ulang
               </button>
            </div>

         </body>
      </html>
   );
}