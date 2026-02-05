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

   try {
      const res = await fetch(url.href, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
         cache: "no-store",
      });

      if (!res.ok) {
         console.error(`[getPublications] API Error Status: ${res.status}`);
         return { data: [], meta: null };
      }
      return await res.json();
   } catch (error) {
      console.error("[getPublications] CRITICAL ERROR:", error);
      return { data: [], meta: null };
   }
}

// --- 4. ACTION UNTUK BERITA/ARTIKEL ---
export async function getArticles(page: number, searchTerm: string, sort: string, locale: string) {
   const baseUrl = getStrapiURL();
   const url = new URL("/api/articles", baseUrl);
   const pageSize = 14;

   const sortOption = sort === 'oldest'
      ? ['publishedAt:asc', 'id:asc']
      : ['publishedAt:desc', 'id:desc'];

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const filters: any = {};
   if (searchTerm) {
      filters.title = { $containsi: searchTerm };
   }

   const query = qs.stringify({
      locale,
      sort: sortOption,
      filters,
      pagination: {
         page,
         pageSize,
      },
      populate: {
         cover: { fields: ['url', 'alternativeText'] },
         category: { fields: ['name', 'slug', 'color'] }
      },
      fields: ['title', 'slug', 'publishedAt', 'excerpt'],
   });

   url.search = query;

   try {
      const res = await fetch(url.href, {
         method: "GET",
         headers: { "Content-Type": "application/json" },
         cache: "no-store",
      });

      if (!res.ok) {
         console.error(`[getArticles] GAGAL. Status: ${res.status}`);
         return { data: [], meta: null };
      }

      const json = await res.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalizedData = json.data?.map((item: any) => {
         const data = item.attributes || item;
         const coverData = data.cover;
         let coverUrl = "";
         if (coverData?.url) {
            coverUrl = coverData.url.startsWith("http")
               ? coverData.url
               : `${baseUrl}${coverData.url}`;
         }

         const catData = data.category;

         return {
            id: item.id,
            title: data.title || "No Title",
            slug: data.slug || "#",
            publishedAt: data.publishedAt,
            excerpt: data.excerpt || "",
            cover: {
               url: coverUrl
            },
            category: catData ? {
               name: catData.name,
               color: catData.color
            } : undefined
         };
      });

      return {
         data: normalizedData || [],
         meta: json.meta
      };

   } catch (error) {
      console.error("[getArticles] ERROR FETCH:", error);
      return { data: [], meta: null };
   }
}