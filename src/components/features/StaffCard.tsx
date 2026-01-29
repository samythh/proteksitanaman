// File: src/components/features/StaffCard.tsx

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { useTranslations } from "next-intl";

// Import Icon Default
import { SiGooglescholar } from "react-icons/si";
import { FaBook, FaGlobe } from "react-icons/fa";

// --- TIPE DATA ---
interface StrapiDataInput {
  id?: number;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

interface PhotoSource {
  url?: string;
  attributes?: { url?: string };
  data?: {
    attributes?: { url?: string };
  } | null;
}

interface StaffCardProps {
  data: StrapiDataInput;
  globalBannerUrl?: string;
  icons?: {
    sinta?: string;
    scopus?: string;
    scholar?: string;
  };
  locale?: string;
}

interface AcademicData {
  __component: "staff-data.academic-data";
  expertise: string;
  sinta_url?: string;
  scopus_url?: string;
  google_scholar_url?: string;
}

interface AdminData {
  __component: "staff-data.admin-data";
  position: string;
  rank: string;
}

export default function StaffCard({
  data,
  globalBannerUrl,
  icons,
  locale = "id",
}: StaffCardProps) {
  // ✅ Panggil Hook Translation
  const t = useTranslations("StaffCard");

  if (!data) return null;

  // --- 1. NORMALISASI DATA ---
  const attributes = (data.attributes || data) as StrapiDataInput;

  const name = attributes.name as string;
  const nip = attributes.nip as string;
  const slug = attributes.slug as string;
  const category = attributes.category as string;
  const photo = attributes.photo;
  const Role_Details = attributes.Role_Details;

  if (!name) return null;

  const detailHref = `/${locale}/profil/staf/${category}/${slug}`;

  // --- 2. LOGIC ROLE ---
  const roleList = (Role_Details || []) as (AcademicData | AdminData)[];

  const academicData = roleList.find(
    (item): item is AcademicData => item.__component === "staff-data.academic-data"
  );

  const adminData = roleList.find(
    (item): item is AdminData => item.__component === "staff-data.admin-data"
  );

  // --- 3. LOGIC GAMBAR ---
  const extractPhotoUrl = (obj: unknown): string | null => {
    if (!obj || typeof obj !== "object") return null;
    const img = obj as PhotoSource;
    return img.url || img.data?.attributes?.url || img.attributes?.url || null;
  };

  const rawPhotoUrl = extractPhotoUrl(photo);
  const imageUrl = getStrapiMedia(rawPhotoUrl);
  const bannerSrc = getStrapiMedia(globalBannerUrl || null);

  const sintaIconSrc = getStrapiMedia(icons?.sinta || null);
  const scopusIconSrc = getStrapiMedia(icons?.scopus || null);
  const scholarIconSrc = getStrapiMedia(icons?.scholar || null);

  return (
    <div className="group relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">

      {/* LINK OVERLAY */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-0"
        aria-label={t("view_profile_aria", { name })}
      />

      {/* BANNER */}
      <div className="h-20 w-full relative bg-green-50 shrink-0 pointer-events-none z-10">
        {bannerSrc ? (
          <>
            <Image
              src={bannerSrc}
              alt={t("banner_alt")}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-800 opacity-80" />
        )}
      </div>

      {/* KONTEN */}
      <div className="px-6 pb-6 relative flex flex-col flex-grow pointer-events-none z-10">

        {/* FOTO PROFIL */}
        <div className="-mt-16 mb-3 relative w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 shrink-0 mx-auto md:mx-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name || t("staff_alt")}
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-xs text-center">
              {t("no_photo")}
            </div>
          )}
        </div>

        {/* INFO TEKS */}
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
                {t("nip")}: {nip || "-"}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium text-gray-500 mr-1">
                  {t("rank")}:
                </span>
                {adminData?.rank || "-"}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {t("nip")}: {nip || "-"}
              </p>
              <p className="text-sm text-gray-700 mt-3">
                <span className="font-semibold text-green-700 text-xs uppercase tracking-wide mr-1">
                  {t("expertise")}:
                </span>
                {academicData?.expertise || "-"}
              </p>
            </>
          )}
        </div>

        {/* ICONS */}
        {category === "akademik" && academicData && (
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 mt-auto relative z-20 pointer-events-auto">
            {academicData.sinta_url && (
              <Link
                href={academicData.sinta_url}
                target="_blank"
                className="hover:opacity-80 transition-opacity flex items-center hover:scale-110 transform duration-200"
                title="Sinta"
              >
                {sintaIconSrc ? (
                  <Image src={sintaIconSrc} alt="Sinta" width={40} height={40} className="h-10 w-auto object-contain" />
                ) : (
                  <FaBook className="w-8 h-8 text-gray-400 hover:text-blue-600" />
                )}
              </Link>
            )}

            {academicData.scopus_url && (
              <Link
                href={academicData.scopus_url}
                target="_blank"
                className="hover:opacity-80 transition-opacity flex items-center hover:scale-110 transform duration-200"
                title="Scopus"
              >
                {scopusIconSrc ? (
                  <Image src={scopusIconSrc} alt="Scopus" width={40} height={40} className="h-10 w-auto object-contain" />
                ) : (
                  <FaGlobe className="w-8 h-8 text-gray-400 hover:text-orange-500" />
                )}
              </Link>
            )}

            {academicData.google_scholar_url && (
              <Link
                href={academicData.google_scholar_url}
                target="_blank"
                className="hover:opacity-80 transition-opacity flex items-center hover:scale-110 transform duration-200"
                title="Google Scholar"
              >
                {scholarIconSrc ? (
                  <Image src={scholarIconSrc} alt="Scholar" width={40} height={40} className="h-10 w-auto object-contain" />
                ) : (
                  <SiGooglescholar className="w-8 h-8 text-gray-400 hover:text-blue-500" />
                )}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}