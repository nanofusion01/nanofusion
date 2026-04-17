/* Infinite Scrolling Reviews for NANOfusion */

const injectReviews = () => {
  const reviewsSection = document.getElementById('reference');
  if (reviewsSection) {
    const reviews = [
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

    const generateCards = (list) => list.map(r => `
      <div class="review-card-modern">
        <div class="review-stars">${'★'.repeat(r.stars)}</div>
        <p class="review-text">"${r.text}"</p>
        <div class="review-author">
          <div class="author-name">${r.name}</div>
          <div class="author-meta">${r.info}</div>
        </div>
      </div>
    `).join('');

    reviewsSection.innerHTML = `
      <div class="container mx-auto px-4 text-center mb-12">
        <h2 class="text-3xl md:text-5xl font-bold text-white mb-4">Co říkají naši zákazníci</h2>
        <p class="text-neutral-400 max-w-2xl mx-auto">Reference čerpáme z portálu firmy.cz. Spokojenost našich klientů je pro nás prioritou číslo jedna.</p>
      </div>
      <div class="reviews-container">
        <div class="reviews-track" id="reviews-track">
          ${generateCards(reviews)}
          ${generateCards(reviews)}
        </div>
      </div>
    `;
    
    return true;
  }
  return false;
};

const initReviews = () => {
  const target = document.getElementById('reference');
  if (target && !target.dataset.injected) {
    if (injectReviews()) {
      target.dataset.injected = 'true';
    }
  }
};

// Start injection with resilience against framework re-renders
const observer = new MutationObserver(() => initReviews());
observer.observe(document.body, { childList: true, subtree: true });

// Initial check
initReviews();

// Final fallback for slow networks/processing
window.addEventListener('load', () => setTimeout(initReviews, 500));

