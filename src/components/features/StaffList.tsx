// File: src/components/features/StaffList.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import StaffCard from "./StaffCard";
import { Staff } from "@/types/staff";
import { getMoreStaff } from "@/lib/strapi/actions";
import { ImSpinner8 } from "react-icons/im";

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
   icons?: StaffIcons;
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
   // Hapus state page, ganti dengan Ref agar fungsi fetch STABIL
   const pageRef = useRef(initialMeta.pagination.page);

   const [hasMore, setHasMore] = useState(
      initialMeta.pagination.page < initialMeta.pagination.pageCount
   );
   const [isLoading, setIsLoading] = useState(false);

   const observer = useRef<IntersectionObserver | null>(null);

   // 1. FUNGSI FETCH YANG STABIL (Tidak bergantung pada state page)
   const fetchNextPage = useCallback(async () => {
      setIsLoading(true);

      // Ambil halaman berikutnya berdasarkan nilai Ref terakhir
      const nextPage = pageRef.current + 1;
      // console.log("Fetching page:", nextPage); // Debugging

      try {
         const res = await getMoreStaff(category, locale, nextPage);

         if (res.data && res.data.length > 0) {
            setStaffList((prev) => {
               // Filter duplikat ID agar aman
               const existingIds = new Set(prev.map((p) => p.id));
               const newItems = res.data.filter((d: Staff) => !existingIds.has(d.id));
               return [...prev, ...newItems];
            });

            // Update Ref halaman
            pageRef.current = nextPage;

            // Cek apakah masih ada halaman selanjutnya
            if (res.meta && nextPage >= res.meta.pagination.pageCount) {
               setHasMore(false);
            }
         } else {
            setHasMore(false);
         }
      } catch (error) {
         console.error("Error fetching staff:", error);
      } finally {
         setIsLoading(false);
      }
   }, [category, locale]); // Dependency sangat sedikit -> Sangat Stabil

   // 2. CALLBACK REF OBSERVER
   const lastElementRef = useCallback(
      (node: HTMLDivElement) => {
         // Jika sedang loading, jangan reset observer, biarkan saja
         if (isLoading) return;

         // Putus koneksi observer lama
         if (observer.current) observer.current.disconnect();

         // Buat observer baru
         observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
               // console.log("Intersecting! Trigger fetch..."); // Debugging
               fetchNextPage();
            }
         });

         if (node) observer.current.observe(node);
      },
      // Dependency: Hanya reset observer jika loading selesai atau status hasMore berubah
      // fetchNextPage sekarang stabil (tidak berubah-ubah), jadi aman dimasukkan sini
      [isLoading, hasMore, fetchNextPage]
   );

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

         {/* Loading Trigger & Indikator */}
         <div
            ref={lastElementRef}
            className="flex justify-center items-center w-full py-10 h-24 mt-4"
         >
            {isLoading && (
               <div className="flex flex-col items-center text-green-600 gap-2">
                  <ImSpinner8 className="animate-spin text-3xl" />
                  <span className="text-sm font-medium">Memuat lebih banyak...</span>
               </div>
            )}

            {/* Tombol Manual Load More (Backup jika scroll macet di browser tertentu) */}
            {!isLoading && hasMore && (
               <button
                  onClick={() => fetchNextPage()}
                  className="text-xs text-gray-400 hover:text-green-600 underline cursor-pointer"
               >
                  Muat lagi manual (jika macet)
               </button>
            )}

            {!hasMore && staffList.length > 0 && (
               <p className="text-gray-400 text-sm italic border-t border-gray-200 pt-4 px-4">
                  Semua data telah ditampilkan
               </p>
            )}
         </div>
      </>
   );
}