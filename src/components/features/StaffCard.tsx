// File: src/components/features/StaffCard.tsx
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Staff } from "@/types/staff";

// Import Icon Default
import { SiGooglescholar } from "react-icons/si";
import { FaBook, FaGlobe } from "react-icons/fa";

// 1. UPDATE INTERFACE
interface StaffCardProps {
  data: Staff;
  globalBannerUrl?: string;
  icons?: {
    sinta?: string;
    scopus?: string;
    scholar?: string;
  };
  locale?: string;
}

// --- Definisi Tipe Data Internal ---
interface AcademicDataComponent {
  __component: "staff-data.academic-data";
  expertise: string;
  sinta_url?: string;
  scopus_url?: string;
  google_scholar_url?: string;
}

interface AdminDataComponent {
  __component: "staff-data.admin-data";
  position: string;
  rank: string;
}

type RoleDetailItem = AcademicDataComponent | AdminDataComponent;

interface StaffAttributes {
  name: string;
  nip: string;
  slug: string; // Pastikan slug ada di interface
  category: "akademik" | "administrasi";
  photo?: { data?: { attributes?: { url: string } } | null; url?: string };
  Role_Details: RoleDetailItem[];
}
// ------------------------------------

export default function StaffCard({
  data,
  globalBannerUrl,
  icons,
  locale = "id",
}: StaffCardProps) {
  if (!data) return null;

  const rawData = data as unknown as {
    attributes?: StaffAttributes;
  } & StaffAttributes;
  const attributes = rawData.attributes || rawData;

  const { name, nip, slug, category, photo, Role_Details } = attributes;

  // URL Detail Page
  // Contoh: /id/profil/staf/akademik/nama-dosen
  const detailHref = `/${locale}/profil/staf/${category}/${slug}`;

  const academicData = Role_Details?.find(
    (item) => item.__component === "staff-data.academic-data"
  ) as AcademicDataComponent | undefined;

  const adminData = Role_Details?.find(
    (item) => item.__component === "staff-data.admin-data"
  ) as AdminDataComponent | undefined;

  const photoData = photo?.data || photo;
  const rawPhotoUrl =
    (photoData as { attributes?: { url: string } })?.attributes?.url ||
    (photoData as { url?: string })?.url;

  const imageUrl = getStrapiMedia(rawPhotoUrl || null);
  const bannerSrc = getStrapiMedia(globalBannerUrl || null);

  const sintaIconSrc = getStrapiMedia(icons?.sinta || null);
  const scopusIconSrc = getStrapiMedia(icons?.scopus || null);
  const scholarIconSrc = getStrapiMedia(icons?.scholar || null);

  const expertiseLabel = locale === "en" ? "Expertise:" : "Keahlian:";
  const rankLabel = locale === "en" ? "Rank:" : "Pangkat:";

  return (
    // BUNGKUS DENGAN LINK UTAMA KE DETAIL
    <Link
      href={detailHref}
      className="block h-full" // Pastikan link memenuhi area grid
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full cursor-pointer">
        {/* Banner Area */}
        <div className="h-20 w-full relative bg-green-50 shrink-0">
          {bannerSrc ? (
            <>
              <Image
                src={bannerSrc}
                alt="Card Background"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/10"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 opacity-80" />
          )}
        </div>

        {/* Konten */}
        <div className="px-6 pb-6 relative flex flex-col flex-grow">
          {/* Foto Profil */}
          <div className="-mt-16 mb-3 relative w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 shrink-0 mx-auto md:mx-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={name || "Staff"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs text-center">
                No Photo
              </div>
            )}
          </div>

          {/* Info Teks */}
          <div className="space-y-1 mb-4 flex-grow">
            <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">
              {name}
            </h3>

            {category === "administrasi" ? (
              <>
                <p className="text-sm font-semibold text-green-700 mt-1">
                  {adminData?.position || "-"}
                </p>
                <p className="text-xs text-gray-500 font-medium mt-2">
                  NIP: {nip || "-"}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium text-gray-500 mr-1">
                    {rankLabel}
                  </span>
                  {adminData?.rank || "-"}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  NIP: {nip || "-"}
                </p>
                <p className="text-sm text-gray-700 mt-3">
                  <span className="font-semibold text-green-700 text-xs uppercase tracking-wide mr-1">
                    {expertiseLabel}
                  </span>
                  {academicData?.expertise || "-"}
                </p>
              </>
            )}
          </div>

          {/* Icons Footer */}
          {/* PERHATIAN: Tambahkan onClick stopPropagation agar tidak memicu link detail saat icon diklik */}
          {category === "akademik" && academicData && (
            <div
              className="flex items-center gap-4 pt-4 border-t border-gray-100 mt-auto relative z-10"
              onClick={(e) => e.stopPropagation()} // <-- PENTING: Mencegah klik tembus ke detail page
            >
              {academicData.sinta_url && (
                <Link
                  href={academicData.sinta_url}
                  target="_blank"
                  className="hover:opacity-80 transition-opacity flex items-center"
                  title="Sinta"
                >
                  {sintaIconSrc ? (
                    <Image
                      src={sintaIconSrc}
                      alt="Sinta Logo"
                      width={40}
                      height={40}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <FaBook className="w-8 h-8 text-gray-400 hover:text-blue-600" />
                  )}
                </Link>
              )}

              {academicData.scopus_url && (
                <Link
                  href={academicData.scopus_url}
                  target="_blank"
                  className="hover:opacity-80 transition-opacity flex items-center"
                  title="Scopus"
                >
                  {scopusIconSrc ? (
                    <Image
                      src={scopusIconSrc}
                      alt="Scopus Logo"
                      width={40}
                      height={40}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <FaGlobe className="w-8 h-8 text-gray-400 hover:text-orange-500" />
                  )}
                </Link>
              )}

              {academicData.google_scholar_url && (
                <Link
                  href={academicData.google_scholar_url}
                  target="_blank"
                  className="hover:opacity-80 transition-opacity flex items-center"
                  title="Google Scholar"
                >
                  {scholarIconSrc ? (
                    <Image
                      src={scholarIconSrc}
                      alt="Scholar Logo"
                      width={40}
                      height={40}
                      className="h-10 w-auto object-contain"
                    />
                  ) : (
                    <SiGooglescholar className="w-8 h-8 text-gray-400 hover:text-blue-500" />
                  )}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
