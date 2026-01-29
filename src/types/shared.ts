// File: src/types/shared.ts

/**
 * Format gambar responsif dari Strapi
 */
export interface StrapiImageFormat {
   readonly url: string;
   readonly width: number;
   readonly height: number;
   readonly size: number;
   readonly mime: string;
}

/**
 * Representasi Gambar Strapi (v5 Ready)
 */
export interface StrapiImage {
   readonly id: number;
   readonly documentId: string;
   readonly url: string;
   readonly alternativeText: string | null;
   readonly caption: string | null;
   readonly width: number | null;
   readonly height: number | null;
   readonly formats?: {
      readonly thumbnail?: StrapiImageFormat;
      readonly small?: StrapiImageFormat;
      readonly medium?: StrapiImageFormat;
      readonly large?: StrapiImageFormat;
   } | null;
}

// Tipe dasar untuk semua entity 
export interface StrapiEntity {
   id: number;
   documentId: string; 
   createdAt?: string;
   updatedAt?: string;
   publishedAt?: string;
}