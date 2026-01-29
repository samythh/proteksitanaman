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

// --- KONFIGURASI KATEGORI ---
// 'id' harus sesuai dengan nama index (uid) di Meilisearch/Strapi Anda
const CATEGORIES = [
  { id: "all", label: "Semua" },
  { id: "article", label: "Berita & Artikel" },
  { id: "event", label: "Agenda" },
  { id: "staff", label: "Dosen & Staff" }, // Pastikan UID di plugins.js adalah 'staff'
  { id: "facility", label: "Fasilitas" }, // Pastikan UID di plugins.js adalah 'facility'
  { id: "page", label: "Halaman" },
];

// --- WRAPPER SUSPENSE (Wajib untuk Next.js App Router) ---
export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto mb-4" />
            <p className="text-gray-500">Memuat pencarian...</p>
          </div>
        </div>
      }
    >
      <SearchContent params={params} />
    </Suspense>
  );
}

// --- KOMPONEN UTAMA ---
function SearchContent({ params }: { params: Promise<{ locale: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // 1. Ambil Parameter dari URL
  const query = searchParams.get("q") || "";
  const activeCategory = searchParams.get("category") || "all";
  const sortBy = searchParams.get("sort") || "relevance"; // 'relevance', 'newest', 'oldest'
  const page = parseInt(searchParams.get("page") || "1");

  // 2. State Lokal
  const [results, setResults] = useState<any[]>([]);
  const [totalHits, setTotalHits] = useState(0); // Estimasi total
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [locale, setLocale] = useState("id");

  const HITS_PER_PAGE = 10;

  // Ambil locale (id/en)
  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  // 3. Fungsi Update URL (Filter/Sort/Page)
  // Ini akan mengubah URL tanpa reload, tapi memicu useEffect pencarian di bawah
  const updateParams = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set(key, value);

    // Reset ke halaman 1 jika filter atau sort berubah
    if (key !== "page") {
      current.set("page", "1");
    }

    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  // 4. LOGIKA UTAMA PENCARIAN MEILISEARCH
  useEffect(() => {
    const performSearch = async () => {
      // Jika tidak ada query, bersihkan hasil
      if (!query.trim()) {
        setResults([]);
        setTotalHits(0);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        // A. Tentukan Index mana yang mau dicari
        // Jika 'all', ambil semua index dari konstanta CATEGORIES (kecuali 'all')
        // Jika spesifik, ambil array berisi 1 index saja.
        const indexesToSearch =
          activeCategory === "all"
            ? CATEGORIES.filter((c) => c.id !== "all").map((c) => c.id)
            : [activeCategory];

        // B. Tentukan Sorting (Meilisearch format: ['field:asc'])
        // Wajib: Field 'timestamp' harus diset sebagai 'Sortable' di setting Meilisearch
        let sortOptions: string[] | undefined = undefined;
        if (sortBy === "newest") sortOptions = ["timestamp:desc"];
        if (sortBy === "oldest") sortOptions = ["timestamp:asc"];

        // C. Hitung Offset untuk Pagination
        const offset = (page - 1) * HITS_PER_PAGE;

        // D. Bangun Query MultiSearch
        const queries = indexesToSearch.map((indexUid) => ({
          indexUid: indexUid,
          q: query,
          limit: HITS_PER_PAGE, // Ambil secukupnya per index
          offset: offset, // Pagination
          sort: sortOptions,
          // Optimasi respons:
          attributesToCrop: ["content:30"], // Potong deskripsi
          attributesToHighlight: ["title", "content"], // Highlight keyword
          showMatchesPosition: true,
        }));

        // E. Eksekusi Request ke Meilisearch
        const response = await meiliClient.multiSearch({ queries });

        // F. Gabungkan Hasil (Flattening)
        let combinedHits = response.results.flatMap((res) => res.hits);

        // Hitung total estimasi hits (Meilisearch memberikan estimatedTotalHits per index)
        const totalEstimated = response.results.reduce(
          (acc, curr) => acc + (curr.estimatedTotalHits || 0),
          0,
        );

        // G. Client-Side Sorting untuk Mode "Semua" (All)
        // Karena Meilisearch mengembalikan sort per-index, saat digabung urutannya bisa acak.
        // Kita rapikan lagi berdasarkan timestamp di sisi client.
        if (activeCategory === "all" && sortBy !== "relevance") {
          combinedHits.sort((a: any, b: any) => {
            const timeA = a.timestamp || 0;
            const timeB = b.timestamp || 0;
            return sortBy === "newest" ? timeB - timeA : timeA - timeB;
          });
        }

        setResults(combinedHits);
        setTotalHits(totalEstimated);
      } catch (error) {
        console.error("Search Error:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, activeCategory, sortBy, page]); // Efek jalan setiap kali parameter ini berubah

  // --- RENDER HALAMAN ---
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaSearch className="text-green-600" />
                {query ? (
                  <span>
                    Hasil Pencarian:{" "}
                    <span className="text-green-600 italic">"{query}"</span>
                  </span>
                ) : (
                  "Pencarian"
                )}
              </h1>
              {hasSearched && !loading && (
                <p className="text-sm text-gray-500 mt-1">
                  Ditemukan sekitar <b>{totalHits}</b> hasil
                </p>
              )}
            </div>
          </div>

          {/* TOOLBAR (FILTER & SORT) */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-20 z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Kategori Tabs (Scrollable Mobile) */}
              <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-400 mr-2 flex-shrink-0" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParams("category", cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                        activeCategory === cat.id
                          ? "bg-green-600 text-white shadow-md transform scale-105"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-green-700"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <div className="relative w-full lg:w-48">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSortAmountDown className="text-gray-400" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => updateParams("sort", e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 focus:ring-green-500 focus:border-green-500 appearance-none cursor-pointer hover:bg-white transition-colors"
                  >
                    <option value="relevance">Paling Relevan</option>
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-32 opacity-70">
              <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
              <p className="text-gray-500 font-medium animate-pulse">
                Sedang mencari data...
              </p>
            </div>
          ) : results.length > 0 ? (
            // Hasil Pencarian
            <div className="grid grid-cols-1 gap-4">
              {results.map((item, idx) => (
                <UniversalSearchCard
                  // Gunakan Unique ID yang kita buat di plugin Strapi, fallback ke kombinasi ID
                  key={item.unique_id || `${item.type}-${item.id}-${idx}`}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            // State Kosong (404 Search)
            hasSearched && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200 text-center px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <FaSearch className="text-3xl text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Tidak ada hasil ditemukan
                </h3>
                <p className="text-gray-500 max-w-md">
                  Maaf, kami tidak menemukan konten yang cocok dengan kata kunci
                  <span className="font-semibold text-gray-800">
                    {" "}
                    "{query}"
                  </span>
                  .
                  <br />
                  Coba periksa ejaan atau gunakan kata kunci yang lebih umum.
                </p>
                <button
                  onClick={() => router.push(pathname)} // Reset semua
                  className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Bersihkan Pencarian
                </button>
              </div>
            )
          )}
        </div>

        {/* PAGINATION */}
        {/* Tampilkan hanya jika hasil ada dan bukan loading */}
        {!loading && results.length > 0 && (
          <div className="mt-12 flex justify-center items-center gap-4 pb-12">
            <button
              disabled={page === 1}
              onClick={() => updateParams("page", String(page - 1))}
              className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              &larr; Sebelumnya
            </button>

            <div className="bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-700">
                Halaman <span className="text-green-600 font-bold">{page}</span>
              </span>
            </div>

            {/* Tombol Next dimatikan jika hasil kurang dari limit (asumsi habis) */}
            <button
              disabled={results.length < HITS_PER_PAGE}
              onClick={() => updateParams("page", String(page + 1))}
              className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Selanjutnya &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
