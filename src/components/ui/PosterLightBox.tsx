"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PosterLightBoxProps {
  src: string;
  alt: string;
  className?: string;
}

export default function PosterLightBox({ src, alt, className }: PosterLightBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Pastikan namespace "UI" ada di file messages (en.json/id.json)
  const t = useTranslations("UI");

  // 1. Handle Hydration (Agar Portal aman di Next.js App Router)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // 2. UX Logic: Scroll Lock & Escape Key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // Kunci scroll halaman utama

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = "auto"; // Buka kunci scroll
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  if (!src) return null;

  return (
    <>
      {/* --- BAGIAN 1: THUMBNAIL TRIGGER --- */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          // Mengisi parent container sepenuhnya
          "group relative cursor-zoom-in overflow-hidden rounded-xl bg-gray-200 flex items-center justify-center w-full h-full border border-gray-200 shadow-sm hover:shadow-md transition-all",
          className
        )}
        aria-label={t("zoom_image")}
      >
        <Image
          src={src}
          alt={alt}
          fill
          // Optimasi ukuran: Download gambar kecil untuk layar kecil/grid
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // Thumbnail pakai 'cover' agar rapi memenuhi kotak tanpa celah putih
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay Icon (Muncul saat Hover) */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center z-10">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 p-3 rounded-full shadow-lg text-[#005320] backdrop-blur-sm">
            <ZoomIn size={24} />
          </div>
        </div>
      </button>

      {/* --- BAGIAN 2: POPUP FULLSCREEN (PORTAL) --- */}
      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
        >
          {/* Tombol Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-5 right-5 md:top-8 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={t("close")}
          >
            <X size={28} />
          </button>

          {/* Klik Background untuk Close */}
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          {/* Container Gambar Fullscreen */}
          <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none p-2 md:p-10">
            {/* Wrapper Max Size */}
            <div className="relative w-full h-full max-w-[95vw] max-h-[90vh]">
              {/* Di Popup pakai 'contain' agar gambar UTUH terlihat semua (tidak terpotong) */}
              <Image
                src={src}
                alt={alt}
                fill
                quality={100}
                className="object-contain pointer-events-auto select-none drop-shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                priority
                sizes="100vw"
              />
            </div>

            {/* Caption Bawah */}
            <div className="absolute bottom-4 left-0 w-full text-center pointer-events-none">
              <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md line-clamp-1 max-w-[80%] mx-auto">
                {alt}
              </span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}