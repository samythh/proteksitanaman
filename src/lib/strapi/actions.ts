// File: src/lib/strapi/actions.ts
"use server";
// ^ Wajib ada "use server" di baris paling atas agar bisa dipanggil dari Client Component

import { fetchAPI } from "@/lib/strapi/fetcher";

// Fungsi untuk mengambil data staff halaman selanjutnya
export async function getMoreStaff(
   category: string,
   locale: string,
   page: number
) {
   try {
      const response = await fetchAPI("/staff-members", {
         filters: { category: { $eq: category } },
         populate: {
            photo: { fields: ["url"] },
            Role_Details: { populate: "*" },
            Education_History: { populate: "*" }
         },
         locale: locale,
         sort: ["name:asc"],
         pagination: {
            page: page,
            pageSize: 6, // Jumlah item per load
         },
      });

      return {
         data: response.data || [],
         meta: response.meta,
      };
   } catch (error) {
      console.error("Error fetching more staff:", error);
      return { data: [], meta: null };
   }
}