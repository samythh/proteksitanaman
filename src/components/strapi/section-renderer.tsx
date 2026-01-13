// File: src/components/strapi/section-renderer.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// Utilities
import { getStrapiMedia } from "@/lib/strapi/utils";

// Components Imports
import HeroSlider from "@/components/sections/HeroSlider";
import QuickAccess from "@/components/sections/QuickAccess";
import VideoProfile, { VideoSlide } from "@/components/sections/VideoProfile";
import WelcomeSection, { WelcomeProfileData } from "@/components/sections/WelcomeSection";
import StatsSection, { StatItemData } from "@/components/sections/StatsSection";
import AccreditationSection, { CertificateItemData } from "@/components/sections/AccreditationSection";
import NewsDashboard, { NewsItem } from "@/components/sections/NewsDashboard";

// --- Interface untuk Props Global ---
interface GlobalData {
   articles?: NewsItem[];
   locale?: string;
}

// Props untuk Component Renderer
interface SectionRendererProps {
   sections: any[];
   globalData?: GlobalData;
}

export default function SectionRenderer({
   sections,
   globalData
}: SectionRendererProps) {

   if (!sections) return null;

   return sections.map((section: any, index: number) => {

      switch (section.__component) {

         // 1. Hero Slider
         case "sections.hero-slider":
            return <HeroSlider key={index} data={section} />;

         // 2. Quick Access
         case "sections.quick-access":
            return <QuickAccess key={index} data={section} />;

         // 3. Video Profile
         case "sections.video-profile":
            const videoSlides: VideoSlide[] = section.slides.map((item: any) => ({
               id: item.id,
               header: item.header,
               description: item.description,
               videoTitle: item.video_title,
               videoUrl: getStrapiMedia(item.video_file?.url) || "",
               youtubeId: item.youtube_id || ""
            }));
            return <VideoProfile key={index} data={videoSlides} />;

         // 4. Welcome Section
         case "sections.welcome-section":
            const welcomeProfiles: WelcomeProfileData[] = section.profiles.map((item: any) => ({
               id: item.id,
               name: item.name,
               role: item.role,
               description: item.description,
               imageUrl: getStrapiMedia(item.image?.url) || ""
            }));
            return <WelcomeSection key={index} data={welcomeProfiles} />;

         // 5. Stats Section
         case "sections.stats":
            const statsData: StatItemData[] = section.items.map((item: any) => ({
               id: item.id,
               label: item.label,
               value: item.value,
               iconUrl: getStrapiMedia(item.icon?.url) || "",
            }));
            return <StatsSection key={index} data={statsData} />;

         // 6. Accreditation Section
         case "sections.accreditation":
            const certData: CertificateItemData[] = section.certificates.map((item: any) => ({
               id: item.id,
               title: item.title,
               imageUrl: getStrapiMedia(item.image?.url) || ""
            }));
            return <AccreditationSection key={index} title={section.title} data={certData} />;

         // 7. NEWS DASHBOARD (TRIGGER)
         case "sections.news-section":
            return (
               <NewsDashboard
                  key={index}
                  initialData={globalData?.articles || []}
                  locale={globalData?.locale || "id"}
                  // Mengaktifkan mode Homepage (menyembunyikan Load More, memunculkan Link Selengkapnya)
                  isHomePage={true}
               />
            );

         default:
            console.warn(`Komponen Strapi tidak dikenal: ${section.__component}`);
            return null;
      }
   });
}