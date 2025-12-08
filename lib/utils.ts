import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 포맷팅 유틸리티는 lib/utils/format.ts에서 export
export { formatRelativeTime, truncateText } from "./utils/format"
