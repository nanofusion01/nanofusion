/* NANOfusion — Premium Dark Reviews Scroller + Supabase hydratace */

let reviewsData = [
  { name: 'Ing. Petr Svoboda', info: 'Praha, Čištění střechy', stars: 5, text: 'Hloubkové čištění krytiny a následná nano-ochrana dopadla na jedničku. Střecha vypadá jako nově položená a už se na ní nedrží mech.' },
  { name: 'Jana Novotná', info: 'Brno, Čištění fasády', stars: 5, text: 'Fasáda prokoukla během jediného dne. Kluci byli moc šikovní, vše po sobě uklidili a výsledek je i po roce stále skvělý.' },
  { name: 'Marek Kučera', info: 'Plzeň, Zámková dlažba', stars: 5, text: 'Čištění před firmou dopadlo výborně. Zmizela všechna léta usazená špína a olejové skvrny. Výborná komunikace.' },
  { name: 'Lucie Marešová', info: 'Ostrava, Celková renovace', stars: 5, text: 'Oceňuji rychlost domluvy a zaměření zdarma. Cena byla férová a výsledek předčil naše očekávání. Určitě doporučuji!' },
  { name: 'David Černý', info: 'Liberec, Fotovoltaika', stars: 5, text: 'Nano-ochrana fotovoltaiky nám reálně zvýšila účinnost panelů. Velmi profesionální přístup a čistá práce.' },
  { name: 'Eva Králová', info: 'Hradec Králové, Čištění střechy', stars: 5, text: 'Skvělý výsledek. Po práci po sobě vše uklidili, dům vypadá skvěle a sousedi se už ptají na kontakt. Děkujeme!' },
  { name: 'Martin Horák', info: 'Pardubice, Fasáda', stars: 5, text: 'Efekt nano-ochrany je neskutečný. Voda z fasády prostě stéká a fasáda se sama omývá deštěm. Úžasná technologie.' },
  { name: 'Pavel Holub', info: 'České Budějovice, Terasa', stars: 5, text: 'Neskutečný rozdíl před a po. Terasa vypadá jako nově postavená a impregnace funguje skvěle.' },
  { name: 'Kateřina Šťastná', info: 'Zlín, Fasáda', stars: 5, text: 'Rychlost, profesionalita a čistota. Rozhodně doporučuji všem, kdo chtějí mít dům jako nový.' },
  { name: 'Jiří Procházka', info: 'Kladno, Střecha', stars: 5, text: 'Skvělá domluva, férová cena. Střecha po čištění vypadá perfektně a mech už nemá šanci.' },
];

const injectReviews = () => {
    const reviewsSection = document.getElementById('reference');
    if (!reviewsSection || reviewsSection.dataset.injected === 'true') return false;

    reviewsSection.innerHTML = `
        <div class="py-40 bg-slate-950 section-reveal">
            <div class="container mx-auto px-6">
                <div class="text-center mb-20">
                    <h2 class="text-4xl md:text-6xl font-bold text-white mb-8">Co o nás říkají naši klienti</h2>
                    <p class="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed opacity-80">
                        Reference čerpáme z portálu firmy.cz. Spokojenost našich klientů je pro nás prioritou číslo jedna.
                    </p>
                </div>

                <div style="position: relative; width: 100%; max-width: 1300px; margin: 0 auto;">
                    <div id="reviews-scroller" style="display: flex; gap: 2.5rem; overflow-x: auto; scroll-behavior: smooth; padding: 2rem 0 4rem; scrollbar-width: none; mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);">
                        ${reviewsData.map(rev => `
                            <div class="review-card-premium"
                                 style="flex: 0 0 400px; background: #1e293b; border-radius: 2rem; padding: 3rem; box-shadow: 0 25px 50px rgba(0,0,0,0.2); display: flex; flex-direction: column; gap: 2rem; border: 1px solid rgba(255,255,255,0.05); transition: transform 0.3s ease;">
                                <div style="display: flex; gap: 6px;">
                                    ${Array(rev.stars || 5).fill('<span style="color: #f59e0b; font-size: 1.4rem;">★</span>').join('')}
                                </div>
                                <p style="color: #cbd5e1; font-style: italic; font-size: 1.1rem; line-height: 1.8; flex-grow: 1;">
                                    "${rev.text}"
                                </p>
                                <div style="border-top: 1px solid rgba(255,255,255,0.1); pt-6; margin-top: 1rem; padding-top: 1.5rem;">
                                    <h4 style="color: white; font-weight: 800; font-size: 1.2rem; margin-bottom: 0.4rem;">${rev.name}</h4>
                                    <p style="color: #64748b; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${rev.info || 'Ověřený zákazník'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Premium Navigation Arrows - Repositioned to be outside on large screens -->
                    <button onclick="document.getElementById('reviews-scroller').scrollLeft -= 450"
                        class="review-arrow-btn left-arrow">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button onclick="document.getElementById('reviews-scroller').scrollLeft += 450"
                        class="review-arrow-btn right-arrow">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <style>
            #reviews-scroller::-webkit-scrollbar { display: none; }
            .review-arrow-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 70px;
                height: 70px;
                border-radius: 22px;
                background: #f59e0b;
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 15px 35px rgba(245,158,11,0.35);
                z-index: 20;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .review-arrow-btn:hover {
                background: #d97706;
                transform: translateY(-50%) scale(1.1);
                box-shadow: 0 20px 45px rgba(245,158,11,0.45);
            }
            .review-arrow-btn:active { transform: translateY(-50%) scale(0.95); }
            
            .left-arrow { left: -90px; }
            .right-arrow { right: -90px; }

            .review-card-premium:hover {
                transform: translateY(-10px);
                border-color: rgba(245,158,11,0.3);
            }

            @media (max-width: 1450px) {
                .left-arrow { left: -40px; }
                .right-arrow { right: -40px; }
            }

            @media (max-width: 1200px) {
                .review-arrow-btn { width: 56px; height: 56px; border-radius: 16px; }
                .left-arrow { left: -20px; }
                .right-arrow { right: -20px; }
            }

            @media (max-width: 768px) {
                .review-card-premium { flex: 0 0 85% !important; padding: 2rem !important; }
                .review-arrow-btn { display: none !important; }
                #reviews-scroller { mask-image: none; -webkit-mask-image: none; padding: 1rem 0 2rem; }
                .py-40 { padding-top: 5rem; padding-bottom: 5rem; }
            }
        </style>
    `;
    reviewsSection.dataset.injected = 'true';
    return true;
};

const hydrateReviews = async () => {
    try {
        const { supabase } = await import('./supabase-config.js');
        let data, error;
        ({ data, error } = await supabase.from('external_reviews').select('*').eq('approved', true));
        if (error || !data || data.length === 0) {
            ({ data, error } = await supabase.from('reviews').select('*').eq('is_approved', true));
        }
        if (!error && data && data.length > 0) {
            reviewsData = data.map(d => ({
                name: d.author || d.name || 'Zákazník',
                info: d.location || d.city
                    ? `${d.city || ''}, ${d.service || d.source || 'firmy.cz'}`.trim().replace(/^,\s*/, '')
                    : (d.source === 'firmy.cz' ? 'Ověřeno na Firmy.cz' : (d.source === 'manual' ? 'Přímá zpětná vazba' : 'Ověřený zákazník')),
                stars: d.rating || d.stars || 5,
                text: d.content || d.text || ''
            })).filter(r => r.text);
            const target = document.getElementById('reference');
            if (target) {
                target.dataset.injected = 'false';
                injectReviews();
            }
        }
    } catch (e) {
        console.error('Reviews Sync Error:', e);
    }
};

const initReviews = () => {
    if (injectReviews()) {
        hydrateReviews();
        return;
    }
    const observer = new MutationObserver(() => {
        if (injectReviews()) {
            observer.disconnect();
            hydrateReviews();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); injectReviews(); hydrateReviews(); }, 5000);
};

initReviews();
