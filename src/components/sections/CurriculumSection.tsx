// File: src/components/sections/CurriculumSection.tsx

"use client";

import React, { useState } from "react";

// --- TYPE DEFINITIONS ---

interface CourseItem {
   id: number;
   name: string;
   type?: string;
   code?: string;
   description: string;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   lecturers?: any;
   rps_link?: string;
   portfolio_link?: string;
}

interface SemesterGroup {
   id: number;
   title: string;
   courses: CourseItem[];
}

interface CurriculumSectionData {
   title?: string;
   items: SemesterGroup[];
}

interface CurriculumSectionProps {
   data: CurriculumSectionData;
}

export default function CurriculumSection({ data }: CurriculumSectionProps) {
   const title = data.title;
   const semesters = data.items || [];

   const [openIndex, setOpenIndex] = useState<number | null>(0);

   const toggleAccordion = (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
   };

   // HELPER: Mengubah teks enter menjadi array list
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const getLecturersList = (raw: any): string[] => {
      if (!raw) return [];
      if (typeof raw === "string") {
         return raw.split("\n").filter((item) => item.trim() !== "");
      }
      return [];
   };

   if (!semesters.length) return null;

   return (
      <section className="container mx-auto px-6 md:px-16 lg:px-24 py-12 md:py-20 bg-gray-50/50">

         {/* HEADER */}
         {title && (
            <div className="max-w-4xl mb-10">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-4">
                  {title}
               </h2>
            </div>
         )}

         {/* LIST SEMESTER */}
         <div className="flex flex-col gap-4">
            {semesters.map((semester, index) => {
               const isOpen = openIndex === index;

               return (
                  <div
                     key={semester.id || index}
                     className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all duration-300"
                  >

                     {/* TOMBOL ACCORDION */}
                     <button
                        onClick={() => toggleAccordion(index)}
                        className={`w-full flex items-center justify-between p-5 text-left transition-colors duration-300 ${isOpen ? "bg-green-50 text-green-800" : "bg-white text-gray-800 hover:bg-gray-50"
                           }`}
                     >
                        <span className="text-lg font-bold">{semester.title}</span>
                        <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m6 9 6 6 6-6" />
                           </svg>
                        </span>
                     </button>

                     {/* ISI KONTEN */}
                     <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                           }`}
                     >
                        <div className="p-5 md:p-8 flex flex-col gap-8 border-t border-gray-100">

                           {semester.courses.map((course, cIndex) => {
                              const dosenList = getLecturersList(course.lecturers);

                              return (
                                 <div
                                    key={course.id || cIndex}
                                    className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200 last:border-0 last:pb-0"
                                 >
                                    {/* KIRI: JUDUL & KODE */}
                                    <div className="md:w-1/4">
                                       <h4 className="text-lg font-bold text-gray-900 leading-tight">
                                          {course.name}
                                       </h4>
                                       {course.code && (
                                          <div className="mt-2 inline-block bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded">
                                             {course.code}
                                          </div>
                                       )}
                                    </div>

                                    {/* KANAN: DETAIL */}
                                    <div className="md:w-3/4 space-y-5">
                                       {course.type && (
                                          <div className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                                             {course.type}
                                          </div>
                                       )}

                                       <p className="text-gray-600 text-sm leading-relaxed text-justify">
                                          {course.description}
                                       </p>

                                       <div className="flex flex-col md:flex-row justify-between gap-6 pt-2 border-t border-gray-100/50 mt-4">

                                          {/* --- BAGIAN DOSEN --- */}
                                          <div className="flex-1">
                                             <span className="block text-sm font-bold text-gray-900 mb-2">
                                                Dosen Pengampu:
                                             </span>

                                             {dosenList.length > 0 ? (
                                                <ul className="list-disc list-outside pl-4 text-sm text-gray-600 space-y-1 marker:text-green-500">
                                                   {dosenList.map((dosen, i) => (
                                                      <li key={i}>{dosen}</li>
                                                   ))}
                                                </ul>
                                             ) : (
                                                <span className="text-gray-400 italic text-sm">- Data dosen belum tersedia -</span>
                                             )}
                                          </div>

                                          {/* --- BAGIAN TOMBOL (REDESIGNED) --- */}
                                          <div className="flex flex-row md:flex-col gap-3 items-start md:items-end justify-start min-w-[180px]">

                                             {/* TOMBOL RPS (Biru) */}
                                             {course.rps_link && (
                                                <a
                                                   href={course.rps_link}
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   className="group flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all duration-300"
                                                >
                                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                      <polyline points="14 2 14 8 20 8" />
                                                      <path d="M16 13H8" />
                                                      <path d="M16 17H8" />
                                                      <path d="M10 9H8" />
                                                   </svg>
                                                   Unduh RPS
                                                </a>
                                             )}

                                             {/* TOMBOL PORTOFOLIO (Orange) */}
                                             {course.portfolio_link && (
                                                <a
                                                   href={course.portfolio_link}
                                                   target="_blank"
                                                   rel="noopener noreferrer"
                                                   className="group flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-orange-100 hover:bg-orange-600 hover:text-white hover:border-orange-600 hover:shadow-md transition-all duration-300"
                                                >
                                                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                      <path d="M20 10c0-6-4-10-10-10S0 4 0 10a10 10 0 0 0 20 0z" opacity="0.5" />
                                                      <path d="M4 10l2-2" />
                                                      <path d="M4 10l2 2" />
                                                      <path d="M20 10l-2-2" />
                                                      <path d="M20 10l-2 2" />
                                                      <rect x="2" y="6" width="20" height="12" rx="2" />
                                                   </svg>
                                                   Lihat Portofolio
                                                </a>
                                             )}

                                          </div>

                                       </div>
                                    </div>
                                 </div>
                              );
                           })}

                           {semester.courses.length === 0 && (
                              <div className="text-center text-gray-400 py-4 italic">
                                 Belum ada mata kuliah di semester ini.
                              </div>
                           )}

                        </div>
                     </div>

                  </div>
               );
            })}
         </div>
      </section>
   );
}