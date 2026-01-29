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
      const node = elementRef.current;
      if (!node) return;

      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting) {
               const end = numericValue;
               const duration = 2000;
               const startTime = performance.now();

               const animate = (currentTime: number) => {
                  const elapsedTime = currentTime - startTime;
                  const progress = Math.min(elapsedTime / duration, 1);
                  const easeProgress = 1 - Math.pow(1 - progress, 4);

                  setCount(Math.floor(easeProgress * end));

                  if (progress < 1) {
                     requestAnimationFrame(animate);
                  } else {
                     setCount(end);
                  }
               };

               requestAnimationFrame(animate);
               observer.unobserve(node);
            }
         },
         { threshold: 0.5 }
      );

      observer.observe(node);

      return () => {
         observer.disconnect();
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

// --- MAIN COMPONENT ---
export default function StatsSection({ data, title }: StatsSectionProps) {
   if (!data || data.length === 0) return null;

   return (
      <section className="relative z-20 px-4 md:px-8 lg:px-24 container mx-auto">

         {/* CARD CONTAINER */}
         <div className="bg-white rounded-[2rem] shadow-xl py-12 px-6 md:px-12 -mt-24 border border-gray-100 relative overflow-hidden">

            {/* Dekorasi Background Halus */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Title */}
            <div className="text-center mb-10 relative z-10">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {title || "Fakta & Data"}
               </h2>
               <div className="h-1 w-16 bg-[#005320] mx-auto rounded-full mt-3 opacity-20"></div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10 gap-x-4 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100 relative z-10">
               {data.map((stat) => (
                  <div
                     key={stat.id}
                     className="flex flex-col items-center gap-2 pt-6 md:pt-0 first:pt-0 md:first:pt-0"
                  >
                     {/* 
                        Mobile: w-10 h-10 (40px)
                        Desktop: w-14 h-14 (56px)
                     */}
                     <div className="relative w-10 h-10 md:w-14 md:h-14 mb-2 flex items-center justify-center">
                        {stat.iconUrl ? (
                           <Image
                              src={stat.iconUrl}
                              alt={stat.label}
                              fill
                              className="object-contain"
                           />
                        ) : (
                           <span className="text-2xl text-green-700">★</span>
                        )}
                     </div>

                     {/* Angka */}
                     <span className="text-3xl md:text-4xl font-extrabold text-[#005320] leading-none tracking-tight">
                        <CounterItem value={stat.value} />
                     </span>

                     {/* Label */}
                     <span className="text-sm text-gray-500 font-medium px-2 leading-tight">
                        {stat.label}
                     </span>
                  </div>
               ))}
            </div>

         </div>
      </section>
   );
}