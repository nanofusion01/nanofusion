import { supabase, normalizeMediaUrl } from './supabase-client.js'

const openBlogDetail = (post) => {
    let overlay = document.getElementById('blog-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'blog-modal-overlay';
        overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.85); backdrop-filter:blur(8px); z-index:999999; display:none; align-items:center; justify-content:center; padding:20px;';
        document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
        <div style="background:white; width:100%; max-width:800px; max-height:90vh; border-radius:32px; overflow-y:auto; position:relative; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
            <button onclick="document.getElementById('blog-modal-overlay').style.display='none'" style="position:sticky; top:20px; right:20px; float:right; background:#f1f5f9; border:none; width:40px; height:40px; border-radius:50%; cursor:pointer; font-size:20px; z-index:10; font-weight:bold;">&times;</button>
            <div style="height:350px; overflow:hidden;">
                <img src="${post.image}" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="padding:40px;">
                <div style="color:#f59e0b; font-weight:800; text-transform:uppercase; font-size:12px; margin-bottom:12px; letter-spacing:0.1em;">Článek • ${post.date}</div>
                <h2 style="font-size:32px; font-weight:800; color:#0f172a; line-height:1.2; margin-bottom:24px;">${post.title}</h2>
                <div style="font-size:18px; line-height:1.7; color:#475569; white-space:pre-wrap;">${post.content}</div>
                
                <div style="margin-top:40px; padding-top:30px; border-top:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:700; color:#1e293b;">Zaujal vás článek?</div>
                    <button onclick="document.getElementById('blog-modal-overlay').style.display='none'; setTimeout(() => document.getElementById('ai-chat-launcher').click(), 200)" style="background:#f59e0b; color:white; border:none; padding:12px 24px; border-radius:12px; font-weight:800; cursor:pointer;">Poptat podobnou službu</button>
                </div>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
};

const injectBlog = async () => {
    // Resilience: Wait for supabase
    if (!window.supabase) await new Promise(r => setTimeout(r, 500));
    const sb = window.supabase;
    if (!sb) return;

    let blogSection = document.getElementById('blog');
    const referenceSection = document.getElementById('reference');
    const contactSection = document.getElementById('kontakt');
    
    if (!blogSection) {
        blogSection = document.createElement('section');
        blogSection.id = 'blog';
        blogSection.className = 'py-32 bg-white';
    }

    if (blogSection) {
        if (referenceSection && referenceSection.parentNode) {
            referenceSection.parentNode.insertBefore(blogSection, referenceSection.nextSibling);
        } else if (contactSection && contactSection.parentNode) {
            contactSection.parentNode.insertBefore(blogSection, contactSection);
        }
    }

    const { data: articles } = await sb
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    const blogPostsData = (articles || []).map(a => ({
        id: a.id,
        title: a.title,
        summary: a.content ? a.content.substring(0, 150) + '...' : '',
        content: a.content || '',
        date: new Date(a.published_at || a.created_at).toLocaleDateString('cs-CZ'),
        image: normalizeMediaUrl(a.hero_image_url) || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'
    }));

    window.nnf_openBlog = (id) => {
        const post = blogPostsData.find(p => p.id === id);
        if (post) openBlogDetail(post);
    };

    const render = () => {
        blogSection.innerHTML = `
            <div class="container mx-auto px-6 relative">
                <div class="text-center mb-16 md:mb-24">
                    <div class="text-amber-500 font-bold uppercase tracking-widest text-sm mb-3">Tipy & Rady</div>
                    <h2 class="text-3xl md:text-5xl font-bold text-slate-800 mb-6 font-heading">Nano-Magazín</h2>
                    <p class="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">Sledujte rady a novinky, jak pečovat o váš dům s moderními technologiemi.</p>
                </div>
                
                <div class="relative group max-w-[1400px] mx-auto">
                    <button class="carousel-arrow left-arrow" id="blog-prev">←</button>
                    <button class="carousel-arrow right-arrow" id="blog-next">→</button>
                    
                    <div class="portfolio-container" id="blog-container">
                        <div class="portfolio-track" id="blog-track">
                            ${blogPostsData.length === 0 ? `
                                <div style="width:100%; text-align:center; padding:3rem; color:#94a3b8; font-weight:600;">Připravujeme pro vás nové články...</div>
                            ` : `
                                ${blogPostsData.map(post => `
                                    <div class="blog-card-modern" 
                                        onclick="window.nnf_openBlog('${post.id}')"
                                        style="flex: 0 0 350px; background: white; border-radius: 2rem; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column;" 
                                    >
                                        <div style="height: 200px; overflow: hidden;">
                                            <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                                        </div>
                                        <div style="padding: 1.5rem 2rem 2rem;">
                                            <div style="font-size: 0.7rem; color: #f59e0b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">AKTUALITA • ${post.date}</div>
                                            <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; line-height: 1.3;">${post.title}</h3>
                                            <div style="color: #f59e0b; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">Číst článek <span>→</span></div>
                                        </div>
                                    </div>
                                `).join('')}
                                ${blogPostsData.length >= 3 ? blogPostsData.map(post => `
                                    <div class="blog-card-modern" 
                                        onclick="window.nnf_openBlog('${post.id}')"
                                        style="flex: 0 0 350px; background: white; border-radius: 2rem; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column;" 
                                    >
                                        <div style="height: 200px; overflow: hidden;">
                                            <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                                        </div>
                                        <div style="padding: 1.5rem 2rem 2rem;">
                                            <div style="font-size: 0.7rem; color: #f59e0b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">AKTUALITA • ${post.date}</div>
                                            <h3 style="font-size: 1.15rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; line-height: 1.3;">${post.title}</h3>
                                            <div style="color: #f59e0b; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">Číst článek <span>→</span></div>
                                        </div>
                                    </div>
                                `).join('') : ''}
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Carousel Logic
        const container = document.getElementById('blog-container');
        const nextBtn = document.getElementById('blog-next');
        const prevBtn = document.getElementById('blog-prev');

        if (container && nextBtn && prevBtn && blogPostsData.length > 0) {
            const scrollAmount = 382; // Card width + gap (350 + 32)
            nextBtn.onclick = () => container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            prevBtn.onclick = () => container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });

            // Auto-scroll logic
            let autoScroll = setInterval(() => {
                if (container.scrollLeft + container.offsetWidth >= container.scrollWidth - 100) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }, 6000);

            container.onmouseenter = () => clearInterval(autoScroll);
        }
    };
    render();
};

const initBlog = () => {
    if (!document.getElementById('blog_injected') || !document.getElementById('blog')) {
        const dummy = document.createElement('div');
        dummy.id = 'blog_injected';
        document.body.appendChild(dummy);
        injectBlog();
    }
};

const blogObserver = new MutationObserver((mutations) => {
    if (!document.getElementById('blog')) initBlog();
});

blogObserver.observe(document.body, { childList: true, subtree: true });
initBlog();
