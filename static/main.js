/**
 * NANOfusion Main logic module
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
      heading.innerHTML = data.value;
      console.log('NANOfusion: Hero text synchronizován');
    } else {
      heading.innerHTML = 'Špičková péče o to,<br><span style="color: #f59e0b;">co jste usilovně vybudovali</span>';
    }
  } catch (e) {
    heading.innerHTML = 'Špičková péče o to,<br><span style="color: #f59e0b;">co jste usilovně vybudovali</span>';
  }
};

const observeAll = () => {
  document.querySelectorAll('.section-reveal:not(.observed)').forEach(el => {
    revealObserver.observe(el);
    el.classList.add('observed');
  });

  // Dynamic Text Replacement & Layout Fix
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

  // Remove header phone number
  const navPhone = document.querySelector('header a[href="tel:+420774509409"]');
  if (navPhone) navPhone.remove();

  // Update Header Logo (excluding chatbot)
  const headerLogos = document.querySelectorAll('header img:not(.chat-logo):not(.ai-chat-launcher img), nav img:not(.chat-logo)');
  headerLogos.forEach(img => {
    if ((img.src.includes('logo.jpg') || img.src.includes('logo-nav.jpg')) && !img.closest('#ai-chat-launcher') && !img.closest('#ai-chat-window')) {
      img.src = '/static/nanofusion-long.png';
      img.style.height = '75px';
      img.style.width = 'auto';
    }
  });

  // Inject Portfolio & Galerie & Blog Links into Navigation
  const navLinks = Array.from(document.querySelectorAll('header nav a, header div a'));
  const referenceLink = navLinks.find(a => a.textContent.trim() === 'Reference');

  if (referenceLink) {
    // Standardize all hash links to be root-relative ONLY if on a subpage
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

    // Set active state for links
    const currentPath = window.location.pathname;
    document.querySelectorAll('header nav a').forEach(a => {
      if (a.getAttribute('href') === currentPath || (currentPath === '/' && a.getAttribute('href') === '/')) {
        a.style.color = '#f59e0b';
      } else {
        // Only reset if it was previously set by us or matches known color
        if (a.style.color === 'rgb(245, 158, 11)' || a.style.color === '#f59e0b') {
          a.style.color = '';
        }
      }
    });
  }

  // Update Footer Style & Logo
  const footer = document.querySelector('footer');
  if (footer) {
    footer.style.backgroundColor = '#111111'; // Pure deep black to bleed into logo background
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

  // Update IČO
  const footerTexts = document.querySelectorAll('footer p.text-xs.text-neutral-500');
  footerTexts.forEach(p => {
    if (p.textContent.includes('IČ:')) {
      p.innerHTML = `© 2026 NANOfusion s.r.o. | IČ: 29375363 | 
        <a href="https://eshop.nanofusion.cz" target="_blank" style="color: inherit; text-decoration: none; margin-left: 10px; border-bottom: 1px solid #444;">E-shop</a> | 
        <a href="https://nanofusion-j3bs.vercel.app/admin/login" style="color: #f59e0b; font-weight: 700; text-decoration: none; margin-left: 5px;">Zaměstnanci</a>`;
    }
  });

  // Format Footer Description Text
  const footerDescTexts = document.querySelectorAll('footer p.text-sm.text-neutral-400');
  footerDescTexts.forEach(p => {
    if (!p.dataset.brUpdated && (p.textContent.includes('Od roku 2012') || p.textContent.includes('13 let'))) {
      p.innerHTML = 'Profesionální čištění, impregnace a nátěry.<br>Již 12 let pečujeme o váš majetek po celé ČR.';
      p.dataset.brUpdated = 'true';
    }
  });

  // Update Experience Stats
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

  const galleryShowcaseData = [
    {
      id: 1,
      title: 'Kompletní renovace střechy Praha - RD',
      category: 'ČIŠTĚNÍ STŘECH',
      description: 'Důkladná hloubková očista střešní krytiny rodinného domu v Praze. Odstranění organických nánosů (mechy, řasy) a následná aplikace hydrofobní nano-impregnace, která zajišťuje samočistící schopnost a prodlužuje životnost materiálu o desítky let.',
      image: 'https://images.unsplash.com/photo-1635339001328-8007ebfd4a60?auto=format&fit=crop&q=80&w=1200',
      hasVideo: true
    },
    {
      id: 2,
      title: 'Nátěr a ošetření dlažby Poruba',
      category: 'ČIŠTĚNÍ DLAŽEB',
      description: 'Oživení zašlé zámkové dlažby pomocí speciálního nátěru a hloubkové nano-ochrany. Povrch nyní odpuzuje vodu i mastnotu, což usnadňuje běžnou údržbu a zabraňuje růstu travin ve spárách.',
      image: 'https://images.unsplash.com/photo-1584622502840-771746be22f2?auto=format&fit=crop&q=80&w=1200',
      hasVideo: false
    },
    {
      id: 3,
      title: 'Čištění fasády bytového domu Brno',
      category: 'RENOVACE FASÁD',
      description: 'Sanace fasády bytového komplexu v Brně s důrazem na likvidaci plísní. Realizace zahrnovala chemické čištění pod nízkým tlakem a nanesení prémiového nátěru s fotokatalytickým efektem proti smogu.',
      image: 'https://images.unsplash.com/photo-1590480500072-5561504930bc?auto=format&fit=crop&q=80&w=1200',
      hasVideo: true
    },
    {
      id: 4,
      title: 'Údržba solárních panelů Ostrava',
      category: 'SERVIS FVE',
      description: 'Zlepšení energetické výtěžnosti fotovoltaické elektrárny o 15 % díky šetrnému odstranění prachu a pylů demineralizovanou vodou. Na povrch byla následně nanesena ultra-tenká vrstva nano-sklenné ochrany.',
      image: 'https://images.unsplash.com/photo-1509391366360-fe5bb65830bb?auto=format&fit=crop&q=80&w=1200',
      hasVideo: false
    }
  ];

  window.nnf_openGallery = (id) => {
    const item = galleryShowcaseData.find(g => g.id === id);
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

  // Inject Gallery Section (Single Page Architecture)
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
          <!-- Navigation Arrows Above the Track -->
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
            
            <!-- Dark Style Gallery Items -->
            ${galleryShowcaseData.map(item => `
              <div class="gallery-item-v" onclick="window.nnf_openGallery(${item.id})" style="flex: 0 0 450px; background: #0f172a; border-radius: 2rem; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.3s ease;">
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


      // JS Scroll Logic
      const scroller = document.getElementById('gallery-scroller-inner');
      const nextBtn = document.getElementById('gallery-next');
      const prevBtn = document.getElementById('gallery-prev');
      let scrollInterval;
      let isPaused = false;

      const performJump = (dir) => {
        const jumpAmount = scroller.clientWidth > 1000 ? 474 : 350; // Dynamic jump amount based on card width
        scroller.scrollBy({left: dir * jumpAmount, behavior: 'smooth'});
      };

      const startAutoJump = () => {
         scrollInterval = setInterval(() => {
            if (!isPaused) {
                if (scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 100) {
                   scroller.scrollTo({left: 0, behavior: 'smooth'});
                } else {
                   performJump(1);
                }
            }
         }, 5000);
      };

      startAutoJump();

      scroller.addEventListener('mouseenter', () => isPaused = true);
      scroller.addEventListener('mouseleave', () => isPaused = false);
      nextBtn.addEventListener('click', () => { performJump(1); isPaused = true; setTimeout(() => isPaused = false, 15000); });
      prevBtn.addEventListener('click', () => { performJump(-1); isPaused = true; setTimeout(() => isPaused = false, 15000); });
    }
  };
  injectGallery();

  // Add Social Icons in Footer
  const socialLinks = document.querySelectorAll('footer a[href*="facebook.com"], footer a[href*="instagram.com"], footer a[href*="linkedin.com"], footer a[href*="youtube.com"]');
  if (socialLinks.length > 0) {
    const socialParent = socialLinks[0].closest('ul');
    if (socialParent && !socialParent.dataset.rowified) {
      socialParent.style.display = 'flex';
      socialParent.style.gap = '1.5rem';
      socialParent.style.marginTop = '1rem';
      socialParent.dataset.rowified = 'true';
    }

    socialLinks.forEach(link => {
      // Force User-Specific Social URLs
      if (link.href.includes('instagram.com')) link.href = 'https://www.instagram.com/nano_fusion_cz/';
      if (link.href.includes('youtube.com')) link.href = 'https://www.youtube.com/@nanofusion7654';
      if (link.href.includes('facebook.com')) link.href = 'https://www.facebook.com/nanofusioncz';
      if (link.href.includes('linkedin.com')) link.href = 'https://www.linkedin.com/company/nanofusion/';

      if (!link.dataset.iconized) {
        link.style.color = '#f59e0b';
        link.style.transition = 'all 0.3s ease';
        link.title = link.textContent.trim();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        let iconSvg = '';
        if (link.href.includes('facebook')) {
          iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`;
        } else if (link.href.includes('instagram')) {
          iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
        } else if (link.href.includes('linkedin')) {
          iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
        } else if (link.href.includes('youtube')) {
          iconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`;
        }

        link.innerHTML = iconSvg;
        link.onmouseenter = () => { link.style.transform = 'translateY(-4px)'; link.style.opacity = '0.7'; };
        link.onmouseleave = () => { link.style.transform = 'translateY(0)'; link.style.opacity = '1'; };
        link.dataset.iconized = 'true';

        if (link.parentElement.tagName === 'LI') {
          link.parentElement.style.margin = '0';
          link.parentElement.style.padding = '0';
        }
      }
    });
  }

  // Transform Footer Services
  const footerHeadings = Array.from(document.querySelectorAll('footer h3, footer h4, footer p.font-bold'));
  const servicesHeading = footerHeadings.find(h => h.textContent.includes('Služby'));
  const contactHeading = footerHeadings.find(h => h.textContent.includes('Kontakt'));

  if (servicesHeading) {
    servicesHeading.style.color = '#f59e0b';
    servicesHeading.style.fontWeight = '800';
    const servicesUl = servicesHeading.parentElement.querySelector('ul');
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
        a.style.color = '#f59e0b';
        a.style.fontWeight = '700';
        a.style.transition = 'all 0.3s ease';
        a.style.display = 'block';

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

        a.onmouseenter = () => { a.style.transform = 'translateX(8px)'; a.style.opacity = '0.8'; };
        a.onmouseleave = () => { a.style.transform = 'translateX(0)'; a.style.opacity = '1'; };

        li.appendChild(a);
        servicesUl.appendChild(li);
      });
      servicesUl.dataset.finalized = 'true';
    }
  }

  // Inject Map
  if (contactHeading) {
    contactHeading.style.color = '#f59e0b';
    contactHeading.style.fontWeight = '800';
    const contactCol = contactHeading.parentElement;
    if (contactCol && !contactCol.querySelector('.footer-map-container')) {
      const mapContainer = document.createElement('div');
      mapContainer.className = 'footer-map-container section-reveal';
      mapContainer.style.marginTop = '1.5rem';
      mapContainer.style.borderRadius = '1rem';
      mapContainer.style.overflow = 'hidden';
      mapContainer.style.border = '2px solid #f59e0b';
      mapContainer.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      mapContainer.style.height = '250px';
      mapContainer.style.position = 'relative';

      mapContainer.innerHTML = `
        <a href="https://www.google.com/maps/search/?api=1&query=Cezavy+627,+664+56+Blučina" target="_blank" style="display: block; height: 100%;">
          <iframe 
            src="https://www.google.com/maps?q=Cezavy%20627,664%2056%20Blučina&output=embed" 
            width="100%" 
            height="100%" 
            style="border:0; pointer-events: none;" 
            allowfullscreen="" 
            loading="lazy">
          </iframe>
          <div style="position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background 0.3s ease;" 
               onmouseenter="this.style.background='rgba(245, 158, 11, 0.1)'"
               onmouseleave="this.style.background='rgba(0,0,0,0)'">
          </div>
        </a>
      `;
      contactCol.appendChild(mapContainer);
      revealObserver.observe(mapContainer);
    }
  }
};

// Global reveal registration
window.observeAll = observeAll;

let isObserving = false;
const domObserver = new MutationObserver(() => {
  if (isObserving) return;
  isObserving = true;
  try {
    observeAll();
  } catch (e) {
    console.error('Observation error:', e);
  } finally {
    setTimeout(() => { isObserving = false; }, 100);
  }
});

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

const initApp = () => {
  try {
    domObserver.observe(document.body, { childList: true, subtree: true });
    observeAll();
  } catch (e) {
    console.warn('Initial app injection error:', e);
  }
  // Independent preloader clearing
  setTimeout(clearPreloader, 100); 
};

// Start initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Senior CTO Fallback: Force clear preloader after 4.5s no matter what
setTimeout(clearPreloader, 4500);

