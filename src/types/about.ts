// File: src/types/about.ts

// --- 1. SHARED TYPES (Tipe yang dipakai berulang) ---

/**
 * Representasi Objek Gambar Strapi (Versi Flattened).
 * Kita asumsikan data sudah melewati fungsi flattenAttributes().
 */
export interface StrapiImage {
  readonly id: number;
  readonly url: string;
  readonly alternativeText: string | null;
  readonly caption: string | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly mime?: string; // Opsional
}

/**
 * Representasi Block Rich Text dari Strapi (Blocks Editor).
 * Menggantikan 'any' agar lebih type-safe.
 */
export type StrapiBlock = {
  type: "paragraph" | "heading" | "list" | "image" | "link" | "quote" | "code";
  children: Array<{
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    type?: "text" | "link";
    url?: string;
    children?: unknown[]; // Nested children
  }>;
  level?: 1 | 2 | 3 | 4 | 5 | 6; // Untuk heading
  format?: "ordered" | "unordered"; // Untuk list
  image?: StrapiImage; // Untuk image block
};

// --- 2. COMPONENT SECTIONS (Dynamic Zones) ---

export interface AboutHeroSection {
  readonly __component: "sections.hero" | "AboutHero"; 
  readonly id: number;
  readonly title: string;
  readonly subtitle?: string | null;
  readonly background_image?: StrapiImage; 
}

export interface AboutHistorySection {
  readonly __component: "sections.history" | "AboutHistory";
  readonly id: number;
  readonly title: string;
  readonly content: StrapiBlock[]; 
  readonly image?: StrapiImage;
}

export interface AboutVisionMissionSection {
  readonly __component: "sections.vision-mission" | "AboutVisionMission";
  readonly id: number;
  readonly vision_title?: string;
  readonly vision_content: string; // Biasanya teks biasa atau textarea
  readonly mission_title?: string;
  // Misi & Tujuan biasanya Repeater Component
  readonly missions: Array<{
    id: number;
    content: string;
  }>;
  readonly objectives: Array<{ // 'tujuan' di-inggriskan jadi objectives
    id: number;
    content: string;
  }>;
}

export interface AboutLeadershipSection {
  readonly __component: "sections.leadership" | "AboutLeadership";
  readonly id: number;
  readonly title: string;
  readonly description?: string | null;
  // Data staff biasanya di-fetch terpisah (client-side atau server action lain)
  // jadi tidak disimpan di sini.
}

// --- 3. MAIN PAGE TYPE ---

/**
 * Union Type untuk semua kemungkinan blok di halaman About.
 * Digunakan saat mapping Dynamic Zone.
 */
export type AboutPageBlock =
  | AboutHeroSection
  | AboutHistorySection
  | AboutVisionMissionSection
  | AboutLeadershipSection;

export interface AboutPageData {
  readonly id: number;
  readonly title: string;
  readonly description?: string;
  readonly blocks: AboutPageBlock[]; 
  readonly seo?: {
    metaTitle: string;
    metaDescription: string;
    shareImage?: StrapiImage;
  };
}