import { supabase } from './supabase-client.js'

const injectReviews = async () => {
  const reviewsSection = document.getElementById('reference');
  if (reviewsSection) {
    const { data: reviewsData } = await supabase
      .from('firmy_reviews')
      .select('*')
      .order('date', { ascending: false });

    const reviews = (reviewsData || []).map(r => ({
      name: r.author || 'Zákazník',
      info: r.source || 'Firms.cz',
      stars: r.rating || 5,
      text: r.text || ''
    }));

    // Fallback if no reviews
    if (reviews.length === 0) {
        reviews.push({ name: 'Spokojený zákazník', info: 'Praha', stars: 5, text: 'Velmi profesionální přístup a skvělý výsledek čištění.' });
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

    reviewsSection.className = 'section-reveal';
    reviewsSection.innerHTML = `
      <div id="reference" class="relative bg-slate-900 border-y border-white/5 py-24 overflow-hidden">
        <div class="container mx-auto px-4 text-center mb-12">
          <h2 class="text-3xl md:text-5xl font-bold text-white mb-4">Co říkají naši zákazníci</h2>
          <p class="text-neutral-400 max-w-2xl mx-auto">Reference čerpáme z portálu firmy.cz. Spokojenost našich klientů je pro nás prioritou číslo jedna.</p>
        </div>
        <div class="reviews-container">
          <div class="reviews-track" id="reviews-track">
            ${generateCards(reviews)}
            ${reviews.length > 3 ? generateCards(reviews) : ''}
          </div>
        </div>
      </div>
    `;
    
    return true;
  }
  return false;
};

const initReviews = async () => {
  const target = document.getElementById('reference');
  if (target && !target.dataset.injected) {
    target.dataset.injected = 'pending';
    if (await injectReviews()) {
      target.dataset.injected = 'true';
    }
  }
};

const observer = new MutationObserver(() => initReviews());
observer.observe(document.body, { childList: true, subtree: true });

initReviews();
window.addEventListener('load', () => setTimeout(initReviews, 500));

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const setupCarousel = (containerSelector) => {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const track = container.querySelector('div');
  
  if (!container.parentElement.querySelector('.carousel-arrow')) {
    container.parentElement.style.position = 'relative';
    const leftArrow = document.createElement('button');
    leftArrow.className = 'carousel-arrow left-arrow';
    leftArrow.innerHTML = '❮';
    const rightArrow = document.createElement('button');
    rightArrow.className = 'carousel-arrow right-arrow';
    rightArrow.innerHTML = '❯';
    
    container.parentElement.appendChild(leftArrow);
    container.parentElement.appendChild(rightArrow);
    
    leftArrow.onclick = () => {
      enableManualMode();
      container.scrollBy({ left: -400, behavior: 'smooth' });
    };
    rightArrow.onclick = () => {
      enableManualMode();
      container.scrollBy({ left: 400, behavior: 'smooth' });
    };
  }

  let isDown = false;
  let startX;
  let scrollLeft;
  let isPaused = false;
  let pauseTimer = null;

  const enableManualMode = () => {
    container.style.scrollSnapType = 'x mandatory';
    container.style.scrollBehavior = 'smooth';
  };

  const enableAutoMode = () => {
    container.style.scrollSnapType = 'none';
    container.style.scrollBehavior = 'auto';
  };

  const pauseAutoplay = (duration = 5000) => {
    isPaused = true;
    enableManualMode();
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => { 
      isPaused = false; 
    }, duration);
  };

  setInterval(() => {
    if (!isPaused && !isDown) {
      enableAutoMode();
      container.scrollLeft += 1;
      
      const halfWidth = track.scrollWidth / 2;
      if (container.scrollLeft >= halfWidth && halfWidth > 0) {
        container.scrollLeft -= halfWidth; 
      }
    }
  }, 20);

  container.addEventListener('mouseenter', () => pauseAutoplay(3000));
  container.addEventListener('touchstart', () => pauseAutoplay(5000));

  container.addEventListener('mousedown', (e) => {
    isDown = true;
    container.style.cursor = 'grabbing';
    enableAutoMode();
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
    isPaused = true;
  });

  const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    container.style.cursor = 'grab';
    pauseAutoplay(4000);
  };

  container.addEventListener('mouseleave', endDrag);
  container.addEventListener('mouseup', endDrag);

  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  });
};

const initAllCarousels = () => {
  setupCarousel('.reviews-container');
  setupCarousel('.portfolio-container');
};

document.addEventListener('DOMContentLoaded', initAllCarousels);
window.addEventListener('load', () => setTimeout(initAllCarousels, 2000));
window.addEventListener('portfolioUpdated', () => setTimeout(initAllCarousels, 500));
