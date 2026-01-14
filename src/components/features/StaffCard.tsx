// File: src/components/features/StaffCard.tsx

import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Staff } from "@/types/staff";

// Import Ikon
import { SiGooglescholar } from "react-icons/si";
import { FaBook, FaGlobe } from "react-icons/fa";

interface StaffCardProps {
  data: Staff;
  globalBannerUrl?: string; // URL gambar gedung dari Global Config
  locale: string; // Bahasa aktif (id/en) untuk link routing
}

export default function StaffCard({
  data,
  globalBannerUrl,
  locale,
}: StaffCardProps) {
  // 1. Safety Check: Pastikan data tidak null
  if (!data) return null;

  // 2. Handle struktur data (Flat vs Nested)
  // Strapi kadang membungkus dalam 'attributes', kadang tidak (tergantung query)
  const attributes = (data as any).attributes || data;

  const {
    name,
    nip,
    slug, // Pastikan field ini sudah ada di Strapi & Type definition
    category, // Pastikan field ini sudah ada
    expertise,
    position,
    photo,
    sinta_url,
    scopus_url,
    google_scholar_url,
  } = attributes;

  // 3. Persiapkan Variabel Link & Gambar
  // Jika slug/category kosong, fallback ke '#' agar tidak error
  const safeSlug = slug || "#";
  const safeCategory = category || "akademik";

  // URL Link Menuju Detail
  const detailUrl = `/${locale}/profil/staf/${safeCategory}/${safeSlug}`;

  // Logika Foto Profil
  const photoObj = photo?.data || photo;
  const rawPhotoUrl = photoObj?.attributes?.url || photoObj?.url;
  const imageUrl = getStrapiMedia(rawPhotoUrl) || "/placeholder-avatar.jpg";

  // Logika Banner (Global vs Default)
  const bannerSrc =
    (globalBannerUrl ? getStrapiMedia(globalBannerUrl) : null) ||
    "/images/gedung-background.jpg";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      {/* --- 1. Banner Background --- */}
      <div className="h-32 w-full relative">
        <Image
          src={bannerSrc}
          alt="Card Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* --- 2. Konten Profil --- */}
      <div className="px-6 pb-6 relative">
        {/* Foto Profil (Bisa Diklik) */}
        <Link
          href={detailUrl}
          className="block -mt-12 mb-4 relative w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 transition-transform hover:scale-105"
        >
          <Image
            src={imageUrl}
            alt={name || "Staff"}
            fill
            className="object-cover"
          />
        </Link>

        {/* Info Teks */}
        <div className="space-y-1 mb-4">
          {/* Nama (Bisa Diklik) */}
          <Link
            href={detailUrl}
            className="hover:text-green-600 transition-colors"
          >
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {name}
            </h3>
          </Link>

          <p className="text-sm text-gray-500 font-medium">NIP: {nip}</p>

          {/* Divider Hijau */}
          <div className="w-10 h-1 bg-green-600 my-2"></div>

          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">
              {expertise ? "Keahlian :" : "Jabatan :"}
            </span>{" "}
            {expertise || position}
          </p>
        </div>

        {/* --- 3. Footer Links (Social) --- */}
        {/* Hanya render div ini jika minimal ada 1 link sosial */}
        {(sinta_url || scopus_url || google_scholar_url) && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            {sinta_url && (
              <Link
                href={sinta_url}
                target="_blank"
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Sinta"
              >
                <FaBook className="w-5 h-5" />
              </Link>
            )}
            {scopus_url && (
              <Link
                href={scopus_url}
                target="_blank"
                className="text-gray-400 hover:text-orange-500 transition-colors"
                title="Scopus"
              >
                <FaGlobe className="w-5 h-5" />
              </Link>
            )}
            {google_scholar_url && (
              <Link
                href={google_scholar_url}
                target="_blank"
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Google Scholar"
              >
                <SiGooglescholar className="w-5 h-5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
