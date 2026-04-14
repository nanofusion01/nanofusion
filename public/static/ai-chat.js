/* AI Nano-Assistant for NANOfusion */

document.addEventListener('DOMContentLoaded', () => {
    const chatConfig = {
        name: 'Nano-Asistent',
        tagline: 'Odborník na hloubkové čištění a ochranu',
        prices: {
            roof: 190, facade: 150, pavement: 120, pv: 80,
            graffiti: 250, industrial: 130, 'facade-paint': 200, 'roof-paint': 180,
            impregnation: 70, antislip: 120, ceramfloor: 250, antibac: 80,
            default: 150
        },
        markup: 1.10 // 10% premium for safe anchoring
    };

    let chatState = 'INIT';
    let currentContext = 'GENERAL';
    let chatHistory = []; // Pro sledování celého chatu
    let userData = {
        service: '',
        location: '',
        details: '',
        area: 0,
        contact: ''
    };

    // --- Dynamic Context Tracking ---
    const targetSections = ['sluzby', 'realizace', 'reference', 'proces'];
    const ctxObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                currentContext = entry.target.id.toUpperCase();
                console.log(`AI Chat Context: ${currentContext}`);
            }
        });
    }, { threshold: 0.5 });

    targetSections.forEach(id => {
        const el = document.getElementById(id);
        if (el) ctxObserver.observe(el);
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        const isMobile = window.innerWidth < 768;
        const welcome = isMobile ? 'Zdravím! Jsem váš Nano-asistent. 📱' : 'Dobrý den! Jsem váš Nano-asistent pro ochranu povrchů.';
        
        if (hour < 12) return welcome + ' Jak vám mohu dnes ráno pomoci?';
        if (hour < 18) return welcome + ' S čím vám mohu dnes pomoci?';
        return welcome + ' Přejete si probrat ochranu vašeho objektu?';
    };

    // Create the UI HTML
    const launcher = document.createElement('div');
    launcher.className = 'ai-chat-launcher';
    launcher.id = 'ai-chat-launcher';
    launcher.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
    `;
    document.body.appendChild(launcher);

    const chatWindow = document.createElement('div');
    chatWindow.className = 'ai-chat-window';
    chatWindow.id = 'ai-chat-window';
    chatWindow.innerHTML = `
        <div class="chat-header">
            <img src="/static/logo.jpg" alt="Nano-Asistent">
            <div class="chat-header-info">
                <h4>${chatConfig.name}</h4>
                <p>${chatConfig.tagline}</p>
            </div>
            <button id="close-chat" style="margin-left: auto; background: none; border: none; color: white; cursor: pointer; font-size: 1.5rem;">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages">
            <div id="typing" class="typing-indicator">Asistent píše...</div>
        </div>
        <div class="chat-footer">
            <input type="text" class="chat-input" id="chat-input" placeholder="Napište zprávu...">
            <button class="chat-send-btn" id="chat-send">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
            </button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    const msgContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const typing = document.getElementById('typing');

    // --- Notification System v2 ---
    let audioContext = null;
    const initAudio = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
    };

    const playNotification = () => {
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        if (!audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    };

    // Unlock audio on ANY interaction
    ['click', 'touchstart', 'scroll'].forEach(evt => {
        document.addEventListener(evt, initAudio, { once: true });
    });

    // Toggle Chat
    launcher.onclick = () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        if (chatWindow.style.display === 'flex') {
            playNotification();
            if (chatState === 'INIT') startChat();
        }
    };

    document.getElementById('close-chat').onclick = () => {
        chatWindow.style.display = 'none';
    };

    const addMessage = (text, type = 'bot', quickReplies = []) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = text;
        msgContainer.appendChild(msgDiv);
        
        chatHistory.push({ type: type === 'bot' ? 'Asistent' : 'Zákazník', text: text, time: new Date().toLocaleTimeString('cs-CZ') });

        if (quickReplies.length > 0) {
            const repliesDiv = document.createElement('div');
            repliesDiv.className = 'quick-replies';
            quickReplies.forEach(reply => {
                const btn = document.createElement('button');
                btn.className = 'quick-reply-btn';
                btn.innerText = reply;
                btn.onclick = () => {
                    // Special case for navigation buttons
                    if (reply.startsWith('🔗')) {
                        const target = reply.includes('Recenze') ? 'reference' : 
                                       reply.includes('Realizace') ? 'realizace' : 
                                       reply.includes('Služby') ? 'sluzby' : '';
                        if (target) {
                            document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
                            chatWindow.style.display = 'none';
                            return;
                        }
                    }
                    handleInput(reply);
                };
                repliesDiv.appendChild(btn);
            });
            msgContainer.appendChild(repliesDiv);
        }
        msgContainer.scrollTop = msgContainer.scrollHeight;
    };

    const botSay = (text, quickReplies = [], delay = 800) => {
        typing.style.display = 'block';
        msgContainer.scrollTop = msgContainer.scrollHeight;
        setTimeout(() => {
            typing.style.display = 'none';
            addMessage(text, 'bot', quickReplies);
        }, delay);
    };

    const startChat = () => {
        chatState = 'ASK_SERVICE';
        botSay(getGreeting(), [
            'Čištění střechy/fasády',
            'Solární panely',
            'Nátěry střech/fasád',
            'Služby pro firmy'
        ]);
    };

    const handleInput = (input) => {
        if (!input.trim()) return;
        addMessage(input, 'user');
        chatInput.value = '';
        setTimeout(() => processLogic(input, input.toLowerCase()), 600);
    };

    // --- Nanobot Knowledge Base ---
    const knowledgeBase = {
        okapy: {
            keywords: ['okap', 'rýny', 'odtok'],
            answer: 'Ano, čištění a kontrola okapů je standardní součástí naší renovace střech. Chceme, aby váš dům po našem zásahu fungoval jako celek. Máte okapy hodně zanesené?'
        },
        zaruka: {
            keywords: ['záruk', 'garanc', 'jak dlouho vydrží'],
            answer: 'U naší nano-ochrany dáváme garanci až 10 let na funkčnost povrchu. Technologie NANOfusion zabraňuje hloubkovému usazování nečistot a růstu mechů.'
        },
        rychlost: {
            keywords: ['jak dlouho to trvá', 'termín', 'kdy začnete'],
            answer: 'Většinu rodinných domů stihneme kompletně vyčistit a ošetřit během 1 až 2 dnů. Aktuálně máme volné termíny v horizontu 14 dnů.'
        },
        cena: {
            keywords: ['cena', 'kolik to stojí', 'rozpočet', 'peněz'],
            answer: 'Cena je individuální a závisí na ploše a stavu povrchu. Abych vám mohl říct aspoň orientační rozmezí, potřeboval bych znát přibližnou plochu v m².'
        }
    };

    const processLogic = (original, text) => {
        // First, check for general questions (FAQ)
        for (let key in knowledgeBase) {
            const entry = knowledgeBase[key];
            if (entry.keywords.some(k => text.includes(k))) {
                botSay(entry.answer);
                // After answering, we wait a bit and ask the current state question if not finished
                if (chatState !== 'FINISHED') {
                    setTimeout(() => botSay(`Vraťme se ale k vaší poptávce. **${getStateQuestion()}**`), 2500);
                }
                return;
            }
        }

        switch (chatState) {
            case 'ASK_SERVICE':
                userData.service = original;
                chatState = 'ASK_LOCATION';
                botSay('Skvělá volba! Pro začátek mi napište, v jakém **městě nebo lokalitě** by se práce prováděly? 📍');
                break;

            case 'ASK_LOCATION':
                userData.location = original;
                chatState = 'ASK_AREA';
                botSay(`V lokalitě **${userData.location}** působíme velmi často! O jak **velkou plochu** (m²) nebo rozsah se přibližně jedná?`);
                break;

            case 'ASK_AREA':
                userData.area = text.replace(/[^0-9]/g, '') || 'nezadáno';
                chatState = 'ASK_CONTACT';
                botSay('Děkuji za informace. Abych vám mohl zaslat přesný propočet a domluvit termín, zanechte mi prosím vaše **telefonní číslo**. 📞');
                break;

            case 'ASK_CONTACT':
                userData.contact = original;
                chatState = 'FINISHED';
                botSay('Perfektní, vaše poptávka je v systému! Kolegové se vám do 24 hodin ozvou s finálním návrhem. ✨');
                botSay('Co by vás zajímalo dál? Můžeme probrat detaily, nebo se můžete podívat na naši práci.', [
                    'Chci dál diskutovat 💬',
                    '🔗 Ukázat Recenze',
                    '🔗 Ukázat Realizace',
                    '🔗 Ostatní Služby'
                ]);
                
                const leads = JSON.parse(localStorage.getItem('nanofusion_leads') || '[]');
                leads.unshift({ id: Date.now(), name: 'Zákazník z Chatu', phone: original, service: userData.service, area: userData.area, location: userData.location });
                localStorage.setItem('nanofusion_leads', JSON.stringify(leads));
                break;

            case 'FINISHED':
                botSay('Jsem připraven na vaše dotazy. Co vás konkrétně zajímá ohledně našich technologií nebo záruk?');
                break;

            default:
                botSay('Rozumím. S čím dalším vám mohu pomoci?');
        }
    };

    const getStateQuestion = () => {
        switch (chatState) {
            case 'ASK_SERVICE': return 'Jakou službu bychom pro vás měli zajistit?';
            case 'ASK_LOCATION': return 'V jaké lokalitě se váš objekt nachází?';
            case 'ASK_AREA': return 'O jak velkou plochu (m²) se přibližně jedná?';
            case 'ASK_CONTACT': return 'Na jaké číslo vám můžeme zavolat s nabídkou?';
            default: return 'Zajímají vás další detaily?';
        }
    };

    sendBtn.onclick = () => handleInput(chatInput.value);
    chatInput.onkeypress = (e) => { if (e.key === 'Enter') handleInput(chatInput.value); };

    // --- Auto-pop logic (Delayed) ---
    // Note: Sounds will only play IF a user interaction has happened before this.
    // We can't force sound without any user click on the whole page.
});
