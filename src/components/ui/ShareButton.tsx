// File: src/components/ui/ShareButton.tsx
"use client";

// PERBAIKAN: Hapus 'Copy' dari import karena tidak dipakai
import { Share2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
   label: string;
}

export default function ShareButton({ label }: ShareButtonProps) {
   const [copied, setCopied] = useState(false);

   const handleShare = async () => {
      // Cek apakah browser mendukung fitur Share bawaan (biasanya Mobile)
      if (navigator.share) {
         try {
            await navigator.share({
               title: document.title,
               url: window.location.href,
            });
         } catch (err) {
            console.error("Error sharing:", err);
         }
      } else {
         // Fallback untuk Desktop: Copy Link ke Clipboard
         try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset icon setelah 2 detik
         } catch (err) {
            console.error("Gagal menyalin link:", err);
         }
      }
   };

   return (
      <button
         onClick={handleShare}
         className="flex items-center gap-2 text-gray-500 hover:text-[#005320] transition-colors group"
         aria-label="Share this post"
      >
         <span className="text-sm font-semibold transition-all">
            {copied ? "Link Disalin!" : label}
         </span>

         {/* Icon berubah jadi Check jika berhasil dicopy, jika belum icon Share */}
         {copied ? (
            <Check className="w-5 h-5 text-green-600" />
         ) : (
            <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
         )}
      </button>
   );
}