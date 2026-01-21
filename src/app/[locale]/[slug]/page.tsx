// File: src/app/[locale]/[slug]/page.tsx

import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/strapi/fetcher";
import SectionRenderer from "@/components/strapi/section-renderer";

// --- TYPE IMPORTS ---
import { NewsItem } from "@/components/sections/NewsDashboard";
import { Agenda } from "@/types/agenda";

// --- TYPES DEFINITION ---
interface StrapiImage {
   url?: string;
   data?: { attributes?: { url?: string } };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StrapiBlock = any;

interface PageData {
   slug?: string;
   blocks?: StrapiBlock[];
   attributes?: {
      slug?: string;
      blocks?: StrapiBlock[];
   };
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   [key: string]: any;
}

export async function generateStaticParams() {
   try {
      const pages = await fetchAPI("/pages", {
         fields: ["slug"],
         pagination: { limit: -1 },
      });
      const params = [];
      const locales = ["id", "en"];
      if (pages?.data) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         for (const page of pages.data as any[]) {
            const slug = page.slug || page.attributes?.slug;
            for (const locale of locales) {
               if (slug) params.push({ slug, locale });
            }
         }
      }
      return params;
   } catch (error) {
      console.error("Error generating params:", error);
      return [];
   }
}

export default async function DynamicPage({
   params,
}: {
   params: Promise<{ slug: string; locale: string }>;
}) {
   const { slug, locale } = await params;

   let pageData: PageData | null = null;

   let globalHeroUrl: string | undefined = undefined;
   let articles: NewsItem[] = [];
   let latestEvents: Agenda[] = [];

   // ==========================================
   // TAHAP 1: FETCH HALAMAN UTAMA (WAJIB)
   // ==========================================
   try {
      const pageRes = await fetchAPI("/pages", {
         filters: { slug: { $eq: slug } },
         locale: locale,
         populate: {
            blocks: {
               on: {
                  // --- 1. LAYOUT & TEXT ---
                  "layout.page-header": { populate: "*" },
                  "sections.rich-text": { populate: "*" },

                  // --- 2. EXISTING SECTIONS ---
                  "sections.visi-misi-section": {
                     populate: { programs: { populate: "*" } }
                  },
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

                  // --- 3. NEW COMPONENTS ---

                  // A. Fasilitas List
                  "sections.facilities-list-section": { populate: "*" },

                  // B. Image Section
                  "sections.image-section": {
                     populate: {
                        image: { fields: ["url", "alternativeText", "width", "height"] }
                     }
                  },

                  // C. Video Section
                  "sections.video-section": { populate: "*" },

                  // D. Feature List Section (Capaian Lulusan)
                  "sections.feature-list-section": {
                     populate: {
                        image: { fields: ["url", "alternativeText", "width", "height"] },
                        items: {
                           populate: {
                              icon: { fields: ["url", "alternativeText"] }
                           }
                        }
                     }
                  },

                  // E. Profile Grid Section (Profil Lulusan / Tim)
                  "sections.profile-grid-section": {
                     populate: {
                        items: {
                           populate: {
                              photo: { fields: ["url", "alternativeText", "width", "height"] }
                           }
                        }
                     }
                  },

                  // F. Curriculum Section (Mata Kuliah Accordion)
                  "sections.curriculum-section": {
                     populate: {
                        items: { // Masuk ke SemesterGroup
                           populate: {
                              courses: { // Masuk ke CourseItem
                                 populate: "*"
                              }
                           }
                        }
                     }
                  },

                  // G. Gallery Section (Galeri Foto)
                  "sections.gallery-section": {
                     populate: {
                        items: {
                           populate: {
                              image: { fields: ["url", "alternativeText", "width", "height"] }
                           }
                        }
                     }
                  },

                  // H. Document Section (Dokumen & SOP)
                  "sections.document-section": {
                     populate: {
                        categories: {
                           populate: {
                              groups: {
                                 populate: {
                                    files: {
                                       populate: {
                                          // Ambil URL file, nama, ekstensi, dan ukuran
                                          file: { fields: ["url", "name", "ext", "size"] }
                                       }
                                    }
                                 }
                              }
                           }
                        }
                     }
                  },

                  // I. Publication Section (Publikasi Ilmiah) ✅ NEW ADDITION
                  "sections.publication-section": {
                     populate: {
                        items: {
                           populate: {
                              image: { fields: ["url", "alternativeText", "width", "height"] }
                           }
                        }
                     }
                  },

                  // J. Agenda Preview
                  "sections.agenda-preview": { populate: "*" },

                  // --- 4. OTHER OPTIONAL SECTIONS ---
                  "sections.accreditation": { populate: { certificates: { populate: "*" } } },
                  "sections.stats": { populate: { items: { populate: "*" } } },
                  "sections.welcome-section": { populate: { profiles: { populate: "*" } } },
                  "sections.video-profile": { populate: { slides: { populate: "*" } } },
                  "sections.other-link-section": { populate: { items: { populate: "*" } } },
                  "sections.faq-section": { populate: { items: { populate: "*" } } },
                  "sections.partnership": { populate: { items: { populate: "*" } } },
                  "sections.hero-slider": { populate: { slides: { populate: "*" } } },
                  "sections.news-section": { populate: "*" },
                  "sections.visitor-stats": { populate: { background_pattern: { fields: ["url"] } } },
               },
            },
         },
      });

      if (!pageRes.data || pageRes.data.length === 0) {
         console.error(`[DynamicPage] Page not found for slug: ${slug}`);
         return notFound();
      }

      const rawPage = pageRes.data[0];
      pageData = rawPage.attributes ? rawPage.attributes : rawPage;

   } catch (error) {
      console.error("[DynamicPage] CRITICAL ERROR fetching Page:", error);
      return notFound();
   }

   // ==========================================
   // TAHAP 2: FETCH DATA PENDUKUNG (OPSIONAL)
   // ==========================================
   try {
      const [globalRes, newsRes, eventRes] = await Promise.all([
         fetchAPI("/global", {
            populate: "Default_Hero_Image",
            locale: locale,
         }).catch(() => null),

         fetchAPI("/articles", {
            locale: locale,
            pagination: { limit: 5 },
            populate: { cover: { fields: ["url"] }, category: { fields: ["name", "color"] } },
         }).catch(() => ({ data: [] })),

         fetchAPI("/events", {
            locale: locale,
            pagination: { limit: 4 },
            populate: { image: { fields: ["url"] }, tags: { populate: "*" } },
         }).catch(() => ({ data: [] })),
      ]);

      const globalImg = globalRes?.data?.Default_Hero_Image as StrapiImage | undefined;
      globalHeroUrl = globalImg?.url || globalImg?.data?.attributes?.url;
      articles = newsRes?.data || [];
      latestEvents = eventRes?.data || [];

   } catch (error) {
      console.warn("Non-critical data fetch failed:", error);
   }

   // ==========================================
   // RENDER HALAMAN
   // ==========================================
   const sections = pageData?.blocks || pageData?.attributes?.blocks || [];

   const globalDataForRenderer = {
      locale: locale,
      globalHeroUrl: globalHeroUrl,
      articles: articles,
      latestEvents: latestEvents
   };

   return (
      <div className="w-full bg-white pb-20 -mt-14 md:-mt-16 relative z-10">
         <SectionRenderer
            sections={sections}
            globalData={globalDataForRenderer}
         />
      </div>
   );
}