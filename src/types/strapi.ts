// File: src/types/strapi.ts

// Tipe untuk Pagination (Meta)
export interface Meta {
   pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
   };
}

// Tipe Generic untuk Respon Strapi Single (misal: Get One Article)
// <T> artinya kita bisa memasukkan tipe data spesifik nanti (misal: Article, Staff, dll)
export interface StrapiResponse<T> {
   data: T;
   meta: Meta;
}

// Tipe Generic untuk Respon Strapi Collection (misal: Get All Articles)
export interface StrapiCollectionResponse<T> {
   data: T[];
   meta: Meta;
}

// Tipe dasar untuk Gambar/Media dari Strapi
export interface StrapiImage {
   id: number;
   url: string;
   alternativeText: string | null;
   caption: string | null;
   width: number;
   height: number;
   formats: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
   };
}