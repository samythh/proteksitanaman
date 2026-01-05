// File: src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
   let locale = await requestLocale;

   // PERBAIKAN:
   // Hapus 'as any'.
   // Kita casting array 'routing.locales' menjadi 'readonly string[]'
   // agar dia mau menerima pengecekan string generic.
   if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
      locale = routing.defaultLocale;
   }

   return {
      locale,
      messages: (await import(`../../messages/${locale}.json`)).default
   };
});