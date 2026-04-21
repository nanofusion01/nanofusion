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
                tag: r.category || 'Realizace',
                description: r.description || '',
                image: normalizeMediaUrl(primaryPhoto?.url) || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
                photos: (r.realization_photos || []).map(p => normalizeMediaUrl(p.url))
            };
        });

        if (portfolioSection) {
            portfolioSection.innerHTML = `
                <div class="container mx-auto px-6">
                    <div class="text-center mb-16">
                        <h2 class="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-heading">Naše nejnovější práce</h2>
                        <div class="w-20 h-1 bg-amber-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div class="portfolio-container">
                        <div class="portfolio-track">
                            ${projects.map(p => `
                                <div class="portfolio-card-modern" onclick="window.nnf_openGallery ? window.nnf_openGallery('${p.id}') : null">
                                    <div class="portfolio-img-wrap">
                                        <img src="${p.image}" alt="${p.title}">
                                    </div>
                                    <div class="portfolio-content">
                                        <span class="portfolio-tag">${p.tag}</span>
                                        <h3 class="portfolio-h3">${p.title}</h3>
                                        <p class="text-slate-500 text-sm mt-2 line-clamp-2">${p.description}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
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
