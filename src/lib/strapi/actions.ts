// File: src/lib/strapi/actions.ts
"use server";

import qs from "qs";
import { getStrapiURL } from "./utils";

export async function getMoreStaff(category: string, locale: string, page: number) {
   // Debug 1: Cek URL dasar
   const baseUrl = getStrapiURL();
   const url = new URL("/api/staff-members", baseUrl);

   const query = qs.stringify({
      filters: { category: { $eq: category } },
      populate: {
         photo: { populate: "*" },
         Role_Details: { populate: "*" },
         Education_History: { populate: "*" },
      },
      locale: locale,
      sort: ["name:asc"],
      pagination: {
         page: page,
         pageSize: 6,
      },
   });

   url.search = query;

   console.log(`[SERVER ACTION] Fetching Page ${page}...`);
   console.log(`[SERVER ACTION] URL: ${url.href}`);

   try {
      const res = await fetch(url.href, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
         cache: "no-store",
      });

      if (!res.ok) {
         console.error(`[SERVER ACTION] Error Status: ${res.status}`);
         throw new Error(`Failed to fetch: ${res.status}`);
      }

      const json = await res.json();

      // Debug 2: Cek apakah data benar-benar ada
      const itemCount = json.data?.length || 0;
      console.log(`[SERVER ACTION] Success! Found ${itemCount} items on Page ${page}`);

      return json;

   } catch (error) {
      console.error("[SERVER ACTION] CRITICAL ERROR:", error);
      return { data: [], meta: null };
   }
}