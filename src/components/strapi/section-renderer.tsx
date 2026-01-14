// File: src/components/strapi/section-renderer.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getStrapiMedia } from "@/lib/strapi/utils";

// Components Imports
import HeroSlider from "@/components/sections/HeroSlider";
import QuickAccess from "@/components/sections/QuickAccess";
import VideoProfile, { VideoSlide } from "@/components/sections/VideoProfile";
import WelcomeSection, { WelcomeProfileData } from "@/components/sections/WelcomeSection";
import StatsSection, { StatItemData } from "@/components/sections/StatsSection";
import AccreditationSection, { CertificateItemData } from "@/components/sections/AccreditationSection";
import NewsDashboard, { NewsItem } from "@/components/sections/NewsDashboard";
import PartnershipSection, { PartnerItemData } from "@/components/sections/PartnershipSection";
import VisitorStats from "@/components/sections/VisitorStats";
import OtherLinkSection, { LinkItemData } from "@/components/sections/OtherLinkSection";
import FAQSection from "@/components/sections/FAQSection";

interface GlobalData {
   articles?: NewsItem[];
   locale?: string;
}

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

         case "sections.hero-slider":
            return <HeroSlider key={index} data={section} />;

         case "sections.quick-access":
            return <QuickAccess key={index} data={section} />;

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

         case "sections.welcome-section":
            const welcomeProfiles: WelcomeProfileData[] = section.profiles.map((item: any) => ({
               id: item.id,
               name: item.name,
               role: item.role,
               description: item.description,
               imageUrl: getStrapiMedia(item.image?.url) || ""
            }));
            return <WelcomeSection key={index} data={welcomeProfiles} />;

         case "sections.stats":
            const statsData: StatItemData[] = section.items.map((item: any) => ({
               id: item.id,
               label: item.label,
               value: item.value,
               iconUrl: getStrapiMedia(item.icon?.url) || "",
            }));
            return <StatsSection key={index} data={statsData} />;

         case "sections.accreditation":
            const certData: CertificateItemData[] = section.certificates.map((item: any) => ({
               id: item.id,
               title: item.title,
               imageUrl: getStrapiMedia(item.image?.url) || ""
            }));
            return <AccreditationSection key={index} title={section.title} data={certData} />;

         case "sections.news-section":
            return (
               <NewsDashboard
                  key={index}
                  initialData={globalData?.articles || []}
                  locale={globalData?.locale || "id"}
                  isHomePage={true}
               />
            );

         case "sections.partnership":
            const partnershipData: PartnerItemData[] = (section.items || []).map((item: any) => ({
               id: item.id,
               name: item.name,
               logoUrl: getStrapiMedia(item.logo?.url) || ""
            }));
            return (
               <PartnershipSection
                  key={index}
                  title={section.title}
                  data={partnershipData}
               />
            );

         // --- VISITOR STATS (UPDATE: Mapping Background Image) ---
         case "sections.visitor-stats":
            // Kita inject properti backgroundPatternUrl ke dalam data yang dikirim ke komponen
            const visitorStatsData = {
               ...section,
               // Mengambil URL dari object media Strapi
               backgroundPatternUrl: getStrapiMedia(section.background_pattern?.url) || ""
            };
            return <VisitorStats key={index} data={visitorStatsData} />;

         case "sections.other-link-section":
            const linkData: LinkItemData[] = (section.items || []).map((item: any) => ({
               id: item.id,
               title: item.title,
               url: item.url,
               imageUrl: getStrapiMedia(item.image?.url) || ""
            }));
            return (
               <OtherLinkSection
                  key={index}
                  title={section.title}
                  data={linkData}
               />
            );

         case "sections.faq-section":
            return <FAQSection key={index} data={section} />;

         default:
            console.warn(`Komponen Strapi tidak dikenal: ${section.__component}`);
            return null;
      }
   });
}