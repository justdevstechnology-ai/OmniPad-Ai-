// ==========================================
// 🛰️ SUPABASE CONFIGURATION LAYER
// ==========================================
const SUPABASE_URL = 'https://stsnwvlihfwmexivtcjm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0c253dmxpaGZ3bWV4aXZ0Y2ptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMzQ4OTAsImV4cCI6MjA5NDgxMDg5MH0.VSl8Qnd6lLmoka2m9l2Z5zd_dQrHPslnfuLQhVGdmp8'; 
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

let db;
let currentSessionId = Date.now().toString();

// ==========================================
// 🔐 GOOGLE OAUTH SECURITY HANDLER SYSTEM
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
    if (supabase) {
        // Evaluate active login token parameters
        const { data: { session } } = await supabase.auth.getSession();
        evaluateAuthState(session);

        // Realtime OAuth tracking pipeline
        supabase.auth.onAuthStateChange((_event, session) => {
            evaluateAuthState(session);
        });
    }

    // Bind Google Interface Node
    const loginBtn = document.getElementById("google-login-btn");
    if(loginBtn) loginBtn.addEventListener("click", executeGoogleOAuthRedirect);
});

async function executeGoogleOAuthRedirect() {
    if (!supabase) return alert("Supabase engine handshake failed to initialize.");
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });
    if (error) alert("OAuth Gateway Exception: " + error.message);
}

function evaluateAuthState(session) {
    const authOverlay = document.getElementById("auth-overlay");
    if (!authOverlay) return;

    if (session) {
        authOverlay.style.display = "none";
        console.log("Verified Session Node Authorized:", session.user.id);
    } else {
        authOverlay.style.display = "flex";
    }
}

// ==========================================
// 🎨 MARKDOWN ENGINE SPECIFICATION
// ==========================================
const renderer = new marked.Renderer();
renderer.code = function(codeObj, infostring) {
    const code = typeof codeObj === 'object' ? codeObj.text : codeObj;
    const lang = (typeof codeObj === 'object' ? codeObj.lang : infostring) || 'code';
    return `
        <div class="code-block-wrapper">
            <div class="code-block-header">
                <span>${lang}</span>
                <button class="copy-code-btn" onclick="copySnippet(this)">Copy</button>
            </div>
            <pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>`;
};
marked.setOptions({ renderer: renderer, breaks: true });

// Clipboard Controllers
window.copySnippet = function(button) {
    const preElement = button.closest('.code-block-wrapper').querySelector('pre code');
    const codeText = preElement.textContent;
    executeClipboardWrite(codeText, button, "Copied!", "#137333");
};

window.copyMessageText = function(msgId, button) {
    const textTarget = document.getElementById(`text-${msgId}`);
    if (textTarget) {
        executeClipboardWrite(textTarget.textContent, button, '<i class="fas fa-check"></i>', '#137333');
    }
};

function executeClipboardWrite(text, button, successContent, activeBg) {
    const originalContent = button.innerHTML;
    const originalBg = button.style.background || 'none';
    const originalBorder = button.style.borderColor || '';

    function showSuccess() {
        button.innerHTML = successContent;
        if(activeBg !== 'none') { button.style.background = activeBg; button.style.borderColor = activeBg; }
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.style.background = originalBg; button.style.borderColor = originalBorder;
        }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showSuccess, () => fallbackCopy(text, showSuccess));
    } else {
        fallbackCopy(text, showSuccess);
    }
}

function fallbackCopy(text, successCallback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand("copy"); successCallback(); } catch (err) { alert("Copy strategy exception."); }
    document.body.removeChild(textArea);
}

// Global Text-to-Speech Controller 
window.speakMessage = function(msgId, button) {
    if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            button.style.color = '';
            return;
        }
        const textContainer = document.getElementById(`text-${msgId}`);
        if (!textContainer) {
            alert("Speech compilation container array match missing.");
            return;
        }
        const textToSpeak = textContainer.textContent;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        utterance.onend = () => { button.style.color = ''; };
        utterance.onerror = () => { button.style.color = ''; };
        
        button.style.color = '#4285f4';
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Native speech profile missing from current device.");
    }
};

// Interface Interactive State Toggles
window.toggleFeedback = function(button, type) {
    button.classList.toggle('active');
    const siblingIconClass = type === 'like' ? 'fa-thumbs-down' : 'fa-thumbs-up';
    const siblingButton = button.parentElement.querySelector(`.action-icon-btn .${siblingIconClass}`)?.closest('.action-icon-btn');
    if(siblingButton) siblingButton.classList.remove('active');
};

window.shareMessage = function(msgId) {
    const textContainer = document.getElementById(`text-${msgId}`);
    if (textContainer && navigator.share) {
        navigator.share({ title: 'OmniPad AI Response', text: textContainer.textContent }).catch(() => {});
    } else {
        alert("Sharing layer profile unsupported on this terminal configuration.");
    }
};

// IndexedDB Sync Initialization
const request = indexedDB.open("OmniPadStructuredDB", 1);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("conversations")) db.createObjectStore("conversations", { keyPath: "id" });
};
request.onsuccess = (e) => { 
    db = e.target.result; 
    renderHistorySidebar(); 
    initializeDefaultSession();
};

function initializeDefaultSession() {
    const box = document.getElementById('chat-container');
    if(box) {
        box.innerHTML = '';
        appendMessageUI("Hello, I am OmniPad AI, compiled by Tenora Labs. Spacing arrays optimized for mobile viewports. Ready for layout instructions.", 'ai', 'init_msg');
    }
}

// Online/Offline State Handlers
window.addEventListener('online', toggleNetwork);
window.addEventListener('offline', toggleNetwork);
function toggleNetwork() {
    const badge = document.getElementById('network-status'), dot = document.getElementById('mobile-status');
    if (navigator.onLine) { if(badge) badge.textContent = "Online"; if(badge) badge.classList.remove('offline'); if(dot) dot.style.color = "#137333"; }
    else { if(badge) badge.textContent = "Offline Mode"; if(badge) badge.classList.add('offline'); if(dot) dot.style.color = "#c5221f"; }
}

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
if(menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.add('open'));

const closeBtn = document.getElementById('close-sidebar');
if(closeBtn) {
    closeBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
}

const sendBtn = document.getElementById('send-btn');
if(sendBtn) sendBtn.addEventListener('click', processMessage);

const userInput = document.getElementById('user-input');
if(userInput) {
    userInput.addEventListener('input', function() {
        this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px';
    });
    userInput.addEventListener('keydown', (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processMessage(); } });
}

const newChatBtn = document.getElementById('new-chat-btn');
if(newChatBtn) {
    newChatBtn.addEventListener('click', () => {
        currentSessionId = Date.now().toString();
        initializeDefaultSession();
        sidebar.classList.remove('open');
    });
}

// Processing pipeline execution channels
async function processMessage() {
    const input = document.getElementById('user-input');
    if(!input) return;
    const promptText = input.value.trim();
    if(!promptText) return;
    
    const userMsgId = 'user_' + Date.now();
    appendMessageUI(promptText, 'user', userMsgId); 
    input.value = ''; input.style.height = 'auto'; sidebar.classList.remove('open');
    await writeToDB(currentSessionId, { id: userMsgId, role: 'user', text: promptText });

    const aiMsgId = 'ai_' + Date.now();

    if (navigator.onLine) {
        try {
            const res = await fetch('https://stsnwvlihfwmexivtcjm.supabase.co/functions/v1/hyper-function', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: promptText })
            });
            const data = await res.json();
            if (data.error) {
                appendMessageUI("Engine Error: " + data.error, 'ai', aiMsgId);
            } else {
                appendMessageUI(data.reply, 'ai', aiMsgId, true); 
                await writeToDB(currentSessionId, { id: aiMsgId, role: 'ai', text: data.reply });
            }
        } catch (e) { 
            appendMessageUI("Could not establish handshake with server backend.", 'ai', aiMsgId); 
        }
    } else {
        const offReply = "Saved locally. Syncing data maps once network connection is restored.";
        appendMessageUI(offReply, 'ai', aiMsgId); 
        await writeToDB(currentSessionId, { id: aiMsgId, role: 'ai', text: offReply });
    }
}

// Word-by-Word Typewriter Architecture Engine
function appendMessageUI(text, sender, msgId, shouldStream = false) {
    const box = document.getElementById('chat-container');
    if(!box) return;
    const div = document.createElement('div');
    div.classList.add('message', sender);
    
    if (sender === 'user') {
        div.innerHTML = `
            <div class="message-header">
                <span class="sender-title"><i class="fas fa-user-circle"></i> You</span>
                <button class="action-icon-btn" onclick="copyMessageText('${msgId}', this)" title="Copy Input"><i class="fas fa-copy"></i></button>
            </div>
            <div class="message-text-content" id="text-${msgId}">${text}</div>`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    } else {
        div.innerHTML = `
            <div class="message-header">
                <span class="sender-title">
                    <button class="action-icon-btn" onclick="speakMessage('${msgId}', this)" title="Listen to Text" style="padding:0; margin-right:4px;"><i class="fas fa-volume-up"></i></button>
                    OmniPad AI
                </span>
                <button class="action-icon-btn" onclick="copyMessageText('${msgId}', this)" title="Copy Response"><i class="fas fa-copy"></i></button>
            </div>
            <div class="message-text-content" id="text-${msgId}"></div>
            <div class="message-footer-actions">
                <button class="action-icon-btn" onclick="toggleFeedback(this, 'like')" title="Good response"><i class="far fa-thumbs-up"></i></button>
                <button class="action-icon-btn" onclick="toggleFeedback(this, 'dislike')" title="Bad response"><i class="far fa-thumbs-down"></i></button>
                <button class="action-icon-btn" onclick="shareMessage('${msgId}')" title="Share"><i class="fas fa-share-nodes"></i></button>
            </div>`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
        
        const textTarget = div.querySelector(`#text-${msgId}`);
        if (!textTarget) return;
        
        if (shouldStream) {
            const words = text.split(" ");
            let index = 0;
            let combinedText = "";
            
            function renderWordChunk() {
                if (index < words.length) {
                    combinedText += words[index] + " ";
                    textTarget.innerHTML = marked.parse(combinedText);
                    box.scrollTop = box.scrollHeight;
                    index++;
                    setTimeout(renderWordChunk, 45); 
                } else {
                    textTarget.innerHTML = marked.parse(text);
                }
            }
            renderWordChunk();
        } else {
            textTarget.innerHTML = marked.parse(text);
            box.scrollTop = box.scrollHeight;
        }
    }
}

// Media Generation Core Triggers
window.triggerMediaGeneration = function(type) {
    const aiMsgId = 'media_' + Date.now();
    let previewPlaceholder = "";
    
    if(type === 'image') {
        previewPlaceholder = `
            <div class="media-attachment">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" alt="AI Asset">
            </div>`;
    } else if(type === 'video') {
        previewPlaceholder = `
            <div class="media-attachment">
                <video controls poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800">
                    <source src="" type="video/mp4">
                </video>
            </div>`;
    } else if(type === 'audio') {
        previewPlaceholder = `
            <div class="media-attachment">
                <audio controls></audio>
            </div>`;
    }

    const responseTemplate = `I have initiated the generation vectors for your request. Below is your generated asset container:<br>${previewPlaceholder}<br><small style="color:#9aa0a6;">Note: Integration pipelines will run completely once backend billing profiles are live in Supabase.</small>`;
    appendMessageUI(responseTemplate, 'ai', aiMsgId, false);
};

// Database Layer Logic
function writeToDB(sessionId, messageBlock) {
    return new Promise((resolve) => {
        if(!db) { resolve(); return; }
        const tx = db.transaction(["conversations"], "readwrite"), store = tx.objectStore("conversations"), getReq = store.get(sessionId);
        getReq.onsuccess = () => {
            let record = getReq.result || { id: sessionId, title: messageBlock.text, logs: [] };
            record.logs.push(messageBlock); store.put(record); tx.oncomplete = () => { renderHistorySidebar(); resolve(); };
        };
    });
}

function deleteSession(sessionId) {
    if (confirm("Delete this chat session permanently from history?")) {
        const tx = db.transaction(["conversations"], "readwrite");
        tx.objectStore("conversations").delete(sessionId);
        tx.oncomplete = () => { renderHistorySidebar(); if (currentSessionId === sessionId) { const btn = document.getElementById('new-chat-btn'); if(btn) btn.click(); } };
    }
}

function renderHistorySidebar() {
    const list = document.getElementById('history-list'); if(!list || !db) return; list.innerHTML = '';
    db.transaction(["conversations"], "readonly").objectStore("conversations").openCursor(null, 'prev').onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            const id = cursor.value.id, item = document.createElement('div');
            item.classList.add('history-item'); item.textContent = cursor.value.title;
            item.onclick = () => loadActiveSession(id);
            
            let pressTimer;
            item.addEventListener('touchstart', () => { pressTimer = setTimeout(() => deleteSession(id), 800); });
            item.addEventListener('touchend', () => clearTimeout(pressTimer));
            item.addEventListener('mousedown', () => { pressTimer = setTimeout(() => deleteSession(id), 800); });
            item.addEventListener('mouseup', () => clearTimeout(pressTimer));
            item.addEventListener('mouseleave', () => clearTimeout(pressTimer));

            list.appendChild(item); cursor.continue();
        }
    };
}

function loadActiveSession(sessionId) {
    currentSessionId = sessionId;
    db.transaction(["conversations"], "readonly").objectStore("conversations").get(sessionId).onsuccess = (e) => {
        const record = e.target.result; if(!record) return;
        const box = document.getElementById('chat-container'); if(!box) return; box.innerHTML = '';
        record.logs.forEach(msg => appendMessageUI(msg.text, msg.role, msg.id || 'old_msg')); 
        sidebar.classList.remove('open');
    };
}
