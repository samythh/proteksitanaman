import Link from "next/link";
import { fetchAPI } from "@/lib/strapi/fetcher";
import AgendaCard from "@/components/features/AgendaCard";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Archive } from "lucide-react";

// --- TYPE DEFINITIONS ---
interface AgendaItem {
   id: number;
   attributes: {
      title: string;
      slug: string;
      startDate: string;
      endDate: string;
      location: string;
      excerpt?: string;
      image?: {
         data?: {
            attributes: {
               url: string;
            };
         };
      };
      tags?: {
         data: {
            id: number;
            attributes: {
               name: string;
            };
         }[];
      };
   };
}

// --- FETCH DATA ARSIP (PAST EVENTS) ---
async function getArchivedAgendas(locale: string) {
   const now = new Date().toISOString();

   try {
      const res = await fetchAPI("/events", {
         locale,
         filters: {
            endDate: {
               $lt: now,
            },
         },
         sort: ["endDate:desc"],
         populate: {
            image: { fields: ["url"] },
            tags: { populate: "*" },
         },
         pagination: {
            limit: 100,
         },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = res as any;

      return (response?.data || []) as AgendaItem[];
   } catch (error) {
      console.error("Error fetching archived agendas:", error);
      return [];
   }
}

// --- METADATA ---
export async function generateMetadata({
   params,
}: {
   params: Promise<{ locale: string }>;
}) {
   const { locale } = await params;
   const t = await getTranslations({ locale, namespace: "AgendaArchive" });

   return {
      title: `${t("title")} - Department of Plant Protection`,
      description: t("subtitle"),
   };
}

// --- MAIN PAGE ---
export default async function AgendaArchivePage({
   params,
}: {
   params: Promise<{ locale: string }>;
}) {
   const { locale } = await params;
   const t = await getTranslations({ locale, namespace: "AgendaArchive" });
   const archivedAgendas = await getArchivedAgendas(locale);

   return (
      <div className="bg-gray-50 min-h-screen pb-20 pt-20 md:pt-24 font-sans">
         <div className="container mx-auto px-4">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-gray-200 pb-8">
               <div className="w-full md:w-auto">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 border-l-4 border-green-600 pl-4 flex items-center gap-3">
                     {t("title")}
                  </h1>
                  {/* Subtitle */}
                  <p className="text-gray-500 mt-2 text-sm pl-5">
                     {t("subtitle")}
                  </p>
               </div>

               {/* Tombol Kembali */}
               <Link
                  href={`/${locale}/informasi/agenda`}
                  className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-green-200 text-green-700 font-bold rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm text-sm"
               >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  {t("back_to_agenda")}
               </Link>
            </div>

            {/* --- GRID ARSIP --- */}
            {archivedAgendas.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {archivedAgendas.map((item) => (
                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
                     <AgendaCard key={item.id} data={item as any} locale={locale} />
                  ))}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                     <Archive size={28} />
                  </div>
                  <p className="text-gray-500 text-base font-medium italic">
                     {t("no_archive")}
                  </p>
               </div>
            )}

         </div>
      </div>
   );
}