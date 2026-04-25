/**
 * NANOfusion — Galerie realizací + Hero média z Supabase
 * TASK 3A: Náhrada hardcoded galleryShowcaseData čtením z DB (gallery_items)
 *           + načtení aktivního hero media (hero_media)
 */

import { supabase } from './supabase-config.js';

// ============================================================
// HERO MEDIA — načti aktivní hero médium z DB
// ============================================================
export const loadHeroMedia = async () => {
  try {
    const { data, error } = await supabase
      .from('hero_media')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      console.warn('NANOfusion: Žádné aktivní hero médium v DB');
      return;
    }

    // Hero sekce = první <section> na stránce (dle DOM auditu)
    const heroSection = document.querySelector('section:first-of-type')
      || document.querySelector('.hero, #hero, [data-hero]');
    if (!heroSection) {
      console.warn('NANOfusion: Hero sekce nenalezena');
      return;
    }

    const isYoutube = data.url.includes('youtube.com') || data.url.includes('youtu.be');
    
    if (isYoutube) {
      let videoId = '';
      if (data.url.includes('youtu.be/')) videoId = data.url.split('youtu.be/')[1].split('?')[0];
      else if (data.url.includes('v=')) videoId = data.url.split('v=')[1].split('&')[0];
      
      const existingMedia = heroSection.querySelector('video, iframe');
      if (existingMedia) existingMedia.parentElement.remove();
      
      const videoWrap = document.createElement('div');
      videoWrap.style.cssText = 'position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none;';
      const iframe = document.createElement('iframe');
      // iframe must be larger than container to hide youtube black bars and UI
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=${videoId}&modestbranding=1`;
      iframe.style.cssText = 'width:100vw;height:56.25vw;min-height:100vh;min-width:177.77vh;position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);';
      iframe.frameBorder = '0';
      iframe.allow = 'autoplay; fullscreen; encrypted-media';
      videoWrap.appendChild(iframe);
      heroSection.style.position = 'relative';
      heroSection.prepend(videoWrap);
      console.log('NANOfusion: Hero YouTube video načteno z DB:', videoId);
      
    } else if (data.type === 'video') {
      // Video je uvnitř div.absolute.inset-0 > video
      const existingVideo = heroSection.querySelector('video');
      if (existingVideo) {
        // Nahraď src existujícího videa — neměň strukturu
        existingVideo.src = data.url;
        existingVideo.load();
        existingVideo.play().catch(() => {}); // autoplay může být blokován
        console.log('NANOfusion: Hero video nahrazeno z DB:', data.url);
      } else {
        // Video neexistuje — vytvoř nový element
        const videoWrap = document.createElement('div');
        videoWrap.style.cssText = 'position:absolute;inset:0;z-index:0;overflow:hidden;';
        const video = document.createElement('video');
        video.src = data.url;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        videoWrap.appendChild(video);
        heroSection.style.position = 'relative';
        heroSection.prepend(videoWrap);
        console.log('NANOfusion: Hero video vytvořeno z DB:', data.url);
      }
    } else if (data.type === 'image') {
      const existingMedia = heroSection.querySelector('video, iframe');
      if (existingMedia) {
        // Skryj video a nahraď obrázkem
        const wrap = existingMedia.parentElement;
        existingMedia.remove();
        const img = document.createElement('img');
        img.src = data.url;
        img.alt = 'NANOfusion hero';
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;position:absolute;inset:0;';
        wrap?.appendChild(img);
      } else {
        heroSection.style.backgroundImage = `url('${data.url}')`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
      }
      console.log('NANOfusion: Hero obrázek načten z DB:', data.url);
    }
  } catch (e) {
    console.warn('Hero media load failed:', e);
  }
};


// ============================================================
// GALERIE — načti položky z gallery_items tabulky
// ============================================================
export const loadGalleryFromDB = async () => {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('NANOfusion: Žádné gallery_items v DB nebo chyba RLS');
      return false;
    }

    console.log(`NANOfusion: Načteno ${data.length} položek galerie z DB`);

    // Aktualizuj existující gallery scroller vytvořený v main.js
    const scroller = document.getElementById('gallery-scroller-inner');
    if (!scroller) return false;

    scroller.innerHTML = data.map(item => {
      if (item.type === 'youtube') {
        return `
          <div class="gallery-item-v" style="flex:0 0 450px;background:#0f172a;border-radius:2rem;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.1);cursor:pointer;transition:transform 0.3s ease;">
            <div style="height:250px;position:relative;">
              <iframe
                src="https://www.youtube.com/embed/${item.youtube_id}"
                title="${item.caption || 'Video'}"
                frameborder="0"
                allowfullscreen
                loading="lazy"
                style="width:100%;height:100%;border:0;"
              ></iframe>
            </div>
            <div style="padding:2rem;">
              <div style="color:#f59e0b;font-weight:800;font-size:0.75rem;letter-spacing:0.1em;margin-bottom:0.5rem;">VIDEO</div>
              ${item.caption ? `<h3 style="color:white;font-weight:800;font-size:1.1rem;">${item.caption}</h3>` : ''}
            </div>
          </div>`;
      } else {
        return `
          <div class="gallery-item-v" style="flex:0 0 450px;background:#0f172a;border-radius:2rem;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.1);cursor:pointer;transition:transform 0.3s ease;">
            <div style="height:250px;position:relative;">
              <img src="${item.url}" alt="${item.caption || 'Galerie'}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">
            </div>
            <div style="padding:2rem;">
              ${item.caption ? `<h3 style="color:white;font-weight:800;font-size:1.1rem;">${item.caption}</h3>` : ''}
            </div>
          </div>`;
      }
    }).join('');

    return true;
  } catch (e) {
    console.warn('Gallery DB load failed:', e);
    return false;
  }
};

// Inicializace — zavolá se z main.js po injektování galerie do DOM
document.addEventListener('DOMContentLoaded', () => {
  loadHeroMedia();
  // Galerie se injektuje dynamicky — počkej chvíli
  setTimeout(() => loadGalleryFromDB(), 800);
});

// Při změně viditelnosti stránky (tab focus) se data aktualizují
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) loadGalleryFromDB();
});
