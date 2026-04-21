/* Dynamic Portfolio / Realizations for NANOfusion */

import { supabase } from './supabase-client.js'

const injectPortfolio = async () => {
    let portfolioSection = document.getElementById('realizace');
    const referenceSection = document.getElementById('reference');
    const processSection = document.getElementById('proces');
    const rootWrapper = document.querySelector('#root > div');
    
    if (!portfolioSection) {
        portfolioSection = document.createElement('div');
        portfolioSection.id = 'realizace';
        portfolioSection.className = 'py-24 bg-slate-50';
    }

    // Determine the best insertion point
    if (referenceSection && referenceSection.parentNode) {
        // Precise spot: before reviews
        if (portfolioSection.previousElementSibling !== referenceSection.previousElementSibling) {
            referenceSection.parentNode.insertBefore(portfolioSection, referenceSection);
        }
    } else if (processSection && processSection.parentNode) {
        // Fallback: after "How it works"
        processSection.parentNode.insertBefore(portfolioSection, processSection.nextSibling);
    } else if (rootWrapper) {
        // Last resort: end of root wrapper
        rootWrapper.appendChild(portfolioSection);
    }


    const fetchProjects = async () => {
        const { data: realizations, error } = await supabase
            .from('realizations')
            .select(`
                *,
                realization_photos (
                    id,
                    url,
                    order_index
                )
            `)
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (error || !realizations) return [];

        return realizations.map(r => {
            const sortedPhotos = (r.realization_photos || []).sort((a, b) => a.order_index - b.order_index);
            return {
                id: r.id,
                title: r.title,
                service: r.work_type || 'NANO péče',
                image: normalizeMediaUrl(sortedPhotos[0]?.url) || 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800',
                location: r.location || 'Česká republika',
                duration: r.duration || 'Realizováno',
                challenge: r.description || '', // Mapping description to challenge for now
                solution: 'Profesionální aplikace NANOfusion technologií.',
                results: 'Dlouhodobá ochrana a obnovený vzhled povrchu.',
                beforeImg: normalizeMediaUrl(sortedPhotos[0]?.url) || '',
                afterImg: normalizeMediaUrl(sortedPhotos[1]?.url) || normalizeMediaUrl(sortedPhotos[0]?.url) || ''
            };
        });
    };

    const openCaseStudy = (p) => {
        let modal = document.getElementById('case-study-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'case-study-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
                <button class="close-modal-btn">&times;</button>
                <div style="padding: 2rem;">
                    <div style="display: flex; gap: 2rem; flex-direction: column;">
                        <div>
                            <h2 style="font-size: 1.75rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem;">${p.title}</h2>
                            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                                <span class="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase">${p.service}</span>
                                <span class="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase">⏱️ ${p.duration}</span>
                                <span class="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold uppercase">📍 ${p.location}</span>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                                <div style="position: relative; border-radius: 1rem; overflow: hidden; height: 240px; md:height: 300px;">
                                    <img src="${p.beforeImg}" alt="Před" style="width: 100%; height: 100%; object-fit: cover;">
                                    <div style="position: absolute; bottom: 1rem; left: 1rem; background: #ef4444; color: white; padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 800; font-size: 0.7rem;">PŘED RENOVACÍ</div>
                                </div>
                                <div style="position: relative; border-radius: 1rem; overflow: hidden; height: 240px; md:height: 300px;">
                                    <img src="${p.afterImg}" alt="Po" style="width: 100%; height: 100%; object-fit: cover;">
                                    <div style="position: absolute; bottom: 1rem; left: 1rem; background: #22c55e; color: white; padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 800; font-size: 0.7rem;">VÝSLEDEK NANO-OCHRANY</div>
                                </div>
                            </div>
                        </div>

                        <div style="display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                            <div style="background: #f8fafc; padding: 1.5rem; border-radius: 1rem;">
                                <h4 style="font-size: 0.875rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem;">Vstupní problém</h4>
                                <p style="font-size: 0.938rem; line-height: 1.6; color: #475569;">${p.challenge}</p>
                            </div>
                            <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 1rem; border: 1px solid #dcfce7;">
                                <h4 style="font-size: 0.875rem; font-weight: 800; color: #166534; text-transform: uppercase; margin-bottom: 0.5rem;">Naše řešení</h4>
                                <p style="font-size: 0.938rem; line-height: 1.6; color: #166534;">${p.solution}</p>
                            </div>
                        </div>

                        <div style="margin-top: 1rem; background: #fffbeb; padding: 1.5rem; border-radius: 1rem; border: 1px solid #fef3c7;">
                            <h4 style="font-size: 0.875rem; font-weight: 800; color: #92400e; text-transform: uppercase; margin-bottom: 0.5rem;">Finální výsledek</h4>
                            <p style="font-size: 1rem; line-height: 1.6; color: #92400e; font-weight: 500;">${p.results}</p>
                        </div>
                    </div>

                    <div style="margin-top: 2.5rem; text-align: center;">
                        <button onclick="document.getElementById('case-study-modal').style.display='none'; document.getElementById('ai-chat-launcher').click();" style="width: 100%; background: #F59E0B; color: white; border: none; padding: 1.25rem; border-radius: 1rem; font-weight: 800; cursor: pointer; font-size: 1.125rem; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2); transition: all 0.2s;">
                            CHCI PODOBNÝ VÝSLEDEK <span style="margin-left: 0.5rem;">💬</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        modal.querySelector('.close-modal-btn').onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    };

    const render = async () => {
        const projects = await fetchProjects();
        window.portfolioOpenStudy = (id) => {
            const project = projects.find(it => it.id === id);
            if (project) openCaseStudy(project);
        };

        const generateCards = (list) => list.map(p => `
            <div class="portfolio-card-modern" onclick="window.portfolioOpenStudy('${p.id}')">
                <div class="portfolio-img-wrap">
                    <img src="${p.image}" alt="${p.title}">
                </div>
                <div class="portfolio-content">
                    <span class="portfolio-tag">${p.service}</span>
                    <h3 class="portfolio-h3">${p.title}</h3>
                    <div style="margin-top: 1rem; font-size: 0.75rem; color: #F59E0B; font-weight: 800; display: flex; align-items: center; gap: 0.5rem;">
                       Zobrazit Case Study <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                </div>
            </div>
        `).join('');

        portfolioSection.className = 'py-24 bg-slate-50 section-reveal';
        portfolioSection.innerHTML = `
            <div class="container mx-auto px-4 mb-12">
                <div class="text-center">
                    <h2 class="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Naše Realizace v detailu</h2>
                    <p class="text-slate-500 max-w-2xl mx-auto">Sledujte, jak vracíme domům jejich původní krásu a lesk.</p>
                </div>
            </div>
            
            <div class="portfolio-container">
                <div class="portfolio-track">
                    ${generateCards(projects)}
                    ${projects.length > 2 ? generateCards(projects) : ''}
                </div>
            </div>
            
            <div style="display: flex; justify-content: center; padding: 4rem 0;">
                <button onclick="document.getElementById('ai-chat-launcher').click()" class="inline-flex items-center px-10 py-5 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-xl active:scale-95 uppercase tracking-wider text-sm">
                    CHCI TAKÉ TAKOVÉ VÝSLEDKY
                    <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        `;
    };

    render();
    window.addEventListener('portfolioUpdated', render);
};

// Start injection with resilience
const initPortfolio = () => {
    if (!portfolioSection) {
       injectPortfolio();
    }
};

const portfolioObserver = new MutationObserver(() => {
    if (!document.getElementById('realizace')) {
        injectPortfolio();
    }
});
portfolioObserver.observe(document.body, { childList: true, subtree: true });

injectPortfolio();
window.addEventListener('load', () => setTimeout(injectPortfolio, 500));
