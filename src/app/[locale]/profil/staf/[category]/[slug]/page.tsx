// src/app/[locale]/profil/staf/[category]/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Staff } from "@/types/staff";

// Import Ikon
import { SiGooglescholar } from "react-icons/si";
import { FaBook, FaGlobe, FaEnvelope, FaGraduationCap } from "react-icons/fa";

// Helper untuk Rich Text sederhana (jika education pakai Markdown)
import ReactMarkdown from "react-markdown";

// Fungsi untuk generate Static Params (Agar tidak 404 di Vercel)
export async function generateStaticParams() {
  const params = [];
  // Fetch semua staff untuk dapatkan slug mereka
  const staffData = await fetchAPI("/staff-members", {
    fields: ["slug", "category"],
  });
  const locales = ["id", "en"];

  if (!staffData?.data) return [];

  for (const locale of locales) {
    for (const staff of staffData.data) {
      if (staff.attributes.slug && staff.attributes.category) {
        params.push({
          locale,
          category: staff.attributes.category,
          slug: staff.attributes.slug,
        });
      }
    }
  }
  return params;
}

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}) {
  const { category, slug, locale } = await params;

  // 1. Fetch Data Detail Staf & Global Banner
  // Kita filter berdasarkan 'slug' yang unik
  const [staffRes, globalConfig] = await Promise.all([
    fetchAPI("/staff-members", {
      filters: { slug: { $eq: slug } }, // Cari staf dengan slug ini
      populate: ["photo"],
      locale: locale,
    }),
    fetchAPI("/staff-page-config", {
      populate: ["Default_Card_Banner", "default_card_banner"],
      locale: locale,
    }),
  ]);

  const staff = staffRes?.data?.[0] as Staff;

  // Jika data tidak ditemukan, tampilkan 404
  if (!staff) {
    return notFound();
  }

  const {
    name,
    nip,
    expertise,
    position,
    email,
    education,
    photo,
    sinta_url,
    scopus_url,
    google_scholar_url,
  } = staff.attributes;

  // Logic Gambar Banner (Sama seperti di Card)
  const attrsConfig = globalConfig?.data?.attributes;
  const bannerData =
    attrsConfig?.Default_Card_Banner?.data ||
    attrsConfig?.default_card_banner?.data;
  const bannerSrc =
    (bannerData ? getStrapiMedia(bannerData.attributes.url) : null) ||
    "/images/gedung-background.jpg";

  // Logic Foto Profil
  const photoUrl =
    getStrapiMedia(photo?.data?.attributes?.url) || "/placeholder-avatar.jpg";

  // Label Jabatan/Keahlian
  const roleLabel = category === "akademik" ? "Dosen" : "Tenaga Kependidikan";

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* 1. HERO HEADER (Kecil) */}
      <div className="relative h-[30vh] min-h-[250px] w-full bg-gray-900">
        <Image
          src="/images/header-campus.jpg"
          alt="Campus Background"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4 mt-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Detail Staf</h1>
          <p className="text-sm md:text-base opacity-90">
            Profil / Staf /{" "}
            {category === "akademik" ? "Akademik" : "Administrasi"} / Detail
          </p>
        </div>
      </div>

      {/* 2. KONTEN UTAMA */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* JUDUL HALAMAN */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Profil</h2>
          <h3 className="text-2xl font-bold text-green-600 mt-1">
            {roleLabel}
          </h3>
        </div>

        {/* --- KARTU UTAMA (SESUAI DESAIN) --- */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100">
          {/* A. Banner Card */}
          <div className="h-48 md:h-64 w-full relative">
            <Image
              src={bannerSrc}
              alt="Banner Profile"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* B. Foto Profil & Info Dasar */}
          <div className="px-8 pb-10 relative text-center">
            {/* Foto Bulat Besar (Overlap) */}
            <div className="relative -mt-24 mb-6 inline-block">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 relative z-10">
                <Image
                  src={photoUrl}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Nama & NIP */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {name}
            </h1>
            <p className="text-lg text-gray-500 font-medium mb-4">NIP: {nip}</p>

            {/* Keahlian / Jabatan */}
            <div className="inline-block px-6 py-2 bg-green-50 rounded-full text-green-700 font-semibold mb-8">
              {expertise || position}
            </div>

            {/* --- SEKSI EMAIL --- */}
            {email && (
              <div className="mb-8 border-t border-gray-200 pt-8 max-w-2xl mx-auto">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  Email
                </h4>
                <a
                  href={`mailto:${email}`}
                  className="text-lg text-gray-600 hover:text-green-600 underline decoration-green-600/30 underline-offset-4 transition-all"
                >
                  {email}
                </a>
              </div>
            )}

            {/* --- SEKSI PENDIDIKAN (Jika Ada) --- */}
            {education && (
              <div className="mb-8 border-t border-gray-200 pt-8 max-w-2xl mx-auto text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                  Pendidikan
                </h4>
                <div className="text-gray-600 leading-relaxed space-y-2 prose prose-green mx-auto">
                  {/* Render Markdown jika pake Rich Text, atau text biasa */}
                  <ReactMarkdown>{education}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* --- FOOTER: SOCIAL LINKS --- */}
            <div className="flex justify-center gap-6 mt-10 pt-8 border-t border-gray-100">
              {google_scholar_url && (
                <Link
                  href={google_scholar_url}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all group"
                >
                  <SiGooglescholar className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  <span className="font-medium text-sm hidden md:block">
                    Google Scholar
                  </span>
                </Link>
              )}
              {sinta_url && (
                <Link
                  href={sinta_url}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 hover:border-blue-600 hover:text-blue-600 transition-all group"
                >
                  <FaBook className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  <span className="font-medium text-sm hidden md:block">
                    SINTA
                  </span>
                </Link>
              )}
              {scopus_url && (
                <Link
                  href={scopus_url}
                  target="_blank"
                  className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 hover:border-orange-500 hover:text-orange-600 transition-all group"
                >
                  <FaGlobe className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                  <span className="font-medium text-sm hidden md:block">
                    Scopus
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Kembali */}
        <div className="text-center mt-12 mb-8">
          <Link
            href={`/${locale}/profil/staf/${category}`}
            className="inline-flex items-center text-green-700 font-semibold hover:underline"
          >
            ← Kembali ke Daftar Staf
          </Link>
        </div>
      </div>
    </div>
  );
}
