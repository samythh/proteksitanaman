import { redirect } from "next/navigation";

export default async function StafIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/profil/staf/akademik`);
}
