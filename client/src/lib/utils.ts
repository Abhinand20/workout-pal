import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A drop-in `className` utility:
 * - uses clsx to join/condition any ClassValue
 * - then runs tailwind-merge to dedupe/resolve conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
