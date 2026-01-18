// File: src/components/sections/VisiMisiSection.tsx
"use client";

import { useState, useEffect } from "react";
import { GraduationCap, BookOpen, CheckCircle2, Target } from "lucide-react";
import { BlocksRenderer, type BlocksContent } from "@strapi/blocks-react-renderer";

// --- TIPE DATA ---
interface ProgramData {
   id: number;
   label: string;
   visi: string;
   misi: BlocksContent;
   tujuan: BlocksContent;
}

interface VisiMisiSectionProps {
   data: {
      title: string;
      programs: ProgramData[];
   };
}

export default function VisiMisiSection({ data }: VisiMisiSectionProps) {
   const [activeIndex, setActiveIndex] = useState(0);
   const [isAnimating, setIsAnimating] = useState(false);
   const [showItems, setShowItems] = useState(false);

   const handleTabChange = (index: number) => {
      if (index === activeIndex) return;

      // 1. Fade out
      setIsAnimating(true);
      setShowItems(false);

      // 2. Switch Data
      setTimeout(() => {
         setActiveIndex(index);
         setIsAnimating(false);

         // 3. Fade in items
         setTimeout(() => {
            setShowItems(true);
         }, 100);
      }, 300);
   };

   useEffect(() => {
      const timer = setTimeout(() => {
         setShowItems(true);
      }, 100);

      return () => clearTimeout(timer);
   }, []);

   if (!data || !data.programs || data.programs.length === 0) return null;

   const currentProgram = data.programs[activeIndex];

   return (
      <section className="py-20 bg-[#749F74] relative overflow-hidden font-sans">

         {/* Pattern Background */}
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:20px_20px]"></div>

         <div className="container mx-auto px-4 md:px-12 lg:px-24 relative z-10">

            {/* HEADER SECTION */}
            <div className="text-center mb-10">
               <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-sm">
                  {data.title || "Visi, Misi & Tujuan"}
               </h2>
               <div className="h-1.5 w-20 bg-white/40 mx-auto rounded-full"></div>
            </div>

            {/* TAB DESIGN */}
            <div className="flex justify-center mb-16">
               <div className="bg-black/10 backdrop-blur-sm p-1.5 rounded-full inline-flex relative shadow-inner">
                  {data.programs.map((prog, idx) => {
                     const isActive = idx === activeIndex;
                     return (
                        <button
                           key={prog.id}
                           onClick={() => handleTabChange(idx)}
                           className={`
                    relative z-10 flex items-center gap-2 px-6 md:px-10 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300
                    ${isActive
                                 ? "bg-white text-[#005320] shadow-md scale-100"
                                 : "text-white/80 hover:text-white hover:bg-white/10 scale-95"}
                  `}
                        >
                           {idx === 0 ? <GraduationCap size={18} /> : <BookOpen size={18} />}
                           {prog.label}
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* CONTENT CONTAINER */}
            <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>

               {/* 1. VISI SECTION */}
               <div
                  className={`mb-16 text-center transform transition-all duration-700 ease-out relative
              ${showItems ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
               >
                  <div className="relative max-w-4xl mx-auto group">

                     {/* --- JUDUL VISI (Revisi) --- */}
                     <div className="mb-4">
                        <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-md inline-block">
                           Visi
                        </h3>
                        {/* Garis bawah dihapus sesuai permintaan */}
                     </div>

                     {/* KOTAK PUTIH KONTEN */}
                     <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
                        <p className="text-xl md:text-3xl font-medium text-gray-800 leading-relaxed text-center font-serif italic relative z-10">
                           &ldquo;{currentProgram.visi}&rdquo;
                        </p>
                     </div>

                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                  {/* 2. MISI COLUMN */}
                  <div>
                     <div className={`transform transition-all duration-700 delay-100 ${showItems ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                        <h3 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
                           <div className="bg-white p-1.5 rounded-full text-[#749F74]">
                              <CheckCircle2 size={20} />
                           </div>
                           Misi
                           <div className="h-px bg-white/30 flex-1"></div>
                        </h3>
                     </div>

                     <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg">
                        <div className="space-y-4">
                           <BlocksRenderer
                              content={currentProgram.misi}
                              blocks={{
                                 list: ({ children }) => <ul className="space-y-4">{children}</ul>,
                                 "list-item": ({ children }) => (
                                    <li className={`flex items-start gap-4 group`}>
                                       <div className="shrink-0 w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center border border-[#749F74]/30 mt-0.5 group-hover:bg-[#749F74] group-hover:text-white transition-colors duration-300">
                                          <span className="font-bold text-sm">✓</span>
                                       </div>
                                       <span className="text-gray-700 leading-relaxed font-medium pt-1">
                                          {children}
                                       </span>
                                    </li>
                                 )
                              }}
                           />
                           <style jsx global>{`
                    ul li {
                      opacity: 0;
                      transform: translateY(10px);
                      animation: fadeInUp 0.5s forwards;
                    }
                    ul li:nth-child(1) { animation-delay: 0.2s; }
                    ul li:nth-child(2) { animation-delay: 0.3s; }
                    ul li:nth-child(3) { animation-delay: 0.4s; }
                    ul li:nth-child(4) { animation-delay: 0.5s; }
                    ul li:nth-child(5) { animation-delay: 0.6s; }

                    @keyframes fadeInUp {
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                        </div>
                     </div>
                  </div>

                  {/* 3. TUJUAN COLUMN */}
                  <div>
                     <div className={`transform transition-all duration-700 delay-200 ${showItems ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                        <h3 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
                           <div className="bg-white p-1.5 rounded-full text-[#749F74]">
                              <Target size={20} />
                           </div>
                           Tujuan
                           <div className="h-px bg-white/30 flex-1"></div>
                        </h3>
                     </div>

                     <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg">
                        <div className="space-y-4">
                           <BlocksRenderer
                              content={currentProgram.tujuan}
                              blocks={{
                                 list: ({ children }) => <ul className="space-y-4">{children}</ul>,
                                 "list-item": ({ children }) => (
                                    <li className="flex items-start gap-4 group">
                                       <div className="shrink-0 w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center border border-[#749F74]/30 mt-0.5 group-hover:bg-[#749F74] group-hover:text-white transition-colors duration-300">
                                          <Target size={14} />
                                       </div>
                                       <span className="text-gray-700 leading-relaxed font-medium pt-1">
                                          {children}
                                       </span>
                                    </li>
                                 )
                              }}
                           />
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>
      </section>
   );
}