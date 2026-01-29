// File: src/app/[locale]/profil/staf/page.tsx

import { redirect } from "next/navigation";

// 1. Generate Static Params (PENTING untuk SSG/Static Export)
// Memberitahu Next.js bahwa halaman ini ada untuk 'id' dan 'en'
export async function generateStaticParams() {
  return [
    { locale: "id" },
    { locale: "en" }
  ];
}

// 2. Halaman Utama (Redirect Only)
export default async function StafIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Arahkan user ke tab default "akademik"
  // Gunakan redirect permanent (RedirectType.push) atau default (replace)
  // Default sudah cukup bagus untuk UX tab
  redirect(`/${locale}/profil/staf/akademik`);
}