let db;
let currentSessionId = Date.now().toString();

// Custom Markdown Parsing System Rules
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

// Clipboard Handlers
window.copySnippet = function(button) {
    const preElement = button.closest('.code-block-wrapper').querySelector('pre code');
    const codeText = preElement.textContent;
    executeClipboardWrite(codeText, button, "Copied!", "#137333");
};

window.copyMessageText = function(msgId, button) {
    const textContent = document.getElementById(`text-${msgId}`).textContent;
    executeClipboardWrite(textContent, button, '<i class="fas fa-check"></i>', '#137333');
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
    try { document.execCommand("copy"); successCallback(); } catch (err) { alert("Copy action failed."); }
    document.body.removeChild(textArea);
}

// Global Native TTS Speech Engine Controller
window.speakMessage = function(msgId, button) {
    if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            button.style.color = '';
            return;
        }
        const textToSpeak = document.getElementById(`text-${msgId}`).textContent;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        utterance.onend = () => { button.style.color = ''; };
        utterance.onerror = () => { button.style.color = ''; };
        
        button.style.color = '#4285f4';
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Text-to-speech engine profile is unavailable on this device.");
    }
};

// Interface Interactive State Toggles
window.toggleFeedback = function(button, type) {
    button.classList.toggle('active');
    const siblingClass = type === 'like' ? '.fa-thumbs-down' : '.fa-thumbs-up';
    const sibling = button.parentElement.querySelector(siblingClass);
    if(sibling) sibling.parentElement.classList.remove('active');
};

window.shareMessage = function(msgId) {
    const shareText = document.getElementById(`text-${msgId}`).textContent;
    if (navigator.share) {
        navigator.share({ title: 'OmniPad AI Response', text: shareText }).catch(() => {});
    } else {
        alert("Native share sheet profile is unsupported. Copy the text directly to transmit manually.");
    }
};

// IndexedDB Initialization Architecture
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
    box.innerHTML = '';
    appendMessageUI("Hello, I am OmniPad AI, compiled by Tenora Labs. Spacing arrays optimized for mobile viewports. Ready for layout instructions.", 'ai', 'init_msg');
}

// Online/Offline Network Detectors
window.addEventListener('online', toggleNetwork);
window.addEventListener('offline', toggleNetwork);
function toggleNetwork() {
    const badge = document.getElementById('network-status'), dot = document.getElementById('mobile-status');
    if (navigator.onLine) { badge.textContent = "Online"; badge.classList.remove('offline'); dot.style.color = "#137333"; }
    else { badge.textContent = "Offline Mode"; badge.classList.add('offline'); dot.style.color = "#c5221f"; }
}

// Client Side Input Control Adjustments
const sidebar = document.getElementById('sidebar');
document.getElementById('menu-toggle').addEventListener('click', () => sidebar.classList.add('open'));

const closeBtn = document.getElementById('close-sidebar');
if(closeBtn) {
    closeBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
}

document.getElementById('send-btn').addEventListener('click', processMessage);
document.getElementById('user-input').addEventListener('input', function() {
    this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px';
});
document.getElementById('user-input').addEventListener('keydown', (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processMessage(); } });

document.getElementById('new-chat-btn').addEventListener('click', () => {
    currentSessionId = Date.now().toString();
    initializeDefaultSession();
    sidebar.classList.remove('open');
});

// Primary Message Handling Pipelines
async function processMessage() {
    const input = document.getElementById('user-input'), promptText = input.value.trim();
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

// Word-by-Word Streaming Engine Interface Logic
function appendMessageUI(text, sender, msgId, shouldStream = false) {
    const box = document.getElementById('chat-container');
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
        
        if (shouldStream) {
            // Split by space to get clean typewriter words
            const words = text.split(" ");
            let index = 0;
            let combinedText = "";
            
            function renderWordChunk() {
                if (index < words.length) {
                    combinedText += words[index] + " ";
                    textTarget.innerHTML = marked.parse(combinedText);
                    box.scrollTop = box.scrollHeight;
                    index++;
                    setTimeout(renderWordChunk, 45); // Standard word streaming rate
                } else {
                    // Double check final rendering passes validation
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

// Media Engine Generation Architecture Gateways
window.triggerMediaGeneration = function(type) {
    const aiMsgId = 'media_' + Date.now();
    let previewPlaceholder = "";
    
    if(type === 'image') {
        previewPlaceholder = `
            <div class="media-attachment">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" alt="AI Engine Generation Concept">
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
        tx.oncomplete = () => { renderHistorySidebar(); if (currentSessionId === sessionId) document.getElementById('new-chat-btn').click(); };
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
        const box = document.getElementById('chat-container'); box.innerHTML = '';
        record.logs.forEach(msg => appendMessageUI(msg.text, msg.role, msg.id || 'old_msg')); 
        sidebar.classList.remove('open');
    };
  }
            
