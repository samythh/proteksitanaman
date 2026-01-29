// File: src/types/strapi.ts

// --- 1. META TYPES ---

export interface StrapiPagination {
   readonly page: number;
   readonly pageSize: number;
   readonly pageCount: number;
   readonly total: number;
}

export interface StrapiMeta {
   readonly pagination: StrapiPagination;
}

// --- 2. GENERIC RESPONSE WRAPPERS ---

/**
 * Wrapper untuk Single Type Response (misal: Get One Article, Homepage).
 * @template T - Tipe data entity (misal: Article, Staff)
 */
export interface StrapiSingleResponse<T> {
   readonly data: T | null; // Bisa null jika 404 handled gracefully
   readonly meta?: StrapiMeta; // Single type kadang tidak punya meta pagination
}

/**
 * Wrapper untuk Collection Type Response (misal: Get All Articles).
 * @template T - Tipe data entity (misal: Article, Staff)
 */
export interface StrapiCollectionResponse<T> {
   readonly data: T[];
   readonly meta: StrapiMeta;
}