// File: src/components/ui/PageHeader.tsx
import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";

interface PageHeaderProps {
   title: string;
   breadcrumb: string;
   backgroundImageUrl?: string | null; // Update tipe agar lebih fleksibel
}

export default function PageHeader({
   title,
   breadcrumb,
   backgroundImageUrl
}: PageHeaderProps) {

   // Pastikan input ke getStrapiMedia aman (string atau null)
   const finalImage = getStrapiMedia(backgroundImageUrl || null);

   return (
      <div className="relative h-[40vh] min-h-[300px] w-full bg-gray-900 overflow-hidden">
         {finalImage ? (
            <Image
               src={finalImage}
               alt="Page Header Background"
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

            {/* PERBAIKAN DI SINI: */}
            {/* Mengganti 'uppercase' menjadi 'lowercase' */}
            <p className="text-sm md:text-base opacity-90 font-medium tracking-wide lowercase">
               {breadcrumb}
            </p>
         </div>
      </div>
   );
}