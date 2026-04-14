/* AI Nano-Assistant for NANOfusion */

document.addEventListener('DOMContentLoaded', () => {
    const chatConfig = {
        name: 'Nano-Asistent',
        tagline: 'Odborník na hloubkové čištění a ochranu',
        prices: {
            roof: 190,
            facade: 150,
            pavement: 120,
            pv: 80,
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
        switch(currentContext) {
            case 'SLUZBY': return 'Zaujaly vás naše nano-technologie? Kterou část domu potřebujete ošetřit?';
            case 'REALIZACE': return 'Líbí se vám naše výsledky? Chcete propočítat cenu pro podobný projekt?';
            case 'REFERENCE': return 'Naši klienti jsou nadšení. Chcete vědět, co přesně jsme pro ně dělali?';
            case 'PROCES': return 'Vypadá to složitě? Nebojte, postaráme se o vše. S čím vám mohu pomoci?';
            default: return 'Hezký den! Jsem váš Nano-asistent. S čím vám dnes mohu pomoci?';
        }
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

    // Toggle Chat
    launcher.onclick = () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        if (chatState === 'INIT') {
            startChat();
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
        
        // Ukládáme každou zprávu pro CMS
        chatHistory.push({
            type: type === 'bot' ? 'Asistent' : 'Zákazník',
            text: text,
            time: new Date().toLocaleTimeString('cs-CZ')
        });

        if (quickReplies.length > 0) {
            const repliesDiv = document.createElement('div');
            repliesDiv.className = 'quick-replies';
            quickReplies.forEach(reply => {
                const btn = document.createElement('button');
                btn.className = 'quick-reply-btn';
                btn.innerText = reply;
                btn.onclick = () => handleInput(reply);
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
            'Čištění střechy',
            'Čištění fasády',
            'Čištění dlažby'
        ]);
    };

    const handleInput = (input) => {
        if (!input.trim()) return;
        addMessage(input, 'user');
        chatInput.value = '';

        setTimeout(() => processLogic(input, input.toLowerCase()), 600);
    };

    const processLogic = (original, text) => {
        switch (chatState) {
            case 'ASK_SERVICE':
                if (text.includes('střech')) userData.service = 'roof';
                else if (text.includes('fasád')) userData.service = 'facade';
                else if (text.includes('dlaž')) userData.service = 'pavement';
                else if (text.includes('solár')) userData.service = 'pv';
                else userData.service = 'default';

                chatState = 'ASK_LOCATION';
                botSay('Skvělá volba! A kde se váš objekt nachází? 📍');
                break;

            case 'ASK_LOCATION':
                userData.location = original;
                chatState = 'ASK_DETAILS';
                botSay(`V lokalitě **${userData.location}** to dobře známe! Můžete mi o tom říct víc? Třeba jak moc je povrch znečištěný, nebo jestli tam máme dobrý přístup (lešení, plošina)? 🏠`);
                break;

            case 'ASK_DETAILS':
                userData.details = original;
                chatState = 'ASK_AREA';
                botSay('Rozumím, díky za info. Poslední věc pro hrubou kalkulaci – o jak velkou plochu (m²) se přibližně jedná?');
                break;

            case 'ASK_AREA':
                const areaNum = parseInt(text.replace(/[^0-9]/g, ''));
                if (isNaN(areaNum) || areaNum <= 0) {
                    botSay('Zkuste prosím napsat jen přibližné číslo m² (např. 150).');
                } else {
                    userData.area = areaNum;
                    chatState = 'ASK_CONTACT';
                    botSay('Perfektní. Než vám propočítám orientační rozmezí ceny, poprosím vás o jméno a telefon, kam vám můžeme nabídku finálně zaslat. 📞');
                }
                break;

            case 'ASK_CONTACT':
                userData.contact = original;
                
                // Calculate Price Range with 10% Markup
                const base = (chatConfig.prices[userData.service] || chatConfig.prices.default) * userData.area;
                const markupBase = base * chatConfig.markup;
                
                const min = Math.round((markupBase * 0.95) / 100) * 100;
                const max = Math.round((markupBase * 1.15) / 100) * 100;
                const rangeStr = `${min.toLocaleString('cs-CZ')} – ${max.toLocaleString('cs-CZ')} Kč`;

                // Save lead to the existing system
                const leads = JSON.parse(localStorage.getItem('nanofusion_leads') || '[]');
                leads.unshift({
                    id: Date.now(),
                    date: new Date().toLocaleString('cs-CZ'),
                    name: userData.contact,
                    phone: 'Viz zpráva',
                    service: userData.service,
                    source: 'AI Prodavač v2',
                    status: 'Nová',
                    priceRange: rangeStr,
                    history: chatHistory,
                    details: `Plocha: ${userData.area} m2, Lok: ${userData.location}, Detaily: ${userData.details}`
                });
                localStorage.setItem('nanofusion_leads', JSON.stringify(leads));

                chatState = 'FINISHED';
                botSay(`Děkuji! Předběžně počítejte s investicí v rozmezí **${rangeStr}**. Přesnou cenu si potvrdíme na místě po zaměření.`);
                botSay('Právě jsem to odeslal kolegům, do 24 hodin se vám ozveme. Budu se těšit na spolupráci! ✨');
                break;

            default:
                botSay('Rád vám pomůžu s čímkoliv dalším. Máte dotaz k technologii nebo záruce?', ['Technologie', 'Záruka', 'Reference']);
        }
    };

    sendBtn.onclick = () => handleInput(chatInput.value);
    chatInput.onkeypress = (e) => { if (e.key === 'Enter') handleInput(chatInput.value); };

    // --- Auto-pop Logic ---
    setTimeout(() => {
        const launcher = document.getElementById('ai-chat-launcher');
        const chatWindow = document.getElementById('ai-chat-window');
        // Check if chat is still hidden and not opened by user yet
        if (launcher && chatWindow && chatWindow.style.display === 'none') {
            launcher.click();
            console.log('AI Chat: Automatické otevření pro zvýšení konverze.');
        }
    }, 5000); // 5 sekund po načtení
});
