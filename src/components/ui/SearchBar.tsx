// src/components/ui/SearchBar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaSearch, FaTimes } from "react-icons/fa"; // Tambah FaTimes untuk icon close (opsional)

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false); // State untuk status buka/tutup
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.split("/")[1] || "id";

  // Fungsi Toggle: Buka/Tutup atau Submit
  const handleToggle = () => {
    if (isOpen) {
      // Jika sudah terbuka dan ada isinya, lakukan pencarian
      if (query.trim()) {
        executeSearch();
      } else {
        // Jika kosong dan diklik lagi, tutup
        setIsOpen(false);
      }
    } else {
      // Jika tertutup, buka dan fokuskan ke input
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const executeSearch = () => {
    if (query.trim()) {
      router.push(`/${currentLocale}/pencarian?q=${encodeURIComponent(query)}`);
      // Opsional: Tutup kembali setelah search atau biarkan terbuka
      // setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Mencegah form submit default jika ada
      executeSearch();
    }
  };

  // Opsional: Tutup search bar jika user klik di luar area (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest("button")
      ) {
        if (!query) setIsOpen(false); // Hanya tutup jika kosong
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query]);

  return (
    <div className="relative flex items-center justify-end">
      {/* Container Input dengan Animasi */}
      <div
        className={`
          flex items-center bg-white rounded-full overflow-hidden transition-all duration-300 ease-in-out border border-transparent
          ${isOpen ? "w-64 border-gray-300 shadow-sm opacity-100" : "w-0 opacity-0"}
        `}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Cari sesuatu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          // Saat tertutup, padding dihilangkan agar tidak ada sisa border
          className={`
            bg-transparent outline-none text-sm text-black h-full w-full transition-all duration-300
            ${isOpen ? "pl-4 pr-2 py-2" : "p-0"}
          `}
        />

        {/* Tombol Clear / Close kecil jika ingin membatalkan (Opsional) */}
        {isOpen && query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="pr-2 text-gray-400 hover:text-red-500 text-xs"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Tombol Kaca Pembesar Utama */}
      <button
        onClick={handleToggle}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300
          ${isOpen ? "bg-green-600 text-white ml-2" : "bg-transparent text-gray-200 hover:bg-gray-100 hover:text-green-600"}
        `}
        title={isOpen ? "Cari" : "Buka Pencarian"}
      >
        <FaSearch />
      </button>
    </div>
  );
}
