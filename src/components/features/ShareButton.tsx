"use client";

import { useState, useEffect } from "react";
import { FaFacebook, FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Share2, Link as LinkIcon, Check } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ShareButton({ title }: { title: string }) {
  const t = useTranslations("UI");
  const [copied, setCopied] = useState(false);

  // State untuk menyimpan URL
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        setShareUrl(window.location.href);
      }
    }, 0);

    // Cleanup timer (praktik yang baik)
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Jika belum ada URL (Server-side atau belum mounted), jangan tampilkan apa-apa
  // untuk mencegah Hydration Error.
  if (!shareUrl) return null;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const socialLinks = [
    {
      name: "WhatsApp",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: FaWhatsapp,
      color: "bg-[#25D366] hover:bg-[#128C7E]",
      label: t("share_wa"),
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: FaFacebook,
      color: "bg-[#1877F2] hover:bg-[#0C63D4]",
      label: t("share_fb"),
    },
    {
      name: "X (Twitter)",
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: FaXTwitter,
      color: "bg-black hover:bg-gray-800",
      label: t("share_x"),
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: FaLinkedin,
      color: "bg-[#0A66C2] hover:bg-[#004182]",
      label: "Share to LinkedIn",
    },
  ];

  return (
    <div className="py-8 border-t border-b border-gray-100 my-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-2 text-gray-700 font-bold text-sm uppercase tracking-wide">
          <Share2 size={18} className="text-[#005320]" />
          <span>{t("share_label")}</span>
        </div>

        <div className="flex items-center gap-2">

          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-9 h-9 rounded-full text-white flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${item.color}`}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon size={16} />
            </a>
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <button
            onClick={handleCopy}
            className={`
              flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border
              ${copied
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm"
              }
            `}
            aria-label={t("copy_link")}
          >
            {copied ? (
              <>
                <Check size={14} strokeWidth={3} />
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
    </div>
  );
}