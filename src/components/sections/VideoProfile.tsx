// File: src/components/sections/VideoProfile.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Play, Pause, X } from "lucide-react";

// --- TIPE DATA ---
export interface VideoSlide {
   id: number;
   header: string;
   description: string;
   videoTitle: string;
   videoUrl: string;
   youtubeId?: string;
}

interface VideoProfileProps {
   data: VideoSlide[];
}

export default function VideoProfile({ data = [] }: VideoProfileProps) {
   // 1. HOOKS
   const [current, setCurrent] = useState(0);
   const [isPlaying, setIsPlaying] = useState(true);
   const [progress, setProgress] = useState(0);
   const [showModal, setShowModal] = useState(false);
   const [mounted, setMounted] = useState(false);

   const videoRef = useRef<HTMLVideoElement>(null);

   // Hook 1: Handle Hydration (Mounted)
   useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMounted(true);
   }, []);

   // Hook 2: Callbacks
   const nextSlide = useCallback(() => {
      if (!data || data.length === 0) return;
      setCurrent((prev) => (prev === data.length - 1 ? 0 : prev + 1));
      setProgress(0);
      setShowModal(false);
   }, [data]);

   // Hook 3: Autoplay Logic
   useEffect(() => {
      if (!data || data.length === 0) return;

      if (videoRef.current) {
         videoRef.current.load();
         videoRef.current
            .play()
            .then(() => setIsPlaying(true))
            .catch((e) => {
               console.log("Autoplay blocked (Browser Policy):", e);
               setIsPlaying(false);
            });
      }
   }, [current, data]);

   // 2. HELPERS & HANDLERS
   const truncateText = (text: string, maxLength: number) => {
      if (!text) return "";
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
   };

   const goToSlide = (index: number) => {
      setCurrent(index);
      setProgress(0);
      setIsPlaying(true);
      setShowModal(false);
   };

   const handleTimeUpdate = () => {
      if (videoRef.current) {
         const currentVal = videoRef.current.currentTime;
         const durationVal = videoRef.current.duration;
         const percent = durationVal > 0 ? (currentVal / durationVal) * 100 : 0;
         setProgress(percent);
      }
   };

   const togglePlay = () => {
      if (videoRef.current) {
         if (isPlaying) videoRef.current.pause();
         else videoRef.current.play();
      }
   };

   const onPlayHandler = () => setIsPlaying(true);
   const onPauseHandler = () => setIsPlaying(false);

   const closeModal = () => {
      setShowModal(false);
      videoRef.current?.play();
      setIsPlaying(true);
   };

   // 3. EARLY RETURN
   if (!data || data.length === 0) return null;

   // 4. DERIVED DATA
   const activeSlide = data[current];

   const openFullVideo = () => {
      if (activeSlide.youtubeId) {
         videoRef.current?.pause();
         setIsPlaying(false);
         setShowModal(true);
      } else {
         alert("Video lengkap belum tersedia.");
      }
   };

   // 5. RENDER
   return (
      <section className="relative w-full h-[500px] md:h-[600px] bg-black overflow-hidden group">

         {/* BACKGROUND VIDEO */}
         <div className="absolute inset-0 overflow-hidden">
            <video
               key={activeSlide.id}
               ref={videoRef}
               className="w-full h-full object-cover transition-transform duration-[2000ms] scale-105"
               onTimeUpdate={handleTimeUpdate}
               onEnded={nextSlide}
               onPlay={onPlayHandler}
               onPause={onPauseHandler}
               muted
               playsInline
            >
               <source src={activeSlide.videoUrl} type="video/mp4" />
            </video>
         </div>

         {/* OVERLAY */}
         <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none z-0" />

         {/* KONTEN TEKS */}
         <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 z-10 pb-40">
            <div
               key={activeSlide.id}
               className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
               <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-2xl">
                  {activeSlide.header}
               </h1>

               <p className="text-gray-200 text-base md:text-lg leading-relaxed drop-shadow-lg">
                  {truncateText(activeSlide.description, 150)}
               </p>

               <div>
                  <button
                     onClick={openFullVideo}
                     className="
                px-8 py-3 
                bg-transparent 
                hover:bg-white/20 
                border-2 border-white 
                text-white 
                rounded-full 
                font-bold 
                transition-all 
                backdrop-blur-sm
                flex items-center gap-3 
                group/btn w-fit 
                hover:scale-105 active:scale-95
              "
                  >
                     <span>
                        {activeSlide.youtubeId ? "Tonton Video Lengkap" : "Selengkapnya"}
                     </span>
                     {activeSlide.youtubeId ? (
                        <Play size={18} fill="currentColor" />
                     ) : (
                        <ChevronRight className="w-5 h-5" />
                     )}
                  </button>
               </div>
            </div>
         </div>

         {/* PLAYLIST BAR */}
         <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-20 pb-12">
            <div className="container mx-auto px-8 md:px-16 lg:px-24">
               <div className="grid grid-cols-2 md:grid-cols-2 gap-6 md:gap-12">
                  {data.map((item, index) => {
                     const isActive = index === current;
                     return (
                        <div
                           key={item.id}
                           onClick={() => goToSlide(index)}
                           className={`cursor-pointer group/item transition-all duration-300 ${isActive ? "opacity-100" : "opacity-60 hover:opacity-90"}`}
                        >
                           <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm md:text-base font-bold tracking-wide drop-shadow-md ${isActive ? "text-white" : "text-gray-300"}`}>
                                 {item.videoTitle}
                              </span>
                              {isActive && (
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       togglePlay();
                                    }}
                                    className="text-white hover:text-green-400 bg-white/10 rounded-full p-1.5 transition-colors"
                                 >
                                    {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                 </button>
                              )}
                           </div>

                           {/* Progress Bar */}
                           <div className="relative h-[3px] w-full bg-gray-600/50 rounded-full overflow-hidden backdrop-blur-sm">
                              <div className="absolute inset-0 bg-white/10"></div>
                              {isActive && (
                                 <div
                                    className="absolute left-0 top-0 h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
                                    style={{ width: `${progress}%` }}
                                 ></div>
                              )}
                           </div>

                           <div className="mt-1.5 text-[10px] text-gray-400 font-mono text-left drop-shadow-sm uppercase tracking-wider">
                              {isActive ? (
                                 <span className="text-green-400 animate-pulse flex items-center gap-1">
                                    ● Now Playing
                                 </span>
                              ) : (
                                 <span>Click to play</span>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* MODAL YOUTUBE (Using Portal) */}
         {showModal && activeSlide.youtubeId && mounted && createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">

               {/* Close Button */}
               <button
                  onClick={closeModal}
                  className="absolute top-6 right-6 z-[100000] p-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white rounded-full transition-colors cursor-pointer"
               >
                  <X size={32} />
               </button>

               <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                  <iframe
                     src={`https://www.youtube.com/embed/${activeSlide.youtubeId}?autoplay=1&rel=0`}
                     title={activeSlide.header}
                     className="w-full h-full"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                     allowFullScreen
                  ></iframe>
               </div>

               {/* Backdrop Click to Close */}
               <div className="absolute inset-0 -z-10" onClick={closeModal}></div>
            </div>,
            document.body
         )}
      </section>
   );
}