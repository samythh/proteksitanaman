// File: src/app/loading.tsx
export default function Loading() {
   return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="relative">
            {/* Lingkaran Luar */}
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#005320] rounded-full animate-spin"></div>
            {/* Logo Kecil di Tengah (Opsional) */}
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
         </div>
      </div>
   );
}