// File: src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
   // Matcher untuk mengabaikan file internal (_next, api, gambar, dll)
   matcher: ['/', '/(id|en)/:path*']
};