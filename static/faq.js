/* Dynamic FAQs for NANOfusion */

const injectFaqs = async () => {
    let faqSection = document.getElementById('faq');
    if (!faqSection) return;

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
            <div class="container mx-auto px-6 py-24">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-5xl font-bold text-slate-800 mb-6">Časté dotazy</h2>
                    <p class="text-slate-500 max-w-2xl mx-auto">Vše, co potřebujete vědět o našich technologiích a postupech.</p>
                </div>
                <div class="max-w-3xl mx-auto space-y-4">
                    ${faqs.map((f, i) => `
                        <div class="faq-item" style="border: 1px solid #e2e8f0; border-radius: 1rem; overflow: hidden; background: white;">
                            <button onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('svg').classList.toggle('rotate-180')" 
                                    style="width: 100%; text-align: left; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; background: none; border: none; cursor: pointer;">
                                <span style="font-weight: 700; color: #1e293b;">${f.question}</span>
                                <svg class="transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M6 9l6 6 6-6"></path>
                                </svg>
                            </button>
                            <div class="hidden" style="padding: 0 1.5rem 1.5rem; color: #64748b; line-height: 1.6;">
                                ${f.answer}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        faqSection.innerHTML = faqHtml;
    };

    hydrateFaqs();
};

document.addEventListener('DOMContentLoaded', injectFaqs);
window.addEventListener('load', () => setTimeout(injectFaqs, 1500));
