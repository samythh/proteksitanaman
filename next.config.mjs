import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */

// 1. Inisialisasi Plugin i18n
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// 2. Konfigurasi Utama Next.js
const nextConfig = {
  // --- A. SECURITY & PERFORMANCE ---
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,

  // --- B. LOGGING ---
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // --- C. IMAGE OPTIMIZATION ---
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,

    remotePatterns: [
      // 1. Placeholder (Development)
      {
        protocol: "https",
        hostname: "placehold.co",
      },

      // 2. Localhost Strapi (Untuk development lokal)
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

      // 3. ✅ SERVER UTAMA (Strapi Production)
      {
        protocol: "https",
        hostname: "api.backendn8n.cloud",
        port: "",
        pathname: "/uploads/**",
      },

      // 4. External Providers (YouTube Thumbnails)
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },

      // 5. 🏳️‍🌈 Flag CDN (Untuk Bendera Navbar)
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
};

// 3. Export dengan Plugin i18n
export default withNextIntl(nextConfig);