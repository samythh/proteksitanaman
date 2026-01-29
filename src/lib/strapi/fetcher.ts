// File: src/lib/strapi/fetcher.ts
import qs from "qs";
import { CONFIG } from "@/lib/config";
import { ZodSchema } from "zod";

// --- 1. TYPE DEFINITIONS ---
interface FetchOptions {
   headers?: Record<string, string>;
   noAuth?: boolean;
   cache?: RequestCache;
   next?: NextFetchRequestConfig;
   timeout?: number;
}

type UrlParams = Record<string, unknown>;

/**
 * Custom Error Class untuk Strapi
 * Memudahkan kita membedakan error network vs error dari API Strapi
 */
class StrapiError extends Error {
   status: number;
   payload: unknown;

   constructor(message: string, status: number, payload: unknown) {
      super(message);
      this.name = "StrapiError";
      this.status = status;
      this.payload = payload;
   }
}

// --- 2. MAIN FUNCTION (GENERIC TYPE <T>) ---
/**
 * Mengambil data dari Strapi API dengan validasi Zod opsional.
 * @template T - Tipe data yang diharapkan (inferred dari Zod Schema jika ada)
 * @param path - Endpoint API (contoh: "/articles")
 * @param urlParamsObject - Query params (filter, populate, locale)
 * @param options - Opsi fetch (cache, headers, auth)
 * @param schema - (Opsional) Skema Zod untuk validasi data response
 */
export async function fetchAPI<T = unknown>(
   path: string,
   urlParamsObject: UrlParams = {},
   options: FetchOptions = {},
   schema?: ZodSchema<T> 
): Promise<T> {
   try {
      // A. Validasi Config (Early Return)
      if (!options.noAuth && !CONFIG.API_TOKEN) {
         if (CONFIG.IS_DEV) {
            console.warn("⚠️ [Strapi] Token tidak ditemukan di config. Request mungkin gagal 403.");
         }
      }

      // B. Build Headers
      const headers = {
         "Content-Type": "application/json",
         ...(!options.noAuth && CONFIG.API_TOKEN
            ? { Authorization: `Bearer ${CONFIG.API_TOKEN}` }
            : {}),
         ...options.headers,
      };

      // C. Build Query String
      const queryString = qs.stringify(urlParamsObject, {
         encodeValuesOnly: true,
         arrayFormat: "indices", // Standar Strapi untuk array filtering
      });

      // D. Construct URL
      // Hapus slash di depan path jika user menambahkannya (defensive programming)
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      const requestUrl = `${CONFIG.API_BASE_URL}/${cleanPath}${queryString ? `?${queryString}` : ""}`;

      // --- DEBUG LOGGING (Hanya di Dev Mode) ---
      // Log request normal (opsional, bisa dimatikan jika terlalu berisik)
      if (CONFIG.IS_DEV) {
         // console.log(`📡 [GET] ${requestUrl}`); 
      }

      // E. Execute Fetch
      const response = await fetch(requestUrl, {
         method: "GET",
         headers,
         cache: options.cache || "no-store", // Default ke dynamic fetching
         next: options.next,
      });

      // F. Handle API Errors (Non-200 responses)
      if (!response.ok) {
         const errorBody = await response.json().catch(() => ({})); // Safe parse jika body bukan JSON

         // 🔥🔥🔥 LOGGING TAMBAHAN (PENTING UNTUK DEBUGGING) 🔥🔥🔥
         console.error("\n🛑 [STRAPI FETCH ERROR]");
         console.error("   👉 URL Request:", requestUrl);
         console.error("   👉 Status Code:", response.status, response.statusText);
         console.error("   👉 Error Body :", JSON.stringify(errorBody, null, 2));
         console.error("---------------------------------------------------\n");

         // Jika error 404, kita bisa return null atau throw spesifik (tergantung strategi)
         // Di sini kita throw agar ditangkap error boundary
         throw new StrapiError(
            `Strapi Error: ${response.status} ${response.statusText}`,
            response.status,
            errorBody
         );
      }

      // G. Parse JSON
      const json = await response.json();

      // H. Validasi Data dengan Zod (THE GOLDEN STANDARD) 🛡️
      // Jika schema diberikan, kita validasi struktur datanya.
      if (schema) {
         const validationResult = schema.safeParse(json);

         if (!validationResult.success) {
            console.error("❌ [Zod] Validasi Data Gagal:", validationResult.error);
            throw new Error("Data dari API tidak sesuai skema yang diharapkan.");
         }

         return validationResult.data; // Mengembalikan data yang sudah terjamin tipenya
      }

      // Jika tidak ada schema, return raw json (unsafe, tapi backward compatible)
      return json as T;

   } catch (error) {
      // Re-throw StrapiError agar bisa ditangani spesifik di UI
      if (error instanceof StrapiError) {
         throw error;
      }

      // Log error fatal
      console.error(`🔥 [FetchAPI] Critical Error pada ${path}:`, error);
      throw error;
   }
}