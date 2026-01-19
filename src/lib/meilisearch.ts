// src/lib/meilisearch.ts
import { Meilisearch } from "meilisearch";

// Gunakan Environment Variable agar aman (Opsional, tapi disarankan)
// Atau hardcode jika untuk development dulu
const MEILISEARCH_HOST =
  process.env.NEXT_PUBLIC_MEILISEARCH_HOST || "http://202.10.34.176:7700";
const MEILISEARCH_KEY =
  process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY ||
  "a5f404f7feb43cff3dcbc982db48e9832ba48a9ef98acc52e2831f0d1e44a15e";

export const meiliClient = new Meilisearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_KEY,
});

// Export index spesifik agar mudah dipanggil
export const eventIndex = meiliClient.index("event");
export const articleIndex = meiliClient.index("article");
// Jika nanti ada berita, bisa tambah: export const newsIndex = meiliClient.index('news');
