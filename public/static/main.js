import { initSupabase, normalizeMediaUrl } from './supabase-client.js'
// Deployment trigger: 2026-04-21T15:57:20

console.log('NANOfusion: main.js init...');

let supabase = null;

const clearPreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => { if(preloader.parentNode) preloader.remove(); }, 500);
    }
    document.body.style.opacity = '1';
    document.body.style.overflow = 'auto';
    console.log('Preloader cleared');
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

const observeAll = () => {
  document.querySelectorAll('.section-reveal:not(.observed)').forEach(el => {
    revealObserver.observe(el);
    el.classList.add('observed');
  });

  const heroHeading = document.querySelector('h1.font-heading');
  if (heroHeading && (heroHeading.textContent.includes('co jste vybudovali') || heroHeading.textContent.includes('Čistíme')) && !heroHeading.dataset.updated) {
    heroHeading.innerHTML = 'Špičková péče o to,<br><span style="color: #f59e0b">co jste usilovně vybudovali</span>';
    heroHeading.style.fontSize = 'min(8vw, 68px)';
    heroHeading.style.lineHeight = '1.05';
    heroHeading.style.fontWeight = '900';
    heroHeading.style.letterSpacing = '-0.04em';
    heroHeading.style.textTransform = 'none';

    const parentContainer = heroHeading.closest('.max-w-2xl') || heroHeading.parentElement;
    if (parentContainer) {
      parentContainer.style.maxWidth = '1000px';
      parentContainer.classList.remove('max-w-2xl');
      parentContainer.classList.add('max-w-5xl');
    }
    heroHeading.dataset.updated = 'true';
    if (supabase) syncHeroWithCMS(heroHeading);
  }

  // Header/Footer cleanup
  const headerLogos = document.querySelectorAll('header img:not(.chat-logo), nav img:not(.chat-logo)');
  headerLogos.forEach(img => {
    if ((img.src.includes('logo.jpg') || img.src.includes('logo-nav.jpg')) && !img.closest('#ai-chat-launcher')) {
      img.src = '/static/nanofusion-long.png';
      img.style.height = '85px';
      img.style.width = 'auto';
      img.style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))';
    }
  });

  const navLinks = Array.from(document.querySelectorAll('header nav a, header div a'));
  const referenceLink = navLinks.find(a => a.textContent.trim() === 'Reference');

  if (referenceLink) {
    const isRoot = window.location.pathname === '/' || window.location.pathname === '/index.html';
    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#')) {
        if (!isRoot) a.href = '/' + href;
      }
    });

    if (!document.querySelector('a[href="#galerie"]')) {
      const galleryLink = referenceLink.cloneNode(true);
      galleryLink.textContent = 'Galerie';
      galleryLink.href = '#galerie';
      referenceLink.parentNode.insertBefore(galleryLink, referenceLink.nextSibling);
    }
    if (!document.querySelector('a[href="#blog"]')) {
      const blogLink = referenceLink.cloneNode(true);
      blogLink.textContent = 'Blog';
      blogLink.href = '#blog';
      referenceLink.parentNode.insertBefore(blogLink, referenceLink.nextSibling);
    }
  }

  const footerTexts = document.querySelectorAll('footer p.text-xs.text-neutral-500');
  footerTexts.forEach(p => {
    if (p.textContent.includes('IČ:')) {
      p.innerHTML = `© 2026 NANOfusion s.r.o. | IČ: 29375363 | 
        <a href="https://eshop.nanofusion.cz" target="_blank" style="color: inherit; text-decoration: none; margin-left: 10px; border-bottom: 1px solid #444;">E-shop</a> | 
        <a href="/admin" style="color: #f59e0b; font-weight: 700; text-decoration: none; margin-left: 5px;">Zaměstnanci</a>`;
    }
  });
};

const syncHeroWithCMS = async (headingEl) => {
    if (!supabase) return;
    try {
        const { data: config } = await supabase.from('site_config').select('*').eq('key', 'hero_title').single();
        if (config?.value && headingEl) {
            headingEl.innerHTML = config.value;
        }

        const { data: activeMedia } = await supabase.from('hero_media').select('*').eq('is_active', true).single();
        if (!activeMedia) return;

        const normalizedUrl = normalizeMediaUrl(activeMedia.url);
        const heroSection = headingEl.closest('section');
        if (!heroSection) return;

        let mediaOverlay = heroSection.querySelector('.cms-hero-media');
        if (!mediaOverlay) {
            mediaOverlay = document.createElement('div');
            mediaOverlay.className = 'cms-hero-media';
            mediaOverlay.style.cssText = 'position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden;';
            heroSection.style.position = 'relative';
            heroSection.insertBefore(mediaOverlay, heroSection.firstChild);
        }

        if (activeMedia.type === 'image') {
            mediaOverlay.innerHTML = `<div style="width:100%; height:100%; background-image:url('${normalizedUrl}'); background-size:cover; background-position:center; opacity:0.6;"></div>`;
        } else {
            mediaOverlay.innerHTML = `
                <iframe 
                    src="${normalizedUrl}&autoplay=1&mute=1&controls=0&loop=1&playlist=${normalizedUrl.split('/').pop()}" 
                    style="width:100%; height:100%; border:none; opacity:0.4; pointer-events:none; transform:scale(1.3);" 
                    allow="autoplay; encrypted-media">
                </iframe>
            `;
        }
    } catch (e) { console.warn('Hero Sync Error:', e); }
};

window.nnf_openGallery = (id) => {
    const galleryItems = window._nnf_galleryData || [];
    const item = galleryItems.find(g => g.id === id);
    if (!item) return;

    let overlay = document.getElementById('gallery-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'gallery-modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <button class="close-modal-btn" onclick="document.getElementById('gallery-modal-overlay').style.display='none'">&times;</button>
            <div style="height: 400px; position: relative;">
                <img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">
                ${item.hasVideo ? `<div style="position:absolute; inset:0; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center;">
                    <div style="width:80px; height:80px; background:#f59e0b; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                </div>` : ''}
            </div>
            <div style="padding: 2.5rem;">
                <div style="color:#f59e0b; font-weight:800; text-transform:uppercase; font-size:14px; margin-bottom:12px;">Realizace • ${item.category}</div>
                <h2 style="font-size:2rem; font-weight:800; color:#0f172a; margin-bottom:1.5rem;">${item.title}</h2>
                <p style="color:#475569; line-height:1.6; margin-bottom:2rem;">${item.description}</p>
                <div style="background:#f8fafc; padding:1.5rem; border-radius:1.5rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
                    <div>
                        <div style="font-weight:800; color:#0f172a;">Zaujal vás tento výsledek?</div>
                        <div style="color:#64748b; font-size:14px;">Zeptejte se nás na cenu či detaily.</div>
                    </div>
                    <button onclick="document.getElementById('gallery-modal-overlay').style.display='none'; setTimeout(() => document.getElementById('ai-chat-launcher').click(), 200)" 
                        style="background:#f59e0b; color:white; border:none; padding:1rem 2rem; border-radius:1rem; font-weight:800; cursor:pointer;">
                        CHCI TAKÉ TAKOVÉ VÝSLEDKY
                    </button>
                </div>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
};

const initGallery = async () => {
    if (!supabase) return;
    try {
        const { data: galleryItems } = await supabase.from('gallery_items').select('*').eq('is_published', true).order('order_index', { ascending: true });
        const galleryData = (galleryItems || []).map(g => ({
            id: g.id, title: g.title, category: g.category || 'Realizace', description: g.description || '', image: normalizeMediaUrl(g.image_url), hasVideo: !!g.video_url
        }));
        window._nnf_galleryData = galleryData;

        let gallerySection = document.getElementById('galerie');
        const referenceSection = document.getElementById('reference');
        if (!gallerySection && referenceSection) {
            gallerySection = document.createElement('section');
            gallerySection.id = 'galerie';
            gallerySection.className = 'pt-24 pb-32 bg-white relative';
            referenceSection.parentNode.insertBefore(gallerySection, referenceSection.nextSibling);

            gallerySection.innerHTML = `
                <div class="container mx-auto px-4 mb-16 text-center">
                    <div style="color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.875rem; margin-bottom: 1rem;">GALERIE REALIZACÍ</div>
                    <h2 class="text-4xl font-bold text-slate-900 mb-6">Špičková péče v detailech</h2>
                    <div class="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
                </div>
                <div class="relative max-w-[1550px] mx-auto px-20">
                    <div id="gallery-scroller-inner" style="display: flex; gap: 1.5rem; overflow-x: auto; scrollbar-width: none; padding-bottom: 2rem;">
                        ${galleryData.map(item => `
                            <div onclick="window.nnf_openGallery('${item.id}')" style="flex: 0 0 400px; background: #0f172a; border-radius: 2rem; overflow: hidden; cursor: pointer;">
                                <div style="height: 220px;"><img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;"></div>
                                <div style="padding: 1.5rem;">
                                    <div style="color: #f59e0b; font-weight: 800; font-size: 0.75rem;">${item.category}</div>
                                    <h3 style="color: white; font-weight: 800; font-size: 1.125rem;">${item.title}</h3>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    } catch(e) {}
};

const initApp = async () => {
    clearPreloader();
    try {
        supabase = await initSupabase();
        observeAll();
        initGallery();
    } catch (e) { console.error("Init Error", e); }
};

const domObserver = new MutationObserver(() => observeAll());
domObserver.observe(document.body, { childList: true, subtree: true });

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
setTimeout(clearPreloader, 3000);
