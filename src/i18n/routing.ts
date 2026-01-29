// File: src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';
import { locales, defaultLocale } from './settings';

export const routing = defineRouting({
   // 1. GUNAKAN VARIABEL IMPORT
   locales,

   defaultLocale,

   // 'always': URL selalu ada prefix (/id/about, /en/about) - Bagus untuk SEO & Konsistensi
   localePrefix: 'always'
});

// 2. EXPORT NAVIGASI
export const { Link, redirect, usePathname, useRouter, getPathname } =
   createNavigation(routing);

// 3. EXPORT TYPES
// Kita bisa mengambil tipe ini langsung dari settings.ts (opsional),
// atau membiarkannya di sini. Agar tidak duplicate, saran saya import saja dari settings.
// Tapi jika ingin tetap di sini untuk kemudahan akses, kodenya:
export type Locale = (typeof routing.locales)[number];