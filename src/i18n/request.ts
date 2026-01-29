// File: src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { notFound } from 'next/navigation';

export default getRequestConfig(async ({ requestLocale }) => {
   // 1. Resolve locale dari Promise
   let locale = await requestLocale;

   // 2. Validasi Locale
   // Pastikan locale ada di daftar yang diizinkan.
   if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
      locale = routing.defaultLocale;
   }

   // 3. Load Messages dengan Error Handling & Fallback 🛡️
   try {
      return {
         locale,
         messages: (await import(`../../messages/${locale}.json`)).default
      };
   } catch (error) {
      console.error(`❌ [i18n] Gagal memuat pesan untuk locale: ${locale}`, error);

      // Opsi Safety: Fallback ke bahasa default (misal: 'id') jika bahasa tujuan rusak
      if (locale !== routing.defaultLocale) {
         try {
            const fallbackMessages = (await import(`../../messages/${routing.defaultLocale}.json`)).default;
            console.warn(`⚠️ [i18n] Menggunakan fallback bahasa: ${routing.defaultLocale}`);
            return {
               locale: routing.defaultLocale,
               messages: fallbackMessages
            };
         } catch (fallbackError) {
            console.error("💀 [i18n] FATAL ERROR: File bahasa default juga rusak/hilang.", fallbackError);

            notFound(); // Halaman 404 jika kedua bahasa rusak
         }
      }

      // Jika error terjadi di bahasa default, langsung 404
      notFound();
   }
});