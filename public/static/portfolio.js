/* Dynamic Portfolio / Realizations for NANOfusion */

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


    const fetchProjects = () => {
        const defaults = [
            { 
                id: 1, 
                title: 'Čištění střechy RD, Praha', 
                service: 'Čištění střech', 
                image: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800',
                location: 'Praha - Západ',
                duration: '2 dny',
                challenge: 'Silné znečištění mechem a lišejníkem na severní straně střechy po 15 letech bez údržby.',
                solution: 'Tlakové čištění s regulací výkonu, následná sanace povrchu a aplikace hydrofobní nano-ochrany.',
                results: 'Střecha získala zpět svůj původní odstín a díky impregnaci je chráněna před opětovným růstem mechu na dalších 7+ let.',
<<<<<<< HEAD
                beforeImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
                afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
=======
                beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
                afterImg: 'https://images.unsplash.com/photo-1628033034914-74977460af25?w=800'
>>>>>>> 6ff963f970458a85f81c0cb004ba205ec2b45a90
            },
            { 
                id: 2, 
                title: 'Renovace fasády bytového domu, Brno', 
                service: 'Čištění fasád', 
                image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
                location: 'Brno - Královo Pole',
                duration: '4 dny',
                challenge: 'Atmosférické nečistoty a mastnota z blízké frekventované křižovatky. Plocha přes 1200 m².',
                solution: 'Aplikace aktivní čisticí pěny, šetrný oplach a nanesení preventivního antigraffiti a nano nátěru.',
                results: 'Kompletní omlazení vzhledu celého domu bez nutnosti nové fasády. Úspora pro SVJ přes 300 000 Kč.',
<<<<<<< HEAD
                beforeImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
=======
                beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
>>>>>>> 6ff963f970458a85f81c0cb004ba205ec2b45a90
                afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'
            },
            { 
                id: 3, 
                title: 'Zámková dlažba firemního areálu, Plzeň', 
                service: 'Čištění dlažeb', 
<<<<<<< HEAD
                image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
=======
                image: 'https://images.unsplash.com/photo-1590076214667-c0f33b98c442?w=800',
>>>>>>> 6ff963f970458a85f81c0cb004ba205ec2b45a90
                location: 'Plzeň - Borská pole',
                duration: '1 den',
                challenge: 'Olejové skvrny a zašlá špína z těžké techniky. Nutnost pracovat za plného provozu logistického centra.',
                solution: 'Hloubkové chemické rozpuštění mastnoty, horkovodní čištění a zapískování spár speciálním pískem.',
                results: 'Povrch vypadá jako nový, zvýšená bezpečnost (protiskluz) a snazší průběžný úklid areálu.',
<<<<<<< HEAD
                beforeImg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
=======
                beforeImg: 'https://images.unsplash.com/photo-1590076214667-c0f33b98c442?w=800',
>>>>>>> 6ff963f970458a85f81c0cb004ba205ec2b45a90
                afterImg: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'
            }
        ];
        return JSON.parse(localStorage.getItem('nanofusion_portfolio')) || defaults;
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

    const render = () => {
        const projects = fetchProjects();
        window.portfolioOpenStudy = (id) => {
            const project = projects.find(it => it.id === id);
            if (project) openCaseStudy(project);
        };

        const generateCards = (list) => list.map(p => `
            <div class="portfolio-card-modern" onclick="window.portfolioOpenStudy(${p.id})">
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
                    ${generateCards(projects)}
                </div>
            </div>
            
            <div style="display: flex; justify-content: center; padding: 4rem 0;">
                <button onclick="document.getElementById('ai-chat-launcher').click()" class="inline-flex items-center px-10 py-5 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-xl active:scale-95">
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
    if (!document.getElementById('realizace')) {
        injectPortfolio();
    }
};

const portfolioObserver = new MutationObserver(() => initPortfolio());
portfolioObserver.observe(document.body, { childList: true, subtree: true });

initPortfolio();
window.addEventListener('load', () => setTimeout(initPortfolio, 500));

