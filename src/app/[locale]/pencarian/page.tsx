// src/app/[locale]/pencarian/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
// 1. Import articleIndex juga
import { eventIndex, articleIndex } from "@/lib/meilisearch";
import AgendaCard from "@/components/features/AgendaCard";
// Pastikan Anda sudah punya komponen ArticleCard, atau gunakan card lain
import ArticleCard from "@/components/features/ArticleCard";
import { FaSpinner } from "react-icons/fa";

export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState("id");

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 2. Lakukan pencarian PARALEL (Bersamaan)
        const [eventResults, articleResults] = await Promise.all([
          eventIndex.search(query, {
            limit: 10,
            attributesToHighlight: ["title"],
          }),
          articleIndex.search(query, {
            limit: 10,
            attributesToHighlight: ["title"],
          }),
        ]);

        // 3. Gabungkan hasil dan beri tanda (Labeling)
        // Kita beri tanda 'type' agar nanti UI tahu mana yang Agenda, mana yang Artikel
        const mergedResults = [
          ...eventResults.hits.map((item) => ({ ...item, type: "agenda" })),
          ...articleResults.hits.map((item) => ({ ...item, type: "article" })),
        ];

        setResults(mergedResults);
      } catch (error) {
        console.error("Meilisearch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, locale]);

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Hasil Pencarian: <span className="text-green-600">"{query}"</span>
        </h1>
        <p className="text-gray-500 mt-2">Ditemukan {results.length} hasil</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <FaSpinner className="animate-spin text-4xl text-green-600" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 4. Render Card sesuai Tipe Datanya */}
          {results.map((item, index) => {
            // Gunakan index sebagai key cadangan jika ID bentrok antar collection
            const uniqueKey = `${item.type}-${item.id}-${index}`;

            if (item.type === "agenda") {
              return <AgendaCard key={uniqueKey} data={item} locale={locale} />;
            } else if (item.type === "article") {
              // Jika tipe 'article', render ArticleCard
              // Jika belum punya komponen ArticleCard, sementara bisa pakai AgendaCard dulu
              // atau buat komponen baru.
              return (
                <ArticleCard key={uniqueKey} data={item} locale={locale} />
              );
            }
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">
            Tidak ditemukan agenda atau artikel dengan kata kunci tersebut.
          </p>
        </div>
      )}
    </div>
  );
}
