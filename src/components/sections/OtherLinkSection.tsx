// File: src/components/sections/OtherLinkSection.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export interface LinkItemData {
  id: number;
  title: string;
  url: string;
  imageUrl: string;
}

interface OtherLinkSectionProps {
  title: string;
  data: LinkItemData[];
}

export default function OtherLinkSection({ title, data }: OtherLinkSectionProps) {
  if (!data || data.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">

        {/* KOTAK KONTAINER UTAMA */}
        {/* Warna disamakan dengan Partnership: #749F74 */}
        <div className="bg-[#749F74] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden shadow-xl">

          {/* Dekorasi Background (Pointer Events None agar tidak blokir klik) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          {/* Header Section */}
          <div className="text-center mb-10 relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 drop-shadow-md">
              {title || "Tautan Terkait"}
            </h2>
            <div className="w-20 h-1.5 bg-white/80 mx-auto rounded-full"></div>
          </div>

          {/* Grid Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
            {data.map((item) => (
              <Link
                key={item.id} // Gunakan ID unik jika tersedia
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="group h-full block"
              >
                {/* KARTU ITEM */}
                <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-transparent h-full flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-green-200">

                  {/* Icon Wrapper */}
                  <div className="relative w-14 h-14 mb-4 bg-[#749F74]/10 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#749F74]/20 text-[#749F74]">
                    {item.imageUrl ? (
                      <div className="relative w-8 h-8">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <ExternalLink className="w-6 h-6" />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-gray-800 font-semibold text-sm md:text-base leading-snug group-hover:text-[#5e855e] transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                </div>
              </Link>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}