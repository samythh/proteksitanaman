import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import SectionRenderer from "@/components/strapi/section-renderer";
import { Metadata } from "next";

// --- TYPE IMPORTS ---
import { NewsItem } from "@/components/sections/NewsDashboard";
import { Agenda } from "@/types/agenda";

// --- TYPES DEFINITION ---
interface StrapiEntity {
   id: number;
   attributes?: Record<string, unknown>;
   [key: string]: unknown;
}

interface StrapiResponse<T> {
   data: T;
   meta?: Record<string, unknown>;
}

// Helper Normalisasi
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAttributes(item: any) {
   if (!item) return null;
   const attrs = item.attributes || item;
   return { id: item.id, ...attrs };
}

// --- GENERATE STATIC PARAMS ---
export async function generateStaticParams() {
   try {
      const pages = await fetchAPI("/pages", {
         fields: ["slug"],
         pagination: { limit: -1 },
         populate: { localizations: { fields: ["locale"] } }
      }) as StrapiResponse<StrapiEntity[]>;

      const params: { slug: string; locale: string }[] = [];
      const locales = ["id", "en"];

      if (pages?.data) {
         pages.data.forEach((page) => {
            const data = getAttributes(page);
            if (data?.slug) {
               locales.forEach((locale) => {
                  params.push({ slug: data.slug, locale });
               });
            }
         });
      }
      return params;
   } catch (error) {
      console.error("Error generating params:", error);
      return [];
   }
}

// --- GENERATE METADATA ---
export async function generateMetadata({
   params,
}: {
   params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
   const { slug, locale } = await params;

   const res = await fetchAPI("/pages", {
      filters: { slug: { $eq: slug } },
      locale,
      fields: ["title"],
   }) as StrapiResponse<StrapiEntity[]>;

   const page = getAttributes(res?.data?.[0]);

   if (!page) return { title: "Page Not Found" };

   return {
      title: page.title,
      description: `Halaman ${page.title} Departemen Proteksi Tanaman`,
   };
}


// --- MAIN PAGE COMPONENT ---
export default async function DynamicPage({
   params,
}: {
   params: Promise<{ slug: string; locale: string }>;
}) {
   const { slug, locale } = await params;

   // ==========================================
   // 1. DEFINISI POPULATE
   // ==========================================
   const blocksPopulate = {
      on: {
         "layout.page-header": { populate: "*" },
         "sections.rich-text": { populate: "*" },
         "sections.hero-slider": { populate: { slides: { populate: "*" } } },
         "sections.visi-misi-section": { populate: { programs: { populate: "*" } } },

         "sections.leaders-section": {
            populate: {
               groups: {
                  populate: {
                     current_leader: { populate: "*" },
                     past_leaders: { populate: "*" }
                  }
               }
            }
         },

         "sections.accreditation": {
            populate: {
               certificates: {
                  populate: {
                     image: { fields: ["url", "alternativeText", "width", "height"] }
                  }
               }
            }
         },

         "sections.image-section": {
            populate: { image: { fields: ["url", "alternativeText", "width", "height"] } }
         },

         "sections.visitor-stats": {
            populate: { background_pattern: { fields: ["url"] } }
         },

         "sections.welcome-section": {
            populate: { profiles: { populate: "*" } }
         },

         "sections.other-link-section": { populate: { items: { populate: "*" } } },
         "sections.video-profile": { populate: { slides: { populate: "*" } } },
         "sections.faq-section": { populate: { items: { populate: "*" } } },
         "sections.facilities-list-section": { populate: "*" },
         "sections.video-section": { populate: "*" },

         "sections.feature-list-section": {
            populate: {
               image: { fields: ["url"] },
               items: { populate: { icon: { fields: ["url"] } } }
            }
         },

         "sections.profile-grid-section": {
            populate: {
               items: { populate: { photo: { fields: ["url", "alternativeText"] } } }
            }
         },

         "sections.curriculum-section": {
            populate: {
               items: { populate: { courses: { populate: "*" } } }
            }
         },

         "sections.gallery-section": {
            populate: { items: { populate: { image: { fields: ["url"] } } } }
         },

         "sections.document-section": {
            populate: {
               categories: {
                  populate: {
                     groups: {
                        populate: {
                           files: { populate: { file: { fields: ["url", "name", "ext", "size"] } } }
                        }
                     }
                  }
               }
            }
         },

         "sections.publication-section": {
            populate: { items: { populate: { image: { fields: ["url"] } } } }
         },
      }
   };

   // ==========================================
   // 2. PARALLEL DATA FETCHING
   // ==========================================

   const [pageRes, globalRes, newsRes, agendaRes] = await Promise.all([
      // A. Page Data
      fetchAPI("/pages", {
         filters: { slug: { $eq: slug } },
         locale: locale,
         populate: {
            blocks: blocksPopulate,
         },
      }) as Promise<StrapiResponse<StrapiEntity[]>>,

      // B. Global Data
      fetchAPI("/global", {
         populate: "Default_Hero_Image",
         locale: locale,
      }).catch(() => null) as Promise<StrapiResponse<StrapiEntity> | null>,

      // C. News Data
      fetchAPI("/articles", {
         locale: locale,
         sort: ["publishedAt:desc"],
         pagination: { limit: 6 },
         populate: {
            cover: { fields: ["url"] },
            category: { fields: ["name", "color"] }
         },
      }).catch(() => ({ data: [] })) as Promise<StrapiResponse<StrapiEntity[]>>,

      // D. Agenda Data
      fetchAPI("/events", {
         locale: locale,
         sort: ["startDate:asc"],
         filters: { endDate: { $gte: new Date().toISOString() } },
         pagination: { limit: 5 },
         populate: {
            image: { fields: ["url", "alternativeText"] },
            tags: { populate: "*" }
         },
      }).catch((err) => {
         console.warn("Agenda fetch failed (check endpoint name):", err);
         return { data: [] };
      }) as Promise<StrapiResponse<Agenda[]>>,
   ]);

   // ==========================================
   // 3. VALIDASI & NORMALISASI
   // ==========================================

   const pageData = getAttributes(pageRes?.data?.[0]);

   if (!pageData) {
      return notFound();
   }

   const blocks = pageData.blocks || [];

   const globalData = getAttributes(globalRes?.data);
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const globalHeroRaw = globalData?.Default_Hero_Image as any;
   const globalHeroUrl = getStrapiMedia(
      globalHeroRaw?.url || globalHeroRaw?.data?.attributes?.url || globalHeroRaw?.attributes?.url
   );

   const rawArticles = newsRes?.data || [];

   const articles: NewsItem[] = rawArticles.map((item) => {
      const data = getAttributes(item);
      if (!data) return null;

      const imageData = data.cover || data.image;

      return {
         id: Number(data.id),
         title: data.title as string,
         slug: data.slug as string,
         publishedAt: data.publishedAt as string,
         excerpt: (data.description as string) || "Klik untuk membaca selengkapnya...",
         image: imageData,
         cover: imageData,
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         category: data.category as any
      };
   }).filter(Boolean) as NewsItem[];

   // Normalisasi Agenda
   const rawAgendas = agendaRes?.data || [];
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const latestEvents = rawAgendas.map((item: any) => {
      const data = getAttributes(item);
      return {
         ...data,
         endDate: data.endDate || data.startDate || "",
         image: data.image || null,
         tags: data.tags || []
      };
   });

   const globalDataForRenderer = {
      locale,
      globalHeroUrl: globalHeroUrl || undefined,
      articles,
      latestEvents
   };

   // ==========================================
   // 4. RENDER
   // ==========================================
   return (
      <div className="w-full bg-white pb-20 -mt-14 md:-mt-16 relative z-10 min-h-screen">
         <SectionRenderer
            sections={blocks}
            globalData={globalDataForRenderer}
         />
      </div>
   );
}