// File: src/lib/strapi/actions.ts
"use server";

import qs from "qs";
import { getStrapiURL } from "./utils";

export async function getMoreStaff(category: string, locale: string, page: number) {
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

   try {
      const res = await fetch(url.href, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
         cache: "no-store",
      });

      if (!res.ok) {
         // jika API gagal
         console.error(`[getMoreStaff] API Error: ${res.status} - ${res.statusText}`);
         throw new Error(`Failed to fetch staff data: ${res.status}`);
      }

      const json = await res.json();
      return json;

   } catch (error) {
      console.error("[getMoreStaff] CRITICAL ERROR:", error);
      // Return struktur kosong yang aman agar UI tidak crash
      return { data: [], meta: null };
   }
}