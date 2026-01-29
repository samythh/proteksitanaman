// File: src/app/[locale]/layout.tsx
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import { ReactNode } from "react";

// --- KOMPONEN UI & LAYOUT ---
import AccessibilityWidget from "@/components/AccessibilityWidget";
import ScrollToTop from "@/components/ui/ScrollToTop";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/ui/footer";
import SmoothScrolling from "@/components/ui/SmoothScrolling";

// ✅ Import ProgressBarProvider
import ProgressBarProvider from "@/components/providers/ProgressBarProvider";

const inter = Inter({ subsets: ["latin"] });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

// Dynamic Metadata
export async function generateMetadata({ params }: Omit<Props, 'children'>) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    title: t("title"),
    description: t("title"),
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ini memberitahu TypeScript: "Anggap routing.locales sebagai daftar string biasa, lalu cek apakah locale ada di dalamnya"
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>

          {/* ✅ ProgressBar */}
          <ProgressBarProvider />

          {/* ✅ Navbar */}
          <Navbar locale={locale} />

          {/* ✅ Main Content */}
          <main className="min-h-screen flex flex-col pt-[85px]">
            {children}
          </main>

          {/* ✅ Footer */}
          <Footer locale={locale} />

          {/* ✅ Utilitas Tambahan */}
          <ScrollToTop />
          <SmoothScrolling />
          <AccessibilityWidget />

        </NextIntlClientProvider>
      </body>
    </html>
  );
}