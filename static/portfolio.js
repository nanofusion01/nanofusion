/* Dynamic Portfolio / Realizations for NANOfusion */

const injectPortfolio = async () => {
    if (document.getElementById('realizace')) return; // Zabráníme dvojité inicializaci

    const portfolioSection = document.createElement('div');
    portfolioSection.id = 'realizace';
    portfolioSection.className = 'py-24 bg-slate-50';

    // Vložíme sekci na správné místo v DOM
    const referenceSection = document.getElementById('reference');
    const processSection = document.getElementById('proces');
    if (referenceSection?.parentNode) {
        referenceSection.parentNode.insertBefore(portfolioSection, referenceSection);
    } else if (processSection?.parentNode) {
        processSection.parentNode.insertBefore(portfolioSection, processSection.nextSibling);
    } else {
        document.querySelector('#root > div')?.appendChild(portfolioSection);
    }

    // Hardcoded záloha (zobrazí se pokud DB je nedostupná)
    let projectsData = [
        {
            id: 'default-1',
            title: 'Čištění střechy RD, Praha',
            work_type: 'Čištění střech',
            location: 'Praha - Západ',
            duration: '2 dny',
            description: 'Silné znečištění mechem a lišejníkem po 15 letech. Tlakové čištění s nano-ochranou.',
            photos: [{ url: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800' }],
        },
        {
            id: 'default-2',
            title: 'Renovace fasády bytového domu, Brno',
            work_type: 'Čištění fasád',
            location: 'Brno - Královo Pole',
            duration: '4 dny',
            description: 'Atmosférické nečistoty a mastnota z blízké frekventované křižovatky. Plocha přes 1200 m².',
            photos: [{ url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' }],
        },
        {
            id: 'default-3',
            title: 'Zámková dlažba firemního areálu, Plzeň',
            work_type: 'Čištění dlažeb',
            location: 'Plzeň - Borská pole',
            duration: '1 den',
            description: 'Olejové skvrny a zašlá špína z těžké techniky. Horkovodní čištění za plného provozu.',
            photos: [{ url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800' }],
        },
    ];

    // Hydratace z Supabase
    try {
        const { supabase } = await import('./supabase-config.js');
        const { data, error } = await supabase
            .from('realizations')
            .select('*, realization_photos(id, url, order_index, caption)')
            .eq('is_published', true)
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            console.log('NANOfusion: Portfolio loaded from Cloud (' + data.length + ' realizací)');
            // Normalizuj data z DB na interní formát
            projectsData = data.map(r => ({
                id: r.id,
                title: r.title || 'Realizace',
                work_type: r.work_type || 'Naše práce',
                location: r.location || '',
                duration: r.duration || '',
                description: r.description || '',
                photos: (r.realization_photos || []).sort((a, b) => a.order_index - b.order_index),
            }));
            render();
        }
    } catch (e) {
        console.warn('Portfolio: DB nedostupná, zobrazuji zálohu');
    }

    // Otevře case study modal
    const openCaseStudy = (p) => {
        let modal = document.getElementById('case-study-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'case-study-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        const mainPhoto = p.photos?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
        const galleryHtml = p.photos && p.photos.length > 1
            ? `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:0.75rem;margin-top:1.5rem;">
                ${p.photos.map(ph => `<img src="${ph.url}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:0.75rem;" loading="lazy">`).join('')}
               </div>`
            : '';

        modal.innerHTML = `
            <div class="modal-content" style="max-width:860px;max-height:90vh;overflow-y:auto;">
                <button class="close-modal-btn">&times;</button>
                <div style="padding:2rem;">
                    <img src="${mainPhoto}" alt="${p.title}" style="width:100%;height:280px;object-fit:cover;border-radius:1.25rem;margin-bottom:1.5rem;">
                    
                    <h2 style="font-size:1.75rem;font-weight:800;color:#1e293b;margin-bottom:0.75rem;">${p.title}</h2>
                    
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;">
                        <span style="background:#fef3c7;color:#92400e;padding:0.25rem 0.75rem;border-radius:99px;font-size:0.75rem;font-weight:700;">${p.work_type}</span>
                        ${p.duration ? `<span style="background:#f1f5f9;color:#475569;padding:0.25rem 0.75rem;border-radius:99px;font-size:0.75rem;font-weight:700;">⏱ ${p.duration}</span>` : ''}
                        ${p.location ? `<span style="background:#f1f5f9;color:#475569;padding:0.25rem 0.75rem;border-radius:99px;font-size:0.75rem;font-weight:700;">📍 ${p.location}</span>` : ''}
                    </div>
                    
                    ${p.description ? `
                    <div style="background:#f8fafc;padding:1.5rem;border-radius:1rem;margin-bottom:1.5rem;">
                        <h4 style="font-size:0.75rem;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:0.5rem;">Popis realizace</h4>
                        <p style="color:#475569;line-height:1.7;font-size:0.938rem;">${p.description}</p>
                    </div>` : ''}
                    
                    ${galleryHtml}
                    
                    <div style="margin-top:2rem;text-align:center;">
                        <button onclick="document.getElementById('case-study-modal').style.display='none';document.getElementById('ai-chat-launcher').click();"
                            style="width:100%;background:#F59E0B;color:white;border:none;padding:1.25rem;border-radius:1rem;font-weight:800;cursor:pointer;font-size:1rem;box-shadow:0 10px 20px rgba(245,158,11,0.2);">
                            CHCI PODOBNÝ VÝSLEDEK 💬
                        </button>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        modal.querySelector('.close-modal-btn').onclick = () => modal.style.display = 'none';
        modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
    };

    const render = () => {
        window.portfolioOpenStudy = (id) => {
            const project = projectsData.find(p => String(p.id) === String(id));
            if (project) openCaseStudy(project);
        };

        const generateCards = (list) => list.map(p => {
            const img = p.photos?.[0]?.url || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
            return `
            <div class="portfolio-card-modern" onclick="window.portfolioOpenStudy('${p.id}')">
                <div class="portfolio-img-wrap">
                    <img src="${img}" alt="${p.title}" loading="lazy">
                </div>
                <div class="portfolio-content">
                    <span class="portfolio-tag">${p.work_type || 'Realizace'}</span>
                    <h3 class="portfolio-h3">${p.title}</h3>
                    ${p.location ? `<p style="font-size:0.75rem;color:#94a3b8;margin-top:0.25rem;">📍 ${p.location}</p>` : ''}
                    <div style="margin-top:1rem;font-size:0.75rem;color:#F59E0B;font-weight:800;display:flex;align-items:center;gap:0.5rem;">
                       Zobrazit Case Study <svg style="width:12px;height:12px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </div>
                </div>
            </div>`;
        }).join('');

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
                    ${generateCards(projectsData)}
                    ${generateCards(projectsData)}
                </div>
            </div>
            <div style="display:flex;justify-content:center;padding:4rem 0;">
                <button onclick="document.getElementById('ai-chat-launcher').click()"
                    class="inline-flex items-center px-10 py-5 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-xl active:scale-95 uppercase tracking-wider text-sm">
                    CHCI TAKÉ TAKOVÉ VÝSLEDKY
                    <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        `;
    };

    render();
};

// MutationObserver — čeká na main.js
const portfolioObserver = new MutationObserver(() => {
    if (!document.getElementById('realizace')) injectPortfolio();
});
portfolioObserver.observe(document.body, { childList: true, subtree: true });

injectPortfolio();
window.addEventListener('load', () => setTimeout(injectPortfolio, 1000));
