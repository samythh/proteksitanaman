// File: src/components/layout/Navbar/index.tsx
import React from 'react';
import NavbarClient from './NavbarClient';
import { fetchAPI } from '@/lib/strapi/fetcher';
import { getStrapiMedia } from '@/lib/strapi/utils';
import { StrapiImage, StrapiEntity } from '@/types/shared';
import { StrapiCollectionResponse, StrapiSingleResponse } from '@/types/strapi';

// --- TYPE DEFINITIONS ---

interface LinkItem extends StrapiEntity {
   label: string;
   url: string;
}

interface MenuSection extends StrapiEntity {
   title: string;
   links: LinkItem[];
}

interface NavItem extends StrapiEntity {
   label: string;
   url: string;
   order: number;
   sections?: MenuSection[];
}

interface GlobalData extends StrapiEntity {
   siteName: string;
   siteDescription: string;
   logo?: StrapiImage;
}

// --- DATA FETCHING ---

async function getNavbarData(locale: string): Promise<NavItem[]> {
   try {
      const path = "/navigations";
      const urlParams = {
         locale,
         sort: "order:asc",
         populate: {
            sections: {
               populate: {
                  links: true
               }
            }
         },
      };

      const res = await fetchAPI<StrapiCollectionResponse<NavItem>>(path, urlParams);

      // Sekarang res.data valid (karena ada di dalam wrapper)
      return res.data || [];
   } catch (err) {
      console.error("❌ [Navbar] Gagal mengambil menu:", err);
      return [];
   }
}

async function getGlobalData(locale: string): Promise<GlobalData | null> {
   try {
      const path = "/global";
      const urlParams = {
         locale,
         populate: { logo: true },
      };

      const res = await fetchAPI<StrapiSingleResponse<GlobalData>>(path, urlParams);

      return res.data || null;
   } catch (err) {
      console.error("❌ [Navbar] Gagal mengambil Global Data:", err);
      return null;
   }
}

// --- SERVER COMPONENT ---

export default async function Navbar({ locale }: { locale: string }) {
   const [navData, globalData] = await Promise.all([
      getNavbarData(locale),
      getGlobalData(locale)
   ]);

   const formattedMenu = navData.map((item) => ({
      id: item.id,
      key: item.documentId || item.id,
      label: item.label,
      url: item.url,
      sections: item.sections?.map((sec) => ({
         id: sec.id,
         key: sec.documentId || sec.id,
         title: sec.title,
         links: sec.links.map((l) => ({
            id: l.id,
            label: l.label,
            url: l.url
         }))
      })) || []
   }));

   const logoUrl = getStrapiMedia(globalData?.logo?.url) || "/logo-unand.png";
   const siteName = globalData?.siteName || "Departemen Proteksi Tanaman";
   const siteDescription = globalData?.siteDescription || "Universitas Andalas";

   return (
      <NavbarClient
         menuItems={formattedMenu}
         logoUrl={logoUrl}
         siteName={siteName}
         siteDescription={siteDescription}
      />
   );
}