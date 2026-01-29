// File: src/components/ui/footer.tsx
import Image from "next/image";
import { getTranslations } from "next-intl/server"; 
import {
   Mail,
   Phone,
   MapPin,
   Instagram,
   Youtube,
   Facebook,
   Twitter,
   Linkedin,
   Globe,
   Video
} from "lucide-react";

import { fetchAPI } from "@/lib/strapi/fetcher"; 
import { getStrapiMedia } from "@/lib/strapi/utils"; 
import { StrapiEntity, StrapiImage } from "@/types/shared"; 
import { StrapiSingleResponse } from "@/types/strapi"; 

// --- 1. TYPE DEFINITIONS (LOGIC BARU) ---

interface SocialLinkItem {
   id: number;
   platform: "Instagram" | "Youtube" | "Facebook" | "Twitter" | "Tiktok" | "Linkedin" | "Website";
   url: string;
}

interface PartnerItem {
   id: number;
   image: StrapiImage;
}

interface FooterAttributes extends StrapiEntity {
   address: string;
   email: string;
   phone: string;
   social_links: SocialLinkItem[];
   mapEmbedUrl: string;
   copyright: string;
   background?: StrapiImage;
   partners?: PartnerItem[];
}

// --- 2. HELPERS ---

const getSocialIcon = (platform: string) => {
   const p = platform.toLowerCase();
   // ✅ Desain Lama: Ukuran w-6 h-6
   const className = "w-6 h-6";

   switch (p) {
      case 'instagram': return <Instagram className={className} />;
      case 'youtube': return <Youtube className={className} />;
      case 'facebook': return <Facebook className={className} />;
      case 'twitter': return <Twitter className={className} />;
      case 'linkedin': return <Linkedin className={className} />;
      case 'tiktok': return <Video className={className} />;
      case 'website': return <Globe className={className} />;
      default: return <Globe className={className} />;
   }
};

function extractSrcFromIframe(htmlString: string | undefined): string {
   if (!htmlString) return "";
   if (htmlString.startsWith("http")) return htmlString;
   const match = htmlString.match(/src="([^"]*)"/);
   return match ? match[1] : "";
}

// --- 3. DATA FETCHER (LOGIC BARU) ---

async function getFooterData(locale: string): Promise<FooterAttributes | null> {
   try {
      const path = "/footer";
      const urlParams = {
         locale,
         populate: {
            background: true,
            social_links: true,
            partners: {
               populate: { image: true }
            }
         },
      };

      const res = await fetchAPI<StrapiSingleResponse<FooterAttributes>>(path, urlParams);
      return res.data || null;
   } catch (error) {
      console.error("❌ [Footer] Gagal mengambil data:", error);
      return null;
   }
}

// --- 4. COMPONENT (DESAIN LAMA) ---

interface FooterProps {
   locale: string;
}

export default async function Footer({ locale }: FooterProps) {
   const [data, t] = await Promise.all([
      getFooterData(locale),
      getTranslations({ locale, namespace: "Footer" })
   ]);

   // Fallback Data
   const footer = {
      address: data?.address || "Alamat belum diatur.",
      email: data?.email || "email@unand.ac.id",
      phone: data?.phone || "-",
      socialLinks: data?.social_links || [],
      mapUrl: extractSrcFromIframe(data?.mapEmbedUrl),
      copyright: data?.copyright || `© ${new Date().getFullYear()} Departemen Proteksi Tanaman`,
      bgUrl: getStrapiMedia(data?.background?.url),
      partners: data?.partners || []
   };

   return (
      <footer className="bg-[#005700] text-white font-sans border-t border-white/10 flex flex-col pt-12">

         {/* Container Utama */}
         <div className="container mx-auto px-6 md:px-12 lg:px-24 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

               {/* KOLOM 1: Alamat & Identitas */}
               <div className="space-y-6 text-center md:text-left">
                  <div>
                     <h3 className="font-bold text-lg mb-4 text-white uppercase tracking-wider border-b border-white/20 pb-2 inline-block md:block">
                        {t("address_title")}
                     </h3>

                     <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-sm text-gray-100 leading-relaxed font-medium">
                        <MapPin className="w-5 h-5 shrink-0 text-yellow-400 mt-1" />
                        <p className="whitespace-pre-line">{footer.address}</p>
                     </div>
                  </div>

                  {/* Area Logo Partner  */}
                  {footer.partners.length > 0 && (
                     <div className="pt-2">
                        <div className="flex flex-col items-center md:items-start gap-4">
                           {footer.partners.map((partner) => {
                              const imgUrl = getStrapiMedia(partner.image?.url);
                              if (!imgUrl) return null;
                              return (
                                 <div key={partner.id} className="w-fit">
                                    <Image
                                       src={imgUrl}
                                       alt={partner.image?.alternativeText || "Logo Institusi"}
                                       width={partner.image?.width || 150}
                                       height={partner.image?.height || 80}
                                       className="object-contain"
                                       style={{ height: 'auto', width: 'auto', maxHeight: '60px', maxWidth: '200px' }}
                                    />
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  )}
               </div>

               {/* KOLOM 2: Sosmed & Kontak (CENTER) */}
               <div className="flex flex-col space-y-8 items-center text-center">
                  <div className="w-full">
                     <h3 className="font-bold text-lg mb-4 text-white uppercase tracking-wider border-b border-white/20 pb-2 inline-block">
                        {t("contact_title")}
                     </h3>

                     {/* Social Media Buttons */}
                     {footer.socialLinks.length > 0 ? (
                        <div className="flex justify-center gap-4 mb-6 flex-wrap">
                           {footer.socialLinks.map((item) => (
                              <a
                                 key={item.id}
                                 href={item.url}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="bg-white/10 p-3 rounded-full hover:bg-yellow-400 hover:text-[#005700] transition-all group shadow-lg text-white"
                                 aria-label={item.platform}
                                 title={item.platform}
                              >
                                 {getSocialIcon(item.platform)}
                              </a>
                           ))}
                        </div>
                     ) : (
                        <p className="text-xs text-gray-300 mb-6">{t("no_social")}</p>
                     )}

                     {/* Contact Info*/}
                     <ul className="space-y-4 text-sm flex flex-col items-center">
                        <li className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full">
                           <Mail className="w-4 h-4 text-yellow-400 shrink-0" />
                           <a href={`mailto:${footer.email}`} className="hover:text-yellow-400">
                              {footer.email}
                           </a>
                        </li>
                        <li className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full">
                           <Phone className="w-4 h-4 text-yellow-400 shrink-0" />
                           <span>{footer.phone}</span>
                        </li>
                     </ul>
                  </div>
               </div>

               {/* KOLOM 3: Peta */}
               <div className="flex flex-col items-center md:items-end text-center md:text-right">
                  <h3 className="font-bold text-lg mb-4 text-white uppercase tracking-wider border-b border-white/20 pb-2 inline-block md:block">
                     {t("location_title")}
                  </h3>

                  <div className="w-full max-w-[280px] h-56 bg-gray-200 rounded-lg overflow-hidden shadow-lg border-2 border-white/20 relative group">
                     {footer.mapUrl ? (
                        <iframe
                           title="Peta Lokasi"
                           src={footer.mapUrl}
                           width="100%"
                           height="100%"
                           style={{ border: 0 }}
                           allowFullScreen={true}
                           loading="lazy"
                           className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
                        ></iframe>
                     ) : (
                        <div className="flex items-center justify-center h-full bg-gray-800 text-gray-400 text-xs px-4">
                           {t("no_map")}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Bagian Copyright */}
         <div className="w-full bg-[#003300] py-4 text-center border-t border-white/10 relative z-20">
            <p className="text-xs text-gray-300 px-4">
               {footer.copyright}
            </p>
         </div>

         {/* Background Image (Batik Pattern) */}
         {footer.bgUrl && (
            <div className="w-full h-12 relative bg-white z-10">
               <Image
                  src={footer.bgUrl}
                  alt="Pattern Batik"
                  fill
                  className="object-cover object-center"
               />
            </div>
         )}
      </footer>
   );
}