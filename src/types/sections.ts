// File: src/types/sections.ts

import { StrapiImage } from "./shared"; 

// --- 1. HERO SLIDER SECTION ---

export interface HeroSlide {
   readonly id: number;
   readonly title: string;
   readonly subtitle?: string | null;

   // Opsi A: Jika button hanya teks & link biasa
   readonly buttonText?: string | null;
   readonly buttonLink?: string | null;

   // Opsi B: Jika button adalah komponen terpisah (Link Component)
   // readonly cta?: StrapiLink; 

   readonly image?: StrapiImage; 
}

export interface HeroSliderSection {
   readonly __component: "sections.hero-slider";
   readonly id: number;
   readonly slides: HeroSlide[];
}

// --- 2. SECTION LAINNYA (Contoh Pengembangan) ---
// Nanti Anda bisa tambahkan section lain di sini saat project berkembang.

export interface RichTextSection {
   readonly __component: "sections.rich-text";
   readonly id: number;
   readonly content: string; // atau StrapiBlock[]
}

export interface FeaturesSection {
   readonly __component: "sections.features";
   readonly id: number;
   readonly title: string;
   // ... properties lainnya
}

// --- 3. UNION TYPE UTAMA ---

/**
 * Union Type untuk semua komponen Dynamic Zone di Homepage/Landing Page.
 * Digunakan di page.tsx untuk mapping:
 * {sections.map(section => {
 * switch(section.__component) { ... }
 * })}
 */
export type StrapiSection =
   | HeroSliderSection
   | RichTextSection
   | FeaturesSection;