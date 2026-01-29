// File: src/types/staff.ts

import { StrapiImage } from "./shared";

// --- 1. SUB-COMPONENTS (Untuk Data Terstruktur) ---

export interface EducationHistory {
  readonly id: number;
  readonly institution: string;
  readonly degree: string; 
  readonly year_start?: string;
  readonly year_end?: string;
  readonly description?: string;
}

export interface StaffRole {
  readonly id: number;
  readonly position_name: string;
  readonly start_date?: string;
  readonly end_date?: string;
}

// --- 2. MAIN ENTITY ---

export interface Staff {
  readonly id: number;
  readonly documentId?: string; 

  // Informasi Dasar
  readonly name: string;
  readonly nip: string;
  readonly slug: string;
  readonly category: "akademik" | "administrasi"; 

  readonly position?: string | null; 
  readonly expertise?: string | null; 
  readonly email?: string | null;

  // Media (Flattened)
  readonly photo?: StrapiImage | null;

  // Data Terstruktur (Komponen Repeater)
  // Perhatikan: Nama field harus sama persis dengan API ID di Strapi
  readonly Education_History?: EducationHistory[];
  readonly Role_Details?: StaffRole[];

  // Fallback jika Anda masih pakai Rich Text/String biasa untuk edukasi
  readonly education?: string | null;

  // Social / Academic Links
  readonly sinta_url?: string | null;
  readonly scopus_url?: string | null;
  readonly google_scholar_url?: string | null;
}

// --- 3. API RESPONSE WRAPPER ---
// Untuk dipanggil di actions.ts sebagai generic type fetchAPI<StaffResponse>

export interface StaffResponse {
  data: Staff[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}