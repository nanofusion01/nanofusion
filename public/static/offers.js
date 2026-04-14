/* Clean Interactivity for NANOfusion Services - Extended */

const servicesData = [
  {
    id: 'facade', title: 'Čištění fasád', tag: 'Prémiová ochrana',
    detail: 'Hloubkové odstranění řas, plísní a atmosférických nečistot. Nano-ochrana se zárukou až 10 let.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
    afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
    involves: 'Proces zahrnuje aplikaci speciálního přípravku na odstranění organických nečistot, následné nanesení aktivní pěny, oplach studenou vodou pod nízkým tlakem, chemické ošetření povrchu a závěrečnou impregnaci, která fasádu chrání před vlhkostí a nečistotami.',
    faq: [
      { q: 'Proč investovat do čištění a impregnace fasády?', a: 'Čištění a impregnace zlepší estetický vzhled domu a prodlouží životnost fasády. Vyhnete se nákladným opravám způsobeným plísněmi, řasami nebo vlhkostí.' },
      { q: 'Jaké metody používáte?', a: 'Používáme nízkotlaké čištění a speciální čisticí prostředky přizpůsobené typu fasády. Na omítkové fasády nikdy nepoužíváme horkou vodu!' },
      { q: 'Je impregnace nutná?', a: 'Ano. Po vyčištění je povrch zranitelný. Impregnace vytvoří neviditelnou vrstvu odpuzující vodu a snižující přilnavost nečistot.' },
      { q: 'Jak dlouho vydrží impregnace?', a: 'Účinek se pohybuje kolem 5–10 let v závislosti na typu fasády a povětrnostních podmínkách.' },
      { q: 'Jaké typy fasád čistíte?', a: 'Čistíme téměř všechny typy – omítky, zateplovací systémy, cihlové i kamenné povrchy.' },
      { q: 'Je to bezpečné pro okolní prostředí?', a: 'Ano, používáme ekologicky nezávadné prostředky. Okolní keře a rostliny zakrýváme.' },
      { q: 'Jak dlouho trvá realizace?', a: 'Rodinný dům (250 m²) cca 2 dny. Bytový dům (2 500 m²) cca 4–5 dní. Závisí na počasí.' },
      { q: 'Mohu službu využít v zimě?', a: 'V zimě fasády nečistíme. Ideální sezóna je od jara do podzimu.' }
    ]
  },
  {
    id: 'roof', title: 'Čištění střech', tag: 'Prodloužení životnosti',
    detail: 'Kompletní renovace krytiny a hydrofobní nátěr, který chrání před mechem a degradací.',
    image: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
    afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
    involves: 'Šetrné čištění střešní krytiny od mechů, lišejníků a nečistot. Po vyčištění následuje sanace a aplikace nano impregnace, která chrání střechu až na 7 let.',
    faq: [
      { q: 'Poškodí čištění moji střechu?', a: 'Ne. Používáme šetrné metody s regulovaným tlakem, které krytinu nepoškodí.' },
      { q: 'Jak často je potřeba střechu čistit?', a: 'Doporučujeme cca každých 5–7 let v závislosti na lokalitě a typu krytiny.' },
      { q: 'Čistíte i okapy?', a: 'Ano, čištění okapů je součástí naší služby.' },
      { q: 'Jakou impregnaci používáte?', a: 'Používáme špičkovou nano impregnaci s ochranou až na 7 let.' }
    ]
  },
  {
    id: 'pavement', title: 'Čištění dlažeb', tag: 'Vzhled nového povrchu',
    detail: 'Odstranění mechů, mastnoty i zašlé špíny. Po vyčištění ošetřujeme impregnací nebo oživovacími nátěry.',
    image: 'https://images.unsplash.com/photo-1590076214667-c0f33b98c442?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
    afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
    involves: 'Hloubkové čištění dlažby pomocí chemie a tlakové vody. Následuje sanace proti mechům a lišejníkům a aplikace hydrofobní impregnace nebo oživovacího nátěru.',
    faq: [
      { q: 'Čistíte i zámkovou dlažbu?', a: 'Ano, specializujeme se na zámkovou dlažbu, betonové plochy i přírodní kámen.' },
      { q: 'Doplníte písek do spár?', a: 'Ano, doplnění písku do spár je volitelná služba za 40 Kč/m².' },
      { q: 'Jaký je minimální rozsah zakázky?', a: 'Minimální výjezdový paušál je 20 000 Kč bez DPH.' }
    ]
  },
  {
    id: 'pv', title: 'Solární panely', tag: 'Vyšší účinnost',
    detail: 'Profesionální čištění solárních panelů pomocí šetrných kartáčů a demineralizované vody. Keramická nano ochrana.',
    image: 'https://images.unsplash.com/photo-1509391366360-fe5bb6583166?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
    afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
    involves: 'Čištění pomocí demineralizované vody a speciálních kartáčů, které nepoškrábeú povrch panelů. Následná aplikace keramické nano ochrany pro samočistící efekt.',
    faq: [
      { q: 'Zvýší čištění výkon panelů?', a: 'Ano, znečištěné panely mohou ztrácet až 25 % výkonu. Po vyčištění se výkon vrátí na optimální úroveň.' },
      { q: 'Jak často čistit panely?', a: 'Doporučujeme čištění 1–2× ročně v závislosti na okolním prostředí.' }
    ]
  },
  {
    id: 'graffiti', title: 'Odstranění graffiti', tag: 'Rychlá pomoc',
    detail: 'Šetrné odstranění nápisů z různých povrchů. Aplikace vysoce účinných antigraffiti nátěrů s dlouhou životností.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
    afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
    involves: 'Odstraňujeme graffiti z betonu, fasád, pískovce, cihel, vagonů a dalších povrchů. Po odstranění aplikujeme antigraffiti nátěr s dlouhou životností.',
    faq: [
      { q: 'Z jakých povrchů odstraňujete graffiti?', a: 'Z betonu, fasád, pískovce, cihel, vagonů i dalších povrchů.' },
      { q: 'Co je antigraffiti nátěr?', a: 'Ochranný nátěr, díky kterému lze budoucí graffiti snadno smýt bez poškození povrchu.' }
    ]
  },
  {
    id: 'industrial', title: 'Průmyslové čištění', tag: 'B2B řešení',
    detail: 'Čištění průmyslových hal od podlahy ke stropu. Práce i za provozu. Technologické rozvody a konstrukce. Likvidace odpadu.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
    afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
    involves: 'Komplexní čištění průmyslových objektů včetně podlah, stěn, stropů, technologických rozvodů a konstrukcí. Schopni pracovat i za plného provozu.',
    faq: [
      { q: 'Můžete čistit za provozu?', a: 'Ano, jsme schopni provádět práce i za plného provozu závodu.' },
      { q: 'Likvidujete odpad?', a: 'Ano, likvidaci veškerého odpadu zajistíme.' }
    ]
  },
  // --- Nátěry a další služby (heslovitě) ---
  {
    id: 'facade-paint', title: 'Nátěry fasád', tag: 'Nový vzhled',
    detail: 'Ve spolupráci s firmou Caparol nabízíme nátěry fasád té nejvyšší kvality. Zdravá a čistá fasáda se zárukou až 12 let.',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
    afterImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
    involves: 'Profesionální nátěry fasád prémiovou barvou Caparol. Čistá fasáda bez plísní, řas a ztráty pigmentu.',
    isBulletStyle: true,
    bulletPoints: [
      'Prémiové barvy Caparol',
      'Záruka pigmentu až 12 let',
      'Ochrana proti plísním a řasám',
      'Čištění fasády před nátěrem v ceně',
      'Vhodné pro rodinné i bytové domy'
    ],
    faq: []
  },
  {
    id: 'roof-paint', title: 'Nátěry střech', tag: 'Dlouhá životnost',
    detail: 'Nátěry všech druhů střech pomocí vysoce kvalitních dvousložkových barev se samočistícím efektem. Životnost 20 let!',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=600',
    afterImg: 'https://images.unsplash.com/photo-1628033034914-74977460af25?w=600',
    involves: 'Dvousložkové barvy se samočisticím efektem, životnost uváděná výrobcem až 20 let.',
    isBulletStyle: true,
    bulletPoints: [
      'Dvousložkové barvy nejvyšší kvality',
      'Samočistící efekt',
      'Životnost až 20 let',
      'Všechny druhy střešních krytin',
      'Čištění střechy před nátěrem v ceně'
    ],
    faq: []
  },
  {
    id: 'impregnation', title: 'Nano impregnace', tag: 'Ochrana povrchů',
    detail: 'Inovativní technologie chrání a prodlužují životnost ošetřených materiálů.',
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
    afterImg: 'https://images.unsplash.com/photo-1520004434532-668416a08753?w=600',
    involves: 'Aplikace hydrofobní nano impregnace na různé povrchy pro dlouhodobou ochranu proti vlhkosti a nečistotám.',
    isBulletStyle: true,
    bulletPoints: [
      'Hydrofobní ochrana povrchů',
      'Prodloužení životnosti materiálů',
      'Odpuzuje vodu a nečistoty',
      'Ochrana až 10 let',
      'Vhodné pro fasády, střechy, dlažby'
    ],
    faq: []
  },
  {
    id: 'antislip', title: 'Protiskluzová úprava', tag: 'Bezpečnost',
    detail: 'Protiskluzová úprava pro mokré povrchy. Funguje na keramice, žule, mramoru, terasu, linoleu a PVC.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1596431940026-c75086d7734a?w=600',
    afterImg: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
    involves: 'Aplikace protiskluzové úpravy na mokré povrchy – bazény, chodby, koupelny, obchodní centra.',
    isBulletStyle: true,
    bulletPoints: [
      'Keramika, žula, mramor, teraso',
      'Nově i linoleum a PVC',
      'Bazény a wellness centra',
      'Koupelny a chodby',
      'Bez změny vzhledu povrchu'
    ],
    faq: []
  },
  {
    id: 'ceramfloor', title: 'IG CeramFloor', tag: 'Průmyslová ochrana',
    detail: 'Vysoce účinná polymerní ochrana podlah s protiskluzovým efektem. Odolnost i v extrémních průmyslových podmínkách.',
    image: 'https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
    afterImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600',
    involves: 'Polymerní ochrana průmyslových podlah s protiskluzovým efektem. Lepší než epoxid či polyuretany.',
    isBulletStyle: true,
    bulletPoints: [
      'Lepší než epoxid a polyuretany',
      'Plně zatížitelná po 24 hodinách',
      'Odolnost proti chemickým látkám',
      'Výrovní závody a logistická centra',
      'Potravinářské provozy a zemědělství',
      'Vyrobeno v ČR'
    ],
    faq: []
  },
  {
    id: 'antibac', title: 'Antibakteriální ochrana', tag: 'Hygiena',
    detail: 'Antibakteriální a antivirová ochrana povrchů s účinností až 120 dní.',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    beforeImg: 'https://images.unsplash.com/photo-1584622781564-1d9876a3e601?w=600',
    afterImg: 'https://images.unsplash.com/photo-1581092916357-5896ebc48073?w=600',
    involves: 'Aplikace IMPAGUARD GCA – antibakteriální a antivirová ochrana povrchů s účinností až 120 dní.',
    isBulletStyle: true,
    bulletPoints: [
      'Účinnost až 120 dní',
      'Antibakteriální i antivirová ochrana',
      'Zdravotnická zařízení',
      'Kanceláře a veřejné prostory',
      'Školy a školky'
    ],
    faq: []
  }
];

const openServiceModal = (data) => {
  let modal = document.getElementById('service-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'service-modal-overlay';
    document.body.appendChild(modal);
  }

  // Build Before/After section
  const beforeAfterHtml = (data.beforeImg && data.afterImg) ? `
    <div class="before-after-section" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
      <h4 style="font-size: 0.875rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 1rem; letter-spacing: 0.05em;">📷 Před a po</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
        <div style="position: relative; border-radius: 1rem; overflow: hidden; border: 2px solid #fee2e2;">
          <img src="${data.beforeImg}" alt="Před" style="width: 100%; height: 140px; object-fit: cover;" onerror="this.parentElement.style.display='none'">
          <span style="position: absolute; bottom: 0.5rem; left: 0.5rem; background: #ef4444; color: white; padding: 0.15rem 0.5rem; border-radius: 99px; font-size: 0.7rem; font-weight: 800;">PŘED</span>
        </div>
        <div style="position: relative; border-radius: 1rem; overflow: hidden; border: 2px solid #bbf7d0;">
          <img src="${data.afterImg}" alt="Po" style="width: 100%; height: 140px; object-fit: cover;" onerror="this.parentElement.style.display='none'">
          <span style="position: absolute; bottom: 0.5rem; left: 0.5rem; background: #22c55e; color: white; padding: 0.15rem 0.5rem; border-radius: 99px; font-size: 0.7rem; font-weight: 800;">PO</span>
        </div>
      </div>
    </div>
  ` : '';

  // Build "Co to obnáší" section
  const involvesHtml = data.involves ? `
    <div style="margin-top: 1.25rem; padding: 1.25rem; background: #f0f9ff; border-radius: 1rem; border: 1px solid #e0f2fe;">
      <h4 style="font-size: 0.813rem; font-weight: 800; text-transform: uppercase; color: #0369a1; margin-bottom: 0.5rem; letter-spacing: 0.05em;">📋 Co to obnáší?</h4>
      <p style="color: #334155; font-size: 0.875rem; line-height: 1.6; margin: 0;">${data.involves}</p>
    </div>
  ` : '';

  // Build Bullet Points section (for coating/secondary services)
  const bulletHtml = (data.isBulletStyle && data.bulletPoints) ? `
    <div style="margin-top: 1rem;">
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${data.bulletPoints.map(bp => `
          <li style="display: flex; align-items: center; gap: 0.5rem; color: #1e293b; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.875rem;">
            <span style="color: #F59E0B; font-size: 0.75rem;">●</span> ${bp}
          </li>
        `).join('')}
      </ul>
    </div>
  ` : `
    <ul style="list-style: none; padding: 0; margin-top: 1rem;">
      <li style="display: flex; align-items: center; gap: 0.75rem; color: #1e293b; margin-bottom: 0.5rem; font-weight: 600;"> <span style="color: #F59E0B;">✓</span> Certifikovaná technologie </li>
      <li style="display: flex; align-items: center; gap: 0.75rem; color: #1e293b; margin-bottom: 0.5rem; font-weight: 600;"> <span style="color: #F59E0B;">✓</span> Záruka až 10 let </li>
      <li style="display: flex; align-items: center; gap: 0.75rem; color: #1e293b; font-weight: 600;"> <span style="color: #F59E0B;">✓</span> Zaměření zdarma </li>
    </ul>
  `;

  // Build FAQ section
  const faqHtml = (data.faq && data.faq.length > 0) ? `
    <div class="service-faq-section" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
      <h4 style="font-size: 0.875rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 1rem; letter-spacing: 0.05em;">❓ Často kladené otázky</h4>
      <div class="faq-accordion" style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${data.faq.map((item, idx) => `
          <div class="faq-item" style="border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden;">
            <button class="faq-toggle" data-idx="${idx}" style="width: 100%; text-align: left; padding: 0.875rem 1rem; background: #fafafa; border: none; cursor: pointer; font-weight: 600; font-size: 0.813rem; color: #1e293b; display: flex; justify-content: space-between; align-items: center;">
              <span>${item.q}</span>
              <span class="faq-arrow" style="transform: rotate(0deg); transition: transform 0.2s; font-size: 0.75rem; color: #94a3b8;">▼</span>
            </button>
            <div class="faq-answer" style="display: none; padding: 0.75rem 1rem; background: white; font-size: 0.813rem; color: #475569; line-height: 1.6;">
              ${item.a}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal-btn">&times;</button>
      <div class="modal-grid">
        <div class="modal-info-pane" style="overflow-y: auto; max-height: 90vh;">
          <div id="modal-image" class="service-image-header" style="background-image: url('${data.image}')">
            <div class="service-image-overlay"></div>
          </div>
          <div style="padding: 2.5rem; padding-top: 0;">
            <span class="service-tag" style="position: relative; z-index: 5; margin-top: -1rem; background: #FEF3C7; color: #F59E0B; padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 700; display: inline-block;">${data.tag}</span>
            <h3 class="modal-service-title">${data.title}</h3>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 0.5rem;">${data.detail}</p>
            ${involvesHtml}
            ${bulletHtml}
            ${beforeAfterHtml}
            ${faqHtml}
          </div>
        </div>
        <div class="modal-calc-pane" style="background: #f8fafc; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem;">
          <div style="background: white; padding: 1.5rem; border-radius: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; width: 100%; max-width: 360px;">
            <div style="width: 48px; height: 48px; background: #F59E0B; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);">
               <svg fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 24px; height: 24px;">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
               </svg>
            </div>
            <h4 style="font-size: 1.25rem; font-weight: 800; color: #1e293b; margin-bottom: 0.5rem;">Cena a termín</h4>
            <p style="color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; font-size: 0.875rem;">Náš Nano-asistent vám ihned propočítá orientační cenu pro váš objekt.</p>
            <button onclick="document.getElementById('service-modal-overlay').style.display='none'; setTimeout(() => document.getElementById('ai-chat-launcher').click(), 300);" class="calc-cta" style="width: 100%; padding: 1rem; border-radius: 0.75rem; border: none; font-weight: 800; cursor: pointer; background: #F59E0B; color: white; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 1rem;">
               Mluvit s asistentem <span style="font-size: 1.125rem;">→</span>
            </button>
            <p style="margin-top: 1rem; font-size: 0.688rem; color: #94a3b8; font-weight: 600;">Odpovídá okamžitě 24/7</p>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  modal.dataset.activeId = data.id;

  // Event Listeners
  modal.querySelector('.close-modal-btn').onclick = () => modal.style.display = 'none';
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  // FAQ accordion toggle
  modal.querySelectorAll('.faq-toggle').forEach(btn => {
    btn.onclick = () => {
      const answer = btn.nextElementSibling;
      const arrow = btn.querySelector('.faq-arrow');
      const isOpen = answer.style.display === 'block';
      // Close all other answers
      modal.querySelectorAll('.faq-answer').forEach(a => a.style.display = 'none');
      modal.querySelectorAll('.faq-arrow').forEach(a => a.style.transform = 'rotate(0deg)');
      if (!isOpen) {
        answer.style.display = 'block';
        arrow.style.transform = 'rotate(180deg)';
      }
    };
  });

  // Calculator logic
  document.getElementById('m-reveal').onclick = () => {
    const name = document.getElementById('m-name').value;
    const phone = document.getElementById('m-phone').value;
    const area = parseInt(document.getElementById('m-area').value) || 0;
    if (!name || !phone) return alert('Prosím vyplňte jméno a telefon.');

    const prices = {
      roof: 190, facade: 150, pavement: 120, pv: 80, graffiti: 250, industrial: 130,
      'facade-paint': 200, 'roof-paint': 180, impregnation: 70, antislip: 120, ceramfloor: 250, antibac: 80
    };
    const base = (prices[data.id] || 150) * area;
    const min = Math.round(base * 1.05 / 10) * 10;
    const max = Math.round(base * 1.15 / 10) * 10;

    document.getElementById('m-price').innerText = `${min.toLocaleString('cs-CZ')} – ${max.toLocaleString('cs-CZ')} Kč`;
    document.getElementById('m-price').style.color = '#F59E0B';
    document.getElementById('m-form').style.display = 'none';
    document.getElementById('m-result').style.display = 'block';

    // Save lead
    const leads = JSON.parse(localStorage.getItem('nanofusion_leads') || '[]');
    leads.unshift({ id: Date.now(), date: new Date().toLocaleString('cs-CZ'), name, phone, service: data.title, source: 'Modal' });
    localStorage.setItem('nanofusion_leads', JSON.stringify(leads));
  };
};

// Injection logic for supplemental services
document.addEventListener('DOMContentLoaded', () => {
  const injectSupplementalServices = () => {
    const serviceGrid = document.querySelector('#sluzby .grid');
    if (!serviceGrid) return;

    // We only want to inject services that are NOT already in the main React grid
    // Based on inspection, we add the ones from id 61 ('graffiti') and onwards
    const supplemental = servicesData.slice(4); // Industrial, Graffiti, Paints, etc.

    supplemental.forEach(service => {
      // Check if already exists by checking text content (simple heuristic)
      if (serviceGrid.innerText.includes(service.title)) return;

      const card = document.createElement('div');
      card.className = 'group relative bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in';
      card.innerHTML = `
        <div class="aspect-[16/9] overflow-hidden">
          <img src="${service.image}" alt="${service.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
        </div>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase tracking-wider">${service.tag}</span>
          </div>
          <h3 class="text-xl font-bold mb-2">${service.title}</h3>
          <p class="text-muted-foreground text-sm line-clamp-2">${service.detail}</p>
          <div class="mt-4 flex items-center text-primary font-bold text-sm">
            Zjistit více <span class="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      `;
      card.onclick = () => openServiceModal(service);
      serviceGrid.appendChild(card);
    });
  };

  // Run with delay to ensure React has finished rendering the initial grid
  setTimeout(injectSupplementalServices, 1500);
});

// Interceptor with improved matching
document.addEventListener('click', (e) => {
  const card = e.target.closest('.group.relative.bg-card, .bg-white, .bg-card, [class*="rounded"]');
  const serviceSection = document.getElementById('sluzby');

  if (card && serviceSection?.contains(card)) {
    // If it's a dynamic card we just added, it already has an onclick, but we can verify here too
    if (e.defaultPrevented) return;

    const heading = card.querySelector('h3, h4, [class*="font-bold"], [class*="font-semibold"]');
    const headingText = (heading ? heading.innerText : card.innerText).toLowerCase().trim();

    const detectedData = servicesData.find(s => {
      const titleLower = s.title.toLowerCase();
      return headingText.includes(titleLower) || titleLower.includes(headingText);
    });

    if (detectedData) {
      e.preventDefault();
      e.stopPropagation();
      openServiceModal(detectedData);
    }
  }
}, true);
