"use client";

import { useState } from "react";
import {
   ChevronDown,
   Download,
   ExternalLink,
   Users,
   BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// --- TYPE DEFINITIONS ---

interface CourseItem {
   id: number;
   name: string;
   type?: string;
   code?: string;
   description?: string;
   lecturers?: string;
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

   // Default buka semester pertama (index 0)
   const [openIndex, setOpenIndex] = useState<number | null>(0);

   const toggleAccordion = (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
   };

   // HELPER: Mengubah teks enter menjadi array list
   const getLecturersList = (raw?: string): string[] => {
      if (!raw) return [];
      return raw.split("\n").filter((item) => item.trim() !== "");
   };

   if (!semesters.length) return null;

   return (
      <section className="container mx-auto px-4 md:px-8 lg:px-12 py-16 md:py-24 bg-gray-50/50">

         {/* HEADER */}
         {title && (
            <div className="max-w-4xl mb-12">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-4">
                  {title}
               </h2>
            </div>
         )}

         {/* LIST SEMESTER */}
         <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {semesters.map((semester, index) => {
               const isOpen = openIndex === index;

               return (
                  <div
                     key={semester.id || index}
                     className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                     {/* TOMBOL ACCORDION */}
                     <button
                        onClick={() => toggleAccordion(index)}
                        aria-expanded={isOpen}
                        className={cn(
                           "w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors duration-300",
                           // Menggunakan warna custom hijau tua untuk state aktif agar tetap elegan
                           isOpen ? "bg-[#005320]/5 text-[#005320]" : "bg-white text-gray-800 hover:bg-gray-50"
                        )}
                     >
                        <span className="text-lg md:text-xl font-bold flex items-center gap-3">
                           <span className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border",
                              isOpen ? "bg-[#005320] text-white border-[#005320]" : "bg-white text-gray-500 border-gray-300"
                           )}>
                              {index + 1}
                           </span>
                           {semester.title}
                        </span>

                        <ChevronDown
                           className={cn("transition-transform duration-300", isOpen && "rotate-180")}
                           size={20}
                        />
                     </button>

                     {/* ISI KONTEN (Collapsible) */}
                     <div
                        className={cn(
                           "transition-all duration-500 ease-in-out overflow-hidden",
                           isOpen ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                        )}
                     >
                        <div className="p-5 md:p-8 flex flex-col gap-8 border-t border-gray-100">

                           {semester.courses.length > 0 ? (
                              semester.courses.map((course, cIndex) => {
                                 const dosenList = getLecturersList(course.lecturers);

                                 return (
                                    <div
                                       key={course.id || cIndex}
                                       className="flex flex-col md:flex-row gap-6 pb-8 border-b border-gray-200 last:border-0 last:pb-0"
                                    >
                                       {/* KIRI: JUDUL & KODE */}
                                       <div className="md:w-1/4 shrink-0">
                                          <h4 className="text-lg font-bold text-gray-900 leading-tight">
                                             {course.name}
                                          </h4>
                                          <div className="flex flex-wrap gap-2 mt-3">
                                             {course.code && (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-mono px-2 py-1 rounded border border-gray-200">
                                                   <BookOpen size={12} />
                                                   {course.code}
                                                </span>
                                             )}
                                             {course.type && (
                                                <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-100 uppercase tracking-wide">
                                                   {course.type}
                                                </span>
                                             )}
                                          </div>
                                       </div>

                                       {/* KANAN: DETAIL */}
                                       <div className="md:w-3/4 space-y-5">
                                          {course.description && (
                                             <p className="text-gray-600 text-sm leading-relaxed">
                                                {course.description}
                                             </p>
                                          )}

                                          <div className="flex flex-col md:flex-row justify-between gap-6 pt-4 border-t border-dashed border-gray-200">

                                             {/* DAFTAR DOSEN */}
                                             <div className="flex-1">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                                                   <Users size={16} className="text-[#005320]" />
                                                   <span>Dosen Pengampu:</span>
                                                </div>

                                                {dosenList.length > 0 ? (
                                                   <ul className="list-disc list-outside pl-5 text-sm text-gray-600 space-y-1 marker:text-[#005320]">
                                                      {dosenList.map((dosen, i) => (
                                                         <li key={i}>{dosen}</li>
                                                      ))}
                                                   </ul>
                                                ) : (
                                                   <span className="text-gray-400 italic text-sm">- Data dosen belum tersedia -</span>
                                                )}
                                             </div>

                                             {/* TOMBOL AKSI */}
                                             <div className="flex flex-row md:flex-col gap-3 items-start md:items-end justify-start min-w-[180px]">

                                                {/* TOMBOL RPS (Download) */}
                                                {course.rps_link && (
                                                   <a
                                                      href={course.rps_link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="group flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-blue-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-md transition-all duration-300"
                                                   >
                                                      <Download size={14} className="group-hover:animate-bounce" />
                                                      Unduh RPS
                                                   </a>
                                                )}

                                                {/* TOMBOL PORTOFOLIO (External Link) */}
                                                {course.portfolio_link && (
                                                   <a
                                                      href={course.portfolio_link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="group flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-orange-50 text-orange-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-orange-100 hover:bg-orange-600 hover:text-white hover:border-orange-600 hover:shadow-md transition-all duration-300"
                                                   >
                                                      <ExternalLink size={14} />
                                                      Portofolio
                                                   </a>
                                                )}
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })
                           ) : (
                              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                 <p className="text-gray-400 italic text-sm">Belum ada mata kuliah yang terdaftar di semester ini.</p>
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