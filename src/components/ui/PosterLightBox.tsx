// src/components/ui/PosterLightBox.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaTimes, FaSearchPlus } from "react-icons/fa";

interface PosterLightBoxProps {
  src: string;
  alt: string;
}

export default function PosterLightBox({ src, alt }: PosterLightBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Menutup modal dengan tombol ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* --- TRIGGER (THUMBNAIL) --- */}
      <div
        className="relative w-full aspect-[3/4] max-w-md shadow-lg rounded-2xl overflow-hidden sticky top-24 cursor-zoom-in group"
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 40vw"
        />

        {/* Overlay Hint Icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 p-3 rounded-full shadow-lg">
            <FaSearchPlus className="text-gray-800 text-xl" />
          </div>
        </div>
      </div>

      {/* --- MODAL (POP-OUT) --- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)} // Klik background untuk tutup
        >
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <FaTimes className="text-2xl" />
          </button>

          {/* Image Container */}
          <div
            className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Mencegah klik gambar menutup modal
          >
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              quality={100}
            />
          </div>

          {/* Caption / Title */}
          <div
            className="mt-4 text-center max-w-2xl px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-medium text-lg md:text-xl leading-relaxed">
              {alt}
            </h3>
          </div>
        </div>
      )}
    </>
  );
}
