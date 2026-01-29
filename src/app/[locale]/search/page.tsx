"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { meiliClient } from "@/lib/meilisearch";
import UniversalSearchCard from "@/components/features/UniversalSearchCard";
import {
  FaSpinner,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
} from "react-icons/fa";

interface SearchHit {
  id: string | number;
  type: string;
  title: string;
  content: string;
  link: string;
  timestamp?: number;
  unique_id?: string;
  slug?: string;
  category?: string;
  [key: string]: unknown;
}

interface MeiliMultiSearchResponse {
  results: Array<{
    indexUid: string;
    hits: SearchHit[];
    estimatedTotalHits?: number;
    [key: string]: unknown;
  }>;
}

const CATEGORIES = [
  { id: "all", labelKey: "filter_all" },
  { id: "article", labelKey: "filter_article" },
  { id: "event", labelKey: "filter_event" },
  { id: "staff", labelKey: "filter_staff" },
  { id: "facility", labelKey: "filter_facility" },
  { id: "page", labelKey: "filter_page" },
];

export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations("SearchPage");
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-[#005320] mx-auto mb-4" />
            <p className="text-gray-500 font-medium">{t("loading_initial")}</p>
          </div>
        </div>
      }
    >
      <SearchContent params={params} />
    </Suspense>
  );
}

function SearchContent({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations("SearchPage");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const query = searchParams.get("q") || "";
  const activeCategory = searchParams.get("category") || "all";
  const sortBy = searchParams.get("sort") || "relevance";
  const page = parseInt(searchParams.get("page") || "1");

  const [results, setResults] = useState<SearchHit[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [locale, setLocale] = useState("id");

  const HITS_PER_PAGE = 10;

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const updateParams = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set(key, value);
    if (key !== "page") {
      current.set("page", "1");
    }
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        setTotalHits(0);
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const indexesToSearch =
          activeCategory === "all"
            ? CATEGORIES.filter((c) => c.id !== "all").map((c) => c.id)
            : [activeCategory];

        const sortOptions = sortBy === "newest"
          ? ["timestamp:desc"]
          : sortBy === "oldest"
            ? ["timestamp:asc"]
            : undefined;

        const offset = (page - 1) * HITS_PER_PAGE;

        const queries = indexesToSearch.map((indexUid) => ({
          indexUid,
          q: query,
          limit: HITS_PER_PAGE,
          offset,
          sort: sortOptions,
          attributesToCrop: ["content:30"],
          attributesToHighlight: ["title", "content"],
          filter: [`locale = ${locale}`]
        }));

        // Casting ke unknown lalu ke struktur spesifik untuk menghindari 'any'
        const response = await (meiliClient as unknown as {
          multiSearch: (p: { queries: unknown[] }) => Promise<MeiliMultiSearchResponse>
        }).multiSearch({ queries });

        // Perbaikan mapping tanpa 'any'
        const combinedHits = response.results.flatMap((res) => {
          return res.hits.map((hit: SearchHit) => {
            let link = `/${locale}`;
            const slug = (hit.slug as string) || "";

            switch (res.indexUid) {
              case "article": link = `/${locale}/informasi/berita/${slug}`; break;
              case "event": link = `/${locale}/informasi/agenda/${slug}`; break;
              case "staff": link = `/${locale}/profil/staf/${(hit.category as string) || "akademik"}/${slug}`; break;
              case "facility": link = `/${locale}/fasilitas/${slug}`; break;
              case "page": link = `/${locale}/${slug}`; break;
            }

            return { ...hit, type: res.indexUid, link };
          });
        });

        const totalEstimated = response.results.reduce(
          (acc, curr) => acc + (curr.estimatedTotalHits || 0),
          0
        );

        if (activeCategory === "all" && sortBy !== "relevance") {
          combinedHits.sort((a, b) => {
            const timeA = (a.timestamp as number) || 0;
            const timeB = (b.timestamp as number) || 0;
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

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, activeCategory, sortBy, page, locale]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaSearch className="text-[#005320]" />
                {query ? (
                  <span>
                    {t("title")}: <span className="text-[#005320] italic">&quot;{query}&quot;</span>
                  </span>
                ) : (
                  t("title")
                )}
              </h1>
              {hasSearched && !loading && (
                <p className="text-sm text-gray-500 mt-1">
                  {t("meta_total")} <b>{totalHits}</b>
                </p>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-24 z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                <div className="flex items-center gap-2">
                  <FaFilter className="text-gray-400 mr-2 flex-shrink-0" />
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParams("category", cat.id)}
                      className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${activeCategory === cat.id
                          ? "bg-[#005320] text-white border-[#005320] shadow-md scale-105"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      {t(cat.labelKey)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <FaSortAmountDown className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => updateParams("sort", e.target.value)}
                  className="block w-full lg:w-48 pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 cursor-pointer"
                >
                  <option value="relevance">{t("sort_relevance")}</option>
                  <option value="newest">{t("sort_newest")}</option>
                  <option value="oldest">{t("sort_oldest")}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <FaSpinner className="animate-spin text-5xl text-[#005320] mb-4" />
              <p className="text-gray-500 font-medium">{t("loading_results")}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((item, idx) => (
                <UniversalSearchCard
                  key={item.unique_id || `${item.type}-${item.id}-${idx}`}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            hasSearched && (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed text-center px-4">
                <FaSearch className="text-5xl text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{t("empty_title")}</h3>
                <p className="text-gray-500 max-w-md">{t("empty_desc", { query })}</p>
                <button
                  onClick={() => updateParams("category", "all")}
                  className="mt-6 px-6 py-2 bg-[#005320] text-white rounded-lg font-medium"
                >
                  {t("reset_filter")}
                </button>
              </div>
            )
          )}
        </div>

        {!loading && results.length > 0 && activeCategory !== "all" && (
          <div className="mt-12 flex justify-center items-center gap-4 pb-12">
            <button
              disabled={page === 1}
              onClick={() => updateParams("page", String(page - 1))}
              className="px-5 py-2.5 bg-white border rounded-lg text-sm font-medium disabled:opacity-50"
            >
              &larr; {t("prev_page")}
            </button>
            <div className="bg-white border px-4 py-2 rounded-lg text-sm font-bold">
              {t("meta_page")} {page}
            </div>
            <button
              disabled={results.length < HITS_PER_PAGE}
              onClick={() => updateParams("page", String(page + 1))}
              className="px-5 py-2.5 bg-white border rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {t("next_page")} &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}