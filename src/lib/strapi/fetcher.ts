// File: src/lib/strapi/fetcher.ts
import qs from "qs";
import { CONFIG } from "@/lib/config";
import { ZodSchema } from "zod";

interface FetchOptions {
   headers?: Record<string, string>;
   noAuth?: boolean;
   cache?: RequestCache;
   next?: NextFetchRequestConfig;
   timeout?: number;
}

type UrlParams = Record<string, unknown>;

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

export async function fetchAPI<T = unknown>(
   path: string,
   urlParamsObject: UrlParams = {},
   options: FetchOptions = {},
   schema?: ZodSchema<T>
): Promise<T> {
   try {
      // 1. Build Headers
      const headers = {
         "Content-Type": "application/json",
         ...(!options.noAuth && CONFIG.API_TOKEN
            ? { Authorization: `Bearer ${CONFIG.API_TOKEN}` }
            : {}),
         ...options.headers,
      };

      // 2. Build Query String
      const queryString = qs.stringify(urlParamsObject, {
         encodeValuesOnly: true,
         arrayFormat: "indices",
      });

      // 3. Construct URL
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      const requestUrl = `${CONFIG.API_BASE_URL}/${cleanPath}${queryString ? `?${queryString}` : ""}`;

      // 4. Execute Fetch
      const response = await fetch(requestUrl, {
         method: "GET",
         headers,
         cache: options.cache || "no-store",
         next: options.next,
      });

      // 5. Handle API Errors (Non-200 responses)
      if (!response.ok) {
         const errorBody = await response.json().catch(() => ({}));

         // Logging Error yang informatif untuk Server Log (Vercel/Cloud)
         console.error(`[Strapi Fetch Error] ${response.status} | URL: ${requestUrl}`, JSON.stringify(errorBody));

         throw new StrapiError(
            `Strapi Error: ${response.status} ${response.statusText}`,
            response.status,
            errorBody
         );
      }

      // 6. Parse JSON
      const json = await response.json();

      // 7. Zod Validation
      if (schema) {
         const validationResult = schema.safeParse(json);

         if (!validationResult.success) {
            // Log ini sangat krusial jika skema database Strapi berubah tiba-tiba
            console.error(`❌ [Zod Validation Failed] Path: ${path}`, validationResult.error.format());
            throw new Error("Data integrity error: API response does not match schema.");
         }

         return validationResult.data;
      }

      return json as T;

   } catch (error) {
      if (error instanceof StrapiError) throw error;

      // Log untuk error fatal (Network failure, timeout, etc)
      console.error(`🔥 [FetchAPI Fatal Error] ${path}:`, error instanceof Error ? error.message : error);
      throw error;
   }
}