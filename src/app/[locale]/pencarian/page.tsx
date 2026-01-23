// File: src/app/[locale]/pencarian/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { meiliClient } from "@/lib/meilisearch";
// Pastikan path import ini sesuai dengan lokasi file UniversalSearchCard Anda
import UniversalSearchCard from "@/components/features/UniversalSearchCard";
import { FaSpinner, FaSearch } from "react-icons/fa";

export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q"); // Ambil keyword dari URL (?q=...)

  // State management
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [locale, setLocale] = useState("id"); // Default locale

  // 1. Ambil Locale dari Params (Next.js 15+ menggunakan Promise untuk params)
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  // 2. Logika Pencarian Multi-Index
  useEffect(() => {
    const fetchResults = async () => {
      // Jika tidak ada query, reset hasil
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        // Request ke Meilisearch: Cari di Artikel, Event, Staff, dan Fasilitas sekaligus
        const searchResponse = await meiliClient.multiSearch({
          queries: [
            {
              indexUid: "article",
              q: query,
              limit: 6,
              attributesToCrop: ["content:25"], // Potong deskripsi maks 25 kata
              attributesToHighlight: ["title", "content"], // Highlight keyword
            },
            {
              indexUid: "event",
              q: query,
              limit: 6,
              attributesToCrop: ["content:25"],
              attributesToHighlight: ["title", "content"],
            },
            {
              indexUid: "staff", // Pastikan nama index ini sesuai yang ada di Meilisearch Anda
              q: query,
              limit: 6,
              attributesToHighlight: ["title", "content"],
            },
            {
              indexUid: "facility", // Pastikan nama index ini sesuai
              q: query,
              limit: 6,
              attributesToCrop: ["content:25"],
              attributesToHighlight: ["title", "content"],
            },
          ],
        });

        // Gabungkan (Flat) semua hasil dari berbagai index menjadi satu array tunggal
        const allHits = searchResponse.results.flatMap((res) => res.hits);
        setResults(allHits);
      } catch (error) {
        console.error("Meilisearch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // Jalankan ulang jika query berubah

  // 3. Render Halaman
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Hasil Pencarian */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center justify-center sm:justify-start gap-3">
            <FaSearch className="text-green-600 text-2xl" />
            {query ? (
              <>
                Hasil Pencarian:{" "}
                <span className="text-green-600 italic">"{query}"</span>
              </>
            ) : (
              "Pencarian"
            )}
          </h1>

          {hasSearched && !loading && (
            <p className="text-gray-500 font-medium ml-1">
              Ditemukan{" "}
              <span className="text-gray-900 font-bold">{results.length}</span>{" "}
              data yang cocok
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
            <p className="text-gray-500 animate-pulse">
              Sedang mencari data...
            </p>
          </div>
        ) : (
          <>
            {/* Grid Hasil Pencarian */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((item, index) => (
                  // Panggil Komponen Card Terpisah
                  <UniversalSearchCard
                    // Gunakan unique_id dari Strapi, atau fallback ke kombinasi ID & index
                    key={item.unique_id || `${item.id}-${index}`}
                    item={item}
                    locale={locale} // PENTING: Kirim locale (id/en) ke card agar link tidak 404
                  />
                ))}
              </div>
            ) : (
              // State Kosong (Jika sudah cari tapi hasil 0)
              hasSearched && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaSearch className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Oops, tidak ditemukan!
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Kami tidak dapat menemukan konten dengan kata kunci
                    <span className="font-bold text-gray-700"> "{query}"</span>.
                    Coba gunakan kata kunci lain yang lebih umum.
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
