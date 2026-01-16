// File: src/components/strapi/section-renderer.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { getStrapiMedia } from "@/lib/strapi/utils";

// Components Imports (Existing)
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

// --- IMPORT BARU ---
import PageHeader from "@/components/ui/PageHeader";
import RichText from "@/components/sections/RichText";

// --- IMPORT AGENDA (TAMBAHAN) ---
import AgendaPreview from "@/components/sections/AgendaPreview"; // <--- 1. Import Komponen
import { Agenda } from "@/types/agenda"; // <--- 2. Import Tipe Data

interface GlobalData {
   articles?: NewsItem[];
   locale?: string;
   globalHeroUrl?: string;
   latestEvents?: Agenda[]; // <--- 3. Daftarkan di Interface
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

         // --- 1. PAGE HEADER ---
         case "layout.page-header": {
            const specificImg = section.backgroundImage?.url || section.backgroundImage?.data?.attributes?.url;
            const finalBg = specificImg || globalData?.globalHeroUrl;

            return (
               <PageHeader
                  key={index}
                  title={section.title}
                  breadcrumb={section.breadcrumb}
                  backgroundImageUrl={finalBg}
                  sectionTitle={section.sectionTitle}
                  sectionSubtitle={section.sectionSubtitle}
               />
            );
         }

         // --- 2. RICH TEXT ---
         case "sections.rich-text":
         case "layout.rich-text":
            return <RichText key={index} data={section} />;

         // --- 3. AGENDA PREVIEW (TAMBAHAN) ---
         case "sections.agenda-preview":
            return (
               <AgendaPreview
                  key={index}
                  data={section} // Config Judul/Link dari Strapi
                  events={globalData?.latestEvents || []} // Data Event dari page.tsx
                  locale={globalData?.locale || "id"}
               />
            );

         // --- EXISTING COMPONENTS ---
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

         case "sections.visitor-stats":
            const visitorStatsData = {
               ...section,
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