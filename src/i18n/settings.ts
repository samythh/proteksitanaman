// File: src/i18n/settings.ts

// 1. DAFTAR LOCALE (Kode Bahasa)
// 'as const' membuat array ini read-only dan bisa dikoversi jadi Tipe Data.
export const locales = ['id', 'en'] as const;

// 2. DEFINISI TYPE (Otomatis)
// Tipe ini akan bernilai: 'id' | 'en'
export type Locale = (typeof locales)[number];

// 3. CONFIG DEFAULT
export const defaultLocale: Locale = 'id';

// 4. METADATA UI 
// Objek ini memetakan kode bahasa ke teks yang enak dibaca user.
// Sangat berguna untuk komponen <LanguageSwitcher />.
export const localeNames: Record<Locale, string> = {
   id: "Bahasa Indonesia",
   en: "English (US)"
};

// Opsional: Bendera atau Icon bisa ditaruh sini juga
export const localeFlags: Record<Locale, string> = {
   id: "🇮🇩",
   en: "🇺🇸"
};