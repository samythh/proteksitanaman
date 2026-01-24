// File: src/components/sections/StatsSection.tsx
"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export interface StatItemData {
   id: number;
   label: string;
   value: string;
   iconUrl: string;
}

interface StatsSectionProps {
   title?: string;
   data: StatItemData[];
}

// --- SUB-COMPONENT: COUNTER ITEM ---
const CounterItem = ({ value }: { value: string }) => {
   const [count, setCount] = useState(0);
   const elementRef = useRef<HTMLSpanElement>(null);

   const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
   const suffix = value.replace(/[0-9]/g, "");

   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting) {
               let start = 0;
               const end = numericValue;
               const duration = 2000;
               const incrementTime = 20;
               const totalSteps = duration / incrementTime;
               const incrementValue = end / totalSteps;

               const timer = setInterval(() => {
                  start += incrementValue;
                  if (start >= end) {
                     setCount(end);
                     clearInterval(timer);
                  } else {
                     setCount(Math.ceil(start));
                  }
               }, incrementTime);

               if (elementRef.current) {
                  observer.unobserve(elementRef.current);
               }
            }
         },
         { threshold: 0.5 }
      );

      if (elementRef.current) {
         observer.observe(elementRef.current);
      }

      return () => {
         if (elementRef.current) {
            // eslint-disable-next-line
            observer.unobserve(elementRef.current);
         }
      };
   }, [numericValue]);

   if (numericValue === 0 && value !== "0") {
      return <span>{value}</span>;
   }

   return (
      <span ref={elementRef} className="tabular-nums">
         {count}
         {suffix}
      </span>
   );
};

// ✅ MAIN COMPONENT
export default function StatsSection({ data, title }: StatsSectionProps) {
   if (!data || data.length === 0) return null;

   return (
      <section className="relative z-20 px-4 md:px-8 lg:px-24 container mx-auto">
         {/* PERUBAHAN UTAMA DISINI (PADDING):
            - Sebelumnya: p-6 md:p-8
            - Sekarang: py-10 px-6 md:py-14 md:px-8 
            (py lebih besar dari px untuk membuat kesan lebih panjang vertikal)
         */}
         <div className="bg-gray-50 rounded-3xl shadow-xl py-10 px-6 md:py-14 md:px-8 -mt-28 border border-gray-100">

            <div className="text-center mb-8">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {title || "Fakta & Data"}
               </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200/50">
               {data.map((stat) => (
                  <div
                     key={stat.id}
                     className="flex flex-col items-center gap-2 pt-6 md:pt-0"
                  >
                     {/* Icon Container */}
                     <div className="relative w-10 h-10 md:w-11 md:h-11 mb-1">
                        {stat.iconUrl ? (
                           <Image
                              src={stat.iconUrl}
                              alt={stat.label}
                              fill
                              className="object-contain"
                           />
                        ) : (
                           <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-400">
                              No Icon
                           </div>
                        )}
                     </div>

                     {/* Angka Besar */}
                     <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                        <CounterItem value={stat.value} />
                     </span>

                     {/* Label */}
                     <span className="text-xs text-gray-500 font-medium leading-tight px-1">
                        {stat.label}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}  