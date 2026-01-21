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
   // Regex untuk menangkap ID dari berbagai format URL Youtube
   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
   const match = url.match(regExp);
   return match && match[2].length === 11 ? match[2] : null;
};

export default function VideoSection({ data }: VideoSectionProps) {
   // Extract Data
   const title = data.title;
   const url = data.youtube_url;
   const desc = data.description;
   const alignment = data.alignment || "center"; // Default Center untuk video biasanya lebih bagus

   const videoId = getYouTubeID(url);

   if (!videoId) {
      console.warn("[VideoSection] URL YouTube tidak valid atau kosong:", url);
      return null;
   }

   // --- STYLING CONFIG (Mirip ImageSection) ---
   const styles = {
      left: {
         wrapper: "text-left",
         underline: "left-0",
         mx: "mr-auto", // Margin right auto (agar elemen di kiri)
      },
      center: {
         wrapper: "text-center",
         underline: "left-1/2 -translate-x-1/2",
         mx: "mx-auto", // Margin x auto (tengah)
      },
      right: {
         wrapper: "text-right",
         underline: "right-0",
         mx: "ml-auto", // Margin left auto (agar elemen di kanan)
      }
   };

   const activeStyle = styles[alignment];

   return (
      <section className="container mx-auto px-4 py-8 md:py-12 relative z-10">
         <div className={`max-w-4xl mx-auto ${activeStyle.wrapper}`}>

            {/* 1. Header Section */}
            {title && (
               <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative inline-block">
                     {title}
                     {/* Garis Hiasan */}
                     <span className={`absolute -bottom-2 w-16 h-1 bg-red-600 rounded-full ${activeStyle.underline}`}></span>
                  </h2>
               </div>
            )}

            {/* 2. Video Container */}
            <div className={`relative w-full overflow-hidden rounded-xl shadow-lg border border-gray-200 bg-black ${activeStyle.mx}`}>
               {/* Aspect Ratio 16:9 menggunakan Tailwind 'aspect-video' */}
               <div className="aspect-video w-full relative">
                  <iframe
                     src={`https://www.youtube.com/embed/${videoId}`}
                     title={title || "YouTube video player"}
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                     className="absolute top-0 left-0 w-full h-full"
                     loading="lazy" // Performance optimization
                  ></iframe>
               </div>
            </div>

            {/* 3. Description */}
            {desc && (
               <p className={`text-gray-600 mt-4 text-sm md:text-base max-w-2xl leading-relaxed ${activeStyle.mx}`}>
                  {desc}
               </p>
            )}

         </div>
      </section>
   );
}