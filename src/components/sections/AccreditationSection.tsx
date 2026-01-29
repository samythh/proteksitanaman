"use client";

import PosterLightBox from "@/components/ui/PosterLightBox";
import { cn } from "@/lib/utils/cn";

export interface CertificateItemData {
   id: number;
   title: string;
   imageUrl: string;
}

interface AccreditationSectionProps {
   title: string;
   data: CertificateItemData[];
}

export default function AccreditationSection({ title, data }: AccreditationSectionProps) {
   if (!data || data.length === 0) return null;

   const count = data.length;

   const getGridConfig = (totalItems: number) => {
      if (totalItems === 1) return "grid-cols-1 max-w-md";
      if (totalItems === 2) return "grid-cols-1 md:grid-cols-2 max-w-4xl";
      if (totalItems === 3) return "grid-cols-1 md:grid-cols-3 max-w-6xl";
      if (totalItems === 4) return "grid-cols-2 md:grid-cols-4 max-w-7xl";
      return "grid-cols-2 md:grid-cols-3 lg:grid-cols-5 max-w-[1400px]";
   };

   const gridConfig = getGridConfig(count);

   return (
      <section className="bg-[#749F74] pb-12 md:pb-20 relative z-10">
         <div className="container mx-auto px-4 md:px-8 pt-40 -mt-20 text-center">

            <h2 className="text-2xl md:text-4xl font-bold text-white mb-10">
               {title || "Akreditasi"}
            </h2>

            <div className={cn(
               "grid gap-6 md:gap-8 items-start justify-center mx-auto",
               gridConfig
            )}>
               {data.map((cert) => (
                  <div key={cert.id} className="flex flex-col items-center gap-3 w-full">

                     <div className="w-full aspect-[4/3] relative">
                        <PosterLightBox
                           src={cert.imageUrl}
                           alt={cert.title}
                           className={cn(
                              "bg-white/10 border border-white/20 rounded-xl",
                              "shadow-md hover:shadow-2xl",
                              "transition-transform duration-300 ease-out",
                              "hover:scale-[1.03] will-change-transform", 
                              "p-3 w-full h-full object-contain"
                           )}
                        />
                     </div>

                     <p className="text-white font-medium text-sm md:text-base leading-tight px-1">
                        {cert.title}
                     </p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}