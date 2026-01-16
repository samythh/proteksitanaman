// File: src/components/ui/PosterLightBox.tsx
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { FaTimes, FaSearchPlus } from "react-icons/fa";

interface PosterLightBoxProps {
  src: string;
  alt: string;
}

export default function PosterLightBox({ src, alt }: PosterLightBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Handle Hydration (Mounting)
  // FIX: Kita tambahkan komentar eslint-disable karena re-render ini DISENGAJA untuk Portal
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 2. Handle Scroll Lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!src) return null;

  return (
    <>
      {/* --- BAGIAN 1: THUMBNAIL --- */}
      <div
        className="group relative cursor-zoom-in overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center w-full h-full min-h-[300px]"
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center z-10">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 p-3 rounded-full shadow-lg text-gray-900">
            <FaSearchPlus />
          </div>
        </div>
      </div>

      {/* --- BAGIAN 2: POPUP (PORTAL) --- */}
      {mounted && isOpen && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={alt || "Poster Lightbox"}
        >
          {/* Tombol Close */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
            className="absolute top-5 right-5 md:top-8 md:right-8 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50 focus:outline-none"
            aria-label="Close lightbox"
          >
            <FaTimes size={24} />
          </button>

          {/* Klik Background Close */}
          <div
            className="absolute inset-0 cursor-default"
            onClick={() => setIsOpen(false)}
          />

          {/* Gambar Fullscreen */}
          <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none p-4 md:p-10">
            <div className="relative w-full h-full max-w-[90vw] max-h-[90vh]">
              <Image
                src={src}
                alt={alt}
                fill
                quality={90}
                className="object-contain pointer-events-auto select-none drop-shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}