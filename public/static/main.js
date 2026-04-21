import { supabase, normalizeMediaUrl } from './supabase-client.js'

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
    heroHeading.innerHTML = 'Špičková péče o to,<br>co jste usilovně vybudovali';
    heroHeading.style.fontSize = 'min(7vw, 64px)';
    heroHeading.style.lineHeight = '1.1';
    heroHeading.style.fontWeight = '900';
    heroHeading.style.letterSpacing = '-0.02em';

    const parentContainer = heroHeading.closest('.max-w-2xl') || heroHeading.parentElement;
    if (parentContainer) {
      parentContainer.style.maxWidth = '1000px';
      parentContainer.classList.remove('max-w-2xl');
      parentContainer.classList.add('max-w-4xl');
    }
    heroHeading.dataset.updated = 'true';
    
    // Trigger dynamic sync
    syncHeroWithCMS(heroHeading);
  }

  const navPhone = document.querySelector('header a[href="tel:+420774509409"]');
  if (navPhone) navPhone.remove();

  const headerLogos = document.querySelectorAll('header img:not(.chat-logo):not(.ai-chat-launcher img), nav img:not(.chat-logo)');
  headerLogos.forEach(img => {
    if ((img.src.includes('logo.jpg') || img.src.includes('logo-nav.jpg')) && !img.closest('#ai-chat-launcher') && !img.closest('#ai-chat-window')) {
      img.src = '/static/nanofusion-long.png';
      img.style.height = '75px';
      img.style.width = 'auto';
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

    const currentPath = window.location.pathname;
    document.querySelectorAll('header nav a').forEach(a => {
      if (a.getAttribute('href') === currentPath || (currentPath === '/' && a.getAttribute('href') === '/')) {
        a.style.color = '#f59e0b';
      } else {
        if (a.style.color === 'rgb(245, 158, 11)' || a.style.color === '#f59e0b') {
          a.style.color = '';
        }
      }
    });
  }

  const footer = document.querySelector('footer');
  if (footer) {
    footer.style.backgroundColor = '#111111';
    footer.classList.remove('bg-neutral-900', 'bg-slate-900');
  }

  const footerLogos = document.querySelectorAll('footer img');
  footerLogos.forEach(img => {
    if (img.src.includes('logo.jpg') || img.src.includes('logo-nav.jpg') || img.src.includes('logo_dark.jpg') || img.src.includes('nanofusion-long')) {
      img.src = '/static/nanofusion-long.png';
      img.style.height = '75px';
      img.style.width = 'auto';

      const parent = img.parentElement;
      if (parent && parent.classList.contains('bg-white') && parent.classList.contains('p-2')) {
        parent.style.background = 'transparent';
        parent.style.padding = '0';
      }
    }
  });

  const footerTexts = document.querySelectorAll('footer p.text-xs.text-neutral-500');
  footerTexts.forEach(p => {
    if (p.textContent.includes('IČ:')) {
      p.innerHTML = `© 2026 NANOfusion s.r.o. | IČ: 29375363 | 
        <a href="https://eshop.nanofusion.cz" target="_blank" style="color: inherit; text-decoration: none; margin-left: 10px; border-bottom: 1px solid #444;">E-shop</a> | 
        <a href="${window.location.hostname === 'localhost' ? 'http://localhost:3000/admin' : '/admin'}" style="color: #f59e0b; font-weight: 700; text-decoration: none; margin-left: 5px;">Zaměstnanci</a>`;
    }
  });

  const footerDescTexts = document.querySelectorAll('footer p.text-sm.text-neutral-400');
  footerDescTexts.forEach(p => {
    if (!p.dataset.brUpdated && (p.textContent.includes('Od roku 2012') || p.textContent.includes('13 let'))) {
      p.innerHTML = 'Profesionální čištění, impregnace a nátěry.<br>Již 12 let pečujeme o váš majetek po celé ČR.';
      p.dataset.brUpdated = 'true';
    }
  });

  const statsLabels = document.querySelectorAll('div, p, span, h2, h3, h4');
  statsLabels.forEach(el => {
    if (el.children.length === 0) {
      if (el.textContent.includes('13 let zkušeností')) {
        el.textContent = el.textContent.replace('13 let zkušeností', '12 let zkušeností');
      }
      if (el.textContent.trim() === '13' && el.nextElementSibling && el.nextElementSibling.textContent.includes('Let zkušeností')) {
        el.textContent = '12';
      }
    }
  });
};

const syncHeroWithCMS = async (headingEl) => {
    try {
        // 1. Sync Title
        const { data: config } = await supabase.from('site_config').select('*').eq('key', 'hero_title').single();
        if (config?.value && headingEl) {
            headingEl.innerHTML = config.value;
        }

        // 2. Sync Media (Image or Video)
        const { data: activeMedia } = await supabase.from('hero_media').select('*').eq('is_active', true).single();
        if (!activeMedia) return;

        const normalizedUrl = normalizeMediaUrl(activeMedia.url);
        const heroSection = headingEl.closest('section');
        if (!heroSection) return;

        // Find or create overlay for media
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

        // Ensure visibility of text content
        const content = headingEl.closest('.container') || headingEl.parentElement;
        if (content) {
            content.style.position = 'relative';
            content.style.zIndex = '10';
        }

    } catch (e) {
        console.warn('Hero CMS Sync Error:', e);
    }
};

const initGallery = async () => {
    try {
        const { data: galleryItems } = await supabase
            .from('gallery_items')
            .select('*')
            .eq('is_published', true)
            .order('order_index', { ascending: true });

        const galleryData = (galleryItems || []).map(g => ({
            id: g.id,
            title: g.title,
            category: g.category || 'Realizace',
            description: g.description || '',
            image: normalizeMediaUrl(g.image_url),
            hasVideo: g.video_url ? true : false
        }));

        window.nnf_openGallery = (id) => {
            const item = galleryData.find(g => g.id === id);
            if (!item) return;

            let overlay = document.getElementById('gallery-modal-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'gallery-modal-overlay';
                overlay.style.cssText = 'position:fixed; inset:0; background:rgba(15,23,42,0.9); backdrop-filter:blur(10px); z-index:999999; display:none; align-items:center; justify-content:center; padding:20px;';
                document.body.appendChild(overlay);
            }

            overlay.innerHTML = `
                <div style="background:white; width:100%; max-width:900px; max-height:90vh; border-radius:32px; overflow:hidden; display:flex; flex-direction:column; position:relative; box-shadow:0 30px 60px rgba(0,0,0,0.5);">
                    <button onclick="document.getElementById('gallery-modal-overlay').style.display='none'" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.9); border:none; width:44px; height:44px; border-radius:50%; cursor:pointer; font-size:24px; z-index:100; font-weight:bold; box-shadow:0 4px 10px rgba(0,0,0,0.1);">&times;</button>
                    <div style="flex: 1; overflow-y:auto;">
                        <div style="height:400px; position:relative;">
                            <img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">
                            ${item.hasVideo ? `<div style="position:absolute; inset:0; background:rgba(0,0,0,0.2); display:flex; align-items:center; justify-content:center;">
                                <div style="width:80px; height:80px; background:#f59e0b; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>` : ''}
                        </div>
                        <div style="padding:40px; background:white;">
                            <div style="color:#f59e0b; font-weight:800; text-transform:uppercase; font-size:14px; margin-bottom:12px; letter-spacing:0.15em;">Realizace • ${item.category}</div>
                            <h2 style="font-size:36px; font-weight:900; color:#0f172a; line-height:1.1; margin-bottom:24px; letter-spacing:-0.03em;">${item.title}</h2>
                            <p style="font-size:18px; line-height:1.8; color:#475569; margin-bottom:30px; font-weight:500;">${item.description}</p>
                            <div style="background:#f8fafc; padding:24px; border-radius:24px; border:1px solid #e2e8f0; display:flex; align-items:center; justify-content:space-between; gap:20px;">
                                <div>
                                    <div style="font-weight:800; color:#0f172a; font-size:18px;">Zaujal vás tento výsledek?</div>
                                    <div style="color:#64748b; font-size:14px;">Zeptejte se Nanobota na cenu či detaily.</div>
                                </div>
                                <button onclick="document.getElementById('gallery-modal-overlay').style.display='none'; setTimeout(() => document.getElementById('ai-chat-launcher').click(), 200)" 
                                    style="background:#f59e0b; color:white; border:none; padding:16px 32px; border-radius:16px; font-weight:800; cursor:pointer; transition:all 0.3s ease; white-space:nowrap; box-shadow:0 10px 20px rgba(245, 158, 11, 0.2);">
                                    CHCI TAKÉ TAKOVÉ VÝSLEDKY
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            overlay.style.display = 'flex';
        };

        const injectGallery = () => {
            let gallerySection = document.getElementById('galerie');
            const referenceSection = document.getElementById('reference');
            if (!gallerySection && referenceSection) {
                gallerySection = document.createElement('section');
                gallerySection.id = 'galerie';
                gallerySection.className = 'pt-24 pb-32 bg-white relative overflow-hidden';
                referenceSection.parentNode.insertBefore(gallerySection, referenceSection.nextSibling);

                gallerySection.innerHTML = `
                    <div class="container mx-auto px-4">
                        <div class="text-center mb-16">
                            <div style="color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.875rem; margin-bottom: 1rem;">GALERIE REALIZACÍ</div>
                            <h2 class="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-heading">Špičková péče o váš majetek v detailech</h2>
                            <div class="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
                        </div>
                    </div>
                    <div class="relative max-w-[1550px] mx-auto px-4 md:px-20">
                        <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-bottom: 2rem;">
                            <button id="gallery-prev" class="w-12 h-12 md:w-16 md:h-16 rounded-full text-white flex items-center justify-center hover:scale-110 active:scale-95 border-none transition-all shadow-[0_4px_25px_rgba(245,158,11,0.4)]" style="background-color: #f59e0b !important; cursor: pointer;">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>
                            </button>
                            <button id="gallery-next" class="w-12 h-12 md:w-16 md:h-16 rounded-full text-white flex items-center justify-center hover:scale-110 active:scale-95 border-none transition-all shadow-[0_4px_25px_rgba(245,158,11,0.4)]" style="background-color: #f59e0b !important; cursor: pointer;">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>
                            </button>
                        </div>
                        <div id="gallery-scroller-inner" style="display: flex; gap: 1.5rem; overflow-x: auto; scroll-behavior: smooth; padding: 1rem 0 3rem; -ms-overflow-style: none; scrollbar-width: none;">
                            <style>#gallery-scroller-inner::-webkit-scrollbar { display: none; }</style>
                            ${galleryData.length === 0 ? '<div style="width:100%; text-align:center; padding:3rem; color:#94a3b8; font-weight:600;">Připravujeme pro vás nové ukázky...</div>' : galleryData.map(item => `
                                <div class="gallery-item-v" onclick="window.nnf_openGallery('${item.id}')" style="flex: 0 0 450px; background: #0f172a; border-radius: 2rem; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.3s ease;">
                                    <div style="height: 250px; position: relative;">
                                        <img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">
                                        ${item.hasVideo ? `<div style="position: absolute; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center;">
                                            <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                            </div>
                                        </div>` : ''}
                                    </div>
                                    <div style="padding: 2rem;">
                                        <div style="color: #f59e0b; font-weight: 800; font-size: 0.75rem; letter-spacing: 0.1em; margin-bottom: 0.5rem;">${item.category}</div>
                                        <h3 style="color: white; font-weight: 800; font-size: 1.25rem; margin-bottom: 1rem;">${item.title}</h3>
                                        <div style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">${item.description.substring(0, 80)}...</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                const scroller = document.getElementById('gallery-scroller-inner');
                const nextBtn = document.getElementById('gallery-next');
                const prevBtn = document.getElementById('gallery-prev');
                let isPaused = false;

                const performJump = (dir) => {
                    const jumpAmount = scroller.clientWidth > 1000 ? 474 : 350;
                    scroller.scrollBy({left: dir * jumpAmount, behavior: 'smooth'});
                };

                nextBtn.addEventListener('click', () => { performJump(1); isPaused = true; setTimeout(() => isPaused = false, 15000); });
                prevBtn.addEventListener('click', () => { performJump(-1); isPaused = true; setTimeout(() => isPaused = false, 15000); });
            }
        };
        injectGallery();
    } catch(e) {
        console.warn('Gallery Init Error:', e);
    }
};

const clearPreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => { if(preloader.parentNode) preloader.remove(); }, 500);
    }
    document.body.style.opacity = '1';
    document.body.style.overflow = 'auto';
};

const domObserver = new MutationObserver(() => {
    observeAll();
});

const initApp = async () => {
    domObserver.observe(document.body, { childList: true, subtree: true });
    observeAll();
    // Start background tasks
    initGallery();
    // Immediately clear preloader after layout is ready or after timeout
    setTimeout(clearPreloader, 400); 
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Final safety clear - absolute maximum wait 6 seconds
setTimeout(clearPreloader, 6000);
