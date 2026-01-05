// File: src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation'; // GANTI DISINI
import { locales, defaultLocale } from './settings';

export const routing = defineRouting({
   locales,
   defaultLocale,
   localePrefix: 'always'
});

// Gunakan createNavigation, bukan createSharedPathnamesNavigation
export const { Link, redirect, usePathname, useRouter, getPathname } =
   createNavigation(routing);