// File: next.config.mjs
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */

// 1. Setup Plugin Bahasa (JANGAN DIHAPUS)
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// 2. Setup Konfigurasi Utama (Gambar)
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "1337",
        pathname: "/uploads/**",
      },
      // ✅ TAMBAHAN BARU: IP Address Server Strapi Anda
      {
        protocol: "http",
        hostname: "202.10.34.176",
        port: "1337",
        pathname: "/uploads/**",
      },
      // Domain Backend
      {
        protocol: "https",
        hostname: "api.backendn8n.cloud",
        port: "",
        pathname: "/uploads/**",
      },
      // ✅ TAMBAHAN BARU: Izin untuk Thumbnail YouTube
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
    minimumCacheTTL: 604800,
  },
};

// 3. Export Gabungan (PENTING: Harus dibungkus withNextIntl)
export default withNextIntl(nextConfig);