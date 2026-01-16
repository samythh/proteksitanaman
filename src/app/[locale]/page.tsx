// File: src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import { fetchAPI } from '@/lib/strapi/fetcher';
import SectionRenderer from '@/components/strapi/section-renderer';
import qs from 'qs';
import { Agenda } from "@/types/agenda";

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
            'sections.hero-slider': { populate: { slides: { populate: { image: true } } } },
            'sections.quick-access': { populate: { links: { populate: { icon: true } } } },
            'sections.video-profile': { populate: { slides: { populate: { video_file: { fields: ['url'] } } } } },
            'sections.welcome-section': { populate: { profiles: { populate: { image: { fields: ['url'] } } } } },
            'sections.stats': { populate: { items: { populate: { icon: { fields: ['url'] } } } } },
            'sections.accreditation': { populate: { certificates: { populate: { image: { fields: ['url'] } } } } },
            'sections.partnership': { populate: { items: { populate: { logo: { fields: ['url', 'alternativeText'] } } } } },
            'sections.visitor-stats': { populate: { background_pattern: { fields: ['url', 'alternativeText'] } } },
            'sections.other-link-section': { populate: { items: { populate: { image: { fields: ['url', 'alternativeText'] } } } } },
            'sections.faq-section': { populate: { items: { populate: '*' } } },
            'sections.news-section': { populate: true },
            'sections.agenda-preview': { populate: true },
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

// --- 2. FUNCTION FETCH ARTIKEL ---
async function getLatestArticles(locale: string) {
  try {
    const query = qs.stringify({
      locale: locale,
      sort: ['publishedDate:desc', 'publishedAt:desc'],
      pagination: { page: 1, pageSize: 5 },
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

// --- 3. FUNCTION FETCH AGENDA (SEMUA WAKTU) ---
async function getLatestEvents(locale: string) {
  try {
    const query = qs.stringify({
      locale: locale,
      sort: ['startDate:desc'], // Urutkan: Terbaru ke Terlama
      pagination: { limit: 4 },
      populate: {
        image: { fields: ["url"] },
        tags: { populate: "*" },
      },
    });

    const res = await fetchAPI(`/events?${query}`);
    return res?.data || [];
  } catch (error) {
    console.error("Error fetching events:", error);
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

  const [strapiData, rawArticles, rawEvents] = await Promise.all([
    getHomePageData(locale),
    getLatestArticles(locale),
    getLatestEvents(locale),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blocks = (strapiData as any)?.blocks || (strapiData as any)?.attributes?.blocks || [];

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

  const latestEvents: Agenda[] = rawEvents || [];

  return (
    <div className="w-full">
      {blocks.length === 0 && (
        <div className="text-center py-20 bg-gray-50 border-b">
          <p className="text-gray-500 font-semibold">Data Homepage Kosong</p>
        </div>
      )}

      <SectionRenderer
        sections={blocks}
        globalData={{
          locale: locale,
          articles: formattedArticles,
          latestEvents: latestEvents // <--- INI SUDAH BENAR DI SINI
        }}
      />
    </div>
  );
}