// File: src/components/sections/VisitorStats.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { BarChart3, CalendarDays, CalendarRange, Globe, Loader2, LucideIcon } from "lucide-react";

export interface VisitorStatsData {
   title: string;
   backgroundPatternUrl?: string;
   today?: number;
   this_week?: number;
   this_month?: number;
   all_time?: number;
}

interface VisitorStatsProps {
   data: VisitorStatsData;
}

type StatConfig = {
   label: string;
   icon: LucideIcon;
   color: string;
   bg: string;
   key: keyof VisitorStatsData;
};

const STATS_CONFIG: StatConfig[] = [
   { label: "Hari Ini", key: "today", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
   { label: "Minggu Ini", key: "this_week", icon: CalendarDays, color: "text-green-600", bg: "bg-green-50" },
   { label: "Bulan Ini", key: "this_month", icon: CalendarRange, color: "text-orange-600", bg: "bg-orange-50" },
   { label: "Total Kunjungan", key: "all_time", icon: Globe, color: "text-purple-600", bg: "bg-purple-50" },
];

// --- SUB-COMPONENT: COUNTER ITEM KHUSUS ANGKA ---
// Menerima input number, bukan string
const CounterItem = ({ value }: { value: number }) => {
   const [count, setCount] = useState(0);
   const elementRef = useRef<HTMLSpanElement>(null);

   useEffect(() => {
      // Jangan jalankan animasi jika value 0 atau negatif (kecuali memang datanya 0)
      if (value < 0) return;

      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting) {
               // Logika Animasi
               let start = 0;
               const end = value;
               // Durasi animasi (2 detik), sesuaikan jika ingin lebih cepat/lambat
               const duration = 2000;
               const incrementTime = 20;

               const totalSteps = duration / incrementTime;
               const incrementValue = end / totalSteps;

               const timer = setInterval(() => {
                  start += incrementValue;
                  // Jika sudah mencapai target, set ke angka akhir agar presisi
                  if (start >= end) {
                     setCount(end);
                     clearInterval(timer);
                  } else {
                     setCount(Math.ceil(start));
                  }
               }, incrementTime);

               // Unobserve agar animasi hanya jalan sekali
               if (elementRef.current) {
                  observer.unobserve(elementRef.current);
               }
            }
         },
         { threshold: 0.5 } // Trigger saat 50% elemen terlihat
      );

      if (elementRef.current) {
         observer.observe(elementRef.current);
      }

      return () => {
         if (elementRef.current) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            observer.unobserve(elementRef.current);
         }
      };
   }, [value]); // Jalankan ulang effect jika value berubah (misal setelah fetch API selesai)

   return (
      <span ref={elementRef} className="tabular-nums">
         {/* Format angka ke format Indonesia (contoh: 1.000) */}
         {count.toLocaleString('id-ID')}
      </span>
   );
};

export default function VisitorStats({ data: initialData }: VisitorStatsProps) {
   const [stats, setStats] = useState<VisitorStatsData>({
      title: initialData.title,
      backgroundPatternUrl: initialData.backgroundPatternUrl || "/images/pattern-batik-besar.png",
      today: initialData.today || 0,
      this_week: initialData.this_week || 0,
      this_month: initialData.this_month || 0,
      all_time: initialData.all_time || 0,
   });

   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const trackVisitor = async () => {
         try {
            const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
            const res = await fetch(`${apiUrl}/api/visitor-stats/track`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
               const liveData = await res.json();
               setStats((prev) => ({
                  ...prev,
                  today: liveData.today,
                  this_week: liveData.this_week,
                  this_month: liveData.this_month,
                  all_time: liveData.all_time,
               }));
            }
         } catch (error) {
            console.error("Tracking error:", error);
         } finally {
            setIsLoading(false);
         }
      };

      trackVisitor();
   }, []);

   if (!initialData) return null;

   return (
      <section className="relative pb-24">

         {/* BACKGROUND PATTERN (DILUAR CARD) */}
         <div className="absolute bottom-0 left-0 w-full h-[75%] pointer-events-none -z-10">
            <div className="relative w-full h-full">
               <Image
                  src={stats.backgroundPatternUrl || "/images/pattern-batik-besar.png"}
                  alt="Pattern Background"
                  fill
                  className="object-cover object-bottom"
               />
            </div>
         </div>

         <div className="container mx-auto px-6 md:px-12 lg:px-32 relative z-10">

            <div className="-mt-24 md:-mt-32 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 md:p-12 border border-gray-100 relative">

               {/* Header Judul */}
               <div className="text-center mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                     {stats.title || "Statistik Kunjungan"}
                     {isLoading && <Loader2 className="animate-spin text-blue-500 w-5 h-5" />}
                  </h2>
                  <div className="w-16 h-1 bg-blue-500 mx-auto mt-4 rounded-full"></div>
               </div>

               {/* Grid Item Statistik */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200/50">
                  {STATS_CONFIG.map((config, idx) => {
                     const value = stats[config.key] as number;
                     return (
                        <div key={idx} className="flex flex-col items-center gap-2 pt-4 md:pt-0 group">
                           <div className={`mb-3 p-3 rounded-full ${config.bg} ${config.color} transform transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                              <config.icon size={28} />
                           </div>

                           {/* BAGIAN ANIMASI ANGKA */}
                           <span className="text-3xl md:text-4xl font-extrabold text-gray-900 transition-all duration-500">
                              {/* Jika value 0 (belum fetch/memang 0), tetap tampilkan 0 dengan animasi */}
                              <CounterItem value={value || 0} />
                           </span>

                           <span className="text-sm md:text-base text-gray-500 font-medium uppercase tracking-wide">
                              {config.label}
                           </span>
                        </div>
                     );
                  })}
               </div>

            </div>
         </div>
      </section>
   );
}