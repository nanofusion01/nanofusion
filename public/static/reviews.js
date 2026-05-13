import { initSupabase, normalizeMediaUrl } from './supabase-client.js'

const injectReviews = async () => {
    // Wait for supabase
    const sb = await initSupabase();
    const reviewsSection = document.getElementById('reference');
    if (!reviewsSection) return false;

    try {
        const { data: reviewsData } = await sb
            .from('firmy_reviews')
            .select('*')
            .order('date', { ascending: false });

        const reviews = (reviewsData || []).map(r => ({
            name: r.author || 'Zákazník',
            info: r.source || 'Firms.cz',
            stars: r.rating || 5,
            text: r.text || ''
        }));

        if (reviews.length === 0) {
            reviews.push({ name: 'Spokojený zákazník', info: 'Auto Detailing', stars: 5, text: 'Vynikající servis a skvělá komunikace.' });
        }

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
          <div class="relative bg-slate-900 py-24 overflow-hidden">
            <div class="container mx-auto px-4 text-center mb-12">
              <h2 class="text-3xl md:text-5xl font-bold text-white mb-4">Co říkají naši zákazníci</h2>
              <p class="text-neutral-400 max-w-2xl mx-auto">Reference čerpáme z portálu firmy.cz. Spokojenost našich klientů je pro nás prioritou číslo jedna.</p>
            </div>
            <div class="reviews-container">
              <div class="reviews-track" id="reviews-track" style="display:flex; gap:1.5rem;">
                ${generateCards(reviews)}
                ${reviews.length > 3 ? generateCards(reviews) : ''}
              </div>
            </div>
          </div>
        `;
        
        // Re-init carousel
        if (window.setupCarousel) window.setupCarousel('.reviews-container');
        return true;
    } catch (e) {
        console.warn('Reviews Sync Error:', e);
        return false;
    }
};

const initReviews = () => {
    const target = document.getElementById('reference');
    if (target && !target.dataset.injected) {
        target.dataset.injected = 'true';
        injectReviews();
    }
};

document.addEventListener('DOMContentLoaded', initReviews);
const observer = new MutationObserver(() => initReviews());
observer.observe(document.body, { childList: true, subtree: true });
initReviews();
