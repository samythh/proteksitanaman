// File: src/components/sections/StatsSection.tsx
"use client";

import Image from "next/image";

export interface StatItemData {
   id: number;
   label: string;
   value: string;
   iconUrl: string;
}

interface StatsSectionProps {
   data: StatItemData[];
}

export default function StatsSection({ data }: StatsSectionProps) {
   if (!data || data.length === 0) return null;

   return (
      <section className="relative z-20 px-6 md:px-12 lg:px-32 container mx-auto">

         {/* PERBAIKAN: 
                - rounded-3xl: Agar sudutnya melengkung (rounded)
                - -mt-28: Tetap mempertahankan posisi melayang ke atas
            */}
         <div className="bg-gray-50 rounded-3xl shadow-xl p-8 md:p-12 -mt-28 border border-gray-100">

            <div className="text-center mb-10">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Fakta & Data</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200/50">
               {data.map((stat) => (
                  <div key={stat.id} className="flex flex-col items-center gap-2 pt-4 md:pt-0">

                     {/* Icon */}
                     <div className="relative w-12 h-12 mb-2">
                        {stat.iconUrl ? (
                           <Image
                              src={stat.iconUrl}
                              alt={stat.label}
                              fill
                              className="object-contain"
                           />
                        ) : (
                           <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-400">
                              No Icon
                           </div>
                        )}
                     </div>

                     {/* Angka Bold */}
                     <span className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        {stat.value}
                     </span>

                     {/* Label Kecil */}
                     <span className="text-sm md:text-base text-gray-500 font-medium">
                        {stat.label}
                     </span>
                  </div>
               ))}
            </div>

         </div>
      </section>
   );
}