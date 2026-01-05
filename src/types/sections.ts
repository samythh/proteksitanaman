// File: src/types/sections.ts

export interface StrapiImage {
   url: string;
   alternativeText?: string;
   width?: number;
   height?: number;
}

export interface HeroSlide {
   id: number;
   title: string;
   subtitle?: string;
   buttonText?: string;
   buttonLink?: string;
   image?: StrapiImage;
}

export interface HeroSliderBlock {
   __component: 'sections.hero-slider';
   id: number;
   slides: HeroSlide[];
}

// PERBAIKAN: Tipe utama untuk semua section
export type StrapiSection = HeroSliderBlock;