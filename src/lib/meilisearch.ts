// File: src/lib/meilisearch.ts
import { MeiliSearch } from "meilisearch";

// 1. KONFIGURASI
// Gunakan process.env.NEXT_PUBLIC_... karena file ini dipanggil di Client Component (search/page.tsx)
const MEILISEARCH_HOST =
  process.env.NEXT_PUBLIC_MEILISEARCH_HOST || "http://202.10.34.176:7700";

const MEILISEARCH_KEY =
  process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY ||
  "a5f404f7feb43cff3dcbc982db48e9832ba48a9ef98acc52e2831f0d1e44a15e";

// 2. INISIALISASI CLIENT
// Kita export sebagai 'meiliClient' (Named Export) agar sesuai dengan import di page.tsx
export const meiliClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_KEY,
});

// 3. EXPORT INDEX (OPSIONAL)
// Ini berguna jika Anda ingin melakukan single-search di komponen lain
export const articleIndex = meiliClient.index("article");
export const eventIndex = meiliClient.index("event");
export const staffIndex = meiliClient.index("staff-member");
export const facilityIndex = meiliClient.index("facility");
export const pageIndex = meiliClient.index("page");