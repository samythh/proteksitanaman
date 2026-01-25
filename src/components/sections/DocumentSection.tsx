// File: src/components/sections/DocumentSection.tsx

"use client";

import React, { useState, useMemo } from "react";

// --- TYPE DEFINITIONS ---
interface DocFile {
   id: number;
   title: string;
   date?: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   file: any;
}

interface DocGroup {
   id: number;
   group_name: string;
   files: DocFile[];
}

interface DocCategory {
   id: number;
   name: string;
   groups: DocGroup[];
}

interface DocumentSectionData {
   title?: string;
   categories: DocCategory[];
}

interface DocumentSectionProps {
   data: DocumentSectionData;
}

export default function DocumentSection({ data }: DocumentSectionProps) {
   // ✅ FIX 1: Gunakan useMemo untuk 'categories' agar referensinya stabil
   // Ini menyelesaikan warning: "The 'categories' logical expression could make the dependencies of useMemo Hook change on every render"
   const categories = useMemo(() => data.categories || [], [data.categories]);

   const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
   const [searchTerm, setSearchTerm] = useState("");
   const [downloadingId, setDownloadingId] = useState<number | null>(null);

   const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

   // --- 1. LOGIKA SEARCH GLOBAL & DISPLAY CONTENT ---
   const displayedContent = useMemo(() => {
      // Jika tidak ada data sama sekali
      if (!categories.length) return [];

      // A. JIKA ADA PENCARIAN (GLOBAL SEARCH)
      if (searchTerm.trim() !== "") {
         const term = searchTerm.toLowerCase();
         const globalResults: DocGroup[] = [];

         // Loop semua kategori
         categories.forEach((cat) => {
            const groups = cat.groups || []; // Safety check
            groups.forEach((group) => {
               const files = group.files || []; // Safety check

               // Cari file yang cocok
               const matchingFiles = files.filter(f =>
                  (f.title || "").toLowerCase().includes(term)
               );

               // Jika ada file cocok, atau nama grup cocok
               const isGroupMatch = (group.group_name || "").toLowerCase().includes(term);

               if (matchingFiles.length > 0 || isGroupMatch) {
                  globalResults.push({
                     ...group,
                     // Tambahkan info kategori ke nama grup agar user tahu ini dari mana
                     group_name: `${cat.name} — ${group.group_name}`,
                     files: matchingFiles.length > 0 ? matchingFiles : files
                  });
               }
            });
         });

         return globalResults;
      }

      // B. JIKA TIDAK ADA PENCARIAN (NORMAL VIEW)
      const activeCat = categories[activeCategoryIndex];
      // Safety check: jika activeCat undefined atau groups kosong
      return activeCat?.groups || [];

   }, [categories, searchTerm, activeCategoryIndex]);


   // --- HELPER FUNCTIONS ---
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const getFileInfo = (fileData: any) => {
      if (!fileData) return { url: null, ext: "" };
      const rawUrl = fileData.url || fileData.data?.attributes?.url || null;
      const ext = fileData.ext || fileData.data?.attributes?.ext || "";
      return { url: rawUrl, ext: ext.toLowerCase() };
   };

   const handleDownload = async (url: string, filename: string, fileId: number) => {
      try {
         setDownloadingId(fileId);
         const response = await fetch(url);
         const blob = await response.blob();
         const blobUrl = window.URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = blobUrl;
         link.download = filename;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
         console.error("Gagal mendownload file:", error);
         window.open(url, '_blank');
      } finally {
         setDownloadingId(null);
      }
   };

   if (!categories.length) return null;

   return (
      <section className="container mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20 bg-gray-50 min-h-screen">

         {/* 1. HEADER & SEARCH */}
         <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-10 border-b border-gray-200 pb-8">
            <div className="w-full md:w-auto">
               {data.title && (
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 border-l-4 border-green-600 pl-4">
                     {data.title}
                  </h2>
               )}
               <p className="text-gray-500 mt-2 text-sm pl-5">
                  Pusat unduhan dokumen resmi, SK, SOP, dan panduan akademik.
               </p>
            </div>

            <div className="relative w-full md:w-80">
               <input
                  type="text"
                  placeholder="Cari di semua kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
               />
               <svg className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
            </div>
         </div>

         <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* 2. SIDEBAR NAVIGATION */}
            <aside className={`w-full lg:w-1/4 flex-shrink-0 transition-opacity ${searchTerm ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-24">
                  <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-2 lg:pb-0 scrollbar-hide">
                     {categories.map((cat, index) => {
                        const isActive = activeCategoryIndex === index;
                        return (
                           <button
                              key={cat.id || index}
                              onClick={() => {
                                 setActiveCategoryIndex(index);
                                 setSearchTerm("");
                              }}
                              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap lg:whitespace-normal text-left
                      ${isActive
                                    ? "bg-green-50 text-green-700 border-l-4 border-green-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                                 }
                    `}
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isActive ? "opacity-100" : "opacity-60"}>
                                 <path d="M20 20a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z" />
                              </svg>
                              {cat.name}
                           </button>
                        );
                     })}
                  </div>
               </div>
            </aside>

            {/* 3. CONTENT AREA */}
            <div className="w-full lg:w-3/4 min-h-[400px]">

               {/* Indikator Hasil Pencarian Global */}
               {searchTerm && (
                  <div className="mb-4 text-sm text-gray-500">
                     {/* ✅ FIX 2: Ganti "..." dengan &quot;...&quot; */}
                     Menampilkan hasil pencarian untuk <span className="font-bold text-gray-900">&quot;{searchTerm}&quot;</span> dari semua kategori:
                  </div>
               )}

               {displayedContent.length > 0 ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     {displayedContent.map((group, gIndex) => (
                        <div key={group.id || gIndex} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                           {/* Group Header */}
                           <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                              <h3 className="font-bold text-gray-800 text-lg">
                                 {group.group_name || "Untitled Group"}
                              </h3>
                              <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                 {group.files?.length || 0} Dokumen
                              </span>
                           </div>

                           {/* List Files */}
                           <div className="divide-y divide-gray-50">
                              {(group.files || []).map((file, fIndex) => {
                                 const { url, ext } = getFileInfo(file.file);
                                 const safeTitle = file.title || "Dokumen Tanpa Judul";

                                 let fullUrl = null;
                                 if (url) {
                                    if (url.startsWith("http")) {
                                       fullUrl = url;
                                    } else {
                                       fullUrl = `${STRAPI_URL}${url}`;
                                    }
                                 }

                                 const canPreview = [".pdf", ".jpg", ".jpeg", ".png"].includes(ext);
                                 const isDownloading = downloadingId === file.id;

                                 const downloadFilename = `${safeTitle.replace(/\s+/g, '_')}${ext}`;

                                 return (
                                    <div key={file.id || fIndex} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-green-50/30 transition-colors group">

                                       {/* File Info */}
                                       <div className="flex items-start gap-4">
                                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${ext === '.pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                             {ext === '.pdf' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><path d="M14 2v6h6" /><path d="M10 13H8" /><path d="M16 13h-2.5" /></svg>
                                             ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
                                             )}
                                          </div>
                                          <div>
                                             <h4 className="text-gray-800 font-medium group-hover:text-green-700 transition-colors">
                                                {safeTitle}
                                             </h4>
                                             {file.date && (
                                                <p className="text-xs text-gray-400 mt-1">Updated: {file.date}</p>
                                             )}
                                          </div>
                                       </div>

                                       {/* ACTION BUTTONS */}
                                       {fullUrl ? (
                                          <div className="flex items-center gap-2">

                                             {/* TOMBOL PREVIEW */}
                                             {canPreview && (
                                                <a
                                                   href={fullUrl}
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                                                   title="Lihat Dokumen"
                                                >
                                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                                      <circle cx="12" cy="12" r="3" />
                                                   </svg>
                                                   <span className="hidden sm:inline">Lihat</span>
                                                </a>
                                             )}

                                             {/* TOMBOL DOWNLOAD */}
                                             <button
                                                onClick={() => handleDownload(fullUrl!, downloadFilename, file.id)}
                                                disabled={isDownloading}
                                                className={`flex items-center justify-center gap-2 px-3 py-2 border rounded-lg text-sm font-semibold transition-all whitespace-nowrap
                                      ${isDownloading
                                                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-wait"
                                                      : "bg-white text-gray-600 border-gray-200 hover:bg-green-600 hover:text-white hover:border-green-600 hover:shadow-md"
                                                   }
                                    `}
                                                title="Unduh Dokumen"
                                             >
                                                {isDownloading ? (
                                                   <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                   </svg>
                                                ) : (
                                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                      <polyline points="7 10 12 15 17 10" />
                                                      <line x1="12" y1="15" x2="12" y2="3" />
                                                   </svg>
                                                )}
                                                <span className="hidden sm:inline">
                                                   {isDownloading ? "Mengunduh..." : "Unduh"}
                                                </span>
                                             </button>

                                          </div>
                                       ) : (
                                          <span className="text-xs text-gray-400 italic px-4">File tidak tersedia</span>
                                       )}

                                    </div>
                                 );
                              })}
                           </div>

                        </div>
                     ))}
                  </div>
               ) : (
                  // EMPTY STATE
                  <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">Dokumen tidak ditemukan</h3>
                     <p className="text-gray-500 mt-2">
                        {/* ✅ FIX 3: Ganti "..." dengan &quot;...&quot; */}
                        {searchTerm
                           ? <>Tidak ada hasil untuk <span className="font-bold">&quot;{searchTerm}&quot;</span> di semua kategori.</>
                           : "Kategori ini belum memiliki dokumen."}
                     </p>
                     {searchTerm && (
                        <button
                           onClick={() => setSearchTerm("")}
                           className="mt-6 text-green-600 font-medium hover:underline"
                        >
                           Reset Pencarian
                        </button>
                     )}
                  </div>
               )}

            </div>
         </div>
      </section>
   );
}