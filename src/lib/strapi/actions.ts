// File: src/lib/strapi/actions.ts
"use server";

import qs from "qs";
import { getStrapiURL } from "./utils";

// --- 1. ACTION UNTUK STAFF (Load More) ---
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
         console.error(`[getMoreStaff] API Error: ${res.status}`);
         throw new Error(`Failed to fetch staff data`);
      }

      return await res.json();

   } catch (error) {
      console.error("[getMoreStaff] ERROR:", error);
      return { data: [], meta: null };
   }
}

// --- 2. ACTION UNTUK FASILITAS (Infinite Scroll) ---
export async function getMoreFacilities(page: number, locale: string) {
   const baseUrl = getStrapiURL();
   const url = new URL("/api/facilities", baseUrl);

   const pageSize = 5; 

   const query = qs.stringify({
      locale: locale,
      sort: ["name:asc"],
      populate: ["images"], 
      pagination: {
         page: page,
         pageSize: pageSize,
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
         console.error(`[getMoreFacilities] API Error: ${res.status}`);
         return { data: [], meta: null };
      }

      return await res.json();

   } catch (error) {
      console.error("[getMoreFacilities] ERROR:", error);
      return { data: [], meta: null };
   }
}

// --- 3. ACTION UNTUK PUBLIKASI (Filter & Load More) ---
export async function getPublications(page: number, category: string, locale: string) {
   const baseUrl = getStrapiURL();
   const url = new URL("/api/publications", baseUrl);

   const pageSize = 8; 

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const filters: any = {};
   
   if (category !== "all") {
      // PERBAIKAN 1: Gunakan $eqi (Case Insensitive) agar 'journal' cocok dengan 'Journal'
      filters.category = { $eqi: category };
   }

   const query = qs.stringify({
      locale: locale,
      sort: ["year:desc", "title:asc"], 
      filters: filters,
      populate: ["image"], 
      pagination: {
         page: page,
         pageSize: pageSize,
      },
   });

   url.search = query;

   console.log(">>> [getPublications] Requesting URL:", url.href);

   try {
      const res = await fetch(url.href, {
         method: "GET",
         headers: { 
             "Content-Type": "application/json",
         },
         cache: "no-store", 
      });

      if (!res.ok) {
         console.error(`[getPublications] API Error Status: ${res.status}`);
         return { data: [], meta: null };
      }

      const json = await res.json();
      
      console.log(`>>> [getPublications] Found: ${json.data?.length || 0} items for category: ${category}`);
      
      return json;

   } catch (error) {
      console.error("[getPublications] CRITICAL ERROR:", error);
      return { data: [], meta: null };
   }
}