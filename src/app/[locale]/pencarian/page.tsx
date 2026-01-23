// src/app/[locale]/pencarian/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { meiliClient } from "@/lib/meilisearch";
import UniversalSearchCard from "@/components/features/UniversalSearchCard"; // <--- IMPORT DI SINI
import { FaSpinner, FaSearch } from "react-icons/fa";

export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const searchResponse = await meiliClient.multiSearch({
          queries: [
            {
              indexUid: "article",
              q: query,
              limit: 5,
              attributesToCrop: ["content:25"],
              attributesToHighlight: ["title", "content"],
            },
            {
              indexUid: "event",
              q: query,
              limit: 5,
              attributesToCrop: ["content:25"],
              attributesToHighlight: ["title", "content"],
            },
            {
              indexUid: "staff",
              q: query,
              limit: 5,
              attributesToHighlight: ["title", "content"],
            },
            {
              indexUid: "facility",
              q: query,
              limit: 5,
              attributesToCrop: ["content:25"],
              attributesToHighlight: ["title", "content"],
            },
          ],
        });

        const allHits = searchResponse.results.flatMap((res) => res.hits);
        setResults(allHits);
      } catch (error) {
        console.error("Meilisearch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center justify-center sm:justify-start gap-3">
            <FaSearch className="text-green-600 text-2xl" />
            {query ? (
              <>
                Hasil: <span className="text-green-600 italic">"{query}"</span>
              </>
            ) : (
              "Pencarian"
            )}
          </h1>
          {hasSearched && !loading && (
            <p className="text-gray-500 font-medium ml-1">
              Ditemukan{" "}
              <span className="text-gray-900 font-bold">{results.length}</span>{" "}
              data
            </p>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <FaSpinner className="animate-spin text-5xl text-green-600 mb-4" />
            <p className="text-gray-500 animate-pulse">
              Sedang mencari data...
            </p>
          </div>
        ) : (
          <>
            {/* Grid Hasil - Menggunakan Komponen Terpisah */}
            {results.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.map((item, index) => (
                  <UniversalSearchCard
                    key={item.unique_id || item.id || index}
                    item={item}
                  />
                ))}
              </div>
            ) : (
              // State Kosong
              hasSearched && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <FaSearch className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Oops, tidak ditemukan!
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Tidak ada hasil untuk kata kunci{" "}
                    <span className="font-bold">"{query}"</span>.
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
