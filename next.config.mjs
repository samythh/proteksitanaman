// File: next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */

// 1. Setup Plugin Bahasa
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// 2. Setup Konfigurasi Utama (Gambar)
const nextConfig = {
   images: {
      // Matikan optimasi static sementara jika perlu, tapi remotePatterns lebih penting
      remotePatterns: [
         {
            protocol: 'http',
            hostname: 'localhost',
            port: '1337',
            pathname: '/uploads/**',
         },
         {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: '1337',
            pathname: '/uploads/**',
         },
         // --- INI YANG PALING PENTING UNTUK ERROR ANDA ---
         {
            protocol: 'http',
            hostname: '202.10.34.176', // IP Server Strapi
            port: '1337',              // Port Server Strapi
            pathname: '/uploads/**',   // Folder gambar Strapi
         },
      ],
   },
};

// 3. Export Gabungan
export default withNextIntl(nextConfig);