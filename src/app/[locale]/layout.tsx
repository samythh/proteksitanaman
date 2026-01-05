// File: src/app/[locale]/layout.tsx
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
// PERBAIKAN 1: Hapus import 'Locale' yang tidak terpakai
// import { type Locale } from "@/i18n/settings"; 
import { ReactNode } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/ui/footer";

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

   // PERBAIKAN 2: Ganti logika validasi
   // Daripada memaksa 'locale as any', kita casting array-nya agar mau menerima string.
   // Ini lebih aman dan lolos ESLint.
   if (!(routing.locales as readonly string[]).includes(locale)) {
      notFound();
   }

   const messages = await getMessages();

   return (
      <html lang={locale}>
         <body className={inter.className}>
            <NextIntlClientProvider messages={messages}>

               <Navbar locale={locale} />

               <main className="min-h-screen flex flex-col pt-[85px]">
                  {children}
               </main>

               <Footer locale={locale} />

            </NextIntlClientProvider>
         </body>
      </html>
   );
}