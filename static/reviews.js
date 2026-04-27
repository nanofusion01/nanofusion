/* NANOfusion — Premium Dark Reviews Scroller + Supabase hydratace */

let reviewsData = [
  { name: 'Ing. Petr Svoboda', info: 'Praha, Čištění střechy', stars: 5, text: 'Hloubkové čištění krytiny a následná nano-ochrana dopadla na jedničku. Střecha vypadá jako nově položená a už se na ní nedrží mech.' },
  { name: 'Jana Novotná', info: 'Brno, Čištění fasády', stars: 5, text: 'Fasáda prokoukla během jediného dne. Kluci byli moc šikovní, vše po sobě uklidili a výsledek je i po roce stále skvělý.' },
  { name: 'Marek Kučera', info: 'Plzeň, Zámková dlažba', stars: 5, text: 'Čištění před firmou dopadlo výborně. Zmizela všechna léta usazená špína a olejové skvrny. Výborná komunikace.' },
  { name: 'Lucie Marešová', info: 'Ostrava, Celková renovace', stars: 5, text: 'Oceňuji rychlost domluvy a zaměření zdarma. Cena byla férová a výsledek předčil naše očekávání. Určitě doporučuji!' },
  { name: 'David Černý', info: 'Liberec, Fotovoltaika', stars: 5, text: 'Nano-ochrana fotovoltaiky nám reálně zvýšila účinnost panelů. Velmi profesionální přístup and čistá práce.' },
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
        <div class="py-24 bg-slate-950 section-reveal">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16 pt-32"> <!-- Offset ONLY the header part -->
                    <h2 class="text-4xl md:text-6xl font-bold text-white mb-6">Co o nás říkají naši klienti</h2>
                    <p class="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed opacity-80">
                        Reference čerpáme z portálu firmy.cz. Spokojenost našich klientů je pro nás prioritou číslo jedna.
                    </p>
                </div>

                <div style="position: relative; width: 100%; max-width: 1300px; margin: 0 auto;">
                    <div id="reviews-scroller" style="display: flex; gap: 1.5rem; overflow-x: auto; scroll-behavior: smooth; padding: 1rem 0 3rem; scrollbar-width: none; mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);">
                        ${reviewsData.map(rev => `
                            <div class="review-card-premium"
                                 style="flex: 0 0 350px; background: #1e293b; border-radius: 1.5rem; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.1); display: flex; flex-direction: column; gap: 1.5rem;">
                                <div style="display: flex; gap: 4px;">
                                    ${Array(rev.stars || 5).fill('<span style="color: #f59e0b; font-size: 1.2rem;">★</span>').join('')}
                                </div>
                                <p style="color: #cbd5e1; font-style: italic; font-size: 1rem; line-height: 1.7; flex-grow: 1;">
                                    "${rev.text}"
                                </p>
                                <div>
                                    <h4 style="color: white; font-weight: 700; font-size: 1.1rem; margin-bottom: 0.25rem;">${rev.name}</h4>
                                    <p style="color: #64748b; font-size: 0.85rem;">${rev.info || 'Ověřený zákazník'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Navigation Arrows -->
                    <button onclick="document.getElementById('reviews-scroller').scrollLeft -= 400"
                        class="review-arrow-btn left-arrow">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <button onclick="document.getElementById('reviews-scroller').scrollLeft += 400"
                        class="review-arrow-btn right-arrow">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
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
                width: 60px;
                height: 60px;
                border-radius: 15px;
                background: #f59e0b;
                border: none;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 10px 30px rgba(245,158,11,0.3);
                z-index: 10;
                transition: all 0.3s ease;
            }
            .review-arrow-btn:hover { background: #d97706; transform: translateY(-50%) scale(1.05); }
            
            .left-arrow { left: -30px; }
            .right-arrow { right: -30px; }

            @media (max-width: 1200px) {
                .left-arrow { left: -10px; }
                .right-arrow { right: -10px; }
            }

            @media (max-width: 768px) {
                .review-card-premium { flex: 0 0 85% !important; padding: 2rem !important; }
                .review-arrow-btn { display: none !important; }
                .pt-32 { padding-top: 3rem !important; }
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
