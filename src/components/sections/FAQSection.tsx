// File: src/components/sections/FAQSection.tsx
"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn"; 

// Tipe Data
interface FAQItemData {
   id: number;
   question: string;
   answer: string;
}

interface FAQSectionProps {
   data: {
      title: string;
      items: FAQItemData[];
   };
}

export default function FAQSection({ data }: FAQSectionProps) {
   const [openIndex, setOpenIndex] = useState<number | null>(null);

   const toggleFAQ = (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
   };

   if (!data || !data.items || data.items.length === 0) return null;

   return (
      <section className="bg-white py-16 md:py-24">
         <div className="container mx-auto px-6 md:px-12 lg:px-24">

            {/* HEADER FAQ  */}
            <div className="text-center mb-12">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide">
                  {data.title || "FAQ"}
               </h2>
               {/* Garis hijau pemanis */}
               <div className="w-16 h-1 bg-[#749F74] mx-auto mt-3 rounded-full"></div>
            </div>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
               {data.items.map((item, index) => {
                  const isOpen = openIndex === index;

                  return (
                     <div
                        key={item.id || index}
                        onClick={() => toggleFAQ(index)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen}
                        onKeyDown={(e) => {
                           if (e.key === "Enter" || e.key === " ") toggleFAQ(index);
                        }}
                        className={cn(
                           "cursor-pointer bg-white rounded-xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md h-full select-none",
                           isOpen
                              ? "border-[#749F74] ring-1 ring-[#749F74]"
                              : "border-gray-200"
                        )}
                     >
                        <div className="flex gap-4 items-start">

                           {/* ICON PANAH  */}
                           <div className={cn(
                              "mt-0.5 text-[#749F74] transform transition-transform duration-300 flex-shrink-0",
                              isOpen && "rotate-90"
                           )}>
                              <ChevronRight size={24} strokeWidth={2.5} />
                           </div>

                           {/* KONTEN */}
                           <div className="flex-1">
                              {/* Pertanyaan */}
                              <h3 className={cn(
                                 "text-sm md:text-base font-bold text-gray-800 leading-snug transition-all",
                                 isOpen ? "mb-2" : "mb-0"
                              )}>
                                 {item.question}
                              </h3>

                              {/* Jawaban (Accordion Effect) */}
                              <div
                                 className={cn(
                                    "overflow-hidden transition-all duration-300 ease-in-out",
                                    isOpen ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
                                 )}
                              >
                                 {/*Border Top Halus, Text Gray */}
                                 <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
                                    {item.answer}
                                 </p>
                              </div>
                           </div>

                        </div>
                     </div>
                  );
               })}
            </div>

         </div>
      </section>
   );
}