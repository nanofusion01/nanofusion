/* Modern Admin Dashboard Logic for NANOfusion */

// Authorized Users Configuration
const AUTHORIZED_USERS = [
  { email: 'admin@nanofusion.cz', password: 'admin123', name: 'Hlavní Admin' },
  { email: 'obchod@nanofusion.cz', password: 'nano2026', name: 'Obchodní Tým' }
];

// Clear test leads on first load after this update
if (!localStorage.getItem('nanofusion_leads_cleaned_cz')) {
  localStorage.removeItem('nanofusion_leads');
  localStorage.setItem('nanofusion_leads_cleaned_cz', 'true');
}

const initializeAdmin = () => {
  let activeSection = 'overview';
  const LOGO_URL = '/static/logo-nav.jpg';


  // --- Dynamic Data Service (Resilient to Supabase availability) ---
  const DataService = {
    async getClient() {
      if (window.supabase) return window.supabase;
      try {
        const { supabase } = await import('./supabase-config.js');
        return supabase;
      } catch (e) {
        return null; // Fallback to localStorage
      }
    },
    async fetchLeads() {
      const sb = await this.getClient();
      if (sb) {
        const { data, error } = await sb.from('leads').select('*').order('created_at', { ascending: false });
        if (!error) return data;
      }
      return JSON.parse(localStorage.getItem('nanofusion_leads') || '[]');
    },
    async fetchPortfolio() {
      const sb = await this.getClient();
      if (sb) {
        const { data, error } = await sb.from('portfolio').select('*').order('date', { ascending: false });
        if (!error) return data;
      }
      return JSON.parse(localStorage.getItem('nanofusion_portfolio')) || [];
    },
    async fetchBlog() {
      const sb = await this.getClient();
      if (sb) {
        const { data, error } = await sb.from('blog').select('*').order('date', { ascending: false });
        if (!error) return data;
      }
      const defaults = [
        { id: 1, title: 'Jak probíhá čištění fasád?', summary: 'Přečtěte si, jaké technologie používáme pro hloubkovou očistu vašeho domu.', date: '2026-04-10', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800', status: 'Publikováno' },
        { id: 2, title: 'Výhody nano-ochrany povrchů', summary: 'Proč je nano-technologie revolucí v údržbě nemovitostí?', date: '2026-04-05', image: 'https://images.unsplash.com/photo-1590076214667-c0f33b98c442?w=800', status: 'Publikováno' }
      ];
      return JSON.parse(localStorage.getItem('nanofusion_blog')) || defaults;
    },
    async saveBlog(posts) {
      localStorage.setItem('nanofusion_blog', JSON.stringify(posts));
      return true;
    },
    async savePortfolio(projects) {
      const sb = await this.getClient();
      if (sb) {
        // Simple strategy: save the entire list if using localStorage, or upsert if single item (simplified here)
        // For now, if Supabase is present, the logic should be different. 
        // We'll keep it simple for the user request.
      }
      localStorage.setItem('nanofusion_portfolio', JSON.stringify(projects));
      window.dispatchEvent(new Event('portfolioUpdated'));
      return true;
    },
    async fetchServices() {
      const sb = await this.getClient();
      if (sb) {
        const { data, error } = await sb.from('services').select('*');
        if (!error) return data;
      }
      return JSON.parse(localStorage.getItem('nanofusion_services') || '[]');
    },
    async saveServices(services) {
      localStorage.setItem('nanofusion_services', JSON.stringify(services));
      return true;
    },
    async fetchSettings() {
      return JSON.parse(localStorage.getItem('nanofusion_settings') || JSON.stringify({
        notification_email: 'info@nanofusion.cz',
        lead_alerts: true,
        ai_agent_active: true
      }));
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
    if (document.querySelector('.admin-overlay')) return;
    const userSession = sessionStorage.getItem('nanofusion_admin_user');
    if (userSession) {
      document.body.insertAdjacentHTML('afterbegin', createDashboardLayout(JSON.parse(userSession)));
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

  const createLoginHtml = () => `
    <div class="admin-overlay">
      <div class="admin-login-wrap">
        <div class="admin-login-card">
          <div class="admin-logo-area" style="padding: 0 0 1.5rem; justify-content: center;">
            <img src="${LOGO_URL}" alt="NANOfusion" style="height: 60px;">
          </div>
          <p style="color: #64748b; margin-bottom: 2rem; text-align: center; font-weight: 500;">Správa systému NANOfusion</p>
          
          <div style="margin-bottom: 1rem;">
            <label class="admin-label">E-mail</label>
            <input type="email" id="admin-email" class="admin-input" placeholder="jmeno@nanofusion.cz">
          </div>
          
          <div style="margin-bottom: 2rem;">
            <label class="admin-label">Heslo</label>
            <input type="password" id="admin-pass" class="admin-input" placeholder="••••••••">
          </div>
          
          <button class="admin-btn-primary" id="login-btn">Vstoupit do administrace</button>
          
          <p style="margin-top: 1.5rem; text-align: center; font-size: 0.875rem;">
            <a href="#" style="color: #64748b; text-decoration: none;" onclick="window.location.hash='';">Zpět na webovou stránku</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const createDashboardLayout = (user) => `
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
          <li class="admin-nav-item ${activeSection === 'blog' ? 'active' : ''}" data-target="blog">Blog</li>
          <li class="admin-nav-item ${activeSection === 'settings' ? 'active' : ''}" data-target="settings">Uživatelé</li>
        </ul>
        <div class="admin-user-info">
          <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${user.name}</div>
          <div style="color: var(--admin-text-muted); font-size: 0.7rem; overflow: hidden; text-overflow: ellipsis;">${user.email}</div>
          <button id="logout-btn" style="margin-top: 1rem; color: #ef4444; background: none; border: none; cursor: pointer; padding: 0; font-weight: 600;">Odhlásit se</button>
        </div>
      </aside>
      <main class="admin-main" id="admin-viewport">
        <!-- Content injected here -->
      </main>
    </div>
  `;

  const renderSection = async (section) => {
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
      case 'blog':
        const posts = await DataService.fetchBlog();
        viewport.innerHTML = renderBlog(posts);
        attachBlogEvents();
        break;
      case 'settings':
        viewport.innerHTML = renderSettings();
        break;
      default:
        viewport.innerHTML = `<div class="admin-card"><h2>Sekce ${section}</h2></div>`;
    }
  };

  const renderOverview = (leads) => `
    <div class="admin-header"><h1 class="admin-title-h1">Nástěnka</h1></div>
    <div class="admin-stats-grid">
      <div class="stat-card">
        <div class="stat-label">Poptávky celkem</div>
        <div class="stat-value">${leads.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Nové poptávky</div>
        <div class="stat-value" style="color: #f59e0b;">${leads.filter(l => l.status === 'Nová' || !l.status).length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Hotovo</div>
        <div class="stat-value">950+</div>
      </div>
    </div>
    <div class="admin-card" style="margin-top: 2rem;">
       <h3 style="margin-bottom: 1rem;">Poslední leady</h3>
       <table class="admin-table">
         <thead><tr><th>Datum</th><th>Jméno</th><th>Stav</th></tr></thead>
         <tbody>
           ${leads.slice(0, 5).map(l => `
             <tr><td>${l.date || 'Dnes'}</td><td>${l.name}</td><td>${l.status || 'Nová'}</td></tr>
           `).join('') || '<tr><td colspan="3">Žádné leday k zobrazení</td></tr>'}
         </tbody>
       </table>
    </div>
  `;

  const renderServices = async () => {
    const services = await DataService.fetchServices();
    return `
      <div class="admin-header"><h1 class="admin-title-h1">Služby</h1></div>
      <div class="admin-card">
        <table class="admin-table">
          <thead><tr><th>Služba</th><th>Cena (od)</th><th>Změnit</th></tr></thead>
          <tbody>
            ${services.map(s => `
              <tr><td><strong>${s.title}</strong></td><td>${s.price || 'Dle dohody'}</td><td>—</td></tr>
            `).join('') || '<tr><td colspan="3">Žádné služby</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  };

  const renderLeads = (leads) => `
    <div class="admin-header"><h1 class="admin-title-h1">Seznam poptávek</h1></div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>Datum</th><th>Klient</th><th>Služba</th><th>Stav</th><th>Chat</th></tr></thead>
        <tbody>
          ${leads.map(l => `
            <tr>
              <td>${l.date || ''}</td>
              <td style="font-weight: 600;">${l.name}</td>
              <td>${l.service}</td>
              <td><span class="admin-badge" style="background: ${l.status === 'Zakázka' ? '#dcfce7' : '#fef3c7'}; color: ${l.status === 'Zakázka' ? '#166534' : '#92400e'}">${l.status || 'Nová'}</span></td>
              <td>${l.history ? '✓' : '—'}</td>
            </tr>
          `).join('') || '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Zatím žádné poptávky</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  const renderPortfolio = (projects) => `
    <div class="admin-header">
      <h1 class="admin-title-h1">Realizace</h1>
      <button class="admin-btn-primary" id="add-project-btn" style="width: auto; padding: 0.6rem 1.25rem;">+ Přidat projekt</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>Název</th><th>Lokalita</th><th>Status</th><th>Akce</th></tr></thead>
        <tbody>
          ${projects.map(p => `
            <tr><td><strong>${p.title}</strong></td><td>${p.service}</td><td>Aktivní</td><td>🗑️</td></tr>
          `).join('') || '<tr><td colspan="4">Žádné projekty</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  const renderBlog = (posts) => `
    <div class="admin-header">
      <h1 class="admin-title-h1">Správa Blogu</h1>
      <button class="admin-btn-primary" id="add-post-btn" style="width: auto; padding: 0.6rem 1.25rem;">+ Nový článek</button>
    </div>
    <div class="admin-card">
      <table class="admin-table">
        <thead><tr><th>Titulek</th><th>Datum</th><th>Status</th><th>Akce</th></tr></thead>
        <tbody>
          ${posts.map(p => `
            <tr>
              <td><strong>${p.title}</strong></td>
              <td>${p.date}</td>
              <td><span class="admin-badge" style="background: #dcfce7; color: #166534;">${p.status || 'Publikováno'}</span></td>
              <td>🗑️</td>
            </tr>
          `).join('') || '<tr><td colspan="4">Žádné články</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  const attachBlogEvents = () => {
    const addBtn = document.getElementById('add-post-btn');
    if (addBtn) {
      addBtn.onclick = () => alert('Funkce přidávání článků bude v příští verzi. Zatím spravujeme přes localStorage.');
    }
  };

  const renderSettings = () => `
    <div class="admin-header"><h1 class="admin-title-h1">Správa uživatelů</h1></div>
    <div class="admin-card" style="max-width: 600px;">
       <h3 style="margin-bottom: 2rem;">Autorizované e-maily</h3>
       <div style="background: #f8fafc; padding: 1rem; border-radius: 1rem;">
         ${AUTHORIZED_USERS.map(u => `
           <div style="display: flex; justify-content: space-between; py: 0.75rem; border-bottom: 1px solid #eee;">
             <div><strong>${u.name}</strong><br><span style="color: #64748b; font-size: 0.8rem;">${u.email}</span></div>
             <div style="color: #10b981; font-size: 0.8rem; font-weight: 700;">AKTIVNÍ</div>
           </div>
         `).join('')}
       </div>
       <p style="margin-top: 1.5rem; font-size: 0.8rem; color: #94a3b8;">Nové uživatele nastavíte v souboru static/admin.js.</p>
    </div>
  `;

  const attachLoginEvents = () => {
    const loginBtn = document.getElementById('login-btn');
    const emailInput = document.getElementById('admin-email');
    const passInput = document.getElementById('admin-pass');

    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        const user = AUTHORIZED_USERS.find(u => u.email.trim() === emailInput.value.trim() && u.password === passInput.value);
        if (user) {
          sessionStorage.setItem('nanofusion_admin_user', JSON.stringify({
            email: user.email,
            name: user.name
          }));
          location.reload();
        } else {
          alert('Nesprávný e-mail nebo heslo!');
        }
      });
      [emailInput, passInput].forEach(i => i.addEventListener('keypress', (e) => { if (e.key === 'Enter') loginBtn.click(); }));
    }
  };

  const attachAdminEvents = () => {
    document.body.addEventListener('click', (e) => {
      const navItem = e.target.closest('.admin-nav-item');
      if (navItem) renderSection(navItem.dataset.target);
      if (e.target.id === 'logout-btn') {
        sessionStorage.removeItem('nanofusion_admin_user');
        window.location.hash = '';
        location.reload();
      }
    });
  };

  const attachPortfolioEvents = () => {
    // Basic wiring for demo
  };

  checkUrl();
  window.addEventListener('hashchange', checkUrl);
};

// Robust initialization for ES Modules
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdmin);
} else {
  initializeAdmin();
}
