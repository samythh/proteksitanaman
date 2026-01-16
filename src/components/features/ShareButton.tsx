// File: src/components/features/ShareButton.tsx
"use client";

import { FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Ambil URL browser saat komponen dimount (Client-side only)
  useEffect(() => {
    // Kita menonaktifkan warning ini karena ini adalah pola standar Next.js
    // untuk mengambil window.location setelah mounting agar tidak error saat SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShareUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Link Generator
  // Cek apakah shareUrl sudah ada (untuk menghindari link kosong saat loading awal)
  const currentUrl = shareUrl || "";

  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`;
  const waLink = `https://wa.me/?text=${encodeURIComponent(title + " " + currentUrl)}`;

  return (
    <div className="flex items-center gap-4 py-6 border-t border-b border-gray-100 my-8">
      <span className="text-gray-600 font-semibold flex items-center gap-2">
        Share post ini <FaShareAlt />
      </span>

      <div className="flex gap-3">
        {/* Facebook */}
        <a
          href={facebookLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label="Share on Facebook"
        >
          <FaFacebook />
        </a>

        {/* Twitter / X */}
        <a
          href={twitterLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label="Share on Twitter"
        >
          <FaTwitter />
        </a>

        {/* WhatsApp */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-80 transition-opacity"
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp />
        </a>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="px-3 py-1 text-xs border rounded hover:bg-gray-50 transition-colors"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}