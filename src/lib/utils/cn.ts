// File: src/lib/utils/cn.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind CSS classes conditionally and without conflicts.
 * Combines the flexibility of `clsx` with the conflict resolution of `tailwind-merge`.
 * * @param inputs - List of classes, objects, arrays, or conditions.
 * @returns A clean, merged string of class names.
 * * @example
 * // Basic usage
 * cn("px-2 py-1", "bg-red-500"); 
 * // -> "px-2 py-1 bg-red-500"
 * * @example
 * // Conditional & Conflict Resolution (Last winner rules)
 * cn("p-4 bg-red-500", isActive && "bg-blue-500", "p-2");
 * // -> "bg-blue-500 p-2" (p-4 removed because p-2 overrides it)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}