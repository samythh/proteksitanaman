"use client";

import * as React from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import SearchBar from "@/components/ui/SearchBar";

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
  logoUrl: string;
  siteName: string;
  siteDescription?: string;
}

// HELPER: Komponen Bendera (Updated: Menerima props 'label' untuk alt text dinamis)
const FlagIcon = ({
  countryCode,
  className,
  label
}: {
  countryCode: string,
  className?: string,
  label: string
}) => {
  // id = Indonesia, gb = Great Britain (English)
  const code = countryCode === 'en' ? 'gb' : 'id';

  return (
    <div className={cn("relative w-full h-full", className)}>
      <Image
        src={`https://flagcdn.com/w80/${code}.png`}
        alt={label}
        fill
        className="object-cover"
        sizes="32px"
      />
    </div>
  );
};

export default function NavbarClient({
  menuItems = [],
  logoUrl,
  siteName,
  siteDescription,
}: NavbarClientProps) {

  // 1. Hooks i18n
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // 2. State UI
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);

  const lastScrollY = React.useRef(0);

  // 3. Logic Ganti Bahasa
  const handleLanguageSwitch = (newLocale: "id" | "en") => {
    router.replace(pathname, { locale: newLocale });
  };

  // 4. Animation Logic
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

  // 5. Scroll Logic
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

  // 6. Reset Menu on Navigate
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // 7. Body Scroll Lock
  React.useEffect(() => {
    if (mobileMenuOpen || isDrawerVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen, isDrawerVisible]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-500",
        "bg-[#005320] border-b border-white/10 shadow-md text-white py-4",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
      aria-label="Main Navigation"
    >
      <div className="container mx-auto flex items-center justify-between px-4">

        {/* --- LOGO --- */}
        <Link href="/" className="flex items-center gap-3 group z-50">
          <div className="relative shrink-0 w-9 h-9 md:w-10 md:h-10 transition-transform group-hover:scale-105">
            <Image
              src={logoUrl}
              alt={siteName}
              width={56}
              height={56}
              className="object-contain w-full h-full"
              priority
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

        {/* --- DESKTOP MENU --- */}
        <ul className="hidden lg:flex items-center gap-1">
          {menuItems.map((item, index) => {
            const sections = item.sections || [];
            const hasDropdown = sections.length > 0;

            return (
              <li key={item.id ?? index} className="relative group">
                {hasDropdown ? (
                  <>
                    <button
                      className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      {item.label} <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    </button>

                    {/* DROPDOWN MEGA MENU */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-max max-w-screen-md">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-green-600"></div>
                      <div className="bg-white rounded-xl shadow-2xl border-t-4 border-green-600 p-6 flex gap-8">
                        {sections.map((section, idx) => (
                          <div key={idx} className="flex-1 min-w-[150px]">
                            {section.title !== "Menu" && (
                              <h4 className="text-xs font-bold text-green-700 uppercase mb-3 border-b border-gray-100 pb-1">
                                {section.title}
                              </h4>
                            )}
                            <ul className="space-y-1">
                              {section.links.map((link, lIdx) => (
                                <li key={lIdx}>
                                  <Link
                                    href={link.url || "#"}
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
                    href={item.url || "#"}
                    className="px-5 py-2 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors block"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        {/* --- ICONS & TOOLS --- */}
        <div className="flex items-center gap-4">

          {/* Language Switcher (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => handleLanguageSwitch("id")}
              className={cn(
                "w-8 h-8 rounded-full overflow-hidden transition-all border-2 relative",
                locale === "id"
                  ? "border-yellow-400 scale-110 shadow-md ring-2 ring-yellow-400/30"
                  : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
              )}
              title={t("switch_id")} // Menggunakan JSON: "Indonesia"
            >
              <FlagIcon countryCode="id" label={t("switch_id")} />
            </button>
            <button
              onClick={() => handleLanguageSwitch("en")}
              className={cn(
                "w-8 h-8 rounded-full overflow-hidden transition-all border-2 relative",
                locale === "en"
                  ? "border-yellow-400 scale-110 shadow-md ring-2 ring-yellow-400/30"
                  : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
              )}
              title={t("switch_en")} // ✅ Menggunakan JSON: "English"
            >
              <FlagIcon countryCode="en" label={t("switch_en")} />
            </button>
          </div>

          <div className="hidden lg:block w-px h-6 bg-white/20 mx-1"></div>

          <div className="hidden lg:block">
            <SearchBar />
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 relative text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label={t("menu_title")}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* --- MOBILE DRAWER --- */}
      {isDrawerVisible && (
        <>
          <div
            className={cn(
              "fixed inset-0 z-[60] bg-black/60 lg:hidden transition-opacity duration-300 ease-in-out backdrop-blur-sm",
              isClosing ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
            )}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className={cn(
              "fixed top-0 right-0 h-screen w-[85%] max-w-[320px] bg-[#005320] shadow-2xl z-[70] flex flex-col lg:hidden",
              "transition-transform duration-350 ease-in-out border-l border-white/10",
              isClosing ? "translate-x-full" : "translate-x-0"
            )}
          >
            {/* Drawer Content */}
            <div className="flex items-center justify-between h-[72px] px-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-bold text-white tracking-wide">{t("menu_title")}</h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-yellow-400">
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#033b19b0] px-6 py-6">
              <div className="mb-6 lg:hidden"><SearchBar /></div>

              {/* Mobile Menu Items Loop */}
              <ul className="space-y-6">
                {menuItems.map((item, i) => (
                  <li key={i}>
                    <div className="text-xl font-bold text-white mb-3">{item.label}</div>
                    {item.sections && item.sections.length > 0 ? (
                      <div className="pl-4 border-l-2 border-white/20 space-y-4">
                        {item.sections.map((sec, j) => (
                          <div key={j}>
                            {sec.title !== "Menu" && (
                              <h4 className="text-xs font-bold text-yellow-400/80 uppercase mb-2">{sec.title}</h4>
                            )}
                            <ul className="space-y-3">
                              {sec.links.map((link, k) => (
                                <li key={k}>
                                  <Link href={link.url || "#"} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/80">
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Link href={item.url || "#"} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/80">
                        {t("open_page")}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mobile Language Switcher */}
            <div className="p-6 border-t border-white/10 bg-[#00461b]">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { handleLanguageSwitch("id"); setMobileMenuOpen(false); }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold border transition-colors",
                    locale === "id"
                      ? "bg-yellow-400 text-[#005320] border-yellow-400"
                      : "border-white/20 text-white hover:bg-white/5"
                  )}
                >
                  <div className="w-5 h-5 relative rounded-sm overflow-hidden shadow-sm">
                    {/* Kirim label dinamis */}
                    <FlagIcon countryCode="id" label={t("switch_id")} />
                  </div>
                  {t("switch_id")} {/* Teks Dinamis: "Indonesia" */}
                </button>
                <button
                  onClick={() => { handleLanguageSwitch("en"); setMobileMenuOpen(false); }}
                  className={cn(
                    "flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold border transition-colors",
                    locale === "en"
                      ? "bg-yellow-400 text-[#005320] border-yellow-400"
                      : "border-white/20 text-white hover:bg-white/5"
                  )}
                >
                  <div className="w-5 h-5 relative rounded-sm overflow-hidden shadow-sm">
                    {/* Kirim label dinamis */}
                    <FlagIcon countryCode="en" label={t("switch_en")} />
                  </div>
                  {t("switch_en")} {/* Teks Dinamis: "English" */}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}