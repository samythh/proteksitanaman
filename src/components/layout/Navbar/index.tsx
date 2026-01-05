// File: src/components/layout/Navbar/index.tsx
import React from 'react';
import NavbarClient from './NavbarClient';
import { fetchAPI } from '@/lib/strapi/fetcher';
import { getStrapiMedia } from '@/lib/strapi/utils';

interface StrapiNavItem {
   id: number;
   label: string;
   url: string;
   order: number;
   sections: {
      id: number;
      title: string;
      links: { id: number; label: string; url: string }[];
   }[];
}

// PERBAIKAN: Tambahkan siteName dan siteDescription
interface StrapiGlobal {
   siteName: string;
   siteDescription: string;
   logo?: { url: string };
}

async function getNavbarData(locale: string): Promise<StrapiNavItem[]> {
   try {
      const path = "/navigations";
      const urlParams = {
         locale: locale,
         sort: "order:asc",
         populate: { sections: { populate: { links: true } } },
      };
      const res = await fetchAPI(path, urlParams);
      return res.data as StrapiNavItem[];
   } catch (err) {
      console.error("Gagal mengambil data Navbar:", err);
      return [];
   }
}

async function getGlobalData(locale: string): Promise<StrapiGlobal | null> {
   try {
      const res = await fetchAPI("/global", {
         locale: locale,
         populate: { logo: true }
      });
      return res.data as StrapiGlobal;
   } catch (err) {
      console.error("Gagal mengambil data Global:", err);
      return null;
   }
}

export default async function Navbar({ locale }: { locale: string }) {
   const [navData, globalData] = await Promise.all([
      getNavbarData(locale),
      getGlobalData(locale)
   ]);

   const formattedMenu = navData.map((item) => ({
      id: item.id,
      label: item.label,
      url: item.url,
      sections: item.sections?.map((sec) => ({
         id: sec.id,
         title: sec.title,
         links: sec.links.map((l) => ({ id: l.id, label: l.label, url: l.url }))
      })) || []
   }));

   const logoUrl = getStrapiMedia(globalData?.logo?.url || null) || "/logo-unand.png";

   // Ambil teks dari Strapi, atau gunakan default jika kosong
   const siteName = globalData?.siteName || "Departemen Proteksi Tanaman";
   const siteDescription = globalData?.siteDescription || "";

   return (
      <NavbarClient
         menuItems={formattedMenu}
         logoUrl={logoUrl}
         // PERBAIKAN: Kirim props ini ke Client
         siteName={siteName}
         siteDescription={siteDescription}
      />
   );
}