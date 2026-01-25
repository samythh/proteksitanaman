// src/app/[locale]/pencarian/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { meiliClient } from "@/lib/meilisearch";
import UniversalSearchCard from "@/components/features/UniversalSearchCard";
import {
  FaSpinner,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
} from "react-icons/fa";

// DAFTAR INDEX YANG AKAN DICARI
// Sesuaikan indexUid dengan nama di Plugin Strapi Anda
const INDEX_SOURCES = [
  { uid: "article", label: "Berita & Artikel" },
  { uid: "event", label: "Agenda" },
  { uid: "staff-member", label: "Dosen & Staff" },
  { uid: "facility", label: "Fasilitas" },
  { uid: "page", label: "Halaman Lain" },
];

export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading search...</div>}
    >
      <SearchContent params={params} />
    </Suspense>
  );
}

function SearchContent({ params }: { params: Promise<{ locale: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // --- STATE ---
  const query = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "all"; // 'all', 'article', 'staff', dll
  const sortOrder = searchParams.get("sort") || "relevance"; // 'relevance', 'newest', 'oldest'
  const page = parseInt(searchParams.get("page") || "1");

  const [results, setResults] = useState<any[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState("id");

  const HITS_PER_PAGE = 10; // Jumlah data per halaman

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  // --- FUNGSI UPDATE URL (Agar filter tersimpan saat refresh) ---
  const updateUrl = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set(key, value);
    if (key !== "page") current.set("page", "1"); // Reset ke page 1 jika filter berubah
    const search = current.toString();
    const queryStr = search ? `?${search}` : "";
    router.push(`${pathname}${queryStr}`);
  };

  // --- LOGIKA PENCARIAN UTAMA ---
  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        setTotalHits(0);
        return;
      }

      setLoading(true);
      try {
        // 1. Tentukan Index mana yang mau dicari
        // Jika filter 'all', cari di semua index. Jika spesifik, cari di index itu saja.
        const indexesToSearch =
          categoryFilter === "all"
            ? INDEX_SOURCES
            : INDEX_SOURCES.filter((idx) => idx.uid === categoryFilter);

        // 2. Siapkan Sorting Parameter
        // Meilisearch butuh format ['field:asc'] atau ['field:desc']
        const sortParam =
          sortOrder === "newest"
            ? ["timestamp:desc"]
            : sortOrder === "oldest"
              ? ["timestamp:asc"]
              : undefined;

        // 3. Bangun Query MultiSearch
        // Kita bagi limit per index agar hasil seimbang, atau query semua
        const queries = indexesToSearch.map((idx) => ({
          indexUid: idx.uid,
          q: query,
          limit: HITS_PER_PAGE, // Kita fetch lebih banyak, nanti potong di client/backend logic
          offset: (page - 1) * (categoryFilter !== "all" ? HITS_PER_PAGE : 2), // Offset trick untuk multi-index agak tricky
          attributesToCrop: ["content:35"],
          attributesToHighlight: ["title", "content"],
          sort: sortParam,
        }));

        // NOTE: Multi-index pagination itu SANGAT SULIT di Meilisearch.
        // Cara paling aman untuk 'All' category adalah fetch top X dari semua index, lalu gabung di client.
        // Jika user pilih kategori spesifik, pagination berjalan normal.

        const searchResponse = await meiliClient.multiSearch({ queries });

        // 4. Gabungkan & Urutkan Ulang Hasil di Client (Untuk mode 'All')
        let allHits = searchResponse.results.flatMap((res) => res.hits);

        // Total hits estimasi (jumlahkan semua estimatedTotalHits)
        const totalEstimated = searchResponse.results.reduce(
          (acc, curr) => acc + (curr.estimatedTotalHits || 0),
          0,
        );

        // Jika mode 'all' & sorting aktif, kita harus sort manual hasil gabungan di client
        // karena meilisearch mengembalikan sort per-index, bukan sort global antar index.
        if (categoryFilter === "all" && sortOrder !== "relevance") {
          allHits.sort((a: any, b: any) => {
            const timeA = a.timestamp || 0;
            const timeB = b.timestamp || 0;
            return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
          });
        }

        setResults(allHits);
        setTotalHits(totalEstimated);
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, categoryFilter, sortOrder, page]);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* HEADER & SEARCH BAR */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaSearch className="text-green-600" />
            Hasil Pencarian:{" "}
            <span className="text-green-600 italic">"{query}"</span>
          </h1>

          {/* TOOLBAR: Filter & Sort */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-20 z-10">
            {/* Filter Kategori */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <FaFilter className="text-gray-400 mr-1" />
              <button
                onClick={() => updateUrl("category", "all")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Semua
              </button>
              {INDEX_SOURCES.map((src) => (
                <button
                  key={src.uid}
                  onClick={() => updateUrl("category", src.uid)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === src.uid
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <FaSortAmountDown className="text-gray-400" />
              <select
                value={sortOrder}
                onChange={(e) => updateUrl("sort", e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full p-2.5"
              >
                <option value="relevance">Relevansi (Paling Cocok)</option>
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-6">
          <p className="text-gray-500 text-sm">
            Ditemukan sekitar{" "}
            <span className="font-bold text-gray-900">{totalHits}</span> data
            yang cocok.
          </p>

          {loading ? (
            <div className="py-20 flex justify-center">
              <FaSpinner className="animate-spin text-4xl text-green-600" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4">
              {results.map((item, index) => (
                <UniversalSearchCard
                  key={item.unique_id || `${item.id}-${index}`}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">
                Tidak ada hasil ditemukan untuk filter ini.
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION (Simple) */}
        {/* Pagination hanya muncul jika bukan mode 'all' atau logic disesuaikan */}
        {totalHits > HITS_PER_PAGE && (
          <div className="mt-10 flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => updateUrl("page", (page - 1).toString())}
              className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="px-4 py-2 text-gray-600 font-medium">
              Halaman {page}
            </span>
            <button
              disabled={results.length < HITS_PER_PAGE} // Logic disable sederhana
              onClick={() => updateUrl("page", (page + 1).toString())}
              className="px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
