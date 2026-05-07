/**
 * NANOfusion Main logic module - Optimized CTO Edition
 * Handles Reveal System, Branding patches, and UI enhancements.
 */

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, { threshold: 0.1 });

const syncHeroText = async (heading) => {
  try {
    const { supabase } = await import('./supabase-config.js');
    const { data, error } = await supabase.from('site_config').select('value').eq('key', 'hero_title').single();
    if (!error && data) {
      heading.style.transition = 'opacity 0.3s ease';
      heading.style.opacity = '0';
      setTimeout(() => {
        heading.innerHTML = data.value;
        heading.style.opacity = '1';
      }, 300);
      console.log('NANOfusion: Hero text synchronizován');
    } else {
      heading.innerHTML = 'Špičková péče o to,<br><span style="color: #f59e0b;">co jste usilovně vybudovali</span>';
    }
  } catch (e) {
    heading.innerHTML = 'Špičková péče o to,<br><span style="color: #f59e0b;">co jste usilovně vybudovali</span>';
  }
};

const observeAll = () => {
  // 1. Reveal Animations
  document.querySelectorAll('.section-reveal:not(.observed)').forEach(el => {
    revealObserver.observe(el);
    el.classList.add('observed');
  });

  // 2. Dynamic Text Replacement (Hero)
  const heroHeading = document.querySelector('h1.font-heading');
  if (heroHeading && (heroHeading.textContent.includes('co jste vybudovali') || heroHeading.textContent.includes('Čistíme')) && !heroHeading.dataset.updated) {
    syncHeroText(heroHeading);
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
  }

  // 3. Remove header phone number
  const navPhone = document.querySelector('header a[href="tel:+420774509409"]');
  if (navPhone) navPhone.remove();

  // 4. Update Logos (SRC only, sizes are in CSS)
  const logos = document.querySelectorAll('header img:not(.chat-logo):not(.ai-chat-launcher img), nav img:not(.chat-logo), footer img');
  logos.forEach(img => {
    if (!img.dataset.patched && (img.src.includes('logo.jpg') || img.src.includes('logo-nav.jpg') || img.src.includes('logo_dark.jpg'))) {
      img.src = '/static/nanofusion-long.png';
      img.dataset.patched = 'true';
      
      // Cleanup legacy inline styles from parent if they exist
      const parent = img.parentElement;
      if (parent && parent.classList.contains('bg-white') && parent.classList.contains('p-2')) {
        parent.style.background = 'transparent';
        parent.style.padding = '0';
      }
    }
  });

  // 5. Navigation Links Injection
  const navLinks = Array.from(document.querySelectorAll('header nav a, header div a'));
  const referenceLink = navLinks.find(a => a.textContent.trim() === 'Reference');

  if (referenceLink && !referenceLink.dataset.navPatched) {
    const isRoot = window.location.pathname === '/' || window.location.pathname === '/index.html';
    
    // Standardize hash links
    navLinks.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.startsWith('#') && !isRoot) a.href = '/' + href;
    });

    const navContainers = Array.from(new Set(navLinks.map(a => a.parentNode).filter(p => p)));
    navContainers.forEach(container => {
      if (container.dataset.navPatched) return;
      const refInContainer = Array.from(container.querySelectorAll('a')).find(a => a.textContent.trim() === 'Reference');
      if (refInContainer) {
        if (!container.querySelector('a[href="#kalkulacka"]')) {
          const configLink = refInContainer.cloneNode(true);
          configLink.textContent = 'Konfigurátor';
          configLink.href = '#kalkulacka';
          refInContainer.parentNode.insertBefore(configLink, refInContainer);
        }
        if (!container.querySelector('a[href="#galerie"]')) {
          const galleryLink = refInContainer.cloneNode(true);
          galleryLink.textContent = 'Galerie';
          galleryLink.href = '#galerie';
          refInContainer.parentNode.insertBefore(galleryLink, refInContainer.nextSibling);
        }
        if (!container.querySelector('a[href="#blog"]')) {
          const blogLink = refInContainer.cloneNode(true);
          blogLink.textContent = 'Blog';
          blogLink.href = '#blog';
          refInContainer.parentNode.insertBefore(blogLink, refInContainer.nextSibling);
        }
        container.dataset.navPatched = 'true';
      }
    });
    referenceLink.dataset.navPatched = 'true';
  }

  // 6. Active link state
  const currentPath = window.location.pathname;
  document.querySelectorAll('header nav a').forEach(a => {
    if (a.getAttribute('href') === currentPath || (currentPath === '/' && a.getAttribute('href') === '/')) {
      a.classList.add('active-link');
    } else {
      a.classList.remove('active-link');
    }
  });

  // 7. Footer Updates
  const footer = document.querySelector('footer');
  if (footer && !footer.dataset.patched) {
    footer.classList.remove('bg-neutral-900', 'bg-slate-900');
    
    // Update IČO
    const footerTexts = footer.querySelectorAll('p.text-xs.text-neutral-500');
    footerTexts.forEach(p => {
      if (p.textContent.includes('IČ:')) {
        p.innerHTML = `© 2026 NANOfusion s.r.o. | IČ: 29375363 | 
          <a href="https://eshop.nanofusion.cz" target="_blank" style="color: inherit; text-decoration: none; margin-left: 10px; border-bottom: 1px solid #444;">E-shop</a> | 
          <a href="https://nanofusion-j3bs.vercel.app/admin/login" style="color: #f59e0b; font-weight: 700; text-decoration: none; margin-left: 5px;">Zaměstnanci</a>`;
      }
    });

    // Update Tagline
    footer.querySelectorAll('p.text-sm.text-neutral-400').forEach(p => {
      if (!p.dataset.brUpdated && (p.textContent.includes('Od roku 2012') || p.textContent.includes('13 let') || p.textContent.includes('12 let'))) {
        p.innerHTML = 'Profesionální čištění, impregnace a nátěry.<br>Již 14 let pečujeme o váš majetek po celé ČR.';
        p.dataset.brUpdated = 'true';
      }
    });
    
    footer.dataset.patched = 'true';
  }

  // 8. Experience Stats
  document.querySelectorAll('div, p, span, h2, h3, h4').forEach(el => {
    if (el.children.length === 0 && !el.dataset.statPatched) {
      if (el.textContent.includes('12 let zkušeností') || el.textContent.includes('13 let zkušeností')) {
        el.textContent = el.textContent.replace('12 let zkušeností', '14 let zkušeností').replace('13 let zkušeností', '14 let zkušeností');
        el.dataset.statPatched = 'true';
      }
      if ((el.textContent.trim() === '12' || el.textContent.trim() === '13') && el.nextElementSibling && el.nextElementSibling.textContent.includes('Let zkušeností')) {
        el.textContent = '14';
        el.dataset.statPatched = 'true';
      }
    }
  });

  // 9. Gallery Section Injection
  const referenceSection = document.getElementById('reference');
  if (referenceSection && !document.getElementById('galerie')) {
    injectGallery();
  }

  // 10. Footer Services Transform
  const servicesHeading = Array.from(document.querySelectorAll('footer h3, footer h4, footer p.font-bold')).find(h => h.textContent.includes('Služby'));
  if (servicesHeading && !servicesHeading.dataset.finalized) {
    finalizeServices(servicesHeading);
  }
};

const finalizeServices = (heading) => {
  heading.style.color = '#f59e0b';
  heading.style.fontWeight = '800';
  const servicesUl = heading.parentElement.querySelector('ul');
  if (servicesUl && !servicesUl.dataset.finalized) {
    const serviceItems = [
      { id: 'facade', name: 'Čištění fasád' },
      { id: 'roof', name: 'Čištění střech' },
      { id: 'pavement', name: 'Čištění dlažeb' },
      { id: 'pv', name: 'Solární panely' },
      { id: 'graffiti', name: 'Odstranění graffiti' },
      { id: 'industrial', name: 'Průmyslové čištění' },
      { id: 'facade-paint', name: 'Nátěry fasád' },
      { id: 'roof-paint', name: 'Nátěry střech' },
      { id: 'antislip', name: 'Protiskluzová úprava' },
      { id: 'ceramfloor', name: 'IG CeramFloor' },
      { id: 'antibac', name: 'Antibakteriální ochrana' }
    ];

    servicesUl.innerHTML = '';
    servicesUl.className = 'space-y-4';

    serviceItems.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = item.name;
      a.className = 'footer-service-link';
      a.style.cssText = 'color:#94a3b8; font-weight:400; font-size:0.9rem; transition:all 0.3s ease; display:block; opacity:0.8;';

      a.onclick = (e) => {
        e.preventDefault();
        if (window.nnf_openService) {
          window.nnf_openService(item.id);
        } else {
          const cards = Array.from(document.querySelectorAll('#sluzby h3, #sluzby h4'));
          const card = cards.find(c => c.textContent.toLowerCase().includes(item.name.toLowerCase()));
          if (card) card.click();
        }
      };

      a.onmouseenter = () => { a.style.transform = 'translateX(8px)'; a.style.opacity = '1'; a.style.color = '#f59e0b'; };
      a.onmouseleave = () => { a.style.transform = 'translateX(0)'; a.style.opacity = '0.8'; a.style.color = '#94a3b8'; };

      li.appendChild(a);
      servicesUl.appendChild(li);
    });
    servicesUl.dataset.finalized = 'true';
    heading.dataset.finalized = 'true';
  }
};

let galleryItems = [];

const syncGalleryData = async () => {
  try {
    const { supabase } = await import('./supabase-config.js');
    const { data, error } = await supabase
      .from('realizations')
      .select('*, realization_photos(*)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      galleryItems = data;
      renderGalleryContent();
    }
  } catch (e) {
    console.warn('NANOfusion: Gallery sync failed', e);
  }
};

const renderGalleryContent = () => {
  const scroller = document.getElementById('gallery-scroller-inner');
  if (!scroller) return;

  if (galleryItems.length === 0) {
    scroller.innerHTML = '<p style="color: #94a3b8; padding: 2rem;">Zatím zde nejsou žádné realizace.</p>';
    return;
  }

  scroller.innerHTML = galleryItems.map(item => {
    const mainImg = item.realization_photos?.[0]?.url || item.image_url || 'https://images.unsplash.com/photo-1635339001328-8007ebfd4a60?w=800';
    return `
      <div class="gallery-item-v" onclick="window.nnf_openGallery('${item.id}')" style="flex: 0 0 450px; background: #0f172a; border-radius: 2rem; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.05); position: relative; user-select: none;">
          <!-- Click Capture Overlay -->
          <div style="position: absolute; inset: 0; z-index: 10; cursor: pointer;"></div>
          
          <div style="height: 250px; position: relative;">
              <img src="${mainImg}" style="width: 100%; height: 100%; object-fit: cover;">
              ${item.youtube_id ? `<div style="position: absolute; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center;">
                  <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
              </div>` : ''}
          </div>
          <div style="padding: 2rem;">
              <div style="color: #f59e0b; font-weight: 800; font-size: 0.75rem; letter-spacing: 0.1em; margin-bottom: 0.5rem; text-transform: uppercase;">${item.work_type || 'Realizace'}</div>
              <h3 style="color: white; font-weight: 800; font-size: 1.25rem; margin-bottom: 1rem;">${item.title}</h3>
              <div style="color: #94a3b8; font-size: 0.875rem; line-height: 1.6;">${(item.description || '').substring(0, 100).replace(/<[^>]*>?/gm, '')}...</div>
          </div>
      </div>
    `;
  }).join('');
};

window.nnf_openGallery = (id) => {
  // Debug log to confirm function is firing
  console.log('NANOfusion: Opening gallery for ID', id);
  
  const item = galleryItems.find(g => String(g.id) === String(id));
  if (!item) {
    console.warn('NANOfusion: Item not found in cache', id);
    return;
  }

  let overlay = document.getElementById('gallery-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'gallery-modal-overlay';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(15,23,42,0.98); backdrop-filter:blur(20px); z-index:9999999; display:none; align-items:center; justify-content:center; padding:20px;';
    document.body.appendChild(overlay);
  }

  const photos = item.realization_photos || [];
  const mainImg = photos[0]?.url || item.image_url || 'https://images.unsplash.com/photo-1635339001328-8007ebfd4a60?w=1200';

  overlay.innerHTML = `
    <div style="background:white; width:100%; max-width:1000px; max-height:95vh; border-radius:32px; overflow:hidden; display:flex; flex-direction:column; position:relative; box-shadow:0 30px 100px rgba(0,0,0,0.5); z-index:10000000;">
      <button onclick="document.getElementById('gallery-modal-overlay').style.display='none'" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.9); border:none; width:44px; height:44px; border-radius:50%; cursor:pointer; font-size:24px; z-index:101; font-weight:bold; box-shadow:0 4px 15px rgba(0,0,0,0.1);">&times;</button>
      
      <div style="flex: 1; overflow-y:auto; padding-bottom: 40px;">
        <!-- Visual Header (Video or Image) -->
        <div style="background: #000;">
          ${item.youtube_id 
            ? `<div style="aspect-ratio: 16/9; width: 100%;">
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${item.youtube_id}?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
               </div>`
            : `<div style="height:500px; position:relative;">
                <img id="modal-main-view" src="${mainImg}" style="width:100%; height:100%; object-fit:cover;">
               </div>`
          }
        </div>
        
        <div style="padding:40px; background:white;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 300px;">
              <div style="color:#f59e0b; font-weight:800; text-transform:uppercase; font-size:13px; margin-bottom:12px; letter-spacing:0.15em;">Realizace • ${item.work_type || 'NANO-OCHRANA'}</div>
              <h2 style="font-size:32px; font-weight:900; color:#0f172a; line-height:1.1; margin-bottom:16px; letter-spacing:-0.03em;">${item.title}</h2>
              <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                ${item.location ? `<span style="background:#f1f5f9; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700; color:#64748b;">📍 ${item.location}</span>` : ''}
                ${item.duration ? `<span style="background:#f1f5f9; padding:6px 12px; border-radius:8px; font-size:12px; font-weight:700; color:#64748b;">⏱ ${item.duration}</span>` : ''}
              </div>
            </div>
          </div>

          <div style="font-size:17px; line-height:1.7; color:#334155; margin-bottom:30px;">${item.description || ''}</div>
          
          <!-- Thumbnail Gallery -->
          ${photos.length > 1 ? `
            <div style="margin-bottom: 40px;">
              <h4 style="font-size:12px; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:16px; letter-spacing:0.1em;">Fotogalerie projektu</h4>
              <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(120px, 1fr)); gap:12px;">
                ${photos.map(p => `
                  <div onclick="const main = document.getElementById('modal-main-view'); if(main) main.src='${p.url}'; window.scrollTo({top:0, behavior:'smooth'})" style="aspect-ratio:1; border-radius:12px; overflow:hidden; cursor:pointer; border:2px solid transparent; transition:all 0.2s;" onmouseenter="this.style.borderColor='#f59e0b'" onmouseleave="this.style.borderColor='transparent'">
                    <img src="${p.url}" style="width:100%; height:100%; object-fit:cover;">
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="background:#0f172a; padding:32px; border-radius:24px; display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap: wrap;">
            <div>
              <div style="font-weight:800; color:white; font-size:20px;">Líbí se vám tento výsledek?</div>
              <div style="color:#94a3b8; font-size:14px;">Napište nám a získejte cenovou nabídku zdarma.</div>
            </div>
            <button onclick="document.getElementById('gallery-modal-overlay').style.display='none'; setTimeout(() => document.getElementById('ai-chat-launcher').click(), 200)" 
              style="background:#f59e0b; color:white; border:none; padding:16px 32px; border-radius:16px; font-weight:800; cursor:pointer; transition:all 0.3s ease; white-space:nowrap; box-shadow:0 10px 20px rgba(245, 158, 11, 0.2);">
              CHCI TAKÉ TAKOVOU PÉČI
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  overlay.style.display = 'flex';
  overlay.onclick = (e) => { if(e.target === overlay) overlay.style.display = 'none'; };
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
              <h2 class="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-heading" style="margin-top: 3rem;">Špičková péče o váš majetek v detailech</h2>
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

        <div id="gallery-scroller-inner" style="display: flex; gap: 1.5rem; overflow-x: auto; scroll-behavior: smooth; padding: 1rem 0 3rem; -ms-overflow-style: none; scrollbar-width: none; min-height: 400px;">
          <style>#gallery-scroller-inner::-webkit-scrollbar { display: none; }</style>
          <!-- Načítání dat... -->
        </div>
      </div>
    `;
    
    syncGalleryData();

    const scroller = document.getElementById('gallery-scroller-inner');
    const nextBtn = document.getElementById('gallery-next');
    const prevBtn = document.getElementById('gallery-prev');
    let isPaused = false;

    const performJump = (dir) => {
      const jumpAmount = scroller.clientWidth > 1000 ? 474 : 350;
      scroller.scrollBy({left: dir * jumpAmount, behavior: 'smooth'});
    };

    setInterval(() => {
      if (!isPaused) {
          if (scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 100) {
             scroller.scrollTo({left: 0, behavior: 'smooth'});
          } else {
             performJump(1);
          }
      }
    }, 5000);

    scroller.addEventListener('mouseenter', () => isPaused = true);
    scroller.addEventListener('mouseleave', () => isPaused = false);
    nextBtn.addEventListener('click', () => { performJump(1); isPaused = true; setTimeout(() => isPaused = false, 15000); });
    prevBtn.addEventListener('click', () => { performJump(-1); isPaused = true; setTimeout(() => isPaused = false, 15000); });
  }
};

// --- Execution Engine ---

let isObserving = false;
const domObserver = new MutationObserver(() => {
  if (isObserving) return;
  isObserving = true;
  requestAnimationFrame(() => {
    observeAll();
    isObserving = false;
  });
});

const clearPreloader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('fade-out')) {
    preloader.classList.add('fade-out');
    setTimeout(() => { if(preloader.parentNode) preloader.remove(); }, 600);
  }
  document.body.style.opacity = '1';
  document.body.style.overflow = 'auto';
};

const initApp = () => {
  observeAll();
  domObserver.observe(document.body, { childList: true, subtree: true });
  setTimeout(clearPreloader, 100); 
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

setTimeout(clearPreloader, 4000); // Fallback
