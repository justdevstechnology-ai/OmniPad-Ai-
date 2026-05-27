// =======================================================
// 🛰️ FIREBASE CONFIGURATION ARCHITECTURE (REPLACING SUPABASE)
// =======================================================

const firebaseConfig = {
  apiKey: "AIzaSyBPFk5dgQufe7iSN49e93onlPw0EZJmPeU",
  authDomain: "trenddrop-3f5e4.firebaseapp.com",
  projectId: "trenddrop-3f5e4",
  storageBucket: "trenddrop-3f5e4.appspot.com",
  messagingSenderId: "839968116137",
  appId: "1:839968116137:web:146ddea9cdb9ae5410c8b8"
};

// Initialize Firebase Core Engine
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

let db;
let currentSessionId = Date.now().toString();
let isSignUpMode = false;

// =======================================================
// 🔐 NATIVE FIREBASE AUTHENTICATION FLOWS (ZERO-GLITCH PORTAL)
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    // Live security monitor listening to authentication status live
    auth.onAuthStateChanged((user) => {
        processCurrentAuthenticationState(user);
    });

    const toggleModeLink = document.getElementById("auth-toggle-mode");
    if (toggleModeLink) toggleModeLink.addEventListener("click", toggleAuthenticationModeView);

    const authForm = document.getElementById("auth-form");
    if (authForm) authForm.addEventListener("submit", executeAuthenticationPipeline);
});

function toggleAuthenticationModeView() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById("auth-title");
    const submitBtn = document.getElementById("auth-submit-btn");
    const switchText = document.getElementById("auth-switch-text");
    const toggleLink = document.getElementById("auth-toggle-mode");

    if (isSignUpMode) {
        title.textContent = "Create New Account";
        submitBtn.textContent = "Sign Up";
        switchText.textContent = "Already have an account?";
        toggleLink.textContent = "Sign In";
    } else {
        title.textContent = "Sign In to Workspace";
        submitBtn.textContent = "Sign In";
        switchText.textContent = "Don't have an account?";
        toggleLink.textContent = "Create Account";
    }
}

async function executeAuthenticationPipeline(e) {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const submitBtn = document.getElementById("auth-submit-btn");

    submitBtn.textContent = "Processing...";
    submitBtn.disabled = true;

    try {
        if (isSignUpMode) {
            // Native Account Creation Pipeline
            await auth.createUserWithEmailAndPassword(email, password);
            alert("Account initialized successfully under Tenora Labs architecture!");
        } else {
            // Native Account Authorization Sign In
            await auth.signInWithEmailAndPassword(email, password);
        }
    } catch (error) {
        alert("Firebase Auth Shield Alert: " + error.message);
    }

    submitBtn.textContent = isSignUpMode ? "Sign Up" : "Sign In";
    submitBtn.disabled = false;
}

function processCurrentAuthenticationState(user) {
    const overlayElement = document.getElementById("auth-overlay");
    if (!overlayElement) return;

    if (user) {
        overlayElement.style.display = "none";
        console.log("Access confirmed for Firebase UID:", user.uid);
    } else {
        overlayElement.style.display = "flex";
    }
}

// =======================================================
// 🎨 MARKDOWN ENGINE SPECIFICATION RULES
// =======================================================
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

window.copySnippet = function(button) {
    const preElement = button.closest('.code-block-wrapper').querySelector('pre code');
    executeClipboardWrite(preElement.textContent, button, "Copied!", "#137333");
};

window.copyMessageText = function(msgId, button) {
    const targetElement = document.getElementById(`text-${msgId}`);
    if (targetElement) {
        executeClipboardWrite(targetElement.textContent, button, '<i class="fas fa-check"></i>', '#137333');
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
    try { document.execCommand("copy"); successCallback(); } catch (err) { alert("Copy action failed."); }
    document.body.removeChild(textArea);
}

window.speakMessage = function(msgId, button) {
    if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            button.style.color = '';
            return;
        }
        const textToSpeak = document.getElementById(`text-${msgId}`)?.textContent;
        if (!textToSpeak) return;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onend = () => { button.style.color = ''; };
        utterance.onerror = () => { button.style.color = ''; };
        button.style.color = '#4285f4';
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Text-to-speech engine profile is unavailable.");
    }
};

window.toggleFeedback = function(button, type) {
    button.classList.toggle('active');
    const siblingIconClass = type === 'like' ? 'fa-thumbs-down' : 'fa-thumbs-up';
    const siblingButton = button.parentElement.querySelector(`.action-icon-btn .${siblingIconClass}`)?.closest('.action-icon-btn');
    if(siblingButton) siblingButton.classList.remove('active');
};

window.shareMessage = function(msgId) {
    const textNode = document.getElementById(`text-${msgId}`);
    if (textNode && navigator.share) {
        navigator.share({ title: 'OmniPad AI Response', text: textNode.textContent }).catch(() => {});
    }
};

// IndexedDB Initialization for Local Storage Channel Cache
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
    if (box) {
        box.innerHTML = '';
        appendMessageUI("Hello, I am OmniPad AI, compiled by Tenora Labs. Firebase core operational. Ready for production actions.", 'ai', 'init_msg');
    }
}

window.addEventListener('online', toggleNetwork);
window.addEventListener('offline', toggleNetwork);
function toggleNetwork() {
    const badge = document.getElementById('network-status'), dot = document.getElementById('mobile-status');
    if (navigator.onLine) { if(badge) badge.textContent = "Online"; if(badge) badge.classList.remove('offline'); if(dot) dot.style.color = "#137333"; }
    else { if(badge) badge.textContent = "Offline Mode"; if(badge) badge.classList.add('offline'); if(dot) dot.style.color = "#c5221f"; }
}

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
if (menuToggle) menuToggle.addEventListener('click', () => sidebar.classList.add('open'));

const closeBtn = document.getElementById('close-sidebar');
if(closeBtn) {
    closeBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
}

const sendBtn = document.getElementById('send-btn');
if (sendBtn) sendBtn.addEventListener('click', processMessage);

const userInput = document.getElementById('user-input');
if (userInput) {
    userInput.addEventListener('input', function() {
        this.style.height = 'auto'; this.style.height = (this.scrollHeight) + 'px';
    });
    userInput.addEventListener('keydown', (e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); processMessage(); } });
}

const newChatBtn = document.getElementById('new-chat-btn');
if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
        currentSessionId = Date.now().toString();
        initializeDefaultSession();
        sidebar.classList.remove('open');
    });
}

// Message Dispatch Core Processing Flow
async function processMessage() {
    const input = document.getElementById('user-input');
    if (!input) return;
    const promptText = input.value.trim();
    if(!promptText) return;
    
    const userMsgId = 'user_' + Date.now();
    appendMessageUI(promptText, 'user', userMsgId); 
    input.value = ''; input.style.height = 'auto'; sidebar.classList.remove('open');
    await writeToDB(currentSessionId, { id: userMsgId, role: 'user', text: promptText });

    const aiMsgId = 'ai_' + Date.now();

    if (navigator.onLine) {
        try {
            // Extract the user identification token securely from Firebase Session storage
            let idToken = '';
            if (auth.currentUser) {
                idToken = await auth.currentUser.getIdToken();
            }

            // Route execution vector to your backend AI edge pipeline processing
            const res = await fetch('https://stsnwvlihfwmexivtcjm.supabase.co/functions/v1/hyper-function', {
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': idToken ? `Bearer ${idToken}` : ''
                }, 
                body: JSON.stringify({ prompt: promptText })
            });

            if (!res.ok) {
                const errorBody = await res.text();
                alert("AI Engine Connection Alert: Status " + res.status + "\nDetails: " + errorBody);
                appendMessageUI("Engine Network Error: Status " + res.status, 'ai', aiMsgId);
                return;
            }

            const data = await res.json();
            if (data.error) {
                appendMessageUI("Engine Error: " + data.error, 'ai', aiMsgId);
            } else {
                appendMessageUI(data.reply, 'ai', aiMsgId, true); 
                await writeToDB(currentSessionId, { id: aiMsgId, role: 'ai', text: data.reply });
            }
        } catch (e) { 
            alert("Handshake Execution Failure Details:\n" + e.message);
            appendMessageUI("Could not establish handshake with server backend.", 'ai', aiMsgId); 
        }
    } else {
        const offReply = "Saved locally. Syncing data maps once network connection is restored.";
        appendMessageUI(offReply, 'ai', aiMsgId); 
        await writeToDB(currentSessionId, { id: aiMsgId, role: 'ai', text: offReply });
    }
}

function appendMessageUI(text, sender, msgId, shouldStream = false) {
    const box = document.getElementById('chat-container');
    if (!box) return;
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
            let index = 0, combinedText = "";
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

window.triggerMediaGeneration = function(type) {
    const aiMsgId = 'media_' + Date.now();
    let previewPlaceholder = "";
    if(type === 'image') previewPlaceholder = `<div class="media-attachment"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" alt="Asset"></div>`;
    else if(type === 'video') previewPlaceholder = `<div class="media-attachment"><video controls poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800"><source src="" type="video/mp4"></video></div>`;
    else if(type === 'audio') previewPlaceholder = `<div class="media-attachment"><audio controls></audio></div>`;

    const responseTemplate = `I have initiated the generation vectors for your request.<br>${previewPlaceholder}<br><small style="color:#9aa0a6;">Note: Production processing is offline until cloud configurations sync.</small>`;
    appendMessageUI(responseTemplate, 'ai', aiMsgId, false);
};

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
        tx.oncomplete = () => { renderHistorySidebar(); if (currentSessionId === sessionId) { document.getElementById('new-chat-btn')?.click(); } };
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

// =======================================================
// 📲 NATIVE PROGRESSIVE WEB APP REGISTRATION ENGINE
// =======================================================
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
            .then((reg) => console.log("Service Worker active under pipeline scope:", reg.scope))
            .catch((err) => console.error("Worker core failed registration protocol:", err));
    });
}
