// File: src/i18n/settings.ts

// Daftar bahasa yang didukung. 
// 'as const' membuat TypeScript tahu bahwa nilai ini tidak akan berubah (read-only).
export const locales = ['id', 'en'] as const;

// Tipe data Locale diambil dari array di atas (agar type-safe)
export type Locale = (typeof locales)[number];

// Bahasa utama jika user tidak memilih bahasa apapun
export const defaultLocale: Locale = 'id';