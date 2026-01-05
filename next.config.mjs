// File: next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
   // Konfigurasi Image Optimization Next.js
   images: {
      remotePatterns: [
         {
            // Mengizinkan gambar dari server Strapi Anda
            protocol: 'http',
            hostname: '202.10.34.176',
            port: '1337',
            pathname: '/uploads/**', // Folder default upload Strapi
         },
         {
            // Mengizinkan gambar placeholder dari localhost (opsional, untuk dev)
            protocol: 'http',
            hostname: 'localhost',
            port: '1337',
            pathname: '/uploads/**',
         },
      ],
   },
   // Opsi tambahan untuk performa (opsional tapi disarankan)
   reactStrictMode: true,
};

// Bungkus config dengan plugin next-intl untuk i18n
export default withNextIntl(nextConfig);