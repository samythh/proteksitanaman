// File: src/components/features/ShareButton.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";

// Icons
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { Link as LinkIcon, Check, Share2 } from "lucide-react";

interface ShareButtonProps {
   title: string;
   showLabel?: boolean;
   className?: string;
}

export default function ShareButton({ title, showLabel = true, className }: ShareButtonProps) {
   const [copied, setCopied] = useState(false);
   const [shareUrl, setShareUrl] = useState("");

   const t = useTranslations("UI");

   // Ambil URL browser saat komponen dimount
   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShareUrl(window.location.href);
   }, []);

   const handleCopy = async () => {
      try {
         await navigator.clipboard.writeText(shareUrl);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      } catch (err) {
         console.error("Failed to copy:", err);
      }
   };

   // Link Generator
   const currentUrl = shareUrl || "";
   const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
   const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`;
   const waLink = `https://wa.me/?text=${encodeURIComponent(title + " " + currentUrl)}`;

   return (
      <div
         className={cn(
            "flex items-center gap-4 flex-wrap",
            showLabel ? "py-6 border-t border-b border-gray-100 my-8" : "",
            className
         )}
      >
         {/* Label Text */}
         {showLabel && (
            <span className="text-gray-600 font-semibold flex items-center gap-2 text-sm md:text-base">
               {t("share_label")} <Share2 size={16} />
            </span>
         )}

         <div className="flex gap-2">
            {/* Facebook */}
            <a
               href={facebookLink}
               target="_blank"
               rel="noopener noreferrer"
               className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-80 transition-all hover:-translate-y-1 shadow-sm"
               aria-label={t("share_fb")}
               title={t("share_fb")}
            >
               <FaFacebook size={18} />
            </a>

            {/* Twitter / X */}
            <a
               href={twitterLink}
               target="_blank"
               rel="noopener noreferrer"
               className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:opacity-80 transition-all hover:-translate-y-1 shadow-sm"
               aria-label={t("share_x")}
               title={t("share_x")}
            >
               <FaTwitter size={18} />
            </a>

            {/* WhatsApp */}
            <a
               href={waLink}
               target="_blank"
               rel="noopener noreferrer"
               className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-80 transition-all hover:-translate-y-1 shadow-sm"
               aria-label={t("share_wa")}
               title={t("share_wa")}
            >
               <FaWhatsapp size={20} />
            </a>

            {/* Copy Link Button */}
            <button
               onClick={handleCopy}
               className={cn(
                  "flex items-center gap-2 px-3 py-1 text-xs md:text-sm border rounded-full transition-all ml-2",
                  copied
                     ? "bg-green-100 border-green-200 text-green-700"
                     : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
               )}
               aria-label={t("copy_link")}
               title={t("copy_link")}
            >
               {copied ? (
                  <>
                     <Check size={14} />
                     <span>{t("copied")}</span>
                  </>
               ) : (
                  <>
                     <LinkIcon size={14} />
                     <span>{t("copy_link")}</span>
                  </>
               )}
            </button>
         </div>
      </div>
   );
}