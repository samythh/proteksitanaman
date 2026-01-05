// File: src/components/ui/footer.tsx
import Image from "next/image";
import { Mail, Phone, Instagram, Youtube, MapPin } from "lucide-react";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";

// --- 1. DEFINISI TIPE DATA ---
interface FooterAttributes {
   address: string;
   email: string;
   phone: string;
   instagram: string;
   youtube: string;
   mapEmbedUrl: string;
   copyright: string;
   background?: {
      url: string;
   };
   partners?: {
      id: number;
      image: {
         url: string;
         width: number;
         height: number;
         alternativeText?: string;
      };
   }[];
}

// --- 2. LOGIKA FETCHER ---
async function getFooterData(locale: string) {
   try {
      const path = "/footer";
      const urlParamsObject = {
         locale: locale,
         populate: {
            background: true,
            partners: {
               populate: { image: true }
            }
         },
      };

      const response = await fetchAPI(path, urlParamsObject);
      return response.data as FooterAttributes;
   } catch (error) {
      console.error("Gagal load Footer:", error);
      return null;
   }
}

function extractSrcFromIframe(htmlString: string | undefined): string {
   if (!htmlString) return "";
   if (htmlString.startsWith("http")) return htmlString;
   const match = htmlString.match(/src="([^"]*)"/);
   return match ? match[1] : "";
}

// --- 3. KOMPONEN VISUAL ---
interface FooterProps {
   locale: string;
}

export default async function Footer({ locale }: FooterProps) {
   const data = await getFooterData(locale);

   const footer = {
      address: data?.address || "Alamat Departemen belum diatur di Strapi.",
      email: data?.email || "email@unand.ac.id",
      phone: data?.phone || "-",
      instagram: data?.instagram || "#",
      youtube: data?.youtube || "#",
      mapUrl: extractSrcFromIframe(data?.mapEmbedUrl),
      copyright: data?.copyright || `© ${new Date().getFullYear()} Departemen Proteksi Tanaman`,
      bgUrl: getStrapiMedia(data?.background?.url || null),
      partners: data?.partners || []
   };

   return (
      <footer className="bg-[#005700] text-white font-sans border-t border-white/10 flex flex-col pt-12">

         {/* Container Utama */}
         <div className="container mx-auto px-6 md:px-12 lg:px-24 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

               {/* KOLOM 1: Alamat & Identitas Institusi */}
               <div className="space-y-6 text-center md:text-left">
                  <div>
                     {/* PERBAIKAN: Judul Diubah menjadi "ALAMAT KAMI" */}
                     <h3 className="font-bold text-lg mb-4 text-white uppercase tracking-wider border-b border-white/20 pb-2 inline-block md:block">
                        ALAMAT KAMI
                     </h3>

                     <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-sm text-gray-100 leading-relaxed font-medium">
                        <MapPin className="w-5 h-5 shrink-0 text-yellow-400 mt-1" />
                        <p className="whitespace-pre-line">{footer.address}</p>
                     </div>
                  </div>

                  {/* Area Logo (Diktisaintek, Unand, dll) */}
                  {footer.partners.length > 0 && (
                     <div className="pt-2">
                        <div className="flex flex-col items-center md:items-start gap-4">
                           {footer.partners.map((partner) => {
                              const imgUrl = getStrapiMedia(partner.image?.url || null);
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
                        KONTAK & SOSMED
                     </h3>

                     {/* Social Media Buttons */}
                     <div className="flex justify-center gap-4 mb-6">
                        <a
                           href={footer.instagram}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="bg-white/10 p-3 rounded-full hover:bg-yellow-400 hover:text-[#005700] transition-all group shadow-lg"
                           aria-label="Instagram"
                        >
                           <Instagram className="w-6 h-6 text-white group-hover:text-[#005700]" />
                        </a>
                        <a
                           href={footer.youtube}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="bg-white/10 p-3 rounded-full hover:bg-yellow-400 hover:text-[#005700] transition-all group shadow-lg"
                           aria-label="Youtube"
                        >
                           <Youtube className="w-6 h-6 text-white group-hover:text-[#005700]" />
                        </a>
                     </div>

                     {/* Contact Info */}
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
                     LOKASI KAMI
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
                           Map Embed URL belum diisi di Strapi
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

         {/* Background Image Paling Bawah (Kecil: h-12) */}
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