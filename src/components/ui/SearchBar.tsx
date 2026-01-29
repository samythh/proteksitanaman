// File: src/components/ui/SearchBar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "@/i18n/routing"; 
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react"; 
import { cn } from "@/lib/utils/cn";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const t = useTranslations("UI");

  // Fungsi Toggle: Buka/Tutup atau Submit
  const handleToggle = () => {
    if (isOpen) {
      if (query.trim()) {
        executeSearch();
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(true);
      // Delay sedikit agar transisi CSS selesai sebelum fokus
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const executeSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);

      // Opsional: Tutup dan reset setelah search
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch();
    } else if (e.key === "Escape") {
      // UX Tambahan: Tekan ESC untuk menutup
      setIsOpen(false);
    }
  };

  // Logic: Click Outside untuk menutup search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Cek apakah klik terjadi di luar inputRef
      if (
        inputRef.current &&
        !inputRef.current.parentElement?.contains(event.target as Node)
      ) {
        // Hanya tutup jika query kosong (UX Choice: biar user gak sengaja ilangin ketikan)
        if (!query) setIsOpen(false);
      }
    };

    // Gunakan 'mousedown' agar lebih responsif
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  return (
    <div className="relative flex items-center justify-end">

      {/* 1. CONTAINER INPUT (ANIMASI) */}
      <div
        className={cn(
          "flex items-center bg-white rounded-full overflow-hidden transition-all duration-300 ease-in-out border border-transparent",
          isOpen ? "w-48 md:w-64 border-gray-300 shadow-sm opacity-100" : "w-0 opacity-0"
        )}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={t("search_placeholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            "bg-transparent outline-none text-sm text-gray-800 h-full w-full transition-all duration-300 placeholder:text-gray-400",
            isOpen ? "pl-4 pr-2 py-2" : "p-0"
          )}
        />

        {/* Tombol Clear (X) Kecil */}
        {isOpen && query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="pr-3 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* 2. TOMBOL TRIGGER UTAMA */}
      <button
        onClick={handleToggle}
        className={cn(
          "flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-all duration-300",
          isOpen
            ? "bg-[#005320] text-yellow-400 ml-2 shadow-md rotate-90"
            : "bg-transparent text-white hover:bg-white/10 hover:text-yellow-400 rotate-0"
        )}
        title={t("search_label")}
        aria-label={t("search_label")}
        aria-expanded={isOpen}
      >
        {/* Jika terbuka & ada query, tampilkan icon Search (Submit), jika kosong tampilkan Search juga tapi fungsi toggle */}
        <Search size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}