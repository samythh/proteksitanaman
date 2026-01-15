// src/app/[locale]/profil/staf/[category]/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Staff } from "@/types/staff";
import { FaArrowLeft } from "react-icons/fa";
import PageHeader from "@/components/ui/PageHeader";

// Import Ikon Default (Fallback)
import { SiGooglescholar } from "react-icons/si";
import { FaBook, FaGlobe } from "react-icons/fa";

// 1. Generate Static Params
export async function generateStaticParams() {
  const staffData = await fetchAPI("/staff-members", {
    fields: ["slug", "category"],
    populate: [],
    pagination: { limit: 100 },
  });

  const locales = ["id", "en"];
  const params = [];

  if (!staffData?.data) return [];

  for (const locale of locales) {
    for (const staff of staffData.data) {
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
          Role_Details: { populate: "*" }, // PENTING: Data link ada di dalam sini
          Education_History: { populate: "*" },
        },
        locale: locale,
      }),
      // B. Config Halaman
      fetchAPI("/staff-page-config", {
        populate: {
          Default_Card_Banner: { fields: ["url"] },
          Icon_Sinta: { fields: ["url"] },
          Icon_Scopus: { fields: ["url"] },
          Icon_GoogleScholar: { fields: ["url"] },
        },
        locale: locale,
      }),
      // C. Global
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

  if (!staff) {
    return notFound();
  }

  // --- Ekstraksi Data ---
  const attr = (staff as any).attributes || staff;
  const {
    name,
    nip,
    photo,
    email,
    Role_Details, // Kita butuh ini untuk ambil link
    Education_History,
  } = attr;

  // Foto Profil
  const photoObj = photo?.data || photo;
  const photoUrl =
    getStrapiMedia(photoObj?.attributes?.url || photoObj?.url) ||
    "/images/placeholder-avatar.png";

  // Data Spesifik (Jabatan/Keahlian & Link)
  const academicData = Role_Details?.find(
    (item: any) => item.__component === "staff-data.academic-data"
  );
  const adminData = Role_Details?.find(
    (item: any) => item.__component === "staff-data.admin-data"
  );

  let mainRole = "-";
  if (category === "akademik") {
    mainRole = academicData?.expertise || "Dosen";
  } else {
    mainRole = adminData?.position || "Tenaga Kependidikan";
  }

  // --- LOGIKA PERBAIKAN URL ---
  // Ambil URL dari academicData (di dalam Role_Details), BUKAN dari attr root
  const sinta_url = academicData?.sinta_url;
  const scopus_url = academicData?.scopus_url;
  const google_scholar_url = academicData?.google_scholar_url;

  // Helper URL Gambar
  const getUrl = (obj: any) => obj?.url || obj?.data?.attributes?.url;

  const heroUrl = getUrl(
    globalData?.attributes?.Default_Hero_Image || globalData?.Default_Hero_Image
  );

  const cardBannerUrl = getUrl(
    pageConfig?.attributes?.Default_Card_Banner ||
      pageConfig?.Default_Card_Banner
  );

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
      <PageHeader
        title={name}
        breadcrumb={`Profil / Staf / ${roleLabel} / Detail`}
        backgroundImageUrl={heroUrl}
      />

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Profil</h2>
          <h3 className="text-2xl font-bold text-green-600 mt-1">
            {roleLabel}
          </h3>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100">
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

          <div className="px-8 pb-10 relative text-center">
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

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {name}
            </h1>
            <p className="text-xl text-gray-500 font-medium mb-4">
              NIP: {nip || "-"}
            </p>

            <div className="inline-block px-6 py-2 bg-green-50 rounded-full text-green-700 font-semibold mb-8">
              {mainRole}
            </div>

            {email && (
              <div className="mb-8 border-t border-gray-200 pt-8 max-w-2xl mx-auto">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Email</h4>
                <a
                  href={`mailto:${email}`}
                  className="text-xl text-gray-600 hover:text-green-600 underline decoration-green-600/30 underline-offset-4 transition-all"
                >
                  {email}
                </a>
              </div>
            )}

            {Education_History && Education_History.length > 0 && (
              <div className="mb-8 border-t border-gray-200 pt-8 max-w-2xl mx-auto text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">
                  {educationLabel}
                </h4>
                <div className="space-y-4">
                  {Education_History.map((edu: any, index: number) => (
                    <div key={index} className="text-gray-700">
                      <span className="font-semibold block text-gray-900">
                        {edu.level} {edu.major}
                      </span>
                      <span className="text-lg text-gray-500">
                        {edu.institution} {edu.year ? `(${edu.year})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- FOOTER: SOCIAL LINKS --- */}
            {category === "akademik" && (
              <div className="flex justify-center gap-6 mt-10 pt-8 border-t border-gray-100 items-center flex-wrap">
                {/* 1. GOOGLE SCHOLAR */}
                {google_scholar_url ? (
                  <Link
                    href={google_scholar_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity flex items-center justify-center"
                    title="Google Scholar"
                  >
                    {icons.scholar ? (
                      <Image
                        src={getStrapiMedia(icons.scholar)!}
                        alt="Google Scholar"
                        width={120}
                        height={40}
                        className="h-10 w-auto object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:border-blue-500 hover:text-blue-600">
                        <SiGooglescholar className="w-6 h-6" />
                        <span className="font-medium text-sm">
                          Google Scholar
                        </span>
                      </div>
                    )}
                  </Link>
                ) : null}

                {/* 2. SINTA */}
                {sinta_url ? (
                  <Link
                    href={sinta_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity flex items-center justify-center"
                    title="Sinta"
                  >
                    {icons.sinta ? (
                      <Image
                        src={getStrapiMedia(icons.sinta)!}
                        alt="Sinta"
                        width={100}
                        height={40}
                        className="h-8 w-auto object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:border-blue-600 hover:text-blue-600">
                        <FaBook className="w-5 h-5" />
                        <span className="font-medium text-sm">SINTA</span>
                      </div>
                    )}
                  </Link>
                ) : null}

                {/* 3. SCOPUS */}
                {scopus_url ? (
                  <Link
                    href={scopus_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity flex items-center justify-center"
                    title="Scopus"
                  >
                    {icons.scopus ? (
                      <Image
                        src={getStrapiMedia(icons.scopus)!}
                        alt="Scopus"
                        width={100}
                        height={40}
                        className="h-8 w-auto object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:border-orange-500 hover:text-orange-600">
                        <FaGlobe className="w-5 h-5" />
                        <span className="font-medium text-sm">Scopus</span>
                      </div>
                    )}
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12 mb-16">
          <Link
            href={`/${locale}/profil/staf/${category}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-green-200 text-green-700 font-semibold rounded-full shadow-sm hover:shadow-md hover:bg-green-50 hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <FaArrowLeft className="text-sm transition-transform duration-300 group-hover:-translate-x-1" />
            <span>
              {locale === "en"
                ? "Back to Staff List"
                : "Kembali ke Daftar Staf"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
