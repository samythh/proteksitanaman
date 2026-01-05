// File: src/lib/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Menggabungkan class Tailwind dengan cerdas.
 * Mengatasi konflik class (misal: 'px-2' vs 'px-4').
 */
export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
}