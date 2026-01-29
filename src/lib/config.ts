// File: src/lib/config.ts

import { z } from "zod";

// 1. Validasi Environment Variables
const envSchema = z.object({
   // Gunakan 'url()' validator dari Zod untuk memastikan format URL valid
   NEXT_PUBLIC_STRAPI_API_URL: z.string().url().default("http://localhost:1337"),
   STRAPI_API_TOKEN: z.string().optional(),
   NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Parsing process.env
// Catatan: Next.js akan mengganti process.env.NEXT_PUBLIC_... saat build time
// jadi objek ini aman digunakan di Client & Server.
const envVars = envSchema.parse({
   NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
   STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
   NODE_ENV: process.env.NODE_ENV,
});

// Helper untuk membersihkan trailing slash (agar tidak ada //api)
const sanitizeUrl = (url: string) => url.replace(/\/$/, "");

export const CONFIG = {
   // Host URL (untuk gambar). Hasil: "http://202.10.34.176:1337"
   STRAPI_HOST: sanitizeUrl(envVars.NEXT_PUBLIC_STRAPI_API_URL),

   // Base URL untuk API. Hasil: "http://202.10.34.176:1337/api"
   API_BASE_URL: `${sanitizeUrl(envVars.NEXT_PUBLIC_STRAPI_API_URL)}/api`,

   // Token
   API_TOKEN: envVars.STRAPI_API_TOKEN,

   // Mode & Timeout
   IS_DEV: envVars.NODE_ENV === "development",
   TIMEOUT: 10000,
} as const;