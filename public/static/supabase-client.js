// Supabase Client for Public Static Site
let supabase = null;

try {
  // Try to load from CDN
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.42.0/+esm');
  
  const SUPABASE_URL = 'https://mgmtkdwvhgrzefmyucvr.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_4zx8PSeFySdRwOitS1bsqA_xO0LimWR';

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  window.supabase = supabase;
} catch (e) {
  console.error("Supabase load failed, using mock client", e);
  // Mock client to prevent crashes
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({ single: () => Promise.resolve({ data: null, error: null }), order: () => Promise.resolve({ data: [], error: null }) }),
        order: () => Promise.resolve({ data: [], error: null })
      })
    })
  };
}

export { supabase };

export function normalizeMediaUrl(url) {
  if (!url) return '';
  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/);
  if (driveMatch) return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  
  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^\/\?\&]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  return url;
}
window.normalizeMediaUrl = normalizeMediaUrl;
