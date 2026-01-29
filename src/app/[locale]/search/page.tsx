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

        let sortOptions: string[] | undefined = undefined;
        if (sortBy === "newest") sortOptions = ["timestamp:desc"];
        if (sortBy === "oldest") sortOptions = ["timestamp:asc"];

        const offset = (page - 1) * HITS_PER_PAGE;

        const queries = indexesToSearch.map((indexUid) => ({
          indexUid: indexUid,
          q: query,
          limit: HITS_PER_PAGE,
          offset: offset,
          sort: sortOptions,
          attributesToCrop: ["content:30"],
          attributesToHighlight: ["title", "content"],
          showMatchesPosition: true,
          filter: [`locale = ${locale}`],
        }));

        const searchResponse = await (meiliClient as unknown as {
          multiSearch: (params: { queries: unknown[] }) => Promise<MeiliMultiSearchResponse>
        }).multiSearch({ queries });

        const combinedHits = searchResponse.results.flatMap((res) => {
          return res.hits.map((hit) => {
            let link = `/${locale}`;
            const slug = (hit.slug as string) || "";

            switch (res.indexUid) {
              case "article":
                link = `/${locale}/informasi/berita/${slug}`;
                break;
              case "event":
                link = `/${locale}/informasi/agenda/${slug}`;
                break;
              case "staff":
                link = `/${locale}/profil/staf/${(hit.category as string) || "akademik"}/${slug}`;
                break;
              case "facility":
                link = `/${locale}/fasilitas/${slug}`;
                break;
              case "page":
                link = `/${locale}/${slug}`;
                break;
            }

            return {
              ...hit,
              type: res.indexUid,
              link: link,
            };
          });
        });

        const totalEstimated = searchResponse.results.reduce(
          (acc: number, curr) => acc + (curr.estimatedTotalHits || 0),
          0,
        );

        if (activeCategory === "all" && sortBy !== "relevance") {
          combinedHits.sort((a: SearchHit, b: SearchHit) => {
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
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FaSearch className="text-[#005320] w-8 h-8" />
            {t("title")}
          </h1>
          <p className="text-gray-500 ml-11">
            {t("showing_results_for")} <span className="font-bold text-gray-900">&quot;{query}&quot;</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center sticky top-24 z-20 mb-8">
          <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mr-2 uppercase tracking-wide">
                <FaFilter size={14} />
                {t("filter_label")}
              </div>

              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParams("category", cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${activeCategory === cat.id
                      ? "bg-[#005320] text-white border-[#005320] shadow-md"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                >
                  {t(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
            <FaSortAmountDown size={16} className="text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => updateParams("sort", e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#005320] focus:border-[#005320] block w-full lg:w-48 p-2.5 font-medium cursor-pointer hover:bg-white transition-colors"
            >
              <option value="relevance">{t("sort_relevance")}</option>
              <option value="newest">{t("sort_newest")}</option>
              <option value="oldest">{t("sort_oldest")}</option>
            </select>
          </div>
        </div>

        <div className="space-y-6 min-h-[400px]">
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium uppercase tracking-wide ml-1">
            <p>{t("meta_total")} {totalHits}</p>
            {activeCategory !== 'all' && <p>{t("meta_page")} {page}</p>}
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <FaSpinner className="animate-spin text-4xl text-[#005320] mb-4" />
              <p className="text-gray-500 font-medium">{t("loading_results")}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((item, index) => (
                <UniversalSearchCard
                  key={`${item.type}-${item.id}-${index}`}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            hasSearched && (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <FaSearch className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t("empty_title")}</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  {t("empty_desc", { query })}
                </p>
                <button
                  onClick={() => updateParams("category", "all")}
                  className="mt-6 px-6 py-2 bg-[#005320] text-white rounded-full text-sm font-bold hover:bg-green-800 transition-colors"
                >
                  {t("reset_filter")}
                </button>
              </div>
            )
          )}
        </div>

        {!loading && activeCategory !== "all" && totalHits > HITS_PER_PAGE && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => updateParams("page", (page - 1).toString())}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#005320] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              &larr; {t("prev_page")}
            </button>

            <div className="px-4 text-sm font-bold text-gray-900">
              {page}
            </div>

            <button
              disabled={results.length < HITS_PER_PAGE}
              onClick={() => updateParams("page", (page + 1).toString())}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#005320] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {t("next_page")} &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}