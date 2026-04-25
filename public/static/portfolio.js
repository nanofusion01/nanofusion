import { supabase, normalizeMediaUrl } from './supabase-client.js'

const injectPortfolio = async () => {
    // Wait for supabase readiness
    if (!window.supabase) await new Promise(r => setTimeout(r, 500));
    const sb = window.supabase;
    if (!sb) return;

    let portfolioSection = document.getElementById('realizace');
    const referenceSection = document.getElementById('reference');
    const processSection = document.getElementById('proces');

    if (!portfolioSection && referenceSection) {
        portfolioSection = document.createElement('section');
        portfolioSection.id = 'realizace';
        portfolioSection.className = 'py-24 bg-slate-50';
        referenceSection.parentNode.insertBefore(portfolioSection, processSection || referenceSection);
    }

    const fetchProjects = async () => {
        const { data: realizations, error } = await sb
            .from('realizations')
            .select(`
                *,
                realization_photos(url, is_primary)
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        const projects = (realizations || []).map(r => {
            const primaryPhoto = r.realization_photos?.find(p => p.is_primary) || r.realization_photos?.[0];
            return {
                id: r.id,
                title: r.title,
                tag: r.work_type || 'Realizace',
                description: r.description || '',
                image: normalizeMediaUrl(primaryPhoto?.url) || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
                photos: (r.realization_photos || []).map(p => normalizeMediaUrl(p.url))
            };
        });

        if (portfolioSection && projects.length > 0) {
            const generateCards = (items) => items.map(p => `
                <div class="portfolio-card-modern" onclick="window.nnf_openGallery ? window.nnf_openGallery('${p.id}') : null">
                    <div class="portfolio-img-wrap">
                        <img src="${p.image}" alt="${p.title}" loading="lazy">
                    </div>
                    <div class="portfolio-content">
                        <span class="portfolio-tag">${p.tag}</span>
                        <h3 class="portfolio-h3">${p.title}</h3>
                        <p class="text-slate-500 text-sm mt-2 line-clamp-2">${p.description}</p>
                    </div>
                </div>
            `).join('');

            portfolioSection.innerHTML = `
                <div class="container mx-auto px-6 relative">
                    <div class="text-center mb-16">
                        <div class="text-amber-500 font-bold uppercase tracking-widest text-sm mb-3">Portfolio</div>
                        <h2 class="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-heading">Naše nejnovější práce</h2>
                        <div class="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div class="relative group">
                        <button class="carousel-arrow left-arrow" id="port-prev">←</button>
                        <button class="carousel-arrow right-arrow" id="port-next">→</button>
                        
                        <div class="portfolio-container" id="port-container">
                            <div class="portfolio-track">
                                ${generateCards(projects)}
                                ${projects.length >= 3 ? generateCards(projects) : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Carousel Logic
            const container = document.getElementById('port-container');
            const nextBtn = document.getElementById('port-next');
            const prevBtn = document.getElementById('port-prev');

            if (container && nextBtn && prevBtn) {
                const scrollAmount = 480; // Card width + gap
                nextBtn.onclick = () => container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                prevBtn.onclick = () => container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });

                // Auto-scroll logic
                let autoScroll = setInterval(() => {
                    if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 100) {
                        container.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    }
                }, 5000);

                container.onmouseenter = () => clearInterval(autoScroll);
            }
        }
    };
    fetchProjects();
};

let _portInit = false;
const initPortfolio = () => {
    if (_portInit) return;
    if (document.getElementById('reference')) {
        _portInit = true;
        injectPortfolio();
    }
};

const portObserver = new MutationObserver(() => initPortfolio());
portObserver.observe(document.body, { childList: true, subtree: true });
initPortfolio();
