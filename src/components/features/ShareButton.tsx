// src/components/features/ShareButton.tsx
"use client";

import { FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { useState } from "react";

export default function ShareButton({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-4 py-6 border-t border-b border-gray-100 my-8">
      <span className="text-gray-600 font-semibold flex items-center gap-2">
        Share post ini <FaShareAlt />
      </span>

      <div className="flex gap-3">
        <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-80">
          <FaFacebook />
        </button>
        <button className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:opacity-80">
          <FaTwitter />
        </button>
        <button className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-80">
          <FaWhatsapp />
        </button>

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
