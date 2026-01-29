// File: src/components/features/StaffList.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import StaffCard from "./StaffCard";
import { Staff } from "@/types/staff";
import { getMoreStaff } from "@/lib/strapi/actions";
import { ImSpinner8 } from "react-icons/im";
import { useTranslations } from "next-intl";

// 1. Definisi Tipe Icons
interface StaffIcons {
   sinta?: string;
   scopus?: string;
   scholar?: string;
}

// 2. Props Interface
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
   // 2. Inisialisasi Hook Translasi
   const t = useTranslations("StaffList");

   // --- STATE ---
   const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
   const [hasMore, setHasMore] = useState(
      initialMeta.pagination.page < initialMeta.pagination.pageCount
   );
   const [isLoading, setIsLoading] = useState(false);

   // --- REFS ---
   const pageRef = useRef(1);
   const observer = useRef<IntersectionObserver | null>(null);

   // --- FETCH FUNCTION ---
   const fetchNextPage = useCallback(async () => {
      if (isLoading || !hasMore) return;

      setIsLoading(true);
      const nextPage = pageRef.current + 1;

      try {
         const res = await getMoreStaff(category, locale, nextPage);

         if (res.data && res.data.length > 0) {
            setStaffList((prev) => {
               const existingIds = new Set(prev.map((p) => p.id));
               const newItems = (res.data as unknown as Staff[]).filter(
                  (d) => !existingIds.has(d.id)
               );
               return [...prev, ...newItems];
            });

            pageRef.current = nextPage;

            if (res.meta && nextPage >= res.meta.pagination.pageCount) {
               setHasMore(false);
            }
         } else {
            setHasMore(false);
         }
      } catch (error) {
         console.error("Error fetching next page:", error);
      } finally {
         setIsLoading(false);
      }
   }, [category, locale, hasMore, isLoading]);

   // --- OBSERVER LOGIC ---
   const lastElementRef = useCallback(
      (node: HTMLDivElement) => {
         if (isLoading) return;
         if (observer.current) observer.current.disconnect();

         observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
               fetchNextPage();
            }
         });

         if (node) observer.current.observe(node);
      },
      [isLoading, hasMore, fetchNextPage]
   );

   return (
      <div className="flex flex-col gap-8">
         {/* LIST GRID */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
            {staffList.map((staff, index) => (
               <StaffCard
                  key={`${staff.id}-${index}`}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  data={staff as any}
                  globalBannerUrl={cardBannerUrl}
                  icons={icons}
                  locale={locale}
               />
            ))}
         </div>

         {/* LOADING TRIGGER AREA */}
         <div
            ref={lastElementRef}
            className="flex justify-center items-center w-full py-10 h-24 mt-4"
         >
            {isLoading && (
               <div className="flex flex-col items-center text-green-600 gap-2">
                  <ImSpinner8 className="animate-spin text-3xl" />
                  {/* 3. Gunakan variable t() */}
                  <span className="text-sm font-medium">{t('loading_more')}</span>
               </div>
            )}

            {!isLoading && hasMore && (
               <div className="h-4 w-full opacity-0"></div>
            )}

            {!hasMore && staffList.length > 0 && (
               <p className="text-gray-400 text-sm italic border-t border-gray-200 pt-4 px-4 mt-4">
                  {/* 4. Gunakan variable t() dengan parameter count */}
                  {t('all_loaded', { count: staffList.length })}
               </p>
            )}
         </div>
      </div>
   );
}