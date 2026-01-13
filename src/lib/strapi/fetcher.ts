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
      // Cek Token (Debugging)
      const token = process.env.STRAPI_API_TOKEN;
      if (!token && !options.noAuth) {
         console.warn("⚠️ Peringatan: STRAPI_API_TOKEN tidak terbaca di .env!");
      }

      // 1. Siapkan Headers
      const headers = {
         "Content-Type": "application/json",
         ...(!options.noAuth && token
            ? { Authorization: `Bearer ${token}` }
            : {}),
         ...options.headers,
      };

      // 2. Build Query String
      const queryString = qs.stringify(urlParamsObject, {
         encodeValuesOnly: true,
      });

      // 3. Gabungkan URL
      // Hasilnya akan seperti: http://202.10.34.176:1337/api/homepage?populate=...
      const requestUrl = `${getStrapiURL(`/api${path}`)}${queryString ? `?${queryString}` : ""
         }`;

      // --- DEBUG LOGGING (PENTING) ---
      console.log("==========================================");
      console.log(`📡 Fetching: ${requestUrl}`);
      // console.log(`🔑 Token Preview: ${token?.substring(0, 10)}...`); // Uncomment jika ingin cek token
      console.log("==========================================");

      // 4. Lakukan Fetch
      const response = await fetch(requestUrl, {
         method: "GET",
         headers,
         cache: options.cache || "no-store", // Bagus untuk development
         next: options.next,
      });

      // 5. Handle Error
      if (!response.ok) {
         const errorBody = await response.text();
         console.error(`❌ Strapi Error [${response.status}]:`, errorBody);
         throw new Error(
            `Error Strapi ${response.status}: ${response.statusText} - ${errorBody}`
         );
      }

      // 6. Return JSON
      const data = await response.json();

      // Cek apakah data kosong dari Strapi
      if (!data.data) {
         console.warn("⚠️ Fetch berhasil (200 OK) tapi data dari Strapi 'null' atau kosong.");
      } else {
         console.log("✅ Data berhasil diterima!");
      }

      return data;

   } catch (error) {
      console.error(`🔥 FetchAPI Gagal Total pada ${path}:`);
      console.error(error);
      throw error;
   }
}