// File: src/lib/strapi/utils.ts

// Mendapatkan URL API Strapi dari env atau default localhost
export function getStrapiURL(path = "") {
   return `${process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337"}${path}`;
}

// Helper untuk menampilkan gambar.
// Jika URL gambar relatif (/uploads/...), tambahkan domain Strapi.
// Jika URL sudah absolut (https://...), biarkan apa adanya.
export function getStrapiMedia(url: string | null) {
   if (url == null) {
      return null;
   }

   // Cek apakah URL sudah memiliki protokol (http/https)
   if (url.startsWith("http") || url.startsWith("//")) {
      return url;
   }

   // Jika tidak, gabungkan dengan URL Strapi
   return `${getStrapiURL()}${url}`;
}

// Fungsi Rekursif untuk meratakan (flatten) respon Strapi yang berjenjang.
// Strapi v4/v5 seringkali membungkus data dalam { data: { attributes: ... } }
// Fungsi ini mengubahnya menjadi object data biasa agar mudah dipakai di frontend.
export function flattenAttributes(data: unknown): unknown {
   // 1. Jika data null/undefined, kembalikan null
   if (!data) return null;

   // 2. Jika data adalah array, lakukan flatten pada setiap itemnya
   if (Array.isArray(data)) {
      return data.map(flattenAttributes);
   }

   // 3. Jika data adalah object
   if (typeof data === "object" && data !== null) {
      // Casting ke Record<string, unknown> agar aman diakses
      const obj = data as Record<string, unknown>;

      const flattened: Record<string, unknown> = {};

      // Jika ada properti 'data', kita ambil isinya (unwrap)
      if ("data" in obj) {
         return flattenAttributes(obj.data);
      }

      // Jika ada properti 'attributes', kita unwrap isinya
      if ("attributes" in obj) {
         return flattenAttributes(obj.attributes);
      }

      // Iterasi setiap key dalam object
      for (const key in obj) {
         // Lakukan flatten secara rekursif pada setiap value
         flattened[key] = flattenAttributes(obj[key]);
      }

      return flattened;
   }

   // 4. Jika tipe primitif (string, number, boolean), kembalikan langsung
   return data;
}