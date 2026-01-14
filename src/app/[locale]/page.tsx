// File: src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import { fetchAPI } from '@/lib/strapi/fetcher';
import SectionRenderer from '@/components/strapi/section-renderer';
import qs from 'qs';

type Props = {
  params: Promise<{ locale: string }>;
};

// --- 1. FUNCTION FETCH DATA HOMEPAGE ---
async function getHomePageData(locale: string) {
  try {
    const path = "/homepage";
    const query = qs.stringify({
      locale: locale,
      populate: {
        blocks: {
          on: {
            // Hero Slider
            'sections.hero-slider': { populate: { slides: { populate: { image: true } } } },
            // Quick Access
            'sections.quick-access': { populate: { links: { populate: { icon: true } } } },
            // Video Profile
            'sections.video-profile': { populate: { slides: { populate: { video_file: { fields: ['url'] } } } } },
            // Welcome Section
            'sections.welcome-section': { populate: { profiles: { populate: { image: { fields: ['url'] } } } } },
            // Stats Section
            'sections.stats': { populate: { items: { populate: { icon: { fields: ['url'] } } } } },
            // Accreditation Section
            'sections.accreditation': { populate: { certificates: { populate: { image: { fields: ['url'] } } } } },

            // --- PARTNERSHIP SECTION ---
            'sections.partnership': {
              populate: {
                items: {
                  populate: {
                    logo: {
                      fields: ['url', 'alternativeText']
                    }
                  }
                }
              }
            },

            // --- VISITOR STATS (UPDATE: Background Pattern) ---
            'sections.visitor-stats': {
              populate: {
                // Ambil field background_pattern agar gambar dinamis muncul
                background_pattern: {
                  fields: ['url', 'alternativeText']
                }
              }
            },
            // ------------------------------------------------

            // --- OTHER LINK SECTION ---
            'sections.other-link-section': {
              populate: {
                items: {
                  populate: {
                    image: {
                      fields: ['url', 'alternativeText']
                    }
                  }
                }
              }
            },

            // --- FAQ SECTION ---
            'sections.faq-section': {
              populate: {
                items: {
                  populate: '*' // Ambil semua field text (question & answer)
                }
              }
            },

            // --- NEWS SECTION (TRIGGER) ---
            'sections.news-section': { populate: true }
          }
        }
      }
    });

    const response = await fetchAPI(`${path}?${query}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching home page:", error);
    return null;
  }
}

// --- 2. FUNCTION FETCH ARTIKEL TERBARU ---
async function getLatestArticles(locale: string) {
  try {
    const query = qs.stringify({
      locale: locale,
      sort: ['publishedDate:desc', 'publishedAt:desc'], // Urutkan: Paling baru
      pagination: {
        page: 1,
        pageSize: 5, // Ambil 5 berita awal (1 Utama + 4 Samping)
      },
      populate: {
        cover: { fields: ["url", "alternativeText"] },
        category: { fields: ["name", "color", "slug"] },
      },
      fields: ["title", "slug", "publishedAt", "publishedDate", "excerpt"],
    });

    const res = await fetchAPI(`/articles?${query}`);
    return res?.data || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return { title: t('title') };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  // --- 3. FETCH PARALEL (HOMEPAGE + ARTIKEL) ---
  const [strapiData, rawArticles] = await Promise.all([
    getHomePageData(locale),
    getLatestArticles(locale)
  ]);

  // Normalisasi Data Homepage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = (strapiData as any)?.blocks || (strapiData as any)?.attributes?.blocks || [];

  // Normalisasi Data Artikel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedArticles = rawArticles.map((item: any) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    publishedAt: item.publishedDate || item.publishedAt,
    excerpt: item.excerpt,
    cover: { url: item.cover?.url || "" },
    category: item.category ? { name: item.category.name, color: item.category.color } : undefined
  }));

  return (
    <div className="w-full">
      {blocks.length === 0 && (
        <div className="text-center py-20 bg-gray-50 border-b">
          <p className="text-gray-500 font-semibold">Data Homepage Kosong</p>
        </div>
      )}

      {/* --- 4. KIRIM DATA KE RENDERER --- */}
      <SectionRenderer
        sections={blocks}
        globalData={{
          articles: formattedArticles,
          locale: locale
        }}
      />
    </div>
  );
}