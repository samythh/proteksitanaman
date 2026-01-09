// File: src/components/ui/ScrollReveal.tsx
"use client";

// PERBAIKAN 1: Import tipe 'Variants' dari framer-motion
import { motion, useInView, useAnimation, Variants } from "framer-motion";
import { useRef, useEffect } from "react";

interface ScrollRevealProps {
   children: React.ReactNode;
   width?: "fit-content" | "100%";
   delay?: number;
   direction?: "up" | "down" | "left" | "right";
}

export default function ScrollReveal({
   children,
   width = "fit-content",
   delay = 0,
   direction = "up"
}: ScrollRevealProps) {
   const ref = useRef(null);

   const isInView = useInView(ref, { once: true, margin: "-50px" });
   const controls = useAnimation();

   useEffect(() => {
      if (isInView) {
         controls.start("visible");
      }
   }, [isInView, controls]);

   // PERBAIKAN 2: Definisikan tipe variants sebagai 'Variants' agar TypeScript paham
   const variants: Variants = {
      hidden: {
         opacity: 0,
         y: direction === "up" ? 50 : direction === "down" ? -50 : 0,
         x: direction === "left" ? 50 : direction === "right" ? -50 : 0,
      },
      visible: {
         opacity: 1,
         y: 0,
         x: 0,
         transition: {
            duration: 0.8,
            // PERBAIKAN 3: Ganti array angka dengan string "easeOut" 
            // atau gunakan "easeInOut" agar tipe datanya valid dan animasi tetap halus.
            ease: "easeOut",
            delay: delay
         }
      },
   };

   return (
      <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
         <motion.div
            variants={variants}
            initial="hidden"
            animate={controls}
         >
            {children}
         </motion.div>
      </div>
   );
}