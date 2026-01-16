// File: src/components/ui/PageHeader.tsx
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";

interface PageHeaderProps {
   title: string;
   breadcrumb: string;
   backgroundImageUrl?: string | null;
   sectionTitle?: string;    // Contoh: "Staf Akademik" (Judul Hitam)
   sectionSubtitle?: string; // Contoh: "Departemen..." (Judul Hijau)
}

export default function PageHeader({
   title,
   breadcrumb,
   backgroundImageUrl,
   sectionTitle,
   sectionSubtitle
}: PageHeaderProps) {

   const finalImage = getStrapiMedia(backgroundImageUrl || null);
   const hasBottomSection = sectionTitle || sectionSubtitle;

   return (
      <>
         {/* --- BAGIAN 1: HERO IMAGE (Tetap) --- */}
         <div className="relative h-[40vh] min-h-[300px] w-full bg-gray-900 overflow-hidden">
            {finalImage ? (
               <Image
                  src={finalImage}
                  alt={title}
                  fill
                  priority
                  className="object-cover opacity-60"
               />
            ) : (
               <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-100" />
            )}

            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4 mt-8 md:mt-16 z-10">
               <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-md">
                  {title}
               </h1>
               <p className="text-sm md:text-base opacity-90 font-medium tracking-wide lowercase">
                  {breadcrumb}
               </p>
            </div>
         </div>

         {/* --- BAGIAN 2: JUDUL SEKSI (Desain Lama Dikembalikan) --- */}
         {hasBottomSection && (
            <div className="container mx-auto px-4 mt-14 relative z-10">
               <div className="text-center mb-10">

                  {/* 1. Judul Hitam (Kembali ke atas) */}
                  {/* Class disamakan: text-2xl font-bold text-gray-800 */}
                  {sectionTitle && (
                     <h2 className="text-2xl font-bold text-gray-800">
                        {sectionTitle}
                     </h2>
                  )}

                  {/* 2. Sub-judul Hijau (Di bawah judul hitam) */}
                  {/* Class disamakan: text-xl font-medium text-green-600 mt-1 */}
                  {sectionSubtitle && (
                     <h3 className="text-xl font-medium text-green-600 mt-1">
                        {sectionSubtitle}
                     </h3>
                  )}

                  {/* 3. Garis Hijau (Paling bawah) */}
                  {/* Class disamakan: w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full mb-6 */}
                  <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full mb-6"></div>

               </div>
            </div>
         )}
      </>
   );
}