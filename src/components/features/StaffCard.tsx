// src/components/features/StaffCard.tsx
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Staff } from "@/types/staff";

import { SiGooglescholar } from "react-icons/si";
import { FaBook, FaGlobe } from "react-icons/fa";

interface StaffCardProps {
  data: Staff;
  globalBannerUrl?: string;
}

export default function StaffCard({ data, globalBannerUrl }: StaffCardProps) {
  // 1. Cek apakah data ada
  if (!data) return null;

  // 2. Handle struktur data (Flat vs Nested)
  // Jika 'data.attributes' ada, pakai itu. Jika tidak, anggap 'data' itu sendiri isinya.
  const attributes = (data as any).attributes || data;

  const {
    name,
    nip,
    expertise,
    position,
    photo,
    sinta_url,
    scopus_url,
    google_scholar_url,
  } = attributes;

  // 3. Handle struktur Foto (Flat vs Nested)
  // Kadang foto ada di photo.data.attributes.url, kadang di photo.url
  const photoObj = photo?.data || photo;
  const rawPhotoUrl = photoObj?.attributes?.url || photoObj?.url;

  const imageUrl = getStrapiMedia(rawPhotoUrl) || "/placeholder-avatar.jpg";
  const bannerSrc =
    (globalBannerUrl ? getStrapiMedia(globalBannerUrl) : null) ||
    "/images/gedung-background.jpg";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Banner */}
      <div className="h-32 w-full relative">
        <Image
          src={bannerSrc}
          alt="Card Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* Konten */}
      <div className="px-6 pb-6 relative">
        <div className="-mt-12 mb-4 relative w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
          <Image
            src={imageUrl}
            alt={name || "Staff"}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-1 mb-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">NIP: {nip}</p>

          <div className="w-10 h-1 bg-green-600 my-2"></div>

          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">
              {expertise ? "Keahlian :" : "Jabatan :"}
            </span>{" "}
            {expertise || position}
          </p>
        </div>

        {/* Footer Link */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {sinta_url && (
            <Link
              href={sinta_url}
              target="_blank"
              className="text-gray-400 hover:text-blue-600"
            >
              <FaBook className="w-5 h-5" />
            </Link>
          )}
          {scopus_url && (
            <Link
              href={scopus_url}
              target="_blank"
              className="text-gray-400 hover:text-orange-500"
            >
              <FaGlobe className="w-5 h-5" />
            </Link>
          )}
          {google_scholar_url && (
            <Link
              href={google_scholar_url}
              target="_blank"
              className="text-gray-400 hover:text-blue-500"
            >
              <SiGooglescholar className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
