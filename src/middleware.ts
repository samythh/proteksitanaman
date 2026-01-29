// File: src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

// 1. Inisialisasi Middleware i18n
const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
   // 2. Jalankan logika i18n
   const response = handleI18nRouting(request);

   // 3. SECURITY HEADERS INJECTION 🔒
   // Menambahkan lapisan keamanan HTTP standar industri pada setiap respons.

   // Mencegah website Anda di-embed di iframe orang lain (Clickjacking protection)
   response.headers.set('X-Frame-Options', 'SAMEORIGIN');

   // Mencegah browser menebak tipe konten (MIME-Sniffing protection)
   response.headers.set('X-Content-Type-Options', 'nosniff');

   // Mengontrol informasi referrer saat user klik link keluar
   response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

   // Memaksa browser menggunakan HTTPS (HSTS) - Penting untuk Production
   if (process.env.NODE_ENV === 'production') {
      response.headers.set(
         'Strict-Transport-Security',
         'max-age=31536000; includeSubDomains; preload'
      );
   }

   // (Opsional) Content Security Policy (CSP) bisa ditambahkan di sini,
   // tapi hati-hati karena bisa memblokir script Strapi/Google Analytics jika terlalu ketat.

   return response;
}

export const config = {
   // 4. MATCHER OPTIMIZATION ⚡
   // Regex ini memastikan Middleware HANYA berjalan di halaman yang perlu diterjemahkan.
   // MENGABAIKAN:
   // - api/ (_next/data, dll)
   // - _next/static (JS, CSS chunks)
   // - _next/image (Image optimization)
   // - favicon.ico, sitemap.xml, robots.txt
   // - File dengan ekstensi umum (.png, .jpg, .svg, dll)
   matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
      '/',
      '/(id|en)/:path*' // Pastikan locale Anda sesuai dengan routing.ts
   ]
};