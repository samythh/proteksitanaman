// File: src/components/layout/Navbar/NavbarClient.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SubMenuItem {
   id: number;
   label: string;
   url: string | null;
}

interface MenuSection {
   id: number | string;
   title: string;
   links: SubMenuItem[];
}

interface NavbarItem {
   id: number;
   label: string;
   url: string | null;
   sections?: MenuSection[];
}

interface NavbarClientProps {
   menuItems: NavbarItem[];
   logoUrl?: string;
   siteName?: string;
   siteDescription?: string;
}

export default function NavbarClient({
   menuItems = [],
   logoUrl = "/logo-unand.png",
   siteName = "Departemen Proteksi Tanaman",
   siteDescription = ""
}: NavbarClientProps) {

   const [isMounted, setIsMounted] = React.useState(false);
   const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
   const [isVisible, setIsVisible] = React.useState(true);

   const lastScrollY = React.useRef(0);
   const pathname = usePathname();
   const router = useRouter();

   const currentLang = pathname.startsWith('/en') ? 'en' : 'id';

   // Helper untuk memperbaiki URL dengan prefix bahasa
   const getLocalizedUrl = (url: string | null) => {
      if (!url) return "#";
      if (url.startsWith("http") || url.startsWith("#")) return url;
      if (url.startsWith(`/${currentLang}`)) return url;
      const cleanUrl = url.startsWith("/") ? url : `/${url}`;
      return `/${currentLang}${cleanUrl}`;
   };

   const switchLanguage = (newLang: string) => {
      if (newLang === currentLang) return;
      const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
      router.push(newPath);
   };

   React.useEffect(() => { setIsMounted(true); }, []);

   React.useEffect(() => {
      const handleScroll = () => {
         const currentScrollY = window.scrollY;
         if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
            setIsVisible(false);
         } else {
            setIsVisible(true);
         }
         lastScrollY.current = currentScrollY;
      };
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
   }, []);

   React.useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

   if (!isMounted) return <div className="h-20 bg-[#005320] w-full" />;

   return (
      <nav className={cn(
         "fixed top-0 left-0 right-0 z-50 transition-transform duration-500",
         "bg-[#005320] border-b border-white/10 shadow-md text-white py-4",
         isVisible ? "translate-y-0" : "-translate-y-full"
      )}>
         <div className="container mx-auto flex items-center justify-between px-4">

            {/* LOGO */}
            <Link href={`/${currentLang}`} className="flex items-center gap-3 group">
               <div className="relative shrink-0 rounded-full h-10 w-10 bg-white/10 p-1.5 transition-transform group-hover:scale-105">
                  <Image src={logoUrl} alt="Logo" width={40} height={40} className="object-contain" />
               </div>
               <div className="flex flex-col justify-center">
                  <span className="font-bold text-sm md:text-base leading-tight group-hover:text-yellow-400 transition-colors">
                     {siteName}
                  </span>
                  {siteDescription && (
                     <span className="text-[10px] md:text-xs text-white/80 font-light leading-tight">
                        {siteDescription}
                     </span>
                  )}
               </div>
            </Link>

            {/* DESKTOP MENU */}
            <ul className="hidden lg:flex items-center gap-1">
               {menuItems.map((item, index) => {
                  const sections = item.sections || [];
                  const hasDropdown = sections.length > 0;

                  return (
                     <li key={item.id ?? index} className="relative group">
                        {hasDropdown ? (
                           <>
                              <button className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors">
                                 {item.label} <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                              </button>

                              {/* DROPDOWN AREA */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">

                                 {/* PANAH SEGITIGA */}
                                 <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-green-600"></div>

                                 <div className="bg-white rounded-xl shadow-2xl border-t-4 border-green-600 p-6 flex gap-8 min-w-[200px] w-max">
                                    {sections.map((section, idx) => (
                                       <div key={idx} className="flex-1 min-w-[150px]">
                                          {section.title !== 'Menu' && (
                                             // PERBAIKAN DI SINI: Menghapus 'text-black', menyisakan 'text-green-700'
                                             <h4 className="text-xs font-bold uppercase mb-3 text-green-700">{section.title}</h4>
                                          )}
                                          <ul className="space-y-1">
                                             {section.links.map((link, lIdx) => (
                                                <li key={lIdx}>
                                                   <Link
                                                      href={getLocalizedUrl(link.url)}
                                                      className="block text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 px-2 py-1.5 rounded transition-colors"
                                                   >
                                                      {link.label}
                                                   </Link>
                                                </li>
                                             ))}
                                          </ul>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </>
                        ) : (
                           <Link
                              href={getLocalizedUrl(item.url)}
                              className="px-5 py-2 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors block"
                           >
                              {item.label}
                           </Link>
                        )}
                     </li>
                  );
               })}
            </ul>

            {/* ICONS & LANGUAGE SWITCHER */}
            <div className="flex items-center gap-3">
               <div className="hidden lg:flex items-center bg-white/10 rounded-full p-1">
                  <button onClick={() => switchLanguage('id')} className={cn("px-3 py-1 text-xs font-bold rounded-full transition-all", currentLang === 'id' ? "bg-yellow-400 text-[#005320]" : "text-white hover:text-yellow-200")}>ID</button>
                  <button onClick={() => switchLanguage('en')} className={cn("px-3 py-1 text-xs font-bold rounded-full transition-all", currentLang === 'en' ? "bg-yellow-400 text-[#005320]" : "text-white hover:text-yellow-200")}>EN</button>
               </div>

               <button className="p-2 rounded-full hover:bg-white/15"><Search className="w-5 h-5" /></button>

               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2">
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
               </button>
            </div>
         </div>

         {/* MOBILE MENU */}
         {mobileMenuOpen && (
            <div className="fixed inset-0 z-40 lg:hidden top-[60px] bg-[#005320] border-t border-white/10 overflow-y-auto p-4">
               <div className="flex justify-center mb-6">
                  <div className="flex items-center bg-white/10 rounded-full p-1 w-fit">
                     <button onClick={() => switchLanguage('id')} className={cn("px-6 py-2 text-sm font-bold rounded-full", currentLang === 'id' ? "bg-yellow-400 text-[#005320]" : "text-white")}>INDONESIA</button>
                     <button onClick={() => switchLanguage('en')} className={cn("px-6 py-2 text-sm font-bold rounded-full", currentLang === 'en' ? "bg-yellow-400 text-[#005320]" : "text-white")}>ENGLISH</button>
                  </div>
               </div>
               <ul className="space-y-4">
                  {menuItems.map((item, i) => (
                     <li key={i}>
                        <div className="font-bold text-lg mb-2 text-yellow-400">{item.label}</div>
                        {item.sections?.map((sec, j) => (
                           <ul key={j} className="pl-4 space-y-2 border-l border-white/20 ml-2">
                              {sec.links.map((link, k) => (
                                 <li key={k}>
                                    <Link href={getLocalizedUrl(link.url)} className="text-white/80">
                                       {link.label}
                                    </Link>
                                 </li>
                              ))}
                           </ul>
                        ))}
                     </li>
                  ))}
               </ul>
            </div>
         )}
      </nav>
   );
}