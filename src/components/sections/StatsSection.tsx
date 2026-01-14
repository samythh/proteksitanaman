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
   data: StatItemData[];
}

// --- SUB-COMPONENT: COUNTER ITEM ---
// Komponen kecil untuk menangani logika animasi per angka
const CounterItem = ({ value }: { value: string }) => {
   const [count, setCount] = useState(0);
   const elementRef = useRef<HTMLSpanElement>(null);

   // Pisahkan angka dan teks non-angka (misal: "150+" -> angka: 150, suffix: "+")
   // Regex ini mengambil angka pertama yang ditemukan
   const numericValue = parseInt(value.replace(/\D/g, "")) || 0;
   // Suffix adalah sisa string setelah angka dihapus (opsional, untuk kasus format kompleks)
   const suffix = value.replace(/[0-9]/g, "");

   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting) {
               // --- MULAI ANIMASI ---
               let start = 0;
               const end = numericValue;
               const duration = 2000; // Durasi animasi dalam milidetik (2 detik)
               const incrementTime = 20; // Update setiap 20ms

               // Hitung berapa langkah yang dibutuhkan
               const totalSteps = duration / incrementTime;
               const incrementValue = end / totalSteps;

               const timer = setInterval(() => {
                  start += incrementValue;
                  if (start >= end) {
                     setCount(end); // Pastikan angka akhir akurat
                     clearInterval(timer);
                  } else {
                     setCount(Math.ceil(start));
                  }
               }, incrementTime);

               // Hentikan observasi setelah animasi dimulai agar tidak berulang
               if (elementRef.current) {
                  observer.unobserve(elementRef.current);
               }
            }
         },
         { threshold: 0.5 } // Animasi mulai saat 50% elemen terlihat
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

   // Jika value aslinya tidak mengandung angka (misal teks doang), tampilkan langsung
   if (numericValue === 0 && value !== "0") {
      return <span>{value}</span>;
   }

   return (
      <span ref={elementRef} className="tabular-nums">
         {/* Tampilkan angka yang sedang berjalan + suffix aslinya */}
         {count}
         {suffix}
      </span>
   );
};

export default function StatsSection({ data }: StatsSectionProps) {
   if (!data || data.length === 0) return null;

   return (
      <section className="relative z-20 px-6 md:px-12 lg:px-32 container mx-auto">
         {/* Container Utama:
          - rounded-3xl: Sudut membulat modern
          - -mt-28: Margin negatif untuk efek melayang menumpuk section sebelumnya
      */}
         <div className="bg-gray-50 rounded-3xl shadow-xl p-8 md:p-12 -mt-28 border border-gray-100">

            <div className="text-center mb-10">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Fakta & Data
               </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200/50">
               {data.map((stat) => (
                  <div
                     key={stat.id}
                     className="flex flex-col items-center gap-2 pt-4 md:pt-0"
                  >
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

                     {/* Angka Bold dengan Animasi */}
                     <span className="text-3xl md:text-4xl font-extrabold text-gray-900">
                        {/* Panggil Component CounterItem di sini */}
                        <CounterItem value={stat.value} />
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