// File: src/components/features/StaffFilter.tsx
"use client";

import Link from "next/link";

interface StaffFilterProps {
  currentCategory: string;
  locale: string;
}

// --- KONFIGURASI MENU ---
// Memudahkan penambahan menu baru tanpa mengotak-atik JSX
const FILTER_ITEMS = [
  { key: "akademik", label: "Staf Akademik" },
  { key: "administrasi", label: "Staf Administrasi" },
];

export default function StaffFilter({
  currentCategory,
  locale,
}: StaffFilterProps) {

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 mb-12">
      {FILTER_ITEMS.map((item) => {
        const isActive = currentCategory === item.key;

        return (
          <Link
            key={item.key}
            href={`/${locale}/profil/staf/${item.key}`}
            scroll={false} // Mencegah scroll jump saat ganti tab
            aria-current={isActive ? "page" : undefined}
            className={`
              px-8 py-3 rounded-full font-bold text-sm md:text-base 
              transition-all duration-300 border
              ${isActive
                ? "bg-[#005320] text-white border-[#005320] shadow-lg transform scale-105"
                : "bg-white text-gray-500 border-gray-200 hover:border-[#005320] hover:text-[#005320] hover:bg-green-50"
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}