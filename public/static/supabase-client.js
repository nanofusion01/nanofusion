import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.0/+esm'

const SUPABASE_URL = 'https://mgmtkdwvhgrzefmyucvr.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_4zx8PSeFySdRwOitS1bsqA_xO0LimWR'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
window.supabase = supabase

export function normalizeMediaUrl(url) {
  if (!url) return ''
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/)
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`
  
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^\/\?\&]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  return url
}
window.normalizeMediaUrl = normalizeMediaUrl


