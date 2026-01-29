// File: src/components/sections/WelcomeSection.tsx
"use client";

import Image from "next/image";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- TIPE DATA ---
export interface WelcomeProfileData {
  id: number;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

interface WelcomeSectionProps {
  data: WelcomeProfileData[];
}

export default function WelcomeSection({ data }: WelcomeSectionProps) {
  // Defensive Check
  if (!data || data.length === 0) return null;

  return (
    <section className="bg-white pt-16 md:pt-24 pb-48 md:pb-80 overflow-hidden relative z-10">

      <div className="container mx-auto px-4 space-y-20 md:space-y-32">

        {data.map((profile, index) => {
          // Logic Ganjil/Genap untuk posisi gambar (Kiri/Kanan)
          const isImageLeft = index % 2 !== 0;
          const imageUrl = getStrapiMedia(profile.imageUrl);

          return (
            <div
              key={profile.id}
              className={`flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 ${isImageLeft ? "md:flex-row-reverse" : "md:flex-row"
                }`}
            >

              {/* --- BAGIAN TEKS ( --- */}
              <div className="w-full md:w-7/12 space-y-5 text-left">
                <div>
                  <span className="text-[#749F74] font-bold tracking-wider text-sm uppercase mb-2 block">
                    Sambutan
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                    {profile.role}
                  </h2>
                  {/* Garis Hijau */}
                  <div className="w-16 h-1 bg-[#749F74] mt-3 rounded-full"></div>
                </div>

                <div className="text-gray-600 text-base md:text-lg leading-relaxed text-justify space-y-4">
                  {/* Render deskripsi per paragraf */}
                  {profile.description.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* --- BAGIAN GAMBAR  --- */}
              {/* Ukuran spesifik: w-9/12 di mobile, w-4/12 di desktop */}
              <div className="w-9/12 md:w-4/12 relative group mx-auto md:mx-0">

                {/* Frame Gambar Utama */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl border border-gray-100 z-10 bg-white">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={profile.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Overlay Gradien Hitam */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                  {/* Nama & Jabatan Overlay */}
                  <div className="absolute bottom-0 left-0 p-5 md:p-6 w-full z-20">
                    <h3 className="text-white text-lg md:text-xl font-bold leading-tight">
                      {profile.name}
                    </h3>
                    <p className="text-gray-300 text-xs md:text-sm mt-1 font-medium">
                      {profile.role}
                    </p>
                  </div>
                </div>

                {/* Dekorasi Belakang  */}
                <div
                  className={`absolute -z-10 w-full h-full border-2 border-[#749F74]/30 rounded-2xl top-3 
                  ${isImageLeft ? "left-3" : "-left-3"} transition-all duration-500 group-hover:top-2 group-hover:left-2`}
                ></div>

              </div>

            </div>
          );
        })}

      </div>
    </section>
  );
}