import { supabase } from './supabase-config.js';

const injectPortfolio = async () => {
    let portfolioSection = document.getElementById('realizace');
    const referenceSection = document.getElementById('reference');
    const processSection = document.getElementById('proces');
    const rootWrapper = document.querySelector('#root > div');
    
    if (!portfolioSection) {
        portfolioSection = document.createElement('div');
        portfolioSection.id = 'realizace';
        portfolioSection.className = 'py-24 bg-slate-50';
    }

    // Determine the best insertion point
    if (referenceSection && referenceSection.parentNode) {
        // Precise spot: before reviews
        if (portfolioSection.previousElementSibling !== referenceSection.previousElementSibling) {
            referenceSection.parentNode.insertBefore(portfolioSection, referenceSection);
        }
    } else if (processSection && processSection.parentNode) {
        // Fallback: after "How it works"
        processSection.parentNode.insertBefore(portfolioSection, processSection.nextSibling);
    } else if (rootWrapper) {
        // Last resort: end of root wrapper
        rootWrapper.appendChild(portfolioSection);
    }


    const fetchProjects = async () => {
        const { data, error } = await supabase
            .from('portfolio')
            .select('*')
            .order('date', { ascending: false });
        
        if (error) {
            console.error('Error fetching portfolio from Supabase:', error);
            const defaults = [
                { id: 1, title: 'Čištění střechy RD, Praha', service: 'Čištění střech', image: 'https://images.unsplash.com/photo-1632759145351-1d592919f522?w=800' },
                { id: 2, title: 'Renovace fasády bytového domu, Brno', service: 'Čištění fasád', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' },
                { id: 3, title: 'Zámková dlažba, firemní areál Plzeň', service: 'Čištění dlažeb', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800' }
            ];
            return JSON.parse(localStorage.getItem('nanofusion_portfolio')) || defaults;
        }
        return data;
    };

    const render = async () => {
        const projects = await fetchProjects();

        const generateCards = (list) => list.map(p => `
            <div class="portfolio-card-modern">
                <div class="portfolio-img-wrap">
                    <img src="${p.image}" alt="${p.title}">
                </div>
                <div class="portfolio-content">
                    <span class="portfolio-tag">${p.service}</span>
                    <h3 class="portfolio-h3">${p.title}</h3>
                </div>
            </div>
        `).join('');

        portfolioSection.innerHTML = `
            <div class="container mx-auto px-4 mb-12">
                <div class="text-center">
                    <h2 class="text-3xl md:text-5xl font-bold text-slate-800 mb-4">Naše Realizace v detailu</h2>
                    <p class="text-slate-500 max-w-2xl mx-auto">Sledujte, jak vracíme domům jejich původní krásu a lesk.</p>
                </div>
            </div>
            
            <div class="portfolio-container">
                <div class="portfolio-track">
                    ${generateCards(projects)}
                    ${generateCards(projects)}
                </div>
            </div>
            
            <div class="text-center mt-12 pb-12">
                <button onclick="document.getElementById('ai-chat-launcher').click()" class="inline-flex items-center px-8 py-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-lg active:scale-95">
                    Chci také takový výsledek
                    <svg class="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </button>
            </div>
        `;
    };

    render();
    window.addEventListener('portfolioUpdated', render);
};

// Start injection with resilience
const initPortfolio = () => {
    if (!document.getElementById('realizace')) {
        injectPortfolio();
    }
};

const portfolioObserver = new MutationObserver(() => initPortfolio());
portfolioObserver.observe(document.body, { childList: true, subtree: true });

initPortfolio();
window.addEventListener('load', () => setTimeout(initPortfolio, 500));

