// File: src/components/sections/FAQSection.tsx
"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

// Tipe Data untuk 1 Item FAQ
interface FAQItemData {
   id: number;
   question: string;
   answer: string;
}

// Props yang diterima component
interface FAQSectionProps {
   data: {
      title: string;
      items: FAQItemData[];
   };
}

export default function FAQSection({ data }: FAQSectionProps) {
   // State untuk melacak item mana yang sedang terbuka
   const [openIndex, setOpenIndex] = useState<number | null>(null);

   const toggleFAQ = (index: number) => {
      setOpenIndex(openIndex === index ? null : index);
   };

   // Jika tidak ada data items, jangan render section
   if (!data || !data.items || data.items.length === 0) return null;

   return (
      <section className="bg-white py-16 md:py-24">
         <div className="container mx-auto px-6 md:px-12 lg:px-24">

            {/* HEADER FAQ */}
            <div className="text-center mb-12">
               <h2 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase tracking-wide">
                  {data.title || "FAQ"}
               </h2>
               {/* Garis hijau pemanis */}
               <div className="w-16 h-1 bg-[#749F74] mx-auto mt-3 rounded-full"></div>
            </div>

            {/* GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
               {data.items.map((item, index) => {
                  const isOpen = openIndex === index;

                  return (
                     <div
                        key={item.id || index}
                        onClick={() => toggleFAQ(index)}
                        className={`
                  cursor-pointer bg-white rounded-xl border border-gray-200 p-5 shadow-sm 
                  transition-all duration-300 hover:shadow-md
                  ${isOpen ? 'ring-1 ring-[#749F74] border-[#749F74]' : ''}
                `}
                     >
                        <div className="flex gap-4 items-start">

                           {/* ICON PANAH */}
                           <div className={`mt-0.5 text-[#749F74] transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                              <ChevronRight size={24} strokeWidth={2.5} />
                           </div>

                           {/* KONTEN */}
                           <div className="flex-1">
                              <h3 className={`text-sm md:text-base font-bold text-gray-800 leading-snug ${isOpen ? 'mb-2' : 'mb-0'}`}>
                                 {item.question}
                              </h3>

                              {/* Jawaban (Accordian Effect) */}
                              <div
                                 className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                              >
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