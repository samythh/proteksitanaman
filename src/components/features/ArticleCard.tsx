// src/components/features/ArticleCard.tsx
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";

const PLACEHOLDER_IMAGE = "/images/placeholder-agenda.jpg";

export default function ArticleCard({
  data,
  locale,
}: {
  data: any;
  locale: string;
}) {
  // 1. Normalisasi Data
  const item = data.attributes || data;

  // 2. Logika Gambar
  const imageUrl =
    item.image || item.image?.data?.attributes?.url || PLACEHOLDER_IMAGE;

  const finalImageUrl =
    imageUrl.startsWith("http") || imageUrl.startsWith("/")
      ? imageUrl
      : `${process.env.NEXT_PUBLIC_STRAPI_URL || "http://202.10.34.176:1337"}${imageUrl}`;

  // 3. Format Tanggal
  const dateObj = item.publishedAt ? new Date(item.publishedAt) : new Date();
  const dateLabel = format(dateObj, "d MMMM yyyy", {
    locale: locale === "id" ? idLocale : enUS,
  });

  // 4. LOGIKA PENGAMAN KONTEN (Updated untuk Rich Text Strapi)
  let summary = "Klik untuk membaca selengkapnya...";

  // Cek 1: Apakah konten berupa String biasa? (Markdown/Text)
  if (typeof item.content === "string") {
    summary = item.content;
  }
  // Cek 2: Apakah konten berupa Array Blocks Strapi? (Rich Text)
  else if (Array.isArray(item.content) && item.content.length > 0) {
    // Coba ambil teks dari paragraf pertama
    const firstBlock = item.content[0];
    if (firstBlock.type === "paragraph" && firstBlock.children?.[0]?.text) {
      summary = firstBlock.children[0].text;
    }
  }
  // Cek 3: Fallback ke description jika ada
  else if (item.description && typeof item.description === "string") {
    summary = item.description;
  }

  return (
    <Link
      href={`/${locale}/informasi/berita/${item.slug}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col h-full"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-gray-200">
        <Image
          src={finalImageUrl}
          alt={item.title || "Article Image"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.srcset = PLACEHOLDER_IMAGE;
          }}
        />
        <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          Artikel
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          📅 {dateLabel}
        </div>

        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-700 transition-colors mb-2">
          {item.title}
        </h3>

        {/* Render Summary yang sudah aman */}
        <p className="text-sm text-gray-600 line-clamp-3">{summary}</p>
      </div>
    </Link>
  );
}
