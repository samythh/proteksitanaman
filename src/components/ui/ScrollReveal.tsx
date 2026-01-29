// File: src/components/ui/ScrollReveal.tsx
"use client";

import { motion, useInView, useAnimation, Variants, useReducedMotion } from "framer-motion";
import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface ScrollRevealProps {
   children: React.ReactNode;
   width?: "fit-content" | "100%";
   delay?: number;
   direction?: "up" | "down" | "left" | "right";
   className?: string;
   duration?: number;
}

export default function ScrollReveal({
   children,
   width = "fit-content",
   delay = 0,
   direction = "up",
   className,
   duration = 0.5
}: ScrollRevealProps) {
   const ref = useRef<HTMLDivElement>(null);
   const isInView = useInView(ref, { once: true, margin: "-50px" });
   const controls = useAnimation();
   const shouldReduceMotion = useReducedMotion();

   useEffect(() => {
      if (isInView) {
         controls.start("visible");
      }
   }, [isInView, controls]);

   // Logic Offset untuk animasi
   const offset = shouldReduceMotion ? 0 : 50;

   const getHiddenVariant = () => {
      switch (direction) {
         case "up": return { y: offset, x: 0 };
         case "down": return { y: -offset, x: 0 };
         case "left": return { x: offset, y: 0 };
         case "right": return { x: -offset, y: 0 };
         default: return { y: offset, x: 0 };
      }
   };

   const variants: Variants = {
      hidden: {
         opacity: 0,
         ...getHiddenVariant()
      },
      visible: {
         opacity: 1,
         x: 0,
         y: 0,
         transition: {
            duration: duration,
            ease: "easeOut",
            delay: delay,
         },
      },
   };

   return (
      <div
         ref={ref}
         className={cn(
            "relative",
            width === "100%" ? "w-full" : "w-fit",
            className
         )}
      >
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