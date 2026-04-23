/* AI Nano-Assistant (GPT-4o Powered) for NANOfusion */

document.addEventListener('DOMContentLoaded', () => {
    const chatConfig = {
        name: 'Nano-Asistent',
        tagline: 'Inteligentní odborník na povrchy',
        apiUrl: 'https://mgmtkdwvhgrzefmyucvr.supabase.co/functions/v1/nano-assistant'
    };

    let chatHistory = []; 
    let isWaiting = false;
    let sessionId = crypto.randomUUID();

    // UI Creation (Launcher & Window)
    const initUI = () => {
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
                <div class="message bot">Dobrý den! Jsem váš inteligentní asistent. S čím vám mohu dnes pomoci? (Čištění střech, fasád, nebo snad orientační kalkulace?)</div>
                <div id="typing" class="typing-indicator" style="display:none">Asistent přemýšlí...</div>
            </div>
            <div class="chat-footer">
                <input type="text" class="chat-input" id="chat-input" placeholder="Zeptejte se na cokoliv...">
                <button class="chat-send-btn" id="chat-send">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                </button>
            </div>
        `;
        document.body.appendChild(chatWindow);

        launcher.onclick = () => {
            chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
            if (chatWindow.style.display === 'flex') document.getElementById('chat-input').focus();
        };

        document.getElementById('close-chat').onclick = () => chatWindow.style.display = 'none';
        document.getElementById('chat-send').onclick = () => handleSend();
        document.getElementById('chat-input').onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
    };

    const addMessage = (text, type = 'bot') => {
        const msgContainer = document.getElementById('chat-messages');
        const typing = document.getElementById('typing');
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        
        // Simple Markdown-like formatting
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // Remove internal LEAD tags from UI
        formattedText = formattedText.replace(/\[LEAD:.*?\]/g, '');

        msgDiv.innerHTML = formattedText;
        msgContainer.insertBefore(msgDiv, typing);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        chatHistory.push({ role: type === 'bot' ? 'assistant' : 'user', content: text });
        
        // Save to Supabase (Background)
        saveHistory();
    };

    const handleSend = async () => {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text || isWaiting) return;

        input.value = '';
        addMessage(text, 'user');
        
        isWaiting = true;
        const typing = document.getElementById('typing');
        typing.style.display = 'block';
        document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;

        try {
            const response = await fetch(chatConfig.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatHistory, session_id: sessionId })
            });
            
            const data = await response.json();
            typing.style.display = 'none';
            isWaiting = false;

            if (data.reply) {
                addMessage(data.reply, 'bot');
                checkAndSaveLead(data.reply);
            } else {
                addMessage('Omlouvám se, ale došlo k chybě v mém nano-mozku. Zkuste to prosím znovu.', 'bot');
            }
        } catch (e) {
            console.error('AI Error:', e);
            typing.style.display = 'none';
            isWaiting = false;
            addMessage('Momentálně nejsem schopen odpovídat. Zkuste to prosím za chvíli.', 'bot');
        }
    };

    const checkAndSaveLead = (text) => {
        const match = text.match(/\[LEAD:(.*?)\]/);
        if (match) {
            const leadInfo = match[1];
            import('./supabase-config.js').then(({ supabase }) => {
                supabase.from('inquiries').insert({
                    name: 'Zákazník (AI Chat)',
                    message: `Poptávka z AI Chatu: ${leadInfo}`,
                    source: 'chat',
                    status: 'new'
                }).then(() => console.log('AI Lead Captured'));
            });
        }
    };

    const saveHistory = () => {
        import('./supabase-config.js').then(({ supabase }) => {
            supabase.from('chat_sessions').upsert({
                session_token: sessionId,
                messages: chatHistory,
                last_activity: new Date().toISOString(),
                status: 'open'
            }, { onConflict: 'session_token' });
        });
    };

    initUI();

    // Auto-pop logic (4s)
    setTimeout(() => {
        const win = document.getElementById('ai-chat-window');
        if (win && win.style.display !== 'flex') {
            document.getElementById('ai-chat-launcher').click();
        }
    }, 4000);
});
