// File: src/app/[locale]/profil/staf/[category]/[slug]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import { getStrapiMedia } from "@/lib/strapi/utils";
import { FaArrowLeft, FaBook, FaGlobe } from "react-icons/fa";
import { SiGooglescholar } from "react-icons/si";
import PageHeader from "@/components/ui/PageHeader";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

// --- TYPE DEFINITIONS ---

interface StrapiImage {
  url?: string;
  data?: {
    attributes?: {
      url?: string;
    };
  } | null;
}

interface EducationItem {
  id: number;
  level: string;
  major: string;
  institution: string;
  year?: string;
}

interface RoleDetail {
  id: number;
  __component: string;
  expertise?: string;
  sinta_url?: string;
  scopus_url?: string;
  google_scholar_url?: string;
  position?: string;
}

interface StaffBase {
  name: string;
  nip: string;
  email: string;
  slug: string;
  category: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  photo?: { data: any } | any;
  Role_Details?: RoleDetail[];
  Education_History?: EducationItem[];
}

interface StrapiEntity {
  id: number;
  attributes?: StaffBase;
  [key: string]: unknown;
}

interface StrapiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

interface PageConfigAttributes {
  Default_Card_Banner?: StrapiImage;
  Icon_Sinta?: StrapiImage;
  Icon_Scopus?: StrapiImage;
  Icon_GoogleScholar?: StrapiImage;
}

interface PageConfigEntity {
  attributes?: PageConfigAttributes;
  [key: string]: unknown;
}

// --- HELPER: Normalisasi Data ---
function getAttributes(item: StrapiEntity | null | undefined): (StaffBase & { id: number }) | null {
  if (!item) return null;
  const id = item.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attrs = (item.attributes || item) as any;
  return { id, ...attrs };
}

// Helper Ekstraksi URL Gambar
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getImageUrl(img: any): string | undefined {
  if (!img) return undefined;
  const url = img.url || img.data?.attributes?.url || img.attributes?.url;
  return getStrapiMedia(url) || undefined;
}

// --- 1. GENERATE STATIC PARAMS ---
export async function generateStaticParams() {
  try {
    const staffData = await fetchAPI("/staff-members", {
      fields: ["slug", "category"],
      pagination: { limit: 100 },
    }) as StrapiResponse<StrapiEntity[]>;

    const locales = ["id", "en"];
    const params: { locale: string; category: string; slug: string }[] = [];

    if (!staffData?.data) return [];

    staffData.data.forEach((item) => {
      const data = getAttributes(item);
      if (data?.slug && data?.category) {
        locales.forEach((locale) => {
          params.push({
            locale,
            category: data.category,
            slug: data.slug,
          });
        });
      }
    });

    return params;
  } catch (error) {
    console.error("Error generating params for staff:", error);
    return [];
  }
}

// --- 2. GENERATE METADATA ---
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "StaffDetail" });

  const res = await fetchAPI("/staff-members", {
    filters: { slug: { $eq: slug } },
    locale,
    fields: ["name", "category", "nip"],
  }) as StrapiResponse<StrapiEntity[]>;

  const data = getAttributes(res?.data?.[0]);

  if (!data) return { title: t("staff_not_found_title") };

  const role = data.category === 'akademik' ? t("role_academic") : t("role_admin");

  return {
    title: `${data.name} - ${role} ${t("meta_title_suffix")}`,
    description: `${t("meta_desc_prefix")} ${data.name}, ${t("nip")}: ${data.nip || '-'}`,
  };
}

// --- 3. HALAMAN UTAMA ---
export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}) {
  const { category, slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "StaffDetail" });

  // Init Data Containers
  let staff: (StaffBase & { id: number }) | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pageConfig: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let globalData: any = null;

  try {
    const [staffRes, configRes, globalRes] = await Promise.all([
      // A. Detail Staf
      fetchAPI("/staff-members", {
        filters: { slug: { $eq: slug } },
        populate: {
          photo: { fields: ["url"] },
          Role_Details: { populate: "*" },
          Education_History: { populate: "*" },
        },
        locale: locale,
      }) as Promise<StrapiResponse<StrapiEntity[]>>,

      // B. Config Halaman
      fetchAPI("/staff-page-config", {
        populate: {
          Default_Card_Banner: { fields: ["url"] },
          Icon_Sinta: { fields: ["url"] },
          Icon_Scopus: { fields: ["url"] },
          Icon_GoogleScholar: { fields: ["url"] },
        },
        locale: locale,
      }) as Promise<StrapiResponse<PageConfigEntity>>,

      // C. Global
      fetchAPI("/global", {
        populate: "Default_Hero_Image",
        locale: locale,
      }) as Promise<StrapiResponse<StrapiEntity>>,
    ]);

    staff = getAttributes(staffRes?.data?.[0]);
    pageConfig = configRes?.data?.attributes || configRes?.data;
    globalData = globalRes?.data?.attributes || globalRes?.data;

  } catch (error) {
    console.error("[StaffDetail] Error fetching data:", error);
  }

  if (!staff) return notFound();

  // --- Normalisasi Field ---
  const photoUrl = getImageUrl(staff.photo) || "/images/placeholder-avatar.png";

  // Hero & Banner
  const heroUrl = getImageUrl(globalData?.Default_Hero_Image);
  const cardBannerUrl = getImageUrl(pageConfig?.Default_Card_Banner);

  // Icons
  const icons = {
    sinta: getImageUrl(pageConfig?.Icon_Sinta),
    scopus: getImageUrl(pageConfig?.Icon_Scopus),
    scholar: getImageUrl(pageConfig?.Icon_GoogleScholar),
  };

  // Logic Role Details
  const academicData = staff.Role_Details?.find(
    (item) => item.__component === "staff-data.academic-data"
  );
  const adminData = staff.Role_Details?.find(
    (item) => item.__component === "staff-data.admin-data"
  );

  let mainRole = "-";
  if (category === "akademik") {
    mainRole = academicData?.expertise || t("default_role_academic");
  } else {
    mainRole = adminData?.position || t("default_role_admin");
  }

  // Label UI (Menggunakan Translation)
  const roleLabel = category === "akademik" ? t("role_academic") : t("role_admin");

  return (
    <div className="bg-gray-50 min-h-screen pb-20 -mt-20 md:-mt-24">

      <PageHeader
        title={staff.name}
        breadcrumb={`${t("breadcrumb_profile")} / ${t("breadcrumb_staff")} / ${roleLabel} / ${t("breadcrumb_detail")}`}
        backgroundImageUrl={heroUrl}
        sectionTitle={t("profile_section_title")}
        sectionSubtitle={roleLabel}
      />

      <div className="container mx-auto px-4 relative z-10">

        <div className="bg-white rounded-xl shadow-xl overflow-hidden max-w-4xl mx-auto border border-gray-100">

          {/* BANNER CARD */}
          <div className="h-48 md:h-64 w-full relative">
            {cardBannerUrl ? (
              <Image
                src={cardBannerUrl}
                alt="Banner Profile"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            ) : (
              <div className="w-full h-full bg-[#005320]" />
            )}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="px-8 pb-10 relative text-center">

            {/* FOTO PROFIL (Overlap Banner) */}
            <div className="relative -mt-24 mb-6 inline-block">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-200 relative z-10">
                <Image
                  src={photoUrl}
                  alt={staff.name || "Staff Photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 200px, 200px"
                />
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {staff.name}
            </h1>
            <p className="text-xl text-gray-500 font-medium mb-4">
              {t("nip")}: {staff.nip || "-"}
            </p>

            <div className="inline-block px-6 py-2 bg-green-50 rounded-full text-[#005320] font-semibold mb-8 border border-green-100">
              {mainRole}
            </div>

            {staff.email && (
              <div className="mb-8 border-t border-gray-200 pt-8 max-w-2xl mx-auto">
                <h4 className="text-2xl font-bold text-gray-900 mb-4">{t("email_title")}</h4>
                <a
                  href={`mailto:${staff.email}`}
                  className="text-xl text-gray-600 hover:text-[#005320] underline decoration-green-600/30 underline-offset-4 transition-all"
                >
                  {staff.email}
                </a>
              </div>
            )}

            {staff.Education_History && staff.Education_History.length > 0 && (
              <div className="mb-8 border-t border-gray-200 pt-8 max-w-2xl mx-auto text-center">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("education")}
                </h4>
                <div className="space-y-4">
                  {staff.Education_History.map((edu, index) => (
                    <div key={index} className="text-gray-700">
                      <span className="font-semibold block text-gray-900">
                        {edu.level} {edu.major}
                      </span>
                      <span className="text-lg text-gray-500">
                        {edu.institution} {edu.year ? `(${edu.year})` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXTERNAL LINKS (AKADEMIK ONLY) */}
            {category === "akademik" && (
              <div className="flex justify-center gap-6 mt-10 pt-8 border-t border-gray-100 items-center flex-wrap">
                {academicData?.google_scholar_url && (
                  <Link
                    href={academicData.google_scholar_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                    title="Google Scholar"
                  >
                    {icons.scholar ? (
                      <Image src={icons.scholar} alt="Google Scholar" width={120} height={40} className="h-10 w-auto object-contain" />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:text-blue-600"><SiGooglescholar /> Scholar</div>
                    )}
                  </Link>
                )}

                {academicData?.sinta_url && (
                  <Link
                    href={academicData.sinta_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                    title="Sinta"
                  >
                    {icons.sinta ? (
                      <Image src={icons.sinta} alt="Sinta" width={100} height={40} className="h-8 w-auto object-contain" />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:text-blue-600"><FaBook /> SINTA</div>
                    )}
                  </Link>
                )}

                {academicData?.scopus_url && (
                  <Link
                    href={academicData.scopus_url}
                    target="_blank"
                    className="hover:opacity-80 transition-opacity"
                    title="Scopus"
                  >
                    {icons.scopus ? (
                      <Image src={icons.scopus} alt="Scopus" width={100} height={40} className="h-8 w-auto object-contain" />
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:text-orange-600"><FaGlobe /> Scopus</div>
                    )}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12 mb-16">
          <Link
            href={`/${locale}/profil/staf/${category}`}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white border border-green-200 text-[#005320] font-semibold rounded-full shadow-sm hover:shadow-md hover:bg-green-50 transition-all duration-300 transform hover:-translate-y-1 group"
          >
            <FaArrowLeft className="text-sm transition-transform duration-300 group-hover:-translate-x-1" />
            <span>{t("back_to_list")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}