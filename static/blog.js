/* Blog Injection & Premium Interaction Logic for NANOfusion */

let blogPostsData = [
    { 
        id: 1, 
        title: 'Jak probíhá čištění fasád?', 
        summary: 'Přečtěte si, jaké technologie používáme pro hloubkovou očistu vašeho domu...', 
        date: '10. 4. 2026', 
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800' 
    }
];

const hydrateBlog = async () => {
    try {
        const { supabase } = await import('./supabase-config.js');
        const { data, error } = await supabase.from('articles')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        if (!error && data && data.length > 0) {
            console.log('NANOfusion: Blog articles synchronized from Cloud');
            blogPostsData = data.map(d => ({
                id: d.id,
                title: d.title,
                summary: d.content?.substring(0, 120) + '...',
                content: d.content,
                date: new Date(d.published_at || d.created_at).toLocaleDateString('cs-CZ'),
                image: d.hero_image_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'
            }));
            injectBlog();
        }
    } catch (e) {
        console.error('Blog Sync Error:', e);
    }
};

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
                <div style="font-size:18px; line-height:1.7; color:#475569; white-space:pre-wrap;">${post.content || post.summary}</div>
                
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
    let blogSection = document.getElementById('blog');
    const referenceSection = document.getElementById('reference');
    const contactSection = document.getElementById('kontakt');
    
    if (!blogSection) {
        blogSection = document.createElement('section');
        blogSection.id = 'blog';
        blogSection.className = 'py-32 bg-white'; // Increased padding (v0.2 - 24 to 32)
    }

    if (referenceSection && referenceSection.parentNode) {
        referenceSection.parentNode.insertBefore(blogSection, referenceSection.nextSibling);
    } else if (contactSection && contactSection.parentNode) {
        contactSection.parentNode.insertBefore(blogSection, contactSection);
    }

    const render = () => {
        blogSection.innerHTML = `
            <div class="container mx-auto px-6">
                <div class="text-center mb-16 md:mb-24">
                    <h2 class="text-3xl md:text-5xl font-bold text-slate-800 mb-6">Nano-Magazín & Tipy</h2>
                    <p class="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">Sledujte rady a novinky, jak pečovat o váš dům s moderními technologiemi.</p>
                </div>
                
                <div style="position:relative; width:100%; max-width:1400px; margin:0 auto;">
                    <!-- Track Container -->
                    <div id="blog-scroller" style="display: flex; gap: 2rem; overflow-x: auto; scroll-behavior: smooth; padding: 1rem 0 3rem; scrollbar-width: none;">
                        ${blogPostsData.map(post => `
                            <div class="blog-card-modern" 
                                onclick="window.nnf_openBlog(${post.id})"
                                style="flex: 0 0 calc(33.333% - 1.34rem); min-width: 320px; background: white; border-radius: 2rem; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column;" 
                                onmouseover="this.style.transform='translateY(-10px)'; this.style.boxShadow='0 25px 45px rgba(0,0,0,0.1)';" 
                                onmouseout="this.style.transform='none'; this.style.boxShadow='0 10px 25px rgba(0,0,0,0.05)';"
                            >
                                <div style="height: 240px; overflow: hidden;">
                                    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                                </div>
                                <div style="padding: 2rem;">
                                    <div style="font-size: 0.75rem; color: #f59e0b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">AKTUALITA • ${post.date}</div>
                                    <h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; line-height: 1.3;">${post.title}</h3>
                                    <div style="color: #f59e0b; font-size: 0.8rem; font-weight: 700; display: flex; align-items: center; gap: 0.25rem;">Číst článek <span>→</span></div>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Premium Navigation Arrows (Side Positioned) -->
                    <button onclick="document.getElementById('blog-scroller').scrollLeft -= 500" 
                        class="hidden md:flex"
                        style="position: absolute; left: -25px; top: 50%; transform: translateY(-50%); z-index: 10; width: 60px; height: 60px; border-radius: 30px; background: #f59e0b !important; border: none; cursor: pointer; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3); transition: all 0.3s ease;"
                        onmouseover="this.style.scale='1.1'; this.style.backgroundColor='#d97706';"
                        onmouseout="this.style.scale='1'; this.style.backgroundColor='#f59e0b';"
                    > 
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white !important" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="stroke: white !important;"><path d="M15 18l-6-6 6-6"></path></svg> 
                    </button>
                    
                    <button onclick="document.getElementById('blog-scroller').scrollLeft += 500" 
                        class="hidden md:flex"
                        style="position: absolute; right: -25px; top: 50%; transform: translateY(-50%); z-index: 10; width: 60px; height: 60px; border-radius: 30px; background: #f59e0b !important; border: none; cursor: pointer; align-items: center; justify-content: center; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.3); transition: all 0.3s ease;"
                        onmouseover="this.style.scale='1.1'; this.style.backgroundColor='#d97706';"
                        onmouseout="this.style.scale='1'; this.style.backgroundColor='#f59e0b';"
                    > 
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white !important" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" style="stroke: white !important;"><path d="M9 18l6-6-6-6"></path></svg> 
                    </button>
                </div>
            </div>
            
            <style>
                #blog-scroller::-webkit-scrollbar { display: none; }
                @media (max-width: 768px) {
                    .blog-card-modern { flex: 0 0 90% !important; min-width: unset !important; }
                }
            </style>
        `;
    };

    render();
};

window.nnf_openBlog = (id) => {
    const post = blogPostsData.find(p => p.id === id);
    if (post) openBlogDetail(post);
};

const initBlog = () => {
    if (!document.getElementById('blog')) {
        injectBlog();
    }
};

// Start injection
injectBlog();
hydrateBlog();

// Fallback for late initialization
window.addEventListener('load', () => {
    setTimeout(hydrateBlog, 1200);
});
