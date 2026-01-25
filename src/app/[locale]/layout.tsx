// File: src/app/[locale]/layout.tsx
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
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

// ✅ 1. Import ProgressBarProvider
import ProgressBarProvider from "@/components/providers/ProgressBarProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Departemen Proteksi Tanaman",
  description: "Website Resmi Departemen Proteksi Tanaman",
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validasi locale aman
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>

          {/* ✅ 2. Tambahkan Provider di sini (Paling Atas) */}
          <ProgressBarProvider />

          <Navbar locale={locale} />

          <main className="min-h-screen flex flex-col pt-[85px]">
            {children}
          </main>

          <Footer locale={locale} />

          <ScrollToTop />

          <SmoothScrolling />

          <AccessibilityWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}