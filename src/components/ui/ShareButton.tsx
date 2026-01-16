// File: src/components/features/ShareButton.tsx
"use client";

import { FaShareAlt, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";

// 1. UPDATE INTERFACE: Tambahkan 'showLabel' (optional)
interface ShareButtonProps {
   title: string;
   showLabel?: boolean; // Default nanti kita set true
}

export default function ShareButton({ title, showLabel = true }: ShareButtonProps) {
   const [copied, setCopied] = useState(false);
   const [shareUrl, setShareUrl] = useState("");

   // Ambil URL browser saat komponen dimount (Client-side only)
   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShareUrl(window.location.href);
   }, []);

   const handleCopy = () => {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   // Link Generator
   const currentUrl = shareUrl || "";

   const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
   const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`;
   const waLink = `https://wa.me/?text=${encodeURIComponent(title + " " + currentUrl)}`;

   return (
      // 2. LOGIC STYLE: Jika showLabel=false, hilangkan border & margin vertikal agar rapi
      <div className={`flex items-center gap-4 ${showLabel ? "py-6 border-t border-b border-gray-100 my-8" : ""}`}>

         {/* 3. LOGIC TEXT: Tampilkan teks hanya jika showLabel=true */}
         {showLabel && (
            <span className="text-gray-600 font-semibold flex items-center gap-2">
               Share post ini <FaShareAlt />
            </span>
         )}

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