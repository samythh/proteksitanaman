// src/components/ui/SearchBar.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split("/")[1] || "id";

  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    // e? digunakan karena bisa dipanggil manual tanpa event
    if (e) e.preventDefault();

    if (query.trim()) {
      router.push(`/${currentLocale}/pencarian?q=${encodeURIComponent(query)}`);
    }
  };

  // Logika Khusus Tombol Enter (Opsional, karena form sudah menangani ini)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        placeholder="Cari sesuatu..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-green-600 w-64 text-sm text-black"
      />
      <button
        type="submit"
        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
      >
        <FaSearch />
      </button>
    </form>
  );
}
