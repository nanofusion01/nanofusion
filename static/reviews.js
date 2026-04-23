
let reviewsData = [
    { name: 'Ing. Petr Svoboda', info: 'Praha, Čištění střechy', stars: 5, text: 'Hloubkové čištění krytiny a následná nano-ochrana dopadla na jedničku. Střecha vypadá jako nově položená a už se na ní nedrží mech.' },
    { name: 'Jana Novotná', info: 'Brno, Čištění fasády', stars: 5, text: 'Fasáda prokoukla během jediného dne. Kluci byli moc šikovní, vše po sobě uklidili a výsledek je i po roce stále skvělý.' },
    { name: 'Marek Kučera', info: 'Plzeň, Zámková dlažba', stars: 5, text: 'Čištění před firmou dopadlo výborně. Zmizela všechna léta usazená špína a olejové skvrny. Výborná komunikace.' },
    { name: 'Lucie Marešová', info: 'Ostrava, Celková renovace', stars: 5, text: 'Oceňuji rychlost domluvy a zaměření zdarma. Cena byla férová a výsledek předčil naše očekávání. Určitě doporučuji!' },
    { name: 'David Černý', info: 'Liberec, Fotovoltaika', stars: 5, text: 'Nano-ochrana fotovoltaiky nám reálně zvýšila účinnost panelů. Velmi profesionální přístup a čistá práce.' }
];

const injectReviews = () => {
    const reviewsSection = document.getElementById('reference');
    if (!reviewsSection || reviewsSection.dataset.injected === 'true') return false;

    reviewsSection.innerHTML = `
        <div class="py-32 bg-slate-950 section-reveal">
            <div class="container mx-auto px-6">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-5xl font-bold text-white mb-6">Co o nás říkají naši klienti</h2>
                    <p class="text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
                        Reference čerpáme z portálu firmy.cz. Spokojenost našich klientů je pro nás prioritou číslo jedna.
                    </p>
                </div>

            <div style="position: relative; width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 40px;">
                <div id="reviews-scroller" style="display: flex; gap: 1.5rem; overflow-x: auto; scroll-behavior: smooth; padding: 1rem 0 3rem; scrollbar-width: none;">
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

                <!-- Premium Navigation Arrows -->
                <button onclick="document.getElementById('reviews-scroller').scrollLeft -= 400" 
                    style="position: absolute; left: -30px; top: 50%; transform: translateY(-50%); width: 60px; height: 60px; border-radius: 15px; background: #f59e0b; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(245,158,11,0.3); z-index: 10; transition: all 0.3s ease;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                        <path d="M15 18L9 12L15 6" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button onclick="document.getElementById('reviews-scroller').scrollLeft += 400" 
                    style="position: absolute; right: -30px; top: 50%; transform: translateY(-50%); width: 60px; height: 60px; border-radius: 15px; background: #f59e0b; border: none; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(245,158,11,0.3); z-index: 10; transition: all 0.3s ease;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                        <path d="M9 18L15 12L9 6" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
        <style>
            #reviews-scroller::-webkit-scrollbar { display: none; }
            @media (max-width: 768px) {
                .review-card-premium { flex: 0 0 85% !important; padding: 2rem !important; }
            }
        </style>
    `;
    reviewsSection.dataset.injected = 'true';
    return true;
};

const hydrateReviews = async () => {
    try {
        const { supabase } = await import('./supabase-config.js');
        // Fetch from 'external_reviews' table (synced from Firmy.cz or manual)
        const { data, error } = await supabase.from('external_reviews').select('*').eq('approved', true);
        
        if (!error && data && data.length > 0) {
            console.log('NANOfusion: Reviews synchronized from Cloud');
            reviewsData = data.map(d => ({
                name: d.author || 'Ověřený zákazník',
                info: d.source === 'firmy.cz' ? 'Recenze z Firmy.cz' : (d.source || 'Ověřený zákazník'),
                stars: d.rating || 5,
                text: d.content
            }));
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

// Start
injectReviews();
hydrateReviews();

window.addEventListener('load', () => {
    setTimeout(injectReviews, 500);
    setTimeout(hydrateReviews, 1000);
});
