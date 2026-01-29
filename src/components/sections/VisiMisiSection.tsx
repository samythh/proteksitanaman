// File: src/components/sections/VisiMisiSection.tsx
"use client";

import React, { useState, useEffect } from "react";
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

// --- SUB-COMPONENT: CUSTOM LIST ITEM ---
const CustomListItem = ({ children, icon: Icon }: { children: React.ReactNode; icon: React.ElementType }) => (
   <li className="flex items-start gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="shrink-0 w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center border border-[#749F74]/30 mt-0.5 group-hover:bg-[#749F74] group-hover:text-white transition-colors duration-300 shadow-sm">
         <Icon size={14} />
      </div>
      <span className="text-gray-700 leading-relaxed font-medium pt-1">
         {children}
      </span>
   </li>
);

export default function VisiMisiSection({ data }: VisiMisiSectionProps) {
   const [activeIndex, setActiveIndex] = useState(0);
   const [isAnimating, setIsAnimating] = useState(false);
   const [mounted, setMounted] = useState(false);

   // Hook: Handle Hydration
   useEffect(() => {
      // Disable rule ini karena double-render diperlukan untuk Hydration check
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
   }, []);

   const handleTabChange = (index: number) => {
      if (index === activeIndex) return;

      // Trigger Fade Out
      setIsAnimating(true);

      // Wait & Switch Data
      setTimeout(() => {
         setActiveIndex(index);
         // Trigger Fade In
         setIsAnimating(false);
      }, 300); // 300ms sesuai durasi transition-opacity
   };

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

            {/* TAB NAVIGATION */}
            <div className="flex justify-center mb-16">
               <div className="bg-black/10 backdrop-blur-sm p-1.5 rounded-full inline-flex relative shadow-inner">
                  {data.programs.map((prog, idx) => {
                     const isActive = idx === activeIndex;
                     return (
                        <button
                           key={prog.id}
                           onClick={() => handleTabChange(idx)}
                           className={`
                    relative z-10 flex items-center gap-2 px-6 md:px-8 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300
                    ${isActive
                                 ? "bg-white text-[#005320] shadow-md scale-100"
                                 : "text-white/80 hover:text-white hover:bg-white/10 scale-95"
                              }
                  `}
                        >
                           {idx === 0 ? <GraduationCap size={18} /> : <BookOpen size={18} />}
                           <span>{prog.label}</span>
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* CONTENT AREA (Dengan Transisi Halus) */}
            <div
               className={`transition-all duration-300 ease-in-out ${isAnimating || !mounted ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
            >
               {/* 1. VISI SECTION */}
               <div className="mb-16 text-center">
                  <div className="relative max-w-4xl mx-auto group">
                     <div className="mb-4">
                        <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-md inline-block border-b-2 border-white/20 pb-1">
                           Visi
                        </h3>
                     </div>

                     <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-500">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#749F74]"></div>
                        <p className="text-xl md:text-3xl font-medium text-gray-800 leading-relaxed text-center font-serif italic relative z-10">
                           &ldquo;{currentProgram.visi}&rdquo;
                        </p>
                        {/* Dekorasi Kutipan */}
                        <div className="absolute top-4 left-4 text-9xl text-gray-100 font-serif leading-none -z-0 opacity-50">&ldquo;</div>
                        <div className="absolute bottom-[-2rem] right-4 text-9xl text-gray-100 font-serif leading-none -z-0 opacity-50">&rdquo;</div>
                     </div>
                  </div>
               </div>

               {/* 2. MISI & TUJUAN GRID */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">

                  {/* KOLOM MISI */}
                  <div className="flex flex-col h-full">
                     <h3 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full text-[#749F74] shadow-sm">
                           <CheckCircle2 size={20} />
                        </div>
                        Misi
                        <div className="h-px bg-white/30 flex-1"></div>
                     </h3>

                     <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl flex-grow border border-white/50 hover:bg-white transition-colors duration-300">
                        <BlocksRenderer
                           content={currentProgram.misi}
                           blocks={{
                              list: ({ children }) => <ul className="space-y-4">{children}</ul>,
                              "list-item": ({ children }) => (
                                 <CustomListItem icon={CheckCircle2}>{children}</CustomListItem>
                              ),
                           }}
                        />
                     </div>
                  </div>

                  {/* KOLOM TUJUAN */}
                  <div className="flex flex-col h-full">
                     <h3 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
                        <div className="bg-white p-2 rounded-full text-[#749F74] shadow-sm">
                           <Target size={20} />
                        </div>
                        Tujuan
                        <div className="h-px bg-white/30 flex-1"></div>
                     </h3>

                     <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl flex-grow border border-white/50 hover:bg-white transition-colors duration-300">
                        <BlocksRenderer
                           content={currentProgram.tujuan}
                           blocks={{
                              list: ({ children }) => <ul className="space-y-4">{children}</ul>,
                              "list-item": ({ children }) => (
                                 <CustomListItem icon={Target}>{children}</CustomListItem>
                              ),
                           }}
                        />
                     </div>
                  </div>

               </div>
            </div>

         </div>
      </section>
   );
}