import { type BlocksContent } from "@strapi/blocks-react-renderer";
import { StrapiImage } from "./shared";

// --- 1. SUB-ENTITIES ---

export interface AgendaTag {
  readonly id: number;
  readonly documentId?: string; // Strapi v5 Public ID
  readonly name: string;
  readonly slug: string;
  readonly color?: string | null;
}

// --- 2. MAIN ENTITY ---

/**
 * Tipe data Agenda yang sudah di-flatten.
 */
export interface AgendaItem {
  readonly id: number;
  readonly documentId?: string; // Strapi v5 specific

  readonly title: string;
  readonly slug: string;

  // Content bisa berupa Markdown string atau Rich Text Block (JSON)
  readonly content?: string | BlocksContent | null;

  // Ringkasan pendek untuk tampilan card/preview
  readonly excerpt?: string;

  // Tanggal dari API selalu String (ISO 8601)
  readonly startDate: string;
  readonly endDate?: string; // Opsional jika acara cuma 1 hari

  readonly location?: string | null;
  readonly isOnline?: boolean; // Opsional: Penanda online/offline

  // Relation Fields (Flattened)
  readonly image?: StrapiImage | null;
  readonly tags?: AgendaTag[];

  // SEO (Opsional)
  readonly seo?: {
    metaTitle: string;
    metaDescription: string;
  };
}

export type Agenda = AgendaItem;

// --- 3. API RESPONSE WRAPPER ---

export interface AgendaResponse {
  data: AgendaItem[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}