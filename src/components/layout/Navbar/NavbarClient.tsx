// File: src/components/layout/Navbar/NavbarClient.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// --- Interfaces ---
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
  siteDescription = "",
}: NavbarClientProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // State untuk kontrol animasi
  const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const [isVisible, setIsVisible] = React.useState(true);
  const lastScrollY = React.useRef(0);
  const navbarRef = React.useRef<HTMLElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Deteksi bahasa saat ini (Default 'id')
  const currentLang = pathname?.startsWith("/en") ? "en" : "id";

  // --- LOGIC UTAMA: PERBAIKAN URL ---
  const getLocalizedUrl = (url: string | null) => {
    if (!url) return "#";

    // 1. Cek Link Eksternal / Anchor
    if (
      url.startsWith("http") ||
      url.startsWith("https") ||
      url.startsWith("#")
    ) {
      return url;
    }

    // 2. Bersihkan URL (Hapus localhost jika tidak sengaja tertulis)
    // Regex ini menghapus "http://localhost:3000" atau domain apapun di depan
    let cleanUrl = url.replace(/^(?:https?:\/\/)?[^\/]+/, "");

    // Pastikan diawali dengan slash. "informasi" -> "/informasi"
    if (!cleanUrl.startsWith("/")) {
      cleanUrl = "/" + cleanUrl;
    }

    // 3. LOGIKA SEGMENT (YANG PALING AKURAT)
    // Kita pecah URL: "/informasi/berita" -> ["", "informasi", "berita"]
    const segments = cleanUrl.split("/");
    const firstSegment = segments[1]; // Ambil kata pertama setelah slash awal

    // Cek apakah kata pertama adalah 'id' atau 'en'
    if (firstSegment === "id" || firstSegment === "en") {
      // Jika sudah ada (misal input: /id/berita), kembalikan apa adanya
      return cleanUrl;
    }

    // 4. Jika belum ada, PAKSA tambahkan di depan
    // Hasil: /id + /informasi/berita
    return `/${currentLang}${cleanUrl}`;
  };

  const switchLanguage = (newLang: string) => {
    if (newLang === currentLang) return;
    const newPath = pathname.replace(`/${currentLang}`, `/${newLang}`);
    // Handle edge case jika di homepage root "/"
    const finalPath = newPath === pathname ? `/${newLang}${pathname}` : newPath;
    router.push(finalPath.replace("//", "/"));
  };

  // --- Animation Logic (Entry & Exit) ---
  React.useEffect(() => {
    if (mobileMenuOpen) {
      setIsDrawerVisible(true);
      setIsClosing(false);
    } else if (isDrawerVisible) {
      setIsClosing(true);
      const timeout = setTimeout(() => {
        setIsDrawerVisible(false);
        setIsClosing(false);
      }, 350);
      return () => clearTimeout(timeout);
    }
  }, [mobileMenuOpen, isDrawerVisible]);

  // --- Scroll Logic ---
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

  // --- Utilities ---
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (mobileMenuOpen || isDrawerVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen, isDrawerVisible]);

  // Prevent body scroll
  React.useEffect(() => {
    if (mobileMenuOpen || isDrawerVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen, isDrawerVisible]);

  return (
    <nav
      ref={navbarRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-500",
        "bg-[#005320] border-b border-white/10 shadow-md text-white py-4",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* LOGO */}
        <Link
          href={`/${currentLang}`}
          className="flex items-center gap-3 group z-50"
        >
          <div className="relative shrink-0 rounded-full h-10 w-10 bg-white/10 p-1.5 transition-transform group-hover:scale-105">
            <Image
              src={logoUrl}
              alt="Logo"
              width={40}
              height={40}
              className="object-contain"
            />
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
                      {item.label}{" "}
                      <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </button>
                    {/* DROPDOWN */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {/* Arrow */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-green-600"></div>
                      <div className="bg-white rounded-xl shadow-2xl border-t-4 border-green-600 p-6 flex gap-8 min-w-[200px] w-max">
                        {sections.map((section, idx) => (
                          <div key={idx} className="flex-1 min-w-[150px]">
                            {section.title !== "Menu" && (
                              <h4 className="text-xs font-bold text-green-700 uppercase mb-3">
                                {section.title}
                              </h4>
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

        {/* ICONS & HAMBURGER */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-white/10 rounded-full p-1">
            <button
              onClick={() => switchLanguage("id")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-full transition-all",
                currentLang === "id"
                  ? "bg-yellow-400 text-[#005320]"
                  : "text-white hover:text-yellow-200"
              )}
            >
              ID
            </button>
            <button
              onClick={() => switchLanguage("en")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-full transition-all",
                currentLang === "en"
                  ? "bg-yellow-400 text-[#005320]"
                  : "text-white hover:text-yellow-200"
              )}
            >
              EN
            </button>
          </div>

          <button className="p-2 rounded-full hover:bg-white/15">
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 relative text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- MOBILE OFF-CANVAS DRAWER MENU --- */}
      {isDrawerVisible && (
        <>
          <div
            className={cn(
              "fixed inset-0 z-[60] bg-black/60 lg:hidden transition-opacity duration-300 ease-in-out",
              isClosing
                ? "opacity-0 pointer-events-none"
                : "opacity-100 pointer-events-auto"
            )}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            className={cn(
              "fixed top-0 right-0 h-screen w-[85%] max-w-[320px] bg-[#005320] shadow-2xl z-[70] flex flex-col lg:hidden ",
              "transition-transform duration-350 ease-in-out",
              isClosing ? "translate-x-full" : "translate-x-0"
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-drawer-title"
          >
            <div className="flex items-center justify-between h-[72px] px-6 border-b border-white/10 shrink-0 rounded-t-lg">
              <h2
                id="mobile-drawer-title"
                className="text-xl font-bold text-white tracking-wide"
              >
                Menu
              </h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none text-yellow-400"
                aria-label="Close menu"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#033b19b0] overscroll-contain px-6 py-6">
              <ul className="space-y-6">
                {menuItems.map((item, i) => (
                  <li key={i}>
                    <div className="text-xl font-bold text-white mb-3">
                      {item.label}
                    </div>
                    {item.sections && item.sections.length > 0 ? (
                      <div className="pl-4 border-l-2 border-white/20 space-y-4">
                        {item.sections.map((sec, j) => (
                          <div key={j}>
                            {sec.title && sec.title !== "Menu" && (
                              <h4 className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider mb-2">
                                {sec.title}
                              </h4>
                            )}
                            <ul className="space-y-3">
                              {sec.links.map((link, k) => (
                                <li key={k}>
                                  <Link
                                    href={getLocalizedUrl(link.url)}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all"
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={getLocalizedUrl(item.url)}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-sm text-white/80 hover:text-yellow-400 -mt-1"
                      >
                        Buka Halaman
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 border-t border-white/10 bg-[#00461b] shrink-0 rounded-b-lg">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    switchLanguage("id");
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-bold border transition-colors",
                    currentLang === "id"
                      ? "bg-yellow-400 border-yellow-400 text-[#005320]"
                      : "border-white/20 text-white hover:border-yellow-400"
                  )}
                >
                  INDONESIA
                </button>
                <button
                  onClick={() => {
                    switchLanguage("en");
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "py-2.5 rounded-lg text-sm font-bold border transition-colors",
                    currentLang === "en"
                      ? "bg-yellow-400 border-yellow-400 text-[#005320]"
                      : "border-white/20 text-white hover:border-yellow-400"
                  )}
                >
                  ENGLISH
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
