/* Modern Admin Dashboard Logic for NANOfusion */

// Clear test leads on first load after this update
if (!localStorage.getItem('nanofusion_leads_cleaned_cz')) {
  localStorage.removeItem('nanofusion_leads');
  localStorage.setItem('nanofusion_leads_cleaned_cz', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
  let activeSection = 'overview';
  const LOGO_URL = '/static/logo.jpg';

  // --- Supabase / Data Service (Príprava na ostrý provoz) ---
  const DataService = {
    async fetchLeads() {
      return JSON.parse(localStorage.getItem('nanofusion_leads') || '[]');
    },
    async fetchPortfolio() {
      const defaults = [
        { id: 1, title: 'Čištění střechy RD, Praha', date: '2026-03-15', service: 'Čištění střech', image: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800', status: 'Publikováno' },
        { id: 2, title: 'Renovace fasády bytového domu, Brno', date: '2026-03-10', service: 'Čištění fasád', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', status: 'Publikováno' },
        { id: 3, title: 'Zámková dlažba, firemní areál Plzeň', date: '2026-02-28', service: 'Čištění dlažeb', image: 'https://images.unsplash.com/photo-1590076214667-c0f33b98c442?w=800', status: 'Publikováno' }
      ];
      return JSON.parse(localStorage.getItem('nanofusion_portfolio')) || defaults;
    },
    async savePortfolio(portfolio) {
      localStorage.setItem('nanofusion_portfolio', JSON.stringify(portfolio));
      window.dispatchEvent(new Event('portfolioUpdated'));
      return true;
    },
    async fetchServices() {
      const defaultData = (typeof defaultServices !== 'undefined') ? defaultServices : [];
      return JSON.parse(localStorage.getItem('nanofusion_services')) || defaultData;
    },
    async saveServices(services) {
      localStorage.setItem('nanofusion_services', JSON.stringify(services));
      return true;
    },    async fetchSettings() {
      return JSON.parse(localStorage.getItem('nanofusion_settings') || JSON.stringify({
        notification_email: 'info@nanofusion.cz',
        lead_alerts: true,
        ai_agent_active: true
      }));
    },
    async saveSettings(settings) {
      localStorage.setItem('nanofusion_settings', JSON.stringify(settings));
      console.log('Nastavení uloženo:', settings);
      return true;
    }
  };

  const checkUrl = () => {
    if (window.location.hash === '#admin') {
      showAdmin();
    } else {
      hideAdmin();
    }
  };

  const showAdmin = () => {
    const session = sessionStorage.getItem('nanofusion_admin');
    if (session) {
      document.body.insertAdjacentHTML('afterbegin', createDashboardLayout());
      renderSection(activeSection);
      attachAdminEvents();
    } else {
      document.body.insertAdjacentHTML('afterbegin', createLoginHtml());
      attachLoginEvents();
    }
    document.body.style.overflow = 'hidden';
  };

  const hideAdmin = () => {
    const overlay = document.querySelector('.admin-overlay');
    if (overlay) overlay.remove();
    document.body.style.overflow = 'auto';
  };

  // --- Generátory HTML ---

  const createLoginHtml = () => `
    <div class="admin-overlay">
      <div class="admin-login-wrap">
        <div class="admin-login-card">
          <div class="admin-logo-area" style="padding: 0 0 1.5rem; justify-content: center;">
            <img src="${LOGO_URL}" alt="NANOfusion" style="height: 60px;">
          </div>
          <p style="color: #64748b; margin-bottom: 2rem; text-align: center;">Vítejte zpět! Přihlaste se do správy.</p>
          <input type="password" id="admin-pass" class="admin-input" placeholder="Zadejte heslo">
          <button class="admin-btn-primary" id="login-btn">Přihlásit se</button>
          <p style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem;">
            <a href="#" style="color: #64748b; text-decoration: none;" onclick="window.location.hash='';">Zpět na web</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const createDashboardLayout = () => `
    <div class="admin-overlay">
      <aside class="admin-sidebar">
        <div class="admin-logo-area">
          <img src="${LOGO_URL}" alt="NANOfusion" style="height: 50px;">
        </div>
        <ul class="admin-nav-list">
          <li class="admin-nav-item ${activeSection === 'overview' ? 'active' : ''}" data-target="overview">Přehled</li>
          <li class="admin-nav-item ${activeSection === 'services' ? 'active' : ''}" data-target="services">Služby a Ceník</li>
          <li class="admin-nav-item ${activeSection === 'leads' ? 'active' : ''}" data-target="leads">Poptávky</li>
          <li class="admin-nav-item ${activeSection === 'portfolio' ? 'active' : ''}" data-target="portfolio">Realizace</li>
          <li class="admin-nav-item ${activeSection === 'settings' ? 'active' : ''}" data-target="settings">Nastavení</li>
        </ul>
        <div class="admin-user-info">
          <div style="font-weight: 600; margin-bottom: 0.25rem;">admin@nanofusion.cz</div>
          <div style="color: var(--admin-text-muted); font-size: 0.75rem;">Administrátor</div>
          <button id="logout-btn" style="margin-top: 1rem; color: #ef4444; background: none; border: none; cursor: pointer; padding: 0;">Odhlásit se</button>
        </div>
      </aside>
      <main class="admin-main" id="admin-viewport">
        <!-- Obsah sekce bude vložen sem -->
      </main>
    </div>
  `;

  window.renderSection = async (section) => {
    const viewport = document.getElementById('admin-viewport');
    if (!viewport) return;

    activeSection = section;

    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.target === section);
    });

    const leads = await DataService.fetchLeads();

    switch (section) {
      case 'overview': viewport.innerHTML = renderOverview(leads); break;
      case 'services': viewport.innerHTML = await renderServices(); break;
      case 'leads': viewport.innerHTML = renderLeads(leads); break;
      case 'portfolio':
        const projects = await DataService.fetchPortfolio();
        viewport.innerHTML = renderPortfolio(projects);
        attachPortfolioEvents();
        break;
      case 'settings':
        const settings = await DataService.fetchSettings();
        viewport.innerHTML = renderSettings(settings);
        attachSettingsEvents();
        break;
      default:
        viewport.innerHTML = `<div class="admin-card"><h2>Sekce ${section} je ve vývoji</h2></div>`;
    }
  };

  const renderOverview = (leads) => `
    <div class="admin-header">
      <h1 class="admin-title-h1">Nástěnka přehledu</h1>
      <button class="admin-btn-primary" style="width: auto; padding: 0.75rem 1.5rem;">+ Přidat realizaci</button>
    </div>
    <div class="admin-stats-grid">
      <div class="stat-card"><div class="stat-label">Aktivní služby</div><div class="stat-value">6</div></div>
      <div class="stat-card"><div class="stat-label">Celkem poptávek</div><div class="stat-value">${leads.length}</div></div>
      <div class="stat-card"><div class="stat-label">Hotové projekty</div><div class="stat-value">950+</div></div>
      <div class="stat-card"><div class="stat-label">Nepřečtené</div><div class="stat-value">0</div></div>
    </div>
    <div class="admin-widgets-grid">
      <div class="admin-widget">
        <div class="widget-title">Poptávky z AI chatu <a href="#" onclick="event.preventDefault(); renderSection('leads')" style="font-size: 0.875rem; color: var(--admin-primary); font-weight: 500;">Zobrazit vše</a></div>
        <table class="admin-table">
          <thead>
            <tr><th>Datum</th><th>Jméno</th><th>Stav</th><th>Detail</th></tr>
          </thead>
          <tbody>
            ${leads.filter(l => l.source.includes('AI')).slice(0, 5).map(l => `
              <tr>
                <td>${l.date.split(' ')[0]}</td>
                <td>${l.name}</td>
                <td><span class="admin-badge" style="background: ${l.status === 'Zakázka' ? '#dcfce7' : '#fef3c7'}; color: ${l.status === 'Zakázka' ? '#166534' : '#92400e'}">${l.status || 'Nová'}</span></td>
                <td><button onclick="showLeadDetail(${l.id})" style="background: none; border: none; cursor: pointer;">👁️</button></td>
              </tr>
            `).join('') || '<tr><td colspan="4" style="text-align: center; padding: 2rem;">Zatím žádné poptávky</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="admin-widget">
        <div class="widget-title">Rychlé akce</div>
        <a href="#" class="quick-action-btn">Listovat novou službu</a>
        <a href="#" class="quick-action-btn">Exportovat leads (CSV)</a>
        <a href="#" class="quick-action-btn">Nastavení upozornění</a>
      </div>
    </div>
  `;

  const renderServices = async () => {
    const services = await DataService.fetchServices();
    return `
      <div class="admin-header"><h1 class="admin-title-h1">Správa služeb a nabídek</h1></div>
      <div class="admin-card">
        <table class="admin-table">
          <thead><tr><th>Služba</th><th>Před / Po</th><th>Akce</th></tr></thead>
          <tbody>
            ${services.map(s => `
              <tr>
                <td style="font-weight: 600;">${s.title}</td>
                <td>
                  <img src="${s.beforeImg}" style="height: 30px; border-radius: 4px; border: 1px solid #ddd;">
                  <img src="${s.afterImg}" style="height: 30px; border-radius: 4px; border: 1px solid #ddd; margin-left: 4px;">
                </td>
                <td><button class="admin-btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="editService('${s.id}')">Upravit fotky</button></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Service Multi-Image Modal -->
      <div id="service-edit-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); z-index: 100000; align-items: center; justify-content: center; padding: 1rem;">
         <div class="admin-card" style="width: 100%; max-width: 500px; padding: 2.5rem; background: white; border-radius: 1.5rem;">
            <h2 id="s-edit-title" style="margin-bottom: 1.5rem; font-size: 1.5rem;">Upravit službu</h2>
            <input type="hidden" id="s-edit-id">
            
            <label class="admin-label">Hlavní náhledový obrázek</label>
            <input type="text" id="s-edit-main" class="admin-input" style="margin-bottom: 1.25rem;">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
              <div>
                <label class="admin-label">Fotka PŘED (URL)</label>
                <input type="text" id="s-edit-before" class="admin-input">
              </div>
              <div>
                <label class="admin-label">Fotka PO (URL)</label>
                <input type="text" id="s-edit-after" class="admin-input">
              </div>
            </div>

            <div style="display: flex; gap: 1rem;">
              <button class="admin-btn-primary" id="s-edit-save">Uložit změny</button>
              <button id="s-edit-close" style="background: #f1f5f9; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; cursor: pointer; font-weight: 600;">Zavřít</button>
            </div>
         </div>
      </div>
    `;
  };

  window.editService = async (id) => {
    const services = await DataService.fetchServices();
    const service = services.find(s => s.id === id);
    if (!service) return;

    document.getElementById('s-edit-title').innerText = `Upravit ${service.title}`;
    document.getElementById('s-edit-id').value = service.id;
    document.getElementById('s-edit-main').value = service.image || '';
    document.getElementById('s-edit-before').value = service.beforeImg || '';
    document.getElementById('s-edit-after').value = service.afterImg || '';
    
    document.getElementById('service-edit-modal').style.display = 'flex';
    
    document.getElementById('s-edit-close').onclick = () => document.getElementById('service-edit-modal').style.display = 'none';
    document.getElementById('s-edit-save').onclick = async () => {
      service.image = document.getElementById('s-edit-main').value;
      service.beforeImg = document.getElementById('s-edit-before').value;
      service.afterImg = document.getElementById('s-edit-after').value;
      await DataService.saveServices(services);
      document.getElementById('service-edit-modal').style.display = 'none';
      renderSection('services');
    };
  };

  const renderLeads = (leads) => `
    <div class="admin-header"><h1 class="admin-title-h1">Seznam poptávek</h1></div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>Datum</th><th>Jméno</th><th>Kontakt</th><th>Služba</th><th>Stav</th><th>Chat</th></tr></thead>
        <tbody>
          ${leads.map(l => `
            <tr>
              <td>${l.date}</td>
              <td style="font-weight: 600;">${l.name}</td>
              <td>${l.email || l.phone}</td>
              <td>${l.service}</td>
              <td><span class="admin-badge" style="background: ${l.status === 'Zakázka' ? '#dcfce7' : '#fef3c7'}; color: ${l.status === 'Zakázka' ? '#166534' : '#92400e'}">${l.status || 'Nová'}</span></td>
              <td>
                ${l.history ? `<button class="admin-btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="showLeadDetail(${l.id})">Otevřít chat</button>` : '—'}
              </td>
            </tr>
          `).join('') || '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Zatím žádné poptávky</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Lead Detail Modal -->
    <div id="lead-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); z-index: 100000; align-items: center; justify-content: center; padding: 1rem;">
       <div class="admin-card" style="width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; padding: 2rem; background: white; border-radius: 1.5rem;">
          <div id="lead-modal-content"></div>
          <div style="margin-top: 2rem; display: flex; gap: 1rem; border-top: 1px solid #eee; pt: 1.5rem;">
             <button id="l-close" style="background: #f1f5f9; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; cursor: pointer; font-weight: 600;">Zavřít</button>
          </div>
       </div>
    </div>
  `;

  window.showLeadDetail = async (id) => {
    const leads = JSON.parse(localStorage.getItem('nanofusion_leads') || '[]');
    const lead = leads.find(l => l.id == id);
    if (!lead) return;

    const modal = document.getElementById('lead-modal');
    const content = document.getElementById('lead-modal-content');

    content.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9;">
        <div>
          <span style="font-size: 0.75rem; font-weight: 800; color: #f59e0b; background: #fff7ed; padding: 0.25rem 0.75rem; border-radius: 99px; text-transform: uppercase; margin-bottom: 0.5rem; display: inline-block;">Poptávka projektu</span>
          <h2 style="font-size: 1.875rem; margin-bottom: 0.25rem;">${lead.name}</h2>
          <p style="color: #64748b; font-size: 0.95rem;">Doručeno: ${lead.date} • ${lead.source}</p>
        </div>
        <div style="text-align: right;">
           <label class="admin-label">Průběh obchodování</label>
           <select onchange="updateLeadStatus(${lead.id}, this.value)" class="admin-input" style="width: 180px; font-weight: 600;">
              <option ${lead.status === 'Nová' ? 'selected' : ''}>Nová 🆕</option>
              <option ${lead.status === 'V řešení' ? 'selected' : ''}>V řešení 📞</option>
              <option ${lead.status === 'Zpracována nabídka' ? 'selected' : ''}>Zpracována nabídka 📑</option>
              <option ${lead.status === 'Zakázka' ? 'selected' : ''}>Zakázka ✅</option>
              <option ${lead.status === 'Storno' ? 'selected' : ''}>Storno ❌</option>
           </select>
        </div>
      </div>
      
      <div style="display: grid; grid-cols: 1; md:grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem;">
         <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div style="background: #f8fafc; padding: 1.25rem; border-radius: 1rem; border: 1px solid #e2e8f0;">
               <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Služba a plocha</div>
               <div style="font-size: 1.125rem; font-weight: 700;">${lead.service}</div>
               <div style="color: #64748b;">${lead.details?.split(',')[0] || 'Nezadáno'}</div>
            </div>
            <div style="background: #fffbeb; padding: 1.25rem; border-radius: 1rem; border: 1px solid #fef3c7;">
               <div style="font-size: 0.75rem; color: #92400e; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Odhadovaná cena (BOT)</div>
               <div style="font-size: 1.25rem; font-weight: 800; color: #d97706;">${lead.priceRange || 'Nekalkulováno'}</div>
               <div style="font-size: 0.75rem; color: #b45309;">Včetně 10% marže pro obchodníka.</div>
            </div>
            <div style="background: #f0f9ff; padding: 1.25rem; border-radius: 1rem; border: 1px solid #e0f2fe; grid-column: span 2;">
               <div style="font-size: 0.75rem; color: #0369a1; text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Detaily projektu a lokalita</div>
               <div style="font-size: 0.95rem; line-height: 1.5;">${lead.details || 'Žádné doplňující informace.'}</div>
            </div>
         </div>
         
         <div style="background: #f1f5f9; padding: 1.25rem; border-radius: 1.5rem; border: 1px solid #e2e8f0;">
            <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 0.75rem;">Interní poznámky s týmem</div>
            <textarea 
               id="lead-notes-${lead.id}" 
               placeholder="Zde napište poznámky z hovoru..." 
               style="width: 100%; height: 120px; background: white; border: 1px solid #cbd5e1; border-radius: 0.75rem; padding: 0.75rem; font-size: 0.875rem; resize: none; margin-bottom: 1rem;"
               onblur="updateLeadNotes(${lead.id}, this.value)"
            >${lead.notes || ''}</textarea>
            <div style="font-size: 0.7rem; color: #94a3b8; text-align: right;">Poznámky se ukládají automaticky při opuštění pole.</div>
         </div>
      </div>

      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
         <h4 style="font-size: 1.125rem; font-weight: 700;">Přepis konverzace</h4>
         <div style="height: 1px; flex: 1; background: #eee;"></div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 1rem; background: #fafafa; border: 1px solid #f1f5f9; padding: 1.5rem; border-radius: 1.5rem; max-height: 350px; overflow-y: auto;">
         ${lead.history ? lead.history.map(m => `
            <div style="align-self: ${m.type === 'Asistent' ? 'flex-start' : 'flex-end'}; max-width: 85%;">
               <div style="font-weight: 700; font-size: 0.7rem; margin-bottom: 0.25rem; color: #64748b; text-align: ${m.type === 'Asistent' ? 'left' : 'right'};">${m.type} • ${m.time}</div>
               <div style="background: ${m.type === 'Asistent' ? '#ffffff' : '#f59e0b'}; color: ${m.type === 'Asistent' ? '#1e293b' : '#ffffff'}; padding: 0.85rem 1.15rem; border-radius: 1.25rem; font-size: 0.95rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); border: 1px solid ${m.type === 'Asistent' ? '#e2e8f0' : '#f59e0b'};">
                  ${m.text}
               </div>
            </div>
         `).join('') : '<p style="color: #94a3b8; text-align: center; padding: 2rem;">K této poptávce není v systému uložen přepis chatu.</p>'}
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('l-close').onclick = () => modal.style.display = 'none';
  };

  window.updateLeadNotes = (id, newNotes) => {
    const leads = JSON.parse(localStorage.getItem('nanofusion_leads') || '[]');
    const index = leads.findIndex(l => l.id == id);
    if (index !== -1) {
      leads[index].notes = newNotes;
      localStorage.setItem('nanofusion_leads', JSON.stringify(leads));
      console.log(`Lead ${id} notes saved.`);
    }
  };

  window.updateLeadStatus = (id, newStatus) => {
    const leads = JSON.parse(localStorage.getItem('nanofusion_leads') || '[]');
    const index = leads.findIndex(l => l.id == id);
    if (index !== -1) {
      leads[index].status = newStatus;
      localStorage.setItem('nanofusion_leads', JSON.stringify(leads));
      console.log(`Lead ${id} status updated to ${newStatus}`);
      // Refresh the view to show updated status badges
      if (typeof window.renderSection === 'function') {
        window.renderSection(activeSection);
      }
    }
  };


  const renderPortfolio = (projects) => `
    <div class="admin-header">
      <h1 class="admin-title-h1">Správa realizací</h1>
      <button class="admin-btn-primary" id="add-project-btn" style="width: auto; padding: 0.75rem 1.5rem;">+ Nový projekt</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>Název projektu</th><th>Datum</th><th>Služba</th><th>Stav</th><th>Akce</th></tr></thead>
        <tbody>
          ${projects.map(p => `
            <tr>
              <td style="font-weight: 500;">${p.title}</td>
              <td>${p.date}</td>
              <td>${p.service}</td>
              <td><span class="admin-badge" style="background: #dcfce7; color: #166534">Publikováno</span></td>
              <td>
                <button onclick="deleteProject(${p.id})" style="background: none; border: none; cursor: pointer; color: #ef4444; font-size: 1.1rem;">🗑️</button>
              </td>
            </tr>
          `).join('') || '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Zatím žádné realizace</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Modal for New Project -->
    <div id="project-modal" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(4px); z-index: 100000; align-items: center; justify-content: center; padding: 1rem;">
       <div class="admin-card" style="width: 100%; max-width: 500px; padding: 2.5rem; background: white; border-radius: 1.5rem;">
          <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem;">Nová realizace</h2>
          <label class="admin-label">Název a místo</label>
          <input type="text" id="p-title" class="admin-input" placeholder="Např. Čištění střechy RD, Praha" style="margin-bottom: 1.25rem;">
          <label class="admin-label">Služba</label>
          <select id="p-service" class="admin-input" style="margin-bottom: 1.25rem;">
            <option>Čištění střech</option>
            <option>Čištění fasád</option>
            <option>Čištění dlažeb</option>
            <option>Solární panely</option>
          </select>
          <label class="admin-label">URL obrázku (např. z Unsplash)</label>
          <input type="text" id="p-image" class="admin-input" placeholder="https://images.unsplash.com/..." style="margin-bottom: 2rem;">
          <div style="display: flex; gap: 1rem;">
            <button class="admin-btn-primary" id="p-save">Uložit realizaci</button>
            <button id="p-close" style="background: #f1f5f9; border: none; padding: 0.75rem 1.5rem; border-radius: 0.75rem; cursor: pointer; font-weight: 600;">Zavřít</button>
          </div>
       </div>
    </div>
  `;

  window.deleteProject = async (id) => {
    if (!confirm('Opravdu chcete tuto realizaci smazat?')) return;
    const projects = await DataService.fetchPortfolio();
    const filtered = projects.filter(p => p.id !== id);
    await DataService.savePortfolio(filtered);
    renderSection('portfolio');
  };

  const attachPortfolioEvents = () => {
    const modal = document.getElementById('project-modal');
    if (document.getElementById('add-project-btn')) {
      document.getElementById('add-project-btn').onclick = () => modal.style.display = 'flex';
    }
    if (document.getElementById('p-close')) {
      document.getElementById('p-close').onclick = () => modal.style.display = 'none';
    }
    if (document.getElementById('p-save')) {
      document.getElementById('p-save').onclick = async () => {
        const title = document.getElementById('p-title').value;
        const service = document.getElementById('p-service').value;
        const image = document.getElementById('p-image').value || 'https://images.unsplash.com/photo-1590076214667-c0f33b98c442?w=800';

        if (!title) return alert('Doplňte název projektu.');

        const projects = await DataService.fetchPortfolio();
        projects.unshift({
          id: Date.now(),
          title,
          service,
          image,
          date: new Date().toISOString().split('T')[0],
          status: 'Publikováno'
        });

        await DataService.savePortfolio(projects);
        modal.style.display = 'none';
        renderSection('portfolio');
      };
    }
  };

  const renderSettings = (settings) => `
    <div class="admin-header"><h1 class="admin-title-h1">Nastavení systému</h1></div>
    <div class="admin-card" style="max-width: 600px;">
      <div style="margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">E-mailové notifikace</h3>
        <label class="admin-label">Příjemce poptávek</label>
        <input type="email" id="settings-email" class="admin-input" value="${settings.notification_email}" placeholder="email@adresa.cz">
        <div style="margin-top: 1rem;">
          <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="settings-alerts" ${settings.lead_alerts ? 'checked' : ''} style="margin-right: 0.75rem; width: 1.25rem; height: 1.25rem;">
            Zasílat upozornění na nové poptávky
          </label>
        </div>
      </div>
      
      <div style="margin-bottom: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
        <h3 style="margin-bottom: 1rem; font-size: 1.125rem;">AI Agent</h3>
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span>Aktivovat AI chatbota na webu</span>
          <label class="admin-toggle">
            <input type="checkbox" id="settings-ai" ${settings.ai_agent_active ? 'checked' : ''}>
            <span class="admin-toggle-slider"></span>
          </label>
        </div>
      </div>

      <div style="padding-top: 1rem;">
        <button class="admin-btn-primary" id="save-settings-btn">Uložit nastavení</button>
      </div>
    </div>
  `;

  const attachSettingsEvents = () => {
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        const newSettings = {
          notification_email: document.getElementById('settings-email').value,
          lead_alerts: document.getElementById('settings-alerts').checked,
          ai_agent_active: document.getElementById('settings-ai').checked
        };
        saveBtn.innerText = 'Ukládám...';
        await DataService.saveSettings(newSettings);
        setTimeout(() => {
          saveBtn.innerText = 'Uloženo! ✓';
          setTimeout(() => { saveBtn.innerText = 'Uložit nastavení'; }, 2000);
        }, 500);
      });
    }
  };

  const attachLoginEvents = () => {
    const loginBtn = document.getElementById('login-btn');
    const passInput = document.getElementById('admin-pass');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        if (passInput.value === 'admin123') {
          sessionStorage.setItem('nanofusion_admin', 'true');
          location.reload();
        } else { alert('Nesprávné heslo!'); }
      });
      passInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') loginBtn.click(); });
    }
  };

  const attachAdminEvents = () => {
    document.body.addEventListener('click', (e) => {
      const navItem = e.target.closest('.admin-nav-item');
      if (navItem) {
        renderSection(navItem.dataset.target);
      }

      if (e.target.id === 'logout-btn') {
        sessionStorage.removeItem('nanofusion_admin');
        window.location.hash = '';
        location.reload();
      }
    });
  };

  checkUrl();
  window.addEventListener('hashchange', checkUrl);
});


