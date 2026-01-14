// src/components/features/StaffCard.tsx
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { Staff } from "@/types/staff";

// Import ikon
import { SiGooglescholar } from "react-icons/si";
import { FaBook, FaGlobe } from "react-icons/fa";

interface StaffCardProps {
  data: Staff;
  globalBannerUrl?: string; // <--- 1. PROPS BARU: Menerima URL gambar dari parent component
}

export default function StaffCard({ data, globalBannerUrl }: StaffCardProps) {
  const {
    name,
    nip,
    expertise,
    position,
    photo,
    sinta_url,
    scopus_url,
    google_scholar_url,
  } = data.attributes;

  // Proses URL foto profil
  const imageUrl =
    getStrapiMedia(photo.data?.attributes.url) || "/placeholder-avatar.jpg";

  // <--- 2. LOGIKA BANNER DINAMIS
  // Cek apakah ada kiriman globalBannerUrl?
  // Jika YA: Format URL-nya pakai getStrapiMedia.
  // Jika TIDAK (atau error): Gunakan gambar default lokal.
  const bannerSrc =
    (globalBannerUrl ? getStrapiMedia(globalBannerUrl) : null) ||
    "/images/gedung-background.jpg";

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* 1. Background Gedung (Header Kartu) */}
      <div className="h-32 w-full relative">
        <Image
          src={bannerSrc} // <--- 3. MENGGUNAKAN SOURCE DINAMIS
          alt="Card Background"
          fill
          className="object-cover"
        />
        {/* Overlay tipis biar teks kebaca kalau ada */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* 2. Foto Profil & Konten */}
      <div className="px-6 pb-6 relative">
        {/* Foto Profil (Overlap ke atas dengan margin minus) */}
        <div className="-mt-12 mb-4 relative w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
          <Image src={imageUrl} alt={name} fill className="object-cover" />
        </div>

        {/* Info Teks */}
        <div className="space-y-1 mb-4">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">
            {name}
          </h3>

          <p className="text-sm text-gray-500 font-medium">NIP: {nip}</p>

          {/* Garis Pemisah Hijau Kecil */}
          <div className="w-10 h-1 bg-green-600 my-2"></div>

          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">
              {expertise ? "Keahlian :" : "Jabatan :"}
            </span>{" "}
            {expertise || position}
          </p>
        </div>

        {/* 3. Footer Kartu (Logo Sinta, Scopus, dll) */}
        {/* Hanya tampilkan jika URL-nya ada */}
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
      </div>
    </div>
  );
}
