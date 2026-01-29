// File: src/app/[locale]/pencarian/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { meiliClient } from "@/lib/meilisearch";
import UniversalSearchCard from "@/components/features/UniversalSearchCard";
import {
  Search,
  Filter,
  ArrowUpDown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileQuestion
} from "lucide-react";

// --- TYPES ---
interface SearchResultItem {
  id: string | number;
  uid?: string;
  title: string;
  content: string;
  slug?: string;
  timestamp?: number;
  type: string;
  link: string;
  image?: string;
  _formatted?: {
    title?: string;
    content?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface MeiliSearchHit {
  id: string | number;
  title?: string;
  content?: string;
  slug?: string;
  publishedAt?: string;
  startDate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface MultiSearchResult {
  indexUid: string;
  hits: MeiliSearchHit[];
  estimatedTotalHits?: number;
}

interface MultiSearchResponse {
  results: MultiSearchResult[];
}

// --- KONFIGURASI ---
// Kita hanya simpan UID-nya saja, labelnya akan diambil via Translation di dalam komponen
const INDEX_UIDS = [
  "article",
  "event",
  "staff-member",
  "facility",
  "page"
];

const HITS_PER_PAGE = 10;

// --- MAIN PAGE COMPONENT ---
export default function SearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations("SearchPage"); 
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-[#005320] animate-spin" />
          <p className="text-gray-500 font-medium">{t("loading_initial")}</p>
        </div>
      </div>
    }>
      <SearchContent params={params} />
    </Suspense>
  );
}

// --- SEARCH CONTENT COMPONENT ---
function SearchContent({ params }: { params: Promise<{ locale: string }> }) {
  const t = useTranslations("SearchPage"); 
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Params State
  const query = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "all";
  const sortOrder = searchParams.get("sort") || "relevance";
  const page = parseInt(searchParams.get("page") || "1");

  // Data State
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalHits, setTotalHits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState("id");

  useEffect(() => {
    params.then((p) => setLocale(p.locale));
  }, [params]);

  const updateUrl = (key: string, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set(key, value);
    if (key !== "page") current.set("page", "1");
    router.push(`${pathname}?${current.toString()}`, { scroll: false });
  };

  // --- HELPER: Translate Label Filter ---
  const getFilterLabel = (uid: string) => {
    switch (uid) {
      case "article": return t("filter_article");
      case "event": return t("filter_event");
      case "staff-member": return t("filter_staff");
      case "facility": return t("filter_facility");
      case "page": return t("filter_page");
      default: return uid;
    }
  };

  // --- LOGIKA PENCARIAN UTAMA ---
  useEffect(() => {
    const mapItemToCard = (hit: MeiliSearchHit, indexUid: string): SearchResultItem => {
      let type = "page";
      let link = "/";

      const dateStr = hit.publishedAt || hit.startDate || hit.createdAt || "";
      const timestamp = dateStr ? new Date(dateStr).getTime() : 0;

      switch (indexUid) {
        case 'article':
          type = "article";
          link = `/${locale}/informasi/berita/${hit.slug}`;
          break;
        case 'event':
          type = "agenda";
          link = `/${locale}/informasi/agenda/${hit.slug}`;
          break;
        case 'staff-member':
          type = "staff";
          link = `/${locale}/profil/staf/${hit.category || 'akademik'}/${hit.slug}`;
          break;
        case 'facility':
          type = "fasilitas";
          link = `/${locale}/fasilitas/${hit.slug}`;
          break;
        case 'page':
          type = "page";
          link = `/${locale}/${hit.slug}`;
          break;
      }

      return {
        ...hit,
        id: hit.id,
        uid: indexUid,
        // ✅ Ganti Hardcode "Tanpa Judul"
        title: hit.title || t("no_title"),
        content: hit.content || "",
        type,
        link,
        timestamp,
      };
    };

    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setTotalHits(0);
        return;
      }

      setLoading(true);
      try {
        const indexesToSearch = categoryFilter === "all"
          ? INDEX_UIDS
          : [categoryFilter]; // Cukup array string UID

        const sortParam = sortOrder === "newest"
          ? ["timestamp:desc"]
          : sortOrder === "oldest"
            ? ["timestamp:asc"]
            : undefined;

        const queries = indexesToSearch.map((uid) => ({
          indexUid: uid,
          q: query,
          limit: HITS_PER_PAGE,
          offset: categoryFilter === "all" ? 0 : (page - 1) * HITS_PER_PAGE,
          attributesToCrop: ["content:35"],
          attributesToHighlight: ["title", "content"],
          sort: sortParam,
          filter: [`locale = ${locale}`]
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchResponse = await (meiliClient as any).multiSearch({ queries }) as MultiSearchResponse;

        const allHits = searchResponse.results.flatMap((res: MultiSearchResult) =>
          res.hits.map((hit: MeiliSearchHit) => mapItemToCard(hit, res.indexUid))
        );

        const totalEstimated = searchResponse.results.reduce(
          (acc: number, curr: MultiSearchResult) => acc + (curr.estimatedTotalHits || 0),
          0
        );

        if (categoryFilter === "all" && sortOrder !== "relevance") {
          allHits.sort((a, b) => {
            const timeA = a.timestamp || 0;
            const timeB = b.timestamp || 0;
            return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
          });
        }

        setResults(allHits);
        setTotalHits(totalEstimated);
      } catch (error) {
        console.error("[SearchPage] Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, categoryFilter, sortOrder, page, locale, t]); 

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Search className="text-[#005320] w-8 h-8" />
            {t("title")} {/* ✅ Ganti "Hasil Pencarian" */}
          </h1>
          <p className="text-gray-500 ml-11">
            {t("showing_results_for")} <span className="font-bold text-gray-900">&quot;{query}&quot;</span>
          </p>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center sticky top-24 z-20 mb-8">

          {/* Filter Pills */}
          <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mr-2 uppercase tracking-wide">
                <Filter size={14} />
                {t("filter_label")}
              </div>

              <button
                onClick={() => updateUrl("category", "all")}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${categoryFilter === "all"
                  ? "bg-[#005320] text-white border-[#005320] shadow-md"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
              >
                {t("filter_all")}
              </button>

              {INDEX_UIDS.map((uid) => (
                <button
                  key={uid}
                  onClick={() => updateUrl("category", uid)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border ${categoryFilter === uid
                    ? "bg-[#005320] text-white border-[#005320] shadow-md"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }`}
                >
                  {getFilterLabel(uid)} 
                </button>
              ))}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
            <ArrowUpDown size={16} className="text-gray-400" />
            <select
              value={sortOrder}
              onChange={(e) => updateUrl("sort", e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#005320] focus:border-[#005320] block w-full lg:w-48 p-2.5 font-medium cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <option value="relevance">{t("sort_relevance")}</option>
              <option value="newest">{t("sort_newest")}</option>
              <option value="oldest">{t("sort_oldest")}</option>
            </select>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-6 min-h-[400px]">

          <div className="flex justify-between items-center text-xs text-gray-500 font-medium uppercase tracking-wide ml-1">
            <p>{t("meta_total")} {totalHits}</p>
            {categoryFilter !== 'all' && <p>{t("meta_page")} {page}</p>}
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <Loader2 className="animate-spin text-4xl text-[#005320] mb-4" />
              <p className="text-gray-500 font-medium">{t("loading_results")}</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-4">
              {results.map((item, index) => (
                <UniversalSearchCard
                  key={`${item.uid}-${item.id}-${index}`}
                  item={item}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <FileQuestion className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t("empty_title")}</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {t("empty_desc", { query })} 
              </p>
              <button
                onClick={() => updateUrl("category", "all")}
                className="mt-6 px-6 py-2 bg-[#005320] text-white rounded-full text-sm font-bold hover:bg-green-800 transition-colors"
              >
                {t("reset_filter")}
              </button>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && categoryFilter !== "all" && totalHits > HITS_PER_PAGE && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => updateUrl("page", (page - 1).toString())}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#005320] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
              {t("prev_page")}
            </button>

            <div className="px-4 text-sm font-bold text-gray-900">
              {page}
            </div>

            <button
              disabled={results.length < HITS_PER_PAGE}
              onClick={() => updateUrl("page", (page + 1).toString())}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#005320] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {t("next_page")}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}