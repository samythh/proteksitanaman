// File: src/lib/strapi/utils.ts

import { CONFIG } from "@/lib/config";

// --- 1. URL HELPER ---

/**
 * Mendapatkan URL lengkap ke Strapi.
 * Menggunakan konfigurasi terpusat dari src/lib/config.ts
 */
export function getStrapiURL(path = ""): string {
   // Pastikan path selalu diawali slash jika belum ada
   const cleanPath = path !== "" && !path.startsWith("/") ? `/${path}` : path;
   return `${CONFIG.STRAPI_HOST}${cleanPath}`;
}

// --- 2. MEDIA HELPER ---

/**
 * Helper untuk menampilkan gambar dari Strapi.
 * Menangani URL relatif (/uploads/...) dan absolut (https://...).
 * @param url - String URL gambar (bisa null/undefined)
 */
export function getStrapiMedia(url: string | null | undefined): string | null {
   if (!url) {
      return null;
   }

   // 1. Jika URL sudah memiliki protokol (external image / S3 bucket)
   if (url.startsWith("http") || url.startsWith("//")) {
      return url;
   }

   // 2. Jika URL relatif (local upload), gabungkan dengan STRAPI_HOST
   // Pastikan url diawali slash agar rapi
   const cleanUrl = url.startsWith("/") ? url : `/${url}`;

   return `${CONFIG.STRAPI_HOST}${cleanUrl}`;
}

// --- 3. DATA TRANSFORMATION (FLATTEN) ---

/**
 * Fungsi Rekursif untuk meratakan (flatten) response Strapi yang berjenjang.
 * Mengubah { data: { id: 1, attributes: { title: "X" } } } menjadi { id: 1, title: "X" }
 * * @template T - Tipe data hasil flatten (opsional)
 */
export function flattenAttributes<T = unknown>(data: unknown): T {
   // 1. Null check (null atau undefined)
   if (!data) return null as T;

   // 2. Jika data adalah array, flatten setiap item
   if (Array.isArray(data)) {
      return data.map((item) => flattenAttributes(item)) as unknown as T;
   }

   // 3. Jika data adalah object
   if (typeof data === "object") {
      // Casting ke bentuk Record agar properti bisa diakses
      const obj = data as Record<string, unknown>;

      // A. Handle wrapper 'data' (Strapi v4 standard wrapper)
      if ("data" in obj) {
         return flattenAttributes(obj.data);
      }

      // B. Handle wrapper 'attributes'
      // Strapi memisahkan ID dan Attributes. Kita gabungkan di sini.
      if ("attributes" in obj) {
         const attributes = flattenAttributes(obj.attributes) as Record<string, unknown>;
         const id = obj.id;

         // Jika ada ID di level luar (sibling dari attributes), masukkan ke dalam object
         if (id) {
            return { id, ...attributes } as unknown as T;
         }
         return attributes as unknown as T;
      }

      // C. Iterasi object biasa (bukan wrapper Strapi)
      const flattened: Record<string, unknown> = {};
      for (const key in obj) {
         // Rekursif untuk nested object/array di dalam field
         flattened[key] = flattenAttributes(obj[key]);
      }

      return flattened as T;
   }

   // 4. Primitive (string, number, boolean) kembalikan langsung
   return data as T;
}