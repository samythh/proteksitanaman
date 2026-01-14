// File: src/components/features/StaffList.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import StaffCard from "./StaffCard";
import { Staff } from "@/types/staff";
import { getMoreStaff } from "@/lib/strapi/actions";
import { ImSpinner8 } from "react-icons/im";

// 1. DEFINISI TIPE ICONS (Pengganti any)
interface StaffIcons {
   sinta?: string;
   scopus?: string;
   scholar?: string;
}

interface StaffListProps {
   initialStaff: Staff[];
   category: string;
   locale: string;
   cardBannerUrl?: string;
   icons?: StaffIcons; // <--- Tipe data spesifik, bukan any
   initialMeta: {
      pagination: {
         page: number;
         pageCount: number;
      };
   };
}

export default function StaffList({
   initialStaff,
   category,
   locale,
   cardBannerUrl,
   icons,
   initialMeta,
}: StaffListProps) {
   const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(initialMeta.pagination.page < initialMeta.pagination.pageCount);
   const [isLoading, setIsLoading] = useState(false);

   // 2. PINDAHKAN loadMore KE ATAS & BUNGKUS DENGAN useCallback
   // Ini penting agar 'handleObserver' di bawah bisa membacanya tanpa error.
   const loadMore = useCallback(async () => {
      setIsLoading(true);
      const nextPage = page + 1;

      const res = await getMoreStaff(category, locale, nextPage);

      if (res.data.length > 0) {
         setStaffList((prev) => [...prev, ...res.data]);
         setPage(nextPage);

         if (res.meta && nextPage >= res.meta.pagination.pageCount) {
            setHasMore(false);
         }
      } else {
         setHasMore(false);
      }

      setIsLoading(false);
   }, [category, locale, page]); // Dependency array loadMore

   // 3. OBSERVER (Sekarang aman memanggil loadMore)
   const handleObserver = useCallback(
      (entries: IntersectionObserverEntry[]) => {
         const target = entries[0];
         if (target.isIntersecting && hasMore && !isLoading) {
            loadMore();
         }
      },
      [hasMore, isLoading, loadMore] // loadMore masuk sini agar ESLint senang
   );

   useEffect(() => {
      const option = {
         root: null,
         rootMargin: "20px",
         threshold: 0,
      };
      const observer = new IntersectionObserver(handleObserver, option);
      const loader = document.getElementById("loading-trigger");
      if (loader) observer.observe(loader);

      return () => {
         if (loader) observer.unobserve(loader);
      };
   }, [handleObserver]);

   return (
      <>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {staffList.map((staff, index) => (
               <StaffCard
                  key={`${staff.id}-${index}`}
                  data={staff}
                  globalBannerUrl={cardBannerUrl}
                  icons={icons}
                  locale={locale}
               />
            ))}
         </div>

         {/* Loading Trigger */}
         <div
            id="loading-trigger"
            className="flex justify-center items-center w-full py-10 h-20"
         >
            {isLoading && (
               <div className="flex flex-col items-center text-green-600 gap-2">
                  <ImSpinner8 className="animate-spin text-3xl" />
                  <span className="text-sm font-medium">Memuat data staf...</span>
               </div>
            )}

            {!hasMore && staffList.length > 0 && (
               <p className="text-gray-400 text-sm italic">Semua data telah ditampilkan</p>
            )}
         </div>
      </>
   );
}