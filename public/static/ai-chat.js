import { initSupabase } from './supabase-client.js'

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
        }
    };

    let chatState = 'INIT';
    let currentContext = 'GENERAL';
    let userData = { service: '', location: '', details: '', area: 0, contact: '' };

    const launcher = document.getElementById('ai-chat-launcher') || document.createElement('div');
    if (!launcher.id) {
        launcher.className = 'ai-chat-launcher';
        launcher.id = 'ai-chat-launcher';
        launcher.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>`;
        document.body.appendChild(launcher);
    }

    const chatWindow = document.getElementById('ai-chat-window') || document.createElement('div');
    if (!chatWindow.id) {
        chatWindow.className = 'ai-chat-window';
        chatWindow.id = 'ai-chat-window';
        chatWindow.innerHTML = `
            <div class="chat-header">
                <img src="/static/logo.jpg" alt="Nano-Asistent">
                <div class="chat-header-info"><h4>${chatConfig.name}</h4><p>${chatConfig.tagline}</p></div>
                <button id="close-chat" style="margin-left: auto; background: none; border: none; color: white; cursor: pointer; font-size: 1.5rem;">&times;</button>
            </div>
            <div class="chat-messages" id="chat-messages"><div id="typing" class="typing-indicator">Asistent píše...</div></div>
            <div class="chat-footer">
                <input type="text" class="chat-input" id="chat-input" placeholder="Napište zprávu...">
                <button class="chat-send-btn" id="chat-send">▶</button>
            </div>
        `;
        document.body.appendChild(chatWindow);
    }

    const msgContainer = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const typing = document.getElementById('typing');

    const addMessage = (text, type = 'bot', quickReplies = []) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        msgDiv.innerHTML = text;
        msgContainer.appendChild(msgDiv);
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
        setTimeout(() => {
            typing.style.display = 'none';
            addMessage(text, 'bot', quickReplies);
        }, delay);
    };

    const handleInput = (input) => {
        if (!input.trim()) return;
        addMessage(input, 'user');
        chatInput.value = '';
        setTimeout(() => processLogic(input, input.toLowerCase()), 600);
    };

    const processLogic = async (original, text) => {
        switch (chatState) {
            case 'INIT':
                chatState = 'ASK_SERVICE';
                botSay('Dobrý den! Jakou službu byste potřebovali zajistit?', ['Čištění střechy', 'Čištění fasády', 'Solární panely']);
                break;
            case 'ASK_SERVICE':
                userData.service = original;
                chatState = 'ASK_LOCATION';
                botSay('Skvěle. V jakém městě nebo lokalitě se objekt nachází?');
                break;
            case 'ASK_LOCATION':
                userData.location = original;
                chatState = 'ASK_CONTACT';
                botSay('Děkuji. Zanechte mi prosím na sebe telefonní číslo, aby se vám mohl ozvat náš technik.');
                break;
            case 'ASK_CONTACT':
                const contact = original;
                chatState = 'FINISHED';
                botSay('Děkuji! Poptávku jsem uložil do systému. Ozveme se vám do 24 hodin.');
                
                // --- SYNC TO ADMIN PANEL ---
                try {
                    const sb = await initSupabase();
                    const { error } = await sb.from('inquiries').insert([{
                        name: 'Zákazník z Chatu',
                        email: 'chat@nanofusion.cz',
                        phone: contact,
                        message: `Poptávka z AI Chatu. Lokalita: ${userData.location}. Služba: ${userData.service}`,
                        address: userData.location,
                        service: userData.service,
                        source: 'ai_chat',
                        status: 'new'
                    }]);
                    if (error) throw error;
                    console.log('AI Inquiry Synced to Admin');
                } catch (e) {
                    console.error('AI Sync Failure:', e);
                }
                break;
        }
    };

    launcher.onclick = () => {
        chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
        if (chatWindow.style.display === 'flex' && chatState === 'INIT') processLogic('', '');
    };
    document.getElementById('close-chat').onclick = () => chatWindow.style.display = 'none';
    sendBtn.onclick = () => handleInput(chatInput.value);
    chatInput.onkeypress = (e) => { if (e.key === 'Enter') handleInput(chatInput.value); };

    // Auto-pop
    setTimeout(() => {
        if (chatWindow.style.display !== 'flex') {
            chatWindow.style.display = 'flex';
            if (chatState === 'INIT') processLogic('', '');
        }
    }, 5000);
});
