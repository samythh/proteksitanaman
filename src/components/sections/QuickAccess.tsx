// File: src/components/sections/QuickAccess.tsx
"use client";

import Link from "next/link";
import Image from "next/image";

// Konfigurasi Warna Tema
const COLOR_THEMES: Record<string, { title: string; bg: string }> = {
   blue: { title: "group-hover:text-blue-700", bg: "bg-blue-100" },
   green: { title: "group-hover:text-green-700", bg: "bg-green-100" },
   orange: { title: "group-hover:text-orange-700", bg: "bg-orange-100" },
   purple: { title: "group-hover:text-purple-700", bg: "bg-purple-100" },
   teal: { title: "group-hover:text-teal-700", bg: "bg-teal-100" },
   default: { title: "group-hover:text-gray-700", bg: "bg-gray-100" },
};

// --- DEFINISI TIPE DATA (Interface) ---
interface IconData {
   url?: string;
   data?: {
      attributes: {
         url: string;
      };
   };
}

interface QuickLinkItem {
   id: number;
   title: string;
   url: string;
   theme: string;
   icon?: IconData;
}

interface QuickAccessData {
   sectionTitle?: string;
   links?: QuickLinkItem[];
}

interface QuickAccessProps {
   data: QuickAccessData;
}

export default function QuickAccess({ data }: QuickAccessProps) {
   const sectionTitle = data.sectionTitle;
   const links = data.links || [];

   if (!links || links.length === 0) return null;

   const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

   return (
      <section className="bg-[#749F74] py-16 -mt-2">
         <div className="container mx-auto px-4">

            {/* Container Putih */}
            <div className="bg-white max-w-6xl mx-auto rounded-2xl shadow-2xl p-6 md:p-10 relative z-10">

               <div className="text-center mb-8">
                  <h2 className="text-xl md:text-3xl font-bold text-gray-800 relative inline-block">
                     {sectionTitle || "Akses Cepat"}
                     <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-[#749F74] rounded-full"></span>
                  </h2>
               </div>

               {/* PERUBAHAN 1: GAP 
             gap-3 (mobile) dan md:gap-4 (desktop) -> Lebih Rapat 
          */}
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 justify-items-center">
                  {links.map((item: QuickLinkItem) => {
                     const themeColors = COLOR_THEMES[item.theme] || COLOR_THEMES['default'];

                     // Logic URL Gambar
                     let rawUrl = item.icon?.url;
                     if (!rawUrl) rawUrl = item.icon?.data?.attributes?.url;

                     let iconUrl = "";
                     if (rawUrl) {
                        iconUrl = rawUrl.startsWith("http") ? rawUrl : `${STRAPI_URL}${rawUrl}`;
                     }

                     return (
                        <Link
                           key={item.id}
                           href={item.url || "#"}
                           className="group flex flex-col items-center gap-3 w-full"
                           target={item.url?.startsWith("http") ? "_blank" : "_self"}
                        >
                           {/* PERUBAHAN 2: UKURAN CARD (BOX)
                     w-24 h-24 (mobile) -> Lebih Besar
                     md:w-32 md:h-32 (desktop) -> Jauh Lebih Besar & Jelas
                  */}
                           <div className={`
                      flex items-center justify-center 
                      w-24 h-24 md:w-32 md:h-32 
                      rounded-3xl shadow-sm border border-gray-50
                      transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md
                      ${themeColors.bg} 
                    `}
                           >
                              {/* PERUBAHAN 3: UKURAN IKON
                       Ikon di dalam juga dibesarkan agar seimbang
                    */}
                              <div className="relative w-10 h-10 md:w-14 md:h-14">
                                 {iconUrl ? (
                                    <Image
                                       src={iconUrl}
                                       alt={item.title}
                                       fill
                                       className="object-contain drop-shadow-sm"
                                    />
                                 ) : (
                                    <div className="w-full h-full bg-gray-300 rounded-full" />
                                 )}
                              </div>
                           </div>

                           {/* PERUBAHAN 4: UKURAN TEKS 
                     text-base (mobile) & md:text-lg (desktop) -> Lebih Terbaca
                  */}
                           <span className={`text-base md:text-lg font-bold text-gray-700 text-center transition-colors leading-tight px-2 ${themeColors.title}`}>
                              {item.title}
                           </span>
                        </Link>
                     );
                  })}
               </div>
            </div>
         </div>
      </section>
   );
}