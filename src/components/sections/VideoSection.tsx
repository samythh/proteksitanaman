// File: src/components/sections/VideoSection.tsx
"use client";

import React from "react";

// --- TYPE DEFINITIONS ---

interface VideoSectionData {
   title?: string;
   youtube_url: string;
   description?: string;
   alignment?: "left" | "center" | "right";
}

interface VideoSectionProps {
   data: VideoSectionData;
}

// --- HELPER: Extract YouTube ID ---
const getYouTubeID = (url: string): string | null => {
   if (!url) return null;
   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
   const match = url.match(regExp);
   return match && match[2].length === 11 ? match[2] : null;
};

export default function VideoSection({ data }: VideoSectionProps) {
   // Extract Data
   const {
      title,
      youtube_url: url,
      description: desc,
      alignment = "center"
   } = data;

   const videoId = getYouTubeID(url);

   if (!videoId) {
      // Return null agar tidak merusak layout jika URL kosong/salah
      return null;
   }

   // --- STYLING CONFIG ---
   // Menggunakan Flexbox alignment agar lebih rapi daripada margin manual
   const styles = {
      left: {
         wrapper: "items-start text-left",
         width: "w-full",
      },
      center: {
         wrapper: "items-center text-center",
         width: "w-full md:w-3/4 lg:w-2/3", // Video di tengah lebih enak dilihat jika tidak full width
      },
      right: {
         wrapper: "items-end text-right",
         width: "w-full",
      }
   };

   const activeStyle = styles[alignment];

   return (
      <section className="container mx-auto px-4 md:px-8 py-12 md:py-16 relative z-10">
         <div className={`flex flex-col ${activeStyle.wrapper} mx-auto max-w-5xl`}>

            {/* 1. Header Section */}
            {title && (
               <div className="mb-8 w-full">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#005320] mb-3 relative inline-block">
                     {title}
                     {/* Garis Hiasan: Menggunakan Kuning agar senada dengan komponen lain */}
                     <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-yellow-400 rounded-full"></span>
                  </h2>
               </div>
            )}

            {/* 2. Video Container */}
            <div className={`relative overflow-hidden rounded-2xl shadow-xl border-4 border-white bg-black ${activeStyle.width}`}>
               {/* Aspect Ratio 16:9 */}
               <div className="aspect-video w-full relative">
                  <iframe
                     src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                     title={title || "YouTube video player"}
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                     className="absolute top-0 left-0 w-full h-full"
                     loading="lazy"
                  ></iframe>
               </div>
            </div>

            {/* 3. Description */}
            {desc && (
               <div className={`mt-6 max-w-3xl ${activeStyle.width}`}>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                     {desc}
                  </p>
               </div>
            )}

         </div>
      </section>
   );
}