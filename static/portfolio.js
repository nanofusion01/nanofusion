/* Dynamic Portfolio / Realizations for NANOfusion with Autoplay & Arrows */

const injectPortfolio = async () => {
    if (document.getElementById('realizace')) return; // Zabráníme dvojité inicializaci

    const portfolioSection = document.createElement('div');
    portfolioSection.id = 'realizace';
    portfolioSection.className = 'py-24 bg-slate-50 relative overflow-hidden';

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

    // Hardcoded záloha
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
        console.warn('Portfolio Sync: Cloud data nedostupná.');
    }

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
                ${p.photos.map(ph => `<img src="${ph.url}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:0.75rem;cursor:pointer;" onclick="window.open('${ph.url}', '_blank')" loading="lazy">`).join('')}
               </div>`
            : '';

        modal.innerHTML = `
            <div class="modal-content" style="max-width:860px;max-height:90vh;overflow-y:auto;">
                <button class="close-modal-btn">&times;</button>
                <div style="padding:2rem;">
                    <img src="${mainPhoto}" alt="${p.title}" style="width:100%;height:320px;object-fit:cover;border-radius:1.25rem;margin-bottom:1.5rem;cursor:zoom-in;" onclick="window.open('${mainPhoto}', '_blank')">
                    
                    <h2 style="font-size:2rem;font-weight:800;color:#1e293b;margin-bottom:0.75rem;">${p.title}</h2>
                    
                    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.5rem;">
                        <span style="background:#fef3c7;color:#92400e;padding:0.4rem 1rem;border-radius:99px;font-size:0.8rem;font-weight:800;text-transform:uppercase;">${p.work_type}</span>
                        ${p.duration ? `<span style="background:#f1f5f9;color:#475569;padding:0.4rem 1rem;border-radius:99px;font-size:0.8rem;font-weight:700;">⏱ ${p.duration}</span>` : ''}
                        ${p.location ? `<span style="background:#f1f5f9;color:#475569;padding:0.4rem 1rem;border-radius:99px;font-size:0.8rem;font-weight:700;">📍 ${p.location}</span>` : ''}
                    </div>
                    
                    ${p.description ? `
                    <div style="background:#f8fafc;padding:2rem;border-radius:1.5rem;margin-bottom:1.5rem;border:1px solid #e2e8f0;">
                        <h4 style="font-size:0.75rem;font-weight:800;color:#94a3b8;text-transform:uppercase;margin-bottom:0.75rem;letter-spacing:0.05em;">Popis realizace</h4>
                        <div style="color:#334155;line-height:1.8;font-size:1rem;">${p.description}</div>
                    </div>` : ''}
                    
                    ${galleryHtml}
                    
                    <div style="margin-top:2.5rem;text-align:center;">
                        <button onclick="document.getElementById('case-study-modal').style.display='none';document.getElementById('ai-chat-launcher').click();"
                            style="width:100%;background:#F59E0B;color:white;border:none;padding:1.5rem;border-radius:1.25rem;font-weight:900;cursor:pointer;font-size:1.1rem;box-shadow:0 10px 30px rgba(245,158,11,0.3);text-transform:uppercase;letter-spacing:0.02em;">
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
                    <div class="portfolio-overlay">
                        <span class="view-btn">Detail projektu</span>
                    </div>
                </div>
                <div class="portfolio-content">
                    <span class="portfolio-tag">${p.work_type || 'Realizace'}</span>
                    <h3 class="portfolio-h3">${p.title}</h3>
                    ${p.location ? `<p style="font-size:0.85rem;color:#64748b;margin-top:0.4rem;display:flex;items-center;gap:0.4rem;">📍 ${p.location}</p>` : ''}
                </div>
            </div>`;
        }).join('');

        portfolioSection.innerHTML = `
            <div class="container mx-auto px-4 mb-16">
                <div class="text-center">
                    <h2 class="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Naše Realizace v detailu</h2>
                    <p class="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">Sledujte, jak vracíme domům jejich původní krásu a lesk.</p>
                </div>
            </div>
            
            <div class="relative max-w-[1600px] mx-auto group">
                <div id="portfolio-scroller" class="portfolio-container-new">
                    <div class="portfolio-track-new">
                        ${generateCards(projectsData)}
                        ${generateCards(projectsData)}
                    </div>
                </div>

                <!-- Navigation Arrows -->
                <button class="portfolio-arrow left" onclick="document.getElementById('portfolio-scroller').scrollLeft -= 500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button class="portfolio-arrow right" onclick="document.getElementById('portfolio-scroller').scrollLeft += 500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
            </div>

            <div style="display:flex;justify-content:center;padding:5rem 0;">
                <button onclick="document.getElementById('ai-chat-launcher').click()"
                    class="inline-flex items-center px-12 py-6 bg-amber-500 text-white font-black rounded-2xl hover:bg-amber-600 transition-all shadow-2xl active:scale-95 uppercase tracking-widest text-sm hover:translate-y-[-2px]">
                    CHCI TAKÉ TAKOVÉ VÝSLEDKY
                    <svg class="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>

            <style>
                .portfolio-container-new {
                    display: flex;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 2rem 0;
                    mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                    -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
                }
                .portfolio-container-new::-webkit-scrollbar { display: none; }
                
                .portfolio-track-new {
                    display: flex;
                    gap: 2.5rem;
                    padding: 0 5%;
                }

                .portfolio-card-modern {
                    flex: 0 0 450px;
                    background: white;
                    border-radius: 2.5rem;
                    overflow: hidden;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 15px 40px -10px rgba(0,0,0,0.05);
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                }

                .portfolio-card-modern:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 25px 60px -15px rgba(0,0,0,0.1);
                    border-color: #f59e0b20;
                }

                .portfolio-img-wrap {
                    height: 320px;
                    overflow: hidden;
                    position: relative;
                }

                .portfolio-img-wrap img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .portfolio-card-modern:hover .portfolio-img-wrap img {
                    transform: scale(1.1);
                }

                .portfolio-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(15,23,42,0.8), transparent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.4s;
                }

                .portfolio-card-modern:hover .portfolio-overlay {
                    opacity: 1;
                }

                .view-btn {
                    background: white;
                    color: #0f172a;
                    padding: 0.8rem 1.5rem;
                    border-radius: 1rem;
                    font-weight: 800;
                    font-size: 0.8rem;
                    text-transform: uppercase;
                    transform: translateY(20px);
                    transition: transform 0.4s;
                }

                .portfolio-card-modern:hover .view-btn {
                    transform: translateY(0);
                }

                .portfolio-content { padding: 2rem; }
                .portfolio-tag {
                    display: inline-block;
                    padding: 0.3rem 0.8rem;
                    background: #fff7ed;
                    color: #f59e0b;
                    border-radius: 0.75rem;
                    font-size: 0.7rem;
                    font-weight: 900;
                    text-transform: uppercase;
                    margin-bottom: 1rem;
                }
                .portfolio-h3 { font-size: 1.4rem; font-weight: 800; color: #0f172a; line-height: 1.3; }

                .portfolio-arrow {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 64px;
                    height: 64px;
                    border-radius: 20px;
                    background: white;
                    color: #0f172a;
                    border: 1px solid #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    z-index: 20;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    transition: all 0.3s;
                    opacity: 0;
                }

                .group:hover .portfolio-arrow { opacity: 1; }
                .portfolio-arrow:hover { background: #f59e0b; color: white; border-color: #f59e0b; transform: translateY(-50%) scale(1.1); }
                .portfolio-arrow.left { left: 2rem; }
                .portfolio-arrow.right { right: 2rem; }

                @media (max-width: 768px) {
                    .portfolio-card-modern { flex: 0 0 320px; border-radius: 1.5rem; }
                    .portfolio-img-wrap { height: 240px; }
                    .portfolio-h3 { font-size: 1.1rem; }
                    .portfolio-arrow { display: none !important; }
                    .portfolio-container-new { mask-image: none; -webkit-mask-image: none; }
                }
            </style>
        `;

        // Autoplay Logic
        const scroller = document.getElementById('portfolio-scroller');
        if (scroller) {
            let autoplayInterval = setInterval(() => {
                if (scroller.scrollLeft >= (scroller.scrollWidth / 2)) {
                    scroller.scrollLeft = 0;
                } else {
                    scroller.scrollLeft += 1;
                }
            }, 30);

            scroller.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
            scroller.addEventListener('mouseleave', () => {
                autoplayInterval = setInterval(() => {
                    if (scroller.scrollLeft >= (scroller.scrollWidth / 2)) {
                        scroller.scrollLeft = 0;
                    } else {
                        scroller.scrollLeft += 1;
                    }
                }, 30);
            });
        }
    };

    render();
};

// Start
injectPortfolio();
window.addEventListener('load', () => setTimeout(injectPortfolio, 1000));
