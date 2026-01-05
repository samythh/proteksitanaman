// File: src/lib/strapi/fetcher.ts
import qs from "qs";
import { getStrapiURL } from "./utils";

interface FetchOptions {
   headers?: Record<string, string>;
   noAuth?: boolean;
   cache?: RequestCache;
   next?: NextFetchRequestConfig;
}

type UrlParams = Record<string, unknown>;

export async function fetchAPI(
   path: string,
   urlParamsObject: UrlParams = {},
   options: FetchOptions = {}
) {
   try {
      // 1. Siapkan Headers
      const headers = {
         "Content-Type": "application/json",
         ...(!options.noAuth && process.env.STRAPI_API_TOKEN
            ? { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }
            : {}),
         ...options.headers,
      };

      // 2. Build Query String
      const queryString = qs.stringify(urlParamsObject, {
         encodeValuesOnly: true,
      });

      // 3. Gabungkan URL
      const requestUrl = `${getStrapiURL(`/api${path}`)}${queryString ? `?${queryString}` : ""}`;

      // 4. Lakukan Fetch
      const response = await fetch(requestUrl, {
         method: "GET",
         headers,
         // --- PERBAIKAN DISINI ---
         // Ganti "force-cache" menjadi "no-store".
         // Ini memaksa Next.js mengambil data baru setiap saat (penting untuk ganti bahasa).
         cache: options.cache || "no-store",

         next: options.next,
      });

      // 5. Handle Error
      if (!response.ok) {
         const errorBody = await response.text();
         throw new Error(
            `Error Strapi ${response.status}: ${response.statusText} - ${errorBody}`
         );
      }

      // 6. Return JSON
      const data = await response.json();
      return data;

   } catch (error) {
      console.error(`FetchAPI Error on ${path}:`, error);
      throw error;
   }
}