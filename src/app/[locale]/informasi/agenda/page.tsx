// File: src/app/[locale]/informasi/agenda/page.tsx
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import PageHeader from "@/components/ui/PageHeader";
import AgendaCard from "@/components/features/AgendaCard";
import AgendaHeroSlider from "@/components/features/AgendaHeroSlider"; // <-- Import Slider Baru
import { Agenda } from "@/types/agenda";

// Helper Component untuk Judul Section
function SectionTitle({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-2">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {link && (
        <Link
          href={link}
          className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
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

  // --- FETCH PARALEL ---
  const [ongoingRes, upcomingRes, pastRes, featuredRes] = await Promise.all([
    // 1. Sedang Berjalan
    fetchAPI("/events", {
      filters: {
        startDate: { $lte: now },
        endDate: { $gte: now },
      },
      populate: ["image"],
      sort: ["startDate:asc"],
      pagination: { limit: 4 },
      locale,
    }),

    // 2. Akan Datang
    fetchAPI("/events", {
      filters: {
        startDate: { $gt: now },
      },
      populate: ["image"],
      sort: ["startDate:asc"],
      pagination: { limit: 4 },
      locale,
    }),

    // 3. Selesai
    fetchAPI("/events", {
      filters: {
        endDate: { $lt: now },
      },
      populate: ["image"],
      sort: ["endDate:desc"],
      pagination: { limit: 4 },
      locale,
    }),

    // 4. Featured (SLIDER) - UPDATE DI SINI
    fetchAPI("/events", {
      filters: { is_featured: { $eq: true } },
      populate: ["image"],
      sort: ["startDate:desc"],
      pagination: { limit: 5 }, // Ambil 5 featured event untuk slider
      locale,
    }),
  ]);

  const ongoing: Agenda[] = ongoingRes?.data || [];
  const upcoming: Agenda[] = upcomingRes?.data || [];
  const past: Agenda[] = pastRes?.data || [];
  const featuredList: Agenda[] = featuredRes?.data || []; // Array untuk slider

  return (
    <div className="bg-gray-50 min-h-screen pb-20 -mt-3">
      {/* 1. HERO SLIDER */}
      {featuredList.length > 0 ? (
        // Gunakan Komponen Slider
        <AgendaHeroSlider data={featuredList} locale={locale} />
      ) : (
        // Fallback jika tidak ada featured event
        <PageHeader title="Agenda & Acara" breadcrumb="Informasi / Agenda" />
      )}

      {/* 2. KONTEN UTAMA */}
      <div className="container mx-auto px-4 mt-12 space-y-16">
        {/* SECTION: SEDANG BERJALAN */}
        {ongoing.length > 0 && (
          <section>
            <SectionTitle title="Sedang Berjalan" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcoming.map((item) => (
                <AgendaCard key={item.id} data={item} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">
                Belum ada agenda yang akan datang.
              </p>
            </div>
          )}
        </section>

        {/* SECTION: SELESAI */}
        <section>
          <SectionTitle title="Selesai" />
          {past.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-80 hover:opacity-100 transition-opacity">
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
        <div className="text-center mt-12">
          <button className="px-8 py-3 border border-green-600 text-green-700 font-semibold rounded-full hover:bg-green-600 hover:text-white transition-all">
            Lihat Semua Arsip
          </button>
        </div>
      </div>
    </div>
  );
}
