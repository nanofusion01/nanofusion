/* Dynamic FAQs for NANOfusion — MutationObserver verze */

const injectFaqs = async () => {
    let faqSection = document.getElementById('faq');
    if (!faqSection || faqSection.dataset.injected === 'true') return;

    const hydrateFaqs = async () => {
        try {
            const { supabase } = await import('./supabase-config.js');
            const { data, error } = await supabase.from('faqs')
                .select('*')
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (!error && data && data.length > 0) {
                console.log('NANOfusion: FAQs synchronized from Cloud');
                render(data);
            }
        } catch (e) {
            console.error('FAQ Sync Error:', e);
        }
    };

    const render = (faqs) => {
        const faqHtml = `
            <div class="container mx-auto px-6 pt-12 pb-16"> <!-- Reduced padding to move title up -->
                <div class="text-center mb-10"> <!-- Reduced margin below header -->
                    <h2 class="text-3xl md:text-4xl font-bold text-slate-800 mb-4">Časté dotazy</h2> <!-- Slightly smaller font -->
                    <p class="text-slate-500 max-w-2xl mx-auto text-sm md:text-base">Vše, co potřebujete vědět o našich technologiích a postupech.</p>
                </div>
                <div class="max-w-3xl mx-auto space-y-3"> <!-- Tighter spacing between items -->
                    ${faqs.map((f, i) => `
                        <div class="faq-item" style="border: 1px solid #e2e8f0; border-radius: 0.875rem; overflow: hidden; background: white; transition: all 0.3s ease;">
                            <button onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('svg').classList.toggle('rotate-180')"
                                    style="width: 100%; text-align: left; padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: none; border: none; cursor: pointer;">
                                <span style="font-weight: 700; color: #1e293b; font-size: 0.938rem;">${f.question}</span>
                                <svg class="transition-transform flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M6 9l6 6 6-6"></path>
                                </svg>
                            </button>
                            <div class="hidden" style="padding: 0 1.5rem 1.25rem; color: #64748b; line-height: 1.6; font-size: 0.875rem;">
                                ${f.answer}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        faqSection.innerHTML = faqHtml;
        faqSection.dataset.injected = 'true';
    };

    hydrateFaqs();
};

// MutationObserver — čeká dokud main.js nevytvoří #faq
const initFaq = () => {
    if (document.getElementById('faq')) {
        injectFaqs();
        return;
    }
    const observer = new MutationObserver(() => {
        if (document.getElementById('faq')) {
            observer.disconnect();
            injectFaqs();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => { observer.disconnect(); injectFaqs(); }, 8000);
};

initFaq();
