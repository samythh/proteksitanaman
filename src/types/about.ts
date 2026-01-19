// src/types/about.ts
export interface StrapiImage {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
}

export interface HeroSection {
  __component: "AboutHero";
  id: number;
  title: string;
  subtitle?: string;
  background_image: { data: StrapiImage };
}

export interface HistorySection {
  __component: "AboutHistory";
  id: number;
  title: string;
  content: any; // Block rich text Strapi
  image: { data: StrapiImage };
}

export interface VisionMissionSection {
  __component: "AboutVisionMission";
  id: number;
  visi: string;
  misi: { id: number; content: string }[];
  tujuan: { id: number; content: string }[];
}

export interface LeadershipSection {
  __component: "AboutLeadership";
  id: number;
  title: string;
  // Di sini kita tidak menyimpan data staf di komponen ini,
  // tapi komponen ini bertanda untuk merender daftar staf.
}

export type AboutPageBlock =
  | HeroSection
  | HistorySection
  | VisionMissionSection
  | LeadershipSection;
