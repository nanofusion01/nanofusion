import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeMediaUrl(url: string): string {
  if (!url) return ''

  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/)
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
  }

  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^\/\?\&]+)/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }

  return url
}
