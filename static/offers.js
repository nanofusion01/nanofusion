/* Clean Interactivity for NANOfusion Services */

const servicesData = [
  { id: 'facade', title: 'Čištění fasád', tag: 'Prémiová ochrana', detail: 'Hloubkové odstranění řas, plísní a atmosférických nečistot. Nano-ochrana se zárukou až 10 let.', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' },
  { id: 'roof', title: 'Čištění střech', tag: 'Prodloužení životnosti', detail: 'Kompletní renovace krytiny a hydrofobní nátěr, který chrání před mechem a degradací.', image: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800' },
  { id: 'pavement', title: 'Čištění dlažeb', tag: 'Vzhled nového povrchu', detail: 'Odstranění skvrn a plevele vysokým tlakem. Impregnace proti vsakování nečistot.', image: 'https://images.unsplash.com/photo-1590076214667-c0f33b98c442?w=800' },
  { id: 'pv', title: 'Solární panely', tag: 'Vyšší účinnost', detail: 'Čištění demineralizovanou vodou a nano-vrstva pro samočistící efekt a vyšší výkon.', image: 'https://images.unsplash.com/photo-1509391366360-fe5bb6583166?w=800' },
  { id: 'graffiti', title: 'Odstranění graffiti', tag: 'Rychlá pomoc', detail: 'Šetrné odstranění nápisů a aplikace anti-graffiti nátěru pro budoucí ochranu.', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' },
  { id: 'industrial', title: 'Průmyslové čištění', tag: 'B2B řešení', detail: 'Čištění hal a konstrukcí ve výškách. Splňujeme veškeré bezpečnostní a hygienické normy.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800' }
];

const openServiceModal = (data) => {
  let modal = document.getElementById('service-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'service-modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal-btn">&times;</button>
      <div class="modal-grid">
        <div class="modal-info-pane">
          <div id="modal-image" class="service-image-header" style="background-image: url('${data.image}')">
            <div class="service-image-overlay"></div>
          </div>
          <div style="padding: 2.5rem; padding-top: 0;">
            <span class="service-tag" style="position: relative; z-index: 5; margin-top: -1rem; background: #FEF3C7; color: #F59E0B; padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 700; display: inline-block;">${data.tag}</span>
            <h3 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 1rem 0;">${data.title}</h3>
            <p style="color: #475569; line-height: 1.6; margin-bottom: 1.5rem;">${data.detail}</p>
            <ul style="list-style: none; padding: 0;">
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #1e293b; margin-bottom: 0.5rem; font-weight: 600;"> <span style="color: #F59E0B;">✓</span> Certifikovaná technologie </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #1e293b; margin-bottom: 0.5rem; font-weight: 600;"> <span style="color: #F59E0B;">✓</span> Záruka až 10 let </li>
              <li style="display: flex; align-items: center; gap: 0.75rem; color: #1e293b; font-weight: 600;"> <span style="color: #F59E0B;">✓</span> Zaměření zdarma </li>
            </ul>
          </div>
        </div>
        <div class="modal-calc-pane">
          <h4 style="font-size: 1.125rem; font-weight: 700; color: #1e293b; margin-bottom: 0.5rem; text-transform: uppercase;">Kalkulátor ceny</h4>
          <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 2rem;">Získejte okamžitý odhad ceny.</p>
          <div id="m-form">
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 0.75rem; font-weight: 700; color: #94a3b8; margin-bottom: 0.5rem;">PLOCHA (m²)</label>
              <div style="position: relative;">
                <input id="m-area" type="number" value="100" style="width: 100%; padding: 1rem; border: 2px solid #e2e8f0; border-radius: 1rem; font-size: 1.25rem; font-weight: 700;">
                <span style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); font-weight: 700; color: #94a3b8;">m²</span>
              </div>
            </div>
            <input id="m-name" type="text" placeholder="Vaše jméno" style="width: 100%; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 1rem; margin-bottom: 0.75rem;">
            <input id="m-phone" type="tel" placeholder="Telefon" style="width: 100%; padding: 0.875rem; border: 2px solid #e2e8f0; border-radius: 1rem; margin-bottom: 1.5rem;">
            <button id="m-reveal" class="calc-cta" style="width: 100%; padding: 1.25rem; border-radius: 1rem; border: none; font-weight: 800; cursor: pointer; background: #F59E0B; color: white;">ZOBRAZIT CENU</button>
          </div>
          <div id="m-result" style="display: none; text-align: center; padding-top: 2rem;">
            <span style="font-size: 0.875rem; color: #64748b;">Orientační cena:</span>
            <div id="m-price" style="font-size: 2.5rem; font-weight: 900; color: #F59E0B; margin: 1rem 0;">0 Kč</div>
            <div style="padding: 1rem; background: #FEF3C7; border-radius: 1rem; color: #92400E; font-size: 0.813rem; font-weight: 600;">✓ Poptávka odeslána. Zavoláme vám.</div>
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

  document.getElementById('m-reveal').onclick = () => {
    const name = document.getElementById('m-name').value;
    const phone = document.getElementById('m-phone').value;
    const area = parseInt(document.getElementById('m-area').value) || 0;
    if (!name || !phone) return alert('Prosím vyplňte jméno a telefon.');

    const prices = { roof: 190, facade: 150, pavement: 120, pv: 80, graffiti: 250, industrial: 130 };
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

// Interceptor with improved matching
document.addEventListener('click', (e) => {
  const card = e.target.closest('.group.relative.bg-card, .bg-white, .bg-card, [class*="rounded"]');
  const serviceSection = document.getElementById('sluzby');

  if (card && serviceSection?.contains(card)) {
    e.preventDefault();
    e.stopPropagation();

    const cardText = card.innerText.toLowerCase();
    let detectedData = servicesData[0]; // Default to facade

    if (cardText.includes('střech')) detectedData = servicesData.find(s => s.id === 'roof');
    else if (cardText.includes('dlažeb')) detectedData = servicesData.find(s => s.id === 'pavement');
    else if (cardText.includes('solární') || cardText.includes('panely')) detectedData = servicesData.find(s => s.id === 'pv');
    else if (cardText.includes('graffiti')) detectedData = servicesData.find(s => s.id === 'graffiti');
    else if (cardText.includes('průmysl')) detectedData = servicesData.find(s => s.id === 'industrial');
    else if (cardText.includes('fasád')) detectedData = servicesData.find(s => s.id === 'facade');

    openServiceModal(detectedData);
  }
}, true);
