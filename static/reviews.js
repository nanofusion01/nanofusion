/* Infinite Scrolling Reviews for NANOfusion */

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
  { name: 'Barbora Veselá', info: 'Teplice, Dlažba', stars: 5, text: 'Konečně zmizel plevel i mech z chodníku. Pěkná práce a velmi příjemní pracovníci.' },
  { name: 'Tomáš Beránek', info: 'Jihlava, Fotovoltaika', stars: 5, text: 'Panely jsou opět čisté a vyrábějí víc energie než v minulém roce. Velmi se to vyplatilo.' },
  { name: 'Alena Tichá', info: 'Karlovy Vary, Fasáda', stars: 5, text: 'Děkuji za profesionální přístup. Dům doslova svítí novotou a sousedé nás zastavují a ptají se.' },
  { name: 'Petr Kříž', info: 'Most, Industriální hala', stars: 5, text: 'Velký projekt v průmyslovém areálu, ale zvládli to skvěle, v termínu a bezpečně.' },
  { name: 'Veronika Bílá', info: 'Benešov, Graffiti', stars: 5, text: 'Rychlé odstranění čmáranic z fasády. Anti-graffiti nátěr funguje, další pokus o graffiti šel smýt vodou.' }
];

const injectReviews = () => {
    const reviewsSection = document.getElementById('reference');
    if (!reviewsSection || reviewsSection.dataset.injected === 'true') return false;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6';
    
    reviewsData.forEach(review => {
        const card = document.createElement('div');
        card.className = 'bg-white p-6 rounded-2xl shadow-sm border border-slate-100';
        card.innerHTML = `
            <div class="flex gap-1 mb-2">
                ${Array(review.stars).fill('<span class="text-amber-500">★</span>').join('')}
            </div>
            <p class="text-slate-600 text-sm italic mb-4">"${review.text}"</p>
            <div>
                <p class="font-bold text-slate-800 text-sm">${review.name}</p>
                <p class="text-slate-400 text-xs">${review.info}</p>
            </div>
        `;
        wrapper.appendChild(card);
    });

    reviewsSection.innerHTML = '';
    reviewsSection.appendChild(wrapper);
    reviewsSection.dataset.injected = 'true';
    return true;
};

const hydrateReviews = async () => {
    try {
        const { supabase } = await import('./supabase-config.js');
        const { data, error } = await supabase.from('external_reviews').select('*').eq('approved', true);
        if (!error && data && data.length > 0) {
            console.log('Hydrating reviews from Cloud...');
            reviewsData = data.map(d => ({
                name: d.author,
                info: `${d.city || 'Česko'}, ${d.service || 'Služba'}`,
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
        console.error('Hydrate error:', e);
    }
};

const initReviews = () => {
    injectReviews();
};

// Initial run
initReviews();
hydrateReviews();

// Fallback for late hydration
window.addEventListener('load', () => {
    setTimeout(initReviews, 500);
    setTimeout(hydrateReviews, 1000);
});
