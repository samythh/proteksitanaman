// File: src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';
import { fetchAPI } from '@/lib/strapi/fetcher';
import SectionRenderer from '@/components/strapi/section-renderer';
import qs from 'qs';

type Props = {
  params: Promise<{ locale: string }>;
};

async function getHomePageData() {
  try {
    // --- PERBAIKAN UTAMA DISINI ---
    // Sesuai screenshot Anda: API ID adalah 'homepage' (tanpa strip)
    const path = "/homepage";

    const query = qs.stringify({
      populate: {
        blocks: {
          on: {
            'sections.hero-slider': {
              populate: {
                slides: {
                  populate: { image: true }
                }
              }
            }
          }
        }
      }
    });

    const response = await fetchAPI(`${path}?${query}`);

    console.log("HASIL DATA:", JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error("Error fetching home page:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title')
  };
}

export default async function HomePage() {
  const strapiData = await getHomePageData();
  const blocks = strapiData?.blocks || [];

  return (
    <div className="w-full">
      {/* Debugging: Jika kosong, beri tahu user */}
      {blocks.length === 0 && (
        <div className="text-center py-20 bg-gray-50 border-b">
          <p className="text-gray-500">
            Data belum muncul? Pastikan:
          </p>
          <ul className="text-sm text-gray-400 list-disc inline-block text-left mt-2">
            <li>Isi konten di Strapi (HomePage)</li>
            <li>Klik tombol <strong>Publish</strong> (Warna Hijau)</li>
            <li>Cek Settings Permissions (Public &gt; Homepage &gt; find)</li>
          </ul>
        </div>
      )}

      <SectionRenderer sections={blocks} />
    </div>
  );
}