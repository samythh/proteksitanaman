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

// Konfigurasi Warna & Icon Modern
const STATS_CONFIG: StatConfig[] = [
   { label: "Hari Ini", key: "today", icon: BarChart3, color: "text-[#005320]", bg: "bg-green-50" },
   { label: "Minggu Ini", key: "this_week", icon: CalendarDays, color: "text-blue-600", bg: "bg-blue-50" },
   { label: "Bulan Ini", key: "this_month", icon: CalendarRange, color: "text-orange-600", bg: "bg-orange-50" },
   { label: "Total Kunjungan", key: "all_time", icon: Globe, color: "text-purple-600", bg: "bg-purple-50" },
];

// --- SUB-COMPONENT: COUNTER ITEM (ANIMASI ANGKA) ---
const CounterItem = ({ value }: { value: number }) => {
   const [count, setCount] = useState(0);
   const elementRef = useRef<HTMLSpanElement>(null);

   useEffect(() => {
      const node = elementRef.current;
      if (!node || value < 0) return;

      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting) {
               const end = value;
               const duration = 2000;
               const startTime = performance.now();

               const animate = (currentTime: number) => {
                  const elapsedTime = currentTime - startTime;
                  const progress = Math.min(elapsedTime / duration, 1);
                  // Easing: easeOutQuart
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
      return () => observer.disconnect();
   }, [value]);

   return (
      <span ref={elementRef} className="tabular-nums">
         {count.toLocaleString('id-ID')}
      </span>
   );
};

export default function VisitorStats({ data: initialData }: VisitorStatsProps) {
   const [stats, setStats] = useState<VisitorStatsData>({
      title: initialData?.title || "Statistik Pengunjung",
      backgroundPatternUrl: initialData?.backgroundPatternUrl || "/images/pattern-batik-besar.png",
      today: initialData?.today || 0,
      this_week: initialData?.this_week || 0,
      this_month: initialData?.this_month || 0,
      all_time: initialData?.all_time || 0,
   });

   const [isLoading, setIsLoading] = useState(true);
   const hasTracked = useRef(false);

   // Tracking Logic (Client-Side)
   useEffect(() => {
      if (hasTracked.current) return;
      hasTracked.current = true;

      const trackVisitor = async () => {
         try {
            const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";
            const res = await fetch(`${apiUrl}/api/visitor-stats/track`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
               const liveData = await res.json();
               if (liveData) {
                  setStats((prev) => ({
                     ...prev,
                     today: liveData.today,
                     this_week: liveData.this_week,
                     this_month: liveData.this_month,
                     all_time: liveData.all_time,
                  }));
               }
            }
         } catch (error) {
            console.error("Tracking failed:", error);
         } finally {
            setIsLoading(false);
         }
      };

      trackVisitor();
   }, []);

   if (!initialData) return null;

   return (
      <section className="relative pb-24 font-sans">

         {/* BACKGROUND PATTERN (FIXED: Tanpa Opacity) */}
         <div className="absolute bottom-0 left-0 w-full h-[75%] pointer-events-none -z-10">
            <div className="relative w-full h-full">
               {stats.backgroundPatternUrl && (
                  <Image
                     src={stats.backgroundPatternUrl}
                     alt="Pattern Background"
                     fill
                     className="object-cover object-bottom"
                     priority
                  />
               )}
            </div>
         </div>

         <div className="container mx-auto px-6 md:px-12 lg:px-32 relative z-10">

            {/* STATS CARD */}
            <div className="-mt-24 md:-mt-32 bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 border border-gray-100 relative overflow-hidden">

               {/* Dekorasi Halus */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

               {/* Header Judul */}
               <div className="text-center mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                     {stats.title}
                     {isLoading && <Loader2 className="animate-spin text-[#005320] w-5 h-5" />}
                  </h2>
                  <div className="w-16 h-1.5 bg-[#005320] mx-auto mt-4 rounded-full opacity-80"></div>
               </div>

               {/* Grid Item Statistik */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  {STATS_CONFIG.map((config, idx) => {
                     const value = stats[config.key] as number;

                     return (
                        <div key={idx} className="flex flex-col items-center gap-3 pt-6 md:pt-0 group">
                           {/* Icon with Hover Effect */}
                           <div className={`
                              mb-2 p-4 rounded-2xl ${config.bg} ${config.color} 
                              transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-md
                           `}>
                              <config.icon size={28} strokeWidth={1.5} />
                           </div>

                           {/* Animated Number */}
                           <span className="text-3xl md:text-4xl font-extrabold text-gray-900 transition-colors group-hover:text-[#005320]">
                              <CounterItem value={value || 0} />
                           </span>

                           {/* Label */}
                           <span className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">
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