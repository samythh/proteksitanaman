import { notFound } from "next/navigation";
import Image from "next/image";
import { fetchAPI } from "@/lib/strapi/fetcher";
import StaffCard from "@/components/features/StaffCard";
import StaffFilter from "@/components/features/StaffFilter";
import { Staff } from "@/types/staff";

function formatTitle(slug: string) {
  if (slug === "akademik") return "Staf Akademik";
  if (slug === "administrasi") return "Staf Administrasi";
  return slug;
}

export default async function StaffPage({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const { category, locale } = await params;

  // Validasi URL
  if (!["akademik", "administrasi"].includes(category)) {
    return notFound();
  }

  // 🔥 FETCH PARALEL (Ambil Data Staff & Config Banner sekaligus)
  const [staffData, globalConfig] = await Promise.all([
    // 1. Ambil List Staf sesuai kategori
    fetchAPI("/staff-members", {
      filters: { category: { $eq: category } },
      populate: ["photo"],
      locale: locale,
      sort: ["name:asc"],
    }),

    // 2. Ambil Config Banner dari Single Type
    fetchAPI("/staff-page-config", {
      populate: ["Default_Card_Banner"],
      locale: locale,
    }),
  ]);

  const staffList: Staff[] = staffData?.data || [];

  // Ambil URL Banner jika ada
  const globalBannerUrl =
    globalConfig?.data?.attributes?.Default_Card_Banner?.data?.attributes?.url;

  const title = formatTitle(category);

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* 1. HERO PAGE HEADER */}
      <div className="relative h-[40vh] min-h-[300px] w-full bg-gray-900">
        <Image
          src="/images/header-campus.jpg" // Pastikan ada gambar ini di public
          alt="Campus Background"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4 mt-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
          <p className="text-sm md:text-base opacity-90">
            Profil / Staf / {title}
          </p>
        </div>
      </div>

      {/* 2. KONTEN UTAMA */}
      <div className="container mx-auto px-4 -mt-16 relative z-10">
        {/* Box Filter & Judul */}
        <div className="bg-white rounded-t-xl p-8 pb-4 text-center shadow-sm border-b border-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <h3 className="text-xl font-medium text-green-600 mt-1">
            Departemen Proteksi Tanaman
          </h3>
          <div className="w-16 h-1 bg-green-600 mx-auto mt-4 rounded-full mb-6"></div>

          {/* KOMPONEN FILTER */}
          <StaffFilter currentCategory={category} locale={locale} />
        </div>

        {/* Grid Staff Cards */}
        <div className="bg-white p-4 md:p-8 min-h-[400px] rounded-b-xl shadow-sm">
          {staffList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {staffList.map((staff) => (
                <StaffCard
                  key={staff.id}
                  data={staff}
                  globalBannerUrl={globalBannerUrl} // Oper URL Banner
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-lg font-medium">
                Belum ada data untuk {title}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
