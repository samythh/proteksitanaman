// File: src/app/[locale]/informasi/agenda/page.tsx
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import PageHeader from "@/components/ui/PageHeader";
import AgendaCard from "@/components/features/AgendaCard";
import AgendaHeroSlider from "@/components/features/AgendaHeroSlider";
import { Agenda } from "@/types/agenda";

// Helper Component untuk Judul Section
function SectionTitle({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="relative">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="h-1 w-12 bg-green-600 rounded-full mt-1"></div>
      </div>
      {link && (
        <Link
          href={link}
          className="px-4 py-1.5 text-xs font-bold text-green-700 border border-green-200 bg-green-50 rounded-full hover:bg-green-600 hover:text-white transition-all"
        >
          Lihat Semua &rarr;
        </Link>
      )}
    </div>
  );
}

export default async function AgendaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const now = new Date().toISOString();

  // Opsi Populate Standar untuk Image + Tags
  // Kita gunakan ini berulang-ulang agar kode rapi
  const commonPopulate = {
    image: { fields: ["url"] },
    tags: { populate: "*" }, // <--- INI KUNCINYA: Ambil data tags
  };

  // --- FETCH PARALEL ---
  const [ongoingRes, upcomingRes, pastRes, featuredRes] = await Promise.all([
    // 1. Sedang Berjalan
    fetchAPI("/events", {
      filters: { startDate: { $lte: now }, endDate: { $gte: now } },
      populate: commonPopulate, // <--- Update Populate
      sort: ["startDate:asc"],
      pagination: { limit: 4 },
      locale,
    }),
    // 2. Akan Datang
    fetchAPI("/events", {
      filters: { startDate: { $gt: now } },
      populate: commonPopulate, // <--- Update Populate
      sort: ["startDate:asc"],
      pagination: { limit: 4 },
      locale,
    }),
    // 3. Selesai
    fetchAPI("/events", {
      filters: { endDate: { $lt: now } },
      populate: commonPopulate, // <--- Update Populate
      sort: ["endDate:desc"],
      pagination: { limit: 4 },
      locale,
    }),
    // 4. Featured Slider
    fetchAPI("/events", {
      filters: { is_featured: { $eq: true } },
      populate: commonPopulate, // <--- Update Populate
      sort: ["startDate:desc"],
      pagination: { limit: 5 },
      locale,
    }),
  ]);

  const ongoing: Agenda[] = ongoingRes?.data || [];
  const upcoming: Agenda[] = upcomingRes?.data || [];
  const past: Agenda[] = pastRes?.data || [];
  const featuredList: Agenda[] = featuredRes?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen pb-20 -mt-3">
      {/* 1. HERO SLIDER */}
      {featuredList.length > 0 ? (
        <AgendaHeroSlider data={featuredList} locale={locale} />
      ) : (
        <PageHeader title="Agenda & Acara" breadcrumb="Informasi / Agenda" />
      )}

      {/* 2. KONTEN UTAMA */}
      <div className="container mx-auto px-4 mt-12 space-y-20">
        {/* SECTION: SEDANG BERJALAN */}
        {ongoing.length > 0 && (
          <section>
            <SectionTitle title="Sedang Berjalan" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {ongoing.map((item) => (
                <AgendaCard key={item.id} data={item} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* SECTION: AKAN DATANG */}
        <section>
          <SectionTitle title="Akan Datang" />
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {upcoming.map((item) => (
                <AgendaCard key={item.id} data={item} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 font-medium">
                Belum ada agenda yang akan datang.
              </p>
            </div>
          )}
        </section>

        {/* SECTION: SELESAI */}
        <section>
          <SectionTitle title="Selesai" />
          {past.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 opacity-90 hover:opacity-100 transition-opacity">
              {past.map((item) => (
                <AgendaCard key={item.id} data={item} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Belum ada agenda yang selesai.
            </p>
          )}
        </section>

        {/* SECTION: BUTTON LOAD MORE */}
        <div className="flex justify-center pt-8">
          <button className="px-10 py-3 bg-white border border-green-600 text-green-700 font-bold rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm hover:shadow-lg transform hover:-translate-y-1">
            Lihat Semua Arsip
          </button>
        </div>
      </div>
    </div>
  );
}
