// File: src/components/strapi/rich-text.tsx
import {
   BlocksRenderer,
   type BlocksContent,
} from "@strapi/blocks-react-renderer";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn"; // Menggunakan utility yang sudah kita buat

// Props untuk komponen ini
interface RichTextProps {
   content: BlocksContent; // Tipe data bawaan library Strapi
   className?: string;
}

/**
 * Komponen ini berfungsi mengubah JSON Blocks dari Strapi v5
 * menjadi tampilan HTML yang sudah di-styling dengan Tailwind.
 */
export default function RichText({ content, className }: RichTextProps) {
   if (!content) return null;

   return (
      <div className={cn("prose max-w-none text-foreground", className)}>
         <BlocksRenderer
            content={content}
            blocks={{
               // 1. Kustomisasi Paragraf
               paragraph: ({ children }) => (
                  <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                     {children}
                  </p>
               ),

               // 2. Kustomisasi Heading (Judul)
               heading: ({ children, level }) => {
                  switch (level) {
                     case 1:
                        return (
                           <h1 className="text-4xl font-bold text-primary mb-6 mt-8">
                              {children}
                           </h1>
                        );
                     case 2:
                        return (
                           <h2 className="text-3xl font-semibold text-foreground mb-4 mt-8 border-b pb-2 border-border">
                              {children}
                           </h2>
                        );
                     case 3:
                        return (
                           <h3 className="text-2xl font-medium text-foreground mb-3 mt-6">
                              {children}
                           </h3>
                        );
                     default:
                        return <h4 className="text-xl font-medium mb-2">{children}</h4>;
                  }
               },

               // 3. Kustomisasi Quote
               quote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary pl-4 italic my-6 bg-secondary/20 p-4 rounded-r-lg">
                     {children}
                  </blockquote>
               ),

               // 4. Kustomisasi List (Daftar)
               list: ({ children, format }) => {
                  if (format === "ordered") {
                     return <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>;
                  }
                  return <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>;
               },

               // 5. Kustomisasi Link
               link: ({ children, url }) => (
                  <Link
                     href={url}
                     className="text-primary hover:underline font-medium hover:text-primary/80 transition-colors"
                     target={url.startsWith("http") ? "_blank" : "_self"}
                     rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                     {children}
                  </Link>
               ),

               // 6. Kustomisasi Gambar (Menggunakan Next.js Image untuk optimasi)
               image: ({ image }) => {
                  return (
                     <div className="my-6 relative w-full h-auto aspect-video rounded-lg overflow-hidden bg-muted">
                        <Image
                           src={image.url}
                           alt={image.alternativeText || "Gambar konten"}
                           fill
                           className="object-cover"
                           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {image.caption && (
                           <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 text-center backdrop-blur-sm">
                              {image.caption}
                           </div>
                        )}
                     </div>
                  );
               },
            }}

            // Modifiers untuk styling inline (Bold, Italic, Code, dll)
            modifiers={{
               bold: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
               italic: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
               underline: ({ children }) => <u className="underline decoration-primary decoration-2 underline-offset-4">{children}</u>,
               code: ({ children }) => (
                  <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                     {children}
                  </code>
               ),
            }}
         />
      </div>
   );
}