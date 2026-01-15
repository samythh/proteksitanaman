// src/app/[locale]/profil/staf/[category]/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Staff } from "@/types/staff";
import PageHeader from "@/components/ui/PageHeader"; // Menggunakan komponen Header yang sudah ada

// Import Ikon Default (Fallback)
import { SiGooglescholar } from "react-icons/si";
import { FaBook, FaGlobe } from "react-icons/fa";

// Helper untuk Rich Text (Jika education pakai Markdown)
import ReactMarkdown from "react-markdown";

// Interface Helper Gambar
interface StrapiImage {
  url?: string;
  data?: {
    attributes?: {
      url?: string;
    };
  };
}

// 1. Generate Static Params (Untuk performa & SEO)
export async function generateStaticParams() {
  const staffData = await fetchAPI("/staff-members", {
    fields: ["slug", "category"],
    populate: [], // Optimasi: Tidak perlu populate foto/detail di sini
    pagination: { limit: 100 }, // Ambil cukup banyak data untuk generate path
  });

  const locales = ["id", "en"];
  const params = [];

  if (!staffData?.data) return [];

  for (const locale of locales) {
    for (const staff of staffData.data) {
      // Support Strapi v4 (attributes) & v5 (flat)
      const attr = staff.attributes || staff;
      if (attr.slug && attr.category) {
        params.push({
          locale,
          category: attr.category,
          slug: attr.slug,
        });
      }
    }
  }
  return params;
}

// 2. Halaman Detail Staf
export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}) {
  const { category, slug, locale } = await params;

  // --- Fetch Data ---
  let staff: Staff | null = null;
  let pageConfig: any = null;
  let globalData: any = null;

  try {
    const [staffRes, configRes, globalRes] = await Promise.all([
      // A. Detail Staf
      fetchAPI("/staff-members", {
        filters: { slug: { $eq: slug } },
        populate: {
          photo: { fields: ["url"] },
          Role_Details: { populate: "*" }, // Ambil detail jabatan/pangkat
          Education_History: { populate: "*" }, // Ambil riwayat pendidikan
        },
        locale: locale,
      }),
      // B. Config Halaman (Untuk Banner & Icon Sinta/Scopus)
      fetchAPI("/staff-page-config", {
        populate: {
          Default_Card_Banner: { fields: ["url"] },
          Icon_Sinta: { fields: ["url"] },
          Icon_Scopus: { fields: ["url"] },
          Icon_GoogleScholar: { fields: ["url"] },
        },
        locale: locale,
      }),
      // C. Global (Hero Image Utama)
      fetchAPI("/global", {
        populate: "Default_Hero_Image",
        locale: locale,
      }),
    ]);

    staff = staffRes?.data?.[0] || null;
    pageConfig = configRes?.data;
    globalData = globalRes?.data;
  } catch (error) {
    console.error("[StaffDetail] Error fetching data:", error);
  }

  // Jika data staf tidak ditemukan -> 404
  if (!staff) {
    return notFound();
  }

  // --- Ekstraksi Data (Support Strapi v4/v5) ---
  const attr = (staff as any).attributes || staff;
  const {
    name,
    nip,
    photo,
    email,
    Role_Details,
    Education_History,
    sinta_url,
    scopus_url,
    google_scholar_url,
  } = attr;

  // Foto Profil
  const photoObj = photo?.data || photo;
  const photoUrl =
    getStrapiMedia(photoObj?.attributes?.url || photoObj?.url) ||
    "/images/placeholder-avatar.png";

  // Data Spesifik (Jabatan/Keahlian) dari Dynamic Zone
  const academicData = Role_Details?.find(
    (item: any) => item.__component === "staff-data.academic-data"
  );
  const adminData = Role_Details?.find(
    (item: any) => item.__component === "staff-data.admin-data"
  );

  // Teks Jabatan/Keahlian Utama
  let mainRole = "-";
  if (category === "akademik") {
    mainRole = academicData?.expertise || "Dosen";
  } else {
    mainRole = adminData?.position || "Tenaga Kependidikan";
  }

  // Banner & Hero Images
  const getUrl = (obj: any) => obj?.url || obj?.data?.attributes?.url;

  const heroUrl = getUrl(
    globalData?.attributes?.Default_Hero_Image || globalData?.Default_Hero_Image
  );
  const cardBannerUrl = getUrl(
    pageConfig?.attributes?.Default_Card_Banner ||
      pageConfig?.Default_Card_Banner
  );

  // Icon Images
  const icons = {
    sinta: getUrl(pageConfig?.attributes?.Icon_Sinta || pageConfig?.Icon_Sinta),
    scopus: getUrl(
      pageConfig?.attributes?.Icon_Scopus || pageConfig?.Icon_Scopus
    ),
    scholar: getUrl(
      pageConfig?.attributes?.Icon_GoogleScholar ||
        pageConfig?.Icon_GoogleScholar
    ),
  };

  // Label UI
  const roleLabel =
    category === "akademik"
      ? locale === "en"
        ? "Academic Staff"
        : "Staf Akademik"
      : locale === "en"
      ? "Administrative Staff"
      : "Staf Administrasi";

  const educationLabel = locale === "en" ? "Education" : "Pendidikan";

  return (
    <div className="bg-gray-50 min-h-screen pb-20 -mt-20 md:-mt-24">
      {/* 1. HERO HEADER */}
      <PageHeader
        title={name}
        breadcrumb={`Profil / Staf / ${roleLabel} / Detail`}
        backgroundImageUrl={heroUrl}
      />

      {/* 2. KONTEN UTAMA */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Judul Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Profil</h2>
          <h3 className="text-2xl font-bold text-green-600 mt-1">
            {roleLabel}
          </h3>
        </div>

        {/* --- KARTU UTAMA --- */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100">
          {/* A. Banner Staf (Batik/Gedung) */}
          <div className="h-48 md:h-64 w-full relative">
            {cardBannerUrl ? (
              <Image
                src={getStrapiMedia(cardBannerUrl)!}
                alt="Banner Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-800" />
            )}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* B. Foto & Info */}
          <div className="px-8 pb-10 relative text-center">
            {/* Foto Bulat Besar */}
            <div className="relative -mt-24 mb-6 inline-block">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 relative z-10">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Photo
                  </div>
                )}
              </div>
            </div>

            {/* Nama & NIP */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {name}
            </h1>
            <p className="text-lg text-gray-500 font-medium mb-4">
              NIP: {nip || "-"}
            </p>

            {/* Keahlian / Jabatan */}
            <div className="inline-block px-6 py-2 bg-green-50 rounded-full text-green-700 font-semibold mb-8">
              {mainRole}
            </div>

            {/* --- SEKSI EMAIL --- */}
            {email && (
              <div className="mb-8 border-t border-gray-200 pt-8 max-w-2xl mx-auto">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Email</h4>
                <a
                  href={`mailto:${email}`}
                  className="text-lg text-gray-600 hover:text-green-600 underline decoration-green-600/30 underline-offset-4 transition-all"
                >
                  {email}
                </a>
              </div>
            )}

            {/* --- SEKSI PENDIDIKAN (Dari Component Education_History) --- */}
            {Education_History && Education_History.length > 0 && (
              <div className="mb-8 border-t border-gray-200 pt-8 max-w-2xl mx-auto text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-6">
                  {educationLabel}
                </h4>
                <div className="space-y-4">
                  {Education_History.map((edu: any, index: number) => (
                    <div key={index} className="text-gray-700">
                      <span className="font-semibold block text-gray-900">
                        {edu.level} {edu.major}
                      </span>
                      <span className="text-sm text-gray-500">
                        {edu.institution} {edu.year ? `(${edu.year})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- SOCIAL LINKS (Sinta/Scopus) --- */}
            {/* Hanya untuk Akademik */}
            {category === "akademik" && (
              <div className="flex justify-center gap-6 mt-10 pt-8 border-t border-gray-100">
                {google_scholar_url && (
                  <Link
                    href={google_scholar_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                  >
                    {icons.scholar ? (
                      <Image
                        src={getStrapiMedia(icons.scholar)!}
                        alt="Google Scholar"
                        width={100}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <SiGooglescholar className="w-8 h-8 text-blue-600" />
                    )}
                  </Link>
                )}
                {sinta_url && (
                  <Link
                    href={sinta_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                  >
                    {icons.sinta ? (
                      <Image
                        src={getStrapiMedia(icons.sinta)!}
                        alt="Sinta"
                        width={100}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <FaBook className="w-8 h-8 text-blue-600" />
                    )}
                  </Link>
                )}
                {scopus_url && (
                  <Link
                    href={scopus_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                  >
                    {icons.scopus ? (
                      <Image
                        src={getStrapiMedia(icons.scopus)!}
                        alt="Scopus"
                        width={100}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <FaGlobe className="w-8 h-8 text-orange-500" />
                    )}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tombol Kembali */}
        <div className="text-center mt-12 mb-8">
          <Link
            href={`/${locale}/profil/staf/${category}`}
            className="inline-flex items-center text-green-700 font-semibold hover:underline"
          >
            ←{" "}
            {locale === "en" ? "Back to Staff List" : "Kembali ke Daftar Staf"}
          </Link>
        </div>
      </div>
    </div>
  );
}
