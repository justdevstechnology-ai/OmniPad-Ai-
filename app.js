// =======================================================
// 📡 GLOBAL SYSTEMS ARCHITECTURE & LOCAL DB SYSTEM
// =======================================================
let db = null;
const DB_NAME = "OmniPadStructuredDB";
const DB_VERSION = 1;
let currentSessionId = Date.now().toString();
let isSignUpMode = false;

// Initialize Client-Side Offline Database Pipeline
const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

dbRequest.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("conversations")) {
        db.createObjectStore("conversations", { keyPath: "id" });
    }
};

dbRequest.onsuccess = (event) => {
    db = event.target.result;
    console.log("Tenora Database Core: Connection established successfully.");
    renderHistorySidebar();
    initializeDefaultSession();
};

dbRequest.onerror = (event) => {
    console.error("Database Engine Exception:", event.target.error);
};

// =======================================================
// 🛰️ FIREBASE CONFIGURATION ARCHITECTURE
// =======================================================
const firebaseConfig = {
  apiKey: "AIzaSyApwDPZ7dcQv9sRxm85r4UQbpwqNDlNdE8",
  authDomain: "omnipad-ai.firebaseapp.com",
  databaseURL: "https://omnipad-ai-default-rtdb.firebaseio.com",
  projectId: "omnipad-ai",
  storageBucket: "omnipad-ai.firebasestorage.app",
  messagingSenderId: "623322278493",
  appId: "1:623322278493:web:d52c83bb60523085937bb4"
};

// Initialize Firebase Core Engine
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// =======================================================
// 🔐 NATIVE FIREBASE AUTHENTICATION FLOWS (MOBILE REDIRECT)
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    // 🛠️ FIXED: Prevent login page flashing on refresh if user is already authenticated
    const overlayElement = document.getElementById("auth-overlay");
    if (overlayElement && !sessionStorage.getItem("auth_checked")) {
        overlayElement.style.display = "none"; 
    }

    // Live security monitor listening to authentication status live
    auth.onAuthStateChanged((user) => {
        sessionStorage.setItem("auth_checked", "true");
        processCurrentAuthenticationState(user);
    });

    const toggleModeLink = document.getElementById("auth-toggle-mode");
    if (toggleModeLink) toggleModeLink.addEventListener("click", toggleAuthenticationModeView);

    const authForm = document.getElementById("auth-form");
    if (authForm) authForm.addEventListener("submit", executeAuthenticationPipeline);

    // Secure Password Reset Engine Listener Vector
    const forgotPasswordLink = document.getElementById("auth-forgot-password");
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", async () => {
            const emailInput = document.getElementById("auth-email").value.trim();
            
            if (!emailInput) {
                alert("Please type your account email address into the input field first.");
                return;
            }

            try {
                await auth.sendPasswordResetEmail(emailInput);
                alert("A secure password reset link has been dispatched to your email address via Tenora automated infrastructure.");
            } catch (error) {
                alert("Firebase Reset Engine Exception: " + error.message);
            }
        });
    }

    // Development Workspace Logout Trigger Bindings
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to log out of the Tenora workspace?")) {
                auth.signOut().then(() => {
                    alert("Workspace session terminated securely.");
                }).catch((error) => {
                    alert("Sign Out Error: " + error.message);
                });
            }
        });
    }
});

function toggleAuthenticationModeView() {
    isSignUpMode = !isSignUpMode;
    const title = document.getElementById("auth-title");
    const submitBtn = document.getElementById("auth-submit-btn");
    const switchText = document.getElementById("auth-switch-text");
    const toggleLink = document.getElementById("auth-toggle-mode");
    const forgotArea = document.getElementById("auth-forgot-password")?.closest('p');

    if (isSignUpMode) {
        title.textContent = "Create New Account";
        submitBtn.textContent = "Sign Up";
        switchText.textContent = "Already have an account?";
        toggleLink.textContent = "Sign In";
        if (forgotArea) forgotArea.style.display = "none"; 
    } else {
        title.textContent = "Sign In to Workspace";
        submitBtn.textContent = "Sign In";
        switchText.textContent = "Don't have an account?";
        toggleLink.textContent = "Create Account";
        if (forgotArea) forgotArea.style.display = "block"; 
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
            await auth.createUserWithEmailAndPassword(email, password);
            alert("Account initialized successfully under Tenora Labs architecture!");
        } else {
            await auth.signInWithEmailAndPassword(email, password);
        }
    } catch (error) {
        alert("Firebase Auth Shield Alert: " + error.message);
    }

    submitBtn.textContent = isSignUpMode ? "Sign Up" : "Sign In";
    submitBtn.disabled = false;
}

// TRIGGER SECURE DEVICE REDIRECT PIPELINE (Bypasses broken mobile popups)
async function launchGoogleAuthenticationRedirect() {
    const googleBtn = document.getElementById("google-login-btn");
    const googleText = document.getElementById("google-btn-text");
    if (!googleBtn) return;

    googleBtn.disabled = true;
    if (googleText) googleText.textContent = "Connecting to Google...";

    const provider = new firebase.auth.GoogleAuthProvider();
    
    try {
        await auth.signInWithRedirect(provider);
    } catch (error) {
        alert("Google Auth Exception: " + error.message);
        googleBtn.disabled = false;
        if (googleText) googleText.textContent = "Continue with Google";
    }
}

// VIEWPORT SECURE LOCK ENGINE & PROFILE DISPLAY INTEL
let currentCredits = 0;

function processCurrentAuthenticationState(user) {
    const overlayElement = document.getElementById("auth-overlay");
    if (!overlayElement) return;

    if (user) {
        overlayElement.style.display = "none";
        console.log("Access confirmed for Firebase UID:", user.uid);

        // 🆕 Check credits + give signup bonus if first time
        checkAndGiveSignupBonus(user.uid, () => user.getIdToken());

        // Dynamically inject user credentials cleanly at the bottom arrangement layer of the sidebar
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            let profileHeader = document.getElementById('workspace-profile-card');
            if (!profileHeader) {
                profileHeader = document.createElement('div');
                profileHeader.id = 'workspace-profile-card';
                profileHeader.style.cssText = "padding: 12px; margin-top: auto; margin-bottom: 8px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 12px; overflow: hidden; background: rgba(255,255,255,0.02); border-radius: 12px;";

                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    sidebar.insertBefore(profileHeader, logoutBtn);
                } else {
                    sidebar.appendChild(profileHeader);
                }
            }

            const avatarUrl = user.photoURL || 'https://www.gstatic.com/images/branding/product/2x/avatar_anonymous_74dp.png';
            const profileName = user.displayName || (user.email? user.email.split('@')[0] : "Tenora User");
            const profileEmail = user.email || "No Email Provided";

            profileHeader.innerHTML = `
                <img src="${avatarUrl}" alt="User Avatar" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--accent); object-fit: cover; flex-shrink: 0;">
                <div style="display: flex; flex-direction: column; overflow: hidden; text-align: left; width: 100%;">
                    <span style="color: #ffffff; font-weight: 700; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${profileName}</span>
                    <span style="color: #9aa0a6; font-size: 0.72rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${profileEmail}</span>
                    <span id="credit-display" style="color: var(--accent); font-size: 0.7rem; font-weight: 600; margin-top: 2px;">Credits: 0</span>
                </div>
            `;
        }

        renderHistorySidebar();
    } else {
        overlayElement.style.display = "flex";

        const existingCard = document.getElementById('workspace-profile-card');
        if (existingCard) existingCard.remove();
    }
}

async function checkAndGiveSignupBonus(uid, getTokenFn) {
    try {
        const idToken = await getTokenFn();
        const res = await fetch('https://stsnwvlihfwmexivtcjm.supabase.co/functions/v1/addAdCredit', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const data = await res.json();

        if(data.success) {
            currentCredits = data.newCredits;
            updateCreditDisplay();
            if(data.bonus) console.log("Signup bonus: 10 credits given");
        }
    } catch(e) {
        console.log("Credit check failed:", e);
    }
}

function updateCreditDisplay() {
    const creditEl = document.getElementById('credit-display');
    if(creditEl) creditEl.textContent = `Credits: ${currentCredits}`;
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
        // Fetches clean text layout data directly, bypassing code block shell copies
        const cleanContent = targetElement.querySelector('pre code') ? targetElement.innerText : targetElement.textContent;
        executeClipboardWrite(cleanContent, button, '<i class="fas fa-check"></i>', '#137333');
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

// Fallback mechanical selector execution for systems lacking advanced navigator scopes
function fallbackCopy(text, successCallback) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand("copy"); successCallback(); } catch (err) { alert("Copy action failed."); }
    document.body.removeChild(textArea);
}

// =======================================================
// 🔊 ACCESSIBILITY AUDIO MODULES (OPTIMIZED FOR CLARITY)
// =======================================================
window.speakMessage = function(msgId, button) {
    if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            button.style.color = '';
            return;
        }
        
        const targetNode = document.getElementById(`text-${msgId}`);
        if (!targetNode) return;

        let textToSpeak = "";
        const cloneNode = targetNode.cloneNode(true);
        cloneNode.querySelectorAll('.code-block-header, .copy-code-btn').forEach(el => el.remove());
        textToSpeak = cloneNode.innerText || cloneNode.textContent;

        if (!textToSpeak.trim()) return;

        const utterance = new SpeechSynthesisUtterance(textToSpeak.trim());
        
        // 🛠️ CORESET: Fetch all available device voices
        const voices = window.speechSynthesis.getVoices();
        
        // Filter for high-clarity natural English profiles (Google native, Apple Premium, or Microsoft crisp)
        const premiumVoice = voices.find(voice => 
            (voice.lang.includes('en-US') || voice.lang.includes('en-GB')) && 
            (voice.name.includes('Google') || voice.name.includes('Natural') || voice.name.includes('Premium'))
        ) || voices.find(voice => voice.lang.includes('en')); // Fallback to any English voice

        if (premiumVoice) {
            utterance.voice = premiumVoice;
            console.log("Selected high-clarity voice node:", premiumVoice.name);
        }
        
        // Optimizing audio physics for maximum clarity over phone speakers
        utterance.rate = 0.95; // Slightly slower pace for razor-sharp pronunciation
        utterance.pitch = 1.0; // Balanced natural tone
        
        utterance.onend = () => { button.style.color = ''; };
        utterance.onerror = (e) => { 
            console.error("Speech Synthesis Stream Broken:", e);
            button.style.color = ''; 
        };
        
        button.style.color = '#4285f4';
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Text-to-speech engine profile is unavailable or blocked on this device browser scope.");
    }
};

// Android utility lifecycle patch to pre-cache voices cleanly
if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

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

function initializeDefaultSession() {
    const box = document.getElementById('chat-container');
    if (box) {
        box.innerHTML = '';
        appendMessageUI("Hello, I am OmniPad AI, compiled by Tenora Labs. Firebase core operational. Ready for production actions.", 'ai', 'init_msg');
    }
}

// =======================================================
// 🌐 SYSTEM NETWORK STATE HANDLERS
// =======================================================
window.addEventListener('online', toggleNetwork);
window.addEventListener('offline', toggleNetwork);
function toggleNetwork() {
    const badge = document.getElementById('network-status'), dot = document.getElementById('mobile-status');
    if (navigator.onLine) { if(badge) badge.textContent = "Online"; if(badge) badge.classList.remove('offline'); if(dot) dot.style.color = "#137333"; }
    else { if(badge) badge.textContent = "Offline Mode"; if(badge) badge.classList.add('offline'); if(dot) dot.style.color = "#c5221f"; }
}

// =======================================================
// 📱 MOBILE INTERACTION EVENT WRAPPERS
// =======================================================
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

// Password Visibility Toggler Engine for Mobile Viewports
const passwordInput = document.getElementById("auth-password");
const eyeToggler = document.getElementById("password-visibility-toggler");
if (eyeToggler && passwordInput) {
    eyeToggler.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeToggler.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            passwordInput.type = "password";
            eyeToggler.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
}

// =======================================================
// 💬 CHAT UTILITIES & SMART SCROLL TYPEWRITER ENGINE
// =======================================================
function appendMessageUI(text, sender, msgId, shouldStream = false) {
    const box = document.getElementById('chat-container');
    if (!box) return;
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.id = `msg-block-${msgId}`;
    
    if (sender === 'user') {
        div.innerHTML = `
            <div class="message-header">
                <span class="sender-title"><i class="fas fa-user-circle"></i> You</span>
                <div>
                    <button class="action-icon-btn" onclick="editUserMessage('${msgId}')" title="Edit Message"><i class="fas fa-pencil-alt"></i></button>
                    <button class="action-icon-btn" onclick="deleteSingleMessage('${msgId}')" style="color: #ea4335;" title="Delete Message"><i class="fas fa-trash"></i></button>
                    <button class="action-icon-btn" onclick="copyMessageText('${msgId}', this)" title="Copy Input"><i class="fas fa-copy"></i></button>
                </div>
            </div>
            <div class="message-text-content" id="text-${msgId}">${text}</div>`;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    } else {
        const isErrorMsg = text.includes("Connection Alert") || text.includes("Network Error") || text.includes("Could not establish handshake");
        const retryButtonMarkup = isErrorMsg ? `<button class="action-icon-btn" onclick="retryLastFailedMessage('${msgId}')" style="color: #4285f4; font-weight: bold; font-size: 0.8rem;" title="Retry Transmission"><i class="fas fa-redo-alt"></i> Retry</button>` : '';

        div.innerHTML = `
            <div class="message-header">
                <span class="sender-title">
                    <button class="action-icon-btn" onclick="speakMessage('${msgId}', this)" title="Listen to Text" style="padding:0; margin-right:4px;"><i class="fas fa-volume-up"></i></button>
                    OmniPad AI
                </span>
                <div>
                    ${retryButtonMarkup}
                    <button class="action-icon-btn" onclick="deleteSingleMessage('${msgId}')" style="color: #ea4335;" title="Delete Message"><i class="fas fa-trash"></i></button>
                    <button class="action-icon-btn" onclick="copyMessageText('${msgId}', this)" title="Copy Response"><i class="fas fa-copy"></i></button>
                </div>
            </div>
            <div class="message-text-content" id="text-${msgId}"></div>
            <div class="message-footer-actions">
                <button class="action-icon-btn" onclick="toggleFeedback(this, 'like')" title="Good response"><i class="far fa-thumbs-up"></i></button>
                                <button class="action-icon-btn" onclick="toggleFeedback(this, 'dislike')" title="Bad response"><i class="far fa-thumbs-down"></i></button>
                <button class="action-icon-btn" onclick="shareMessage('${msgId}')" title="Share"><i class="fas fa-share-nodes"></i></button>
            </div>`;
        box.appendChild(div);
        
        const textTarget = div.querySelector(`#text-${msgId}`);
        if (!textTarget) return;
        
        if (shouldStream) {
            const words = text.split(" ");
            let index = 0, combinedText = "";
            
            function renderWordChunk() {
                if (index < words.length) {
                    // 🛠️ FIXED: Calculate if user has intentionally scrolled up to read text
                    // If they scroll up by more than 80px, isUserAtBottom evaluates to false and unlocks the anchor
                    const distanceToBottom = box.scrollHeight - box.clientHeight - box.scrollTop;
                    const isUserAtBottom = distanceToBottom <= 80;
                    
                    combinedText += words[index] + " ";
                    textTarget.innerHTML = marked.parse(combinedText);
                    
                    // Smooth tracking updates only fire if the anchor isn't locked by an manual scroll-up gesture
                    if (isUserAtBottom) {
                        box.scrollTop = box.scrollHeight - box.clientHeight;
                    }
                    index++;
                    setTimeout(renderWordChunk, 30); 
                } else {
                    const distanceToBottom = box.scrollHeight - box.clientHeight - box.scrollTop;
                    const isUserAtBottom = distanceToBottom <= 80;
                    textTarget.innerHTML = marked.parse(text);
                    
                    if (isUserAtBottom) {
                        box.scrollTop = box.scrollHeight - box.clientHeight;
                    }
                    
                    if (typeof TenoraBilling !== 'undefined') TenoraBilling.updateInterfaceVisibility();
                }
            }
            renderWordChunk();
        } else {
            textTarget.innerHTML = marked.parse(text);
            box.scrollTop = box.scrollHeight - box.clientHeight;
            if (typeof TenoraBilling !== 'undefined') TenoraBilling.updateInterfaceVisibility();
        }
    }
}

// 📝 PROFESSIONAL SINGLE MESSAGE EDIT ENGINE
window.editUserMessage = function(msgId) {
    const textContainer = document.getElementById(`text-${msgId}`);
    if (!textContainer) return;
    
    const currentText = textContainer.textContent;
    const inputField = document.getElementById('user-input');
    
    if (inputField) {
        inputField.value = currentText;
        inputField.focus();
        inputField.style.height = 'auto';
        inputField.style.height = (inputField.scrollHeight) + 'px';
        
        inputField.placeholder = "Editing selected message...";
        inputField.style.borderLeft = "3px solid var(--accent)";
        
        deleteSingleMessage(msgId, true);
    }
};

// 🔄 AUTOMATED RETRY PIPELINE ACTION ENGINE
window.retryLastFailedMessage = function(failedAiMsgId) {
    const failedAiBlock = document.getElementById(`msg-block-${failedAiMsgId}`);
    if (!failedAiBlock) return;

    // Look backward sequentially to extract the user's prompt text content parameters
    const previousMessageBlock = failedAiBlock.previousElementSibling;
    if (previousMessageBlock && previousMessageBlock.classList.contains('user')) {
        const textNode = previousMessageBlock.querySelector('.message-text-content');
        if (textNode) {
            const promptText = textNode.textContent;
            
            // Clean up the broken AI response node element from display viewport
            failedAiBlock.remove();
            
            // Push prompt values directly back into the input container field and trigger execution
            const inputField = document.getElementById('user-input');
            if (inputField) {
                // Remove the old message logs completely so they don't append duplicates
                previousMessageBlock.remove();
                
                // Set text input context targets directly and fire up the engine execution routine
                inputField.value = promptText;
                processMessage();
            }
        }
    }
};

// 🗑️ PROFESSIONAL SINGLE MESSAGE DELETION PIPELINE
window.deleteSingleMessage = function(msgId, isSilentReset = false) {
    if (!isSilentReset && !confirm("Delete this message from workspace view?")) return;

    const messageBlock = document.getElementById(`msg-block-${msgId}`);
    if (messageBlock) {
        const nextBlock = messageBlock.nextElementSibling;
        if (nextBlock && nextBlock.classList.contains('ai')) {
            nextBlock.remove();
        }
        messageBlock.remove();
    }

    if (db && currentSessionId) {
        const tx = db.transaction(["conversations"], "readwrite");
        const store = tx.objectStore("conversations");
        
        store.get(currentSessionId).onsuccess = (e) => {
            const record = e.target.result;
            if (record) {
                const targetIndex = record.logs.findIndex(log => log.id === msgId);
                if (targetIndex !== -1) {
                    if (record.logs[targetIndex + 1] && record.logs[targetIndex + 1].role === 'ai') {
                        record.logs.splice(targetIndex, 2);
                    } else {
                        record.logs.splice(targetIndex, 1);
                    }
                    store.put(record);
                }
            }
        };
    }
};

// Message Dispatch Core Processing Flow With Active Multi-Currency Validation
async function processMessage() {
    const input = document.getElementById('user-input');
    if (!input) return;
    const promptText = input.value.trim();
    if(!promptText) return;

    const user = auth.currentUser;
    if (!user) {
        alert("Please sign in first");
        return;
    }

    // 🛑 CREDIT GATE - DEDUCT BEFORE AI CALL
    try {
        const idToken = await user.getIdToken();
        const creditRes = await fetch('https://stsnwvlihfwmexivtcjm.supabase.co/functions/v1/useCredit', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (creditRes.status === 402) {
            const upgradeModal = document.getElementById('premium-upgrade-modal');
            if (upgradeModal) upgradeModal.style.display = 'flex';
            alert("No credits left. Upgrade to premium or watch ad.");
            return; // STOP HERE. Don't call AI
        }

        if (!creditRes.ok) {
            alert("Auth error. Please sign in again.");
            return;
        }

        const creditData = await creditRes.json();
        if (creditData.success) {
            TenoraBilling.credits = creditData.newCredits;
            currentCredits = creditData.newCredits;
            updateCreditDisplay();
            if (typeof TenoraBilling !== 'undefined') TenoraBilling.updateInterfaceVisibility();
        } else {
            alert(creditData.error || "No credits");
            return;
        }
    } catch(e) {
        console.error(e);
        alert("Credit check failed: " + e.message);
        return;
    }
    // ===== END CREDIT GATE =====
    
    const userMsgId = 'user_' + Date.now();
    appendMessageUI(promptText, 'user', userMsgId); 
    
    input.value = ''; 
    input.style.height = 'auto'; 
    sidebar.classList.remove('open');
    
    const userMessageElement = document.getElementById(`msg-block-${userMsgId}`);
    const box = document.getElementById('chat-container');
    if (userMessageElement && box) {
        setTimeout(() => {
            box.scrollTo({
                top: userMessageElement.offsetTop - 16,
                behavior: 'smooth'
            });
        }, 60);
    }
    
    await writeToDB(currentSessionId, { id: userMsgId, role: 'user', text: promptText });

    const aiMsgId = 'ai_' + Date.now();

    if (navigator.onLine) {
        try {
            let structuralHistory = [];
            if (db) {
                const crossChatPromise = new Promise((resolve) => {
                    const tx = db.transaction(["conversations"], "readonly");
                    const store = tx.objectStore("conversations");
                    const request = store.openCursor(null, 'prev');
                    
                    let activeSessionContext = [];
                    let backgroundSessionContext = [];

                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            const session = cursor.value;
                            const mappedLogs = session.logs.map(log => ({
                                role: log.role === 'user' ? 'user' : 'model',
                                parts: [{ text: `[Session Title: ${session.title}] ${log.text}` }]
                            }));

                            if (session.id === currentSessionId) {
                                activeSessionContext = mappedLogs;
                            } else {
                                backgroundSessionContext.push({
                                    role: 'user',
                                    parts: [{ text: `[System Archive Note: The following dialog occurred in an alternative chat workspace titled "${session.title}"]` }]
                                });
                                backgroundSessionContext = backgroundSessionContext.concat(mappedLogs);
                            }
                            cursor.continue();
                        } else {
                            structuralHistory = backgroundSessionContext.concat(activeSessionContext);
                            resolve();
                        }
                    };
                });
                await crossChatPromise;
            }

            const res = await fetch('https://stsnwvlihfwmexivtcjm.supabase.co/functions/v1/hyper-function', {
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                }, 
                body: JSON.stringify({ 
                    prompt: promptText,
                    history: structuralHistory 
                })
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

// MEDIA GENERATION INTERACTION LAYER
window.triggerMediaGeneration = function(type) {
    const aiMsgId = 'media_' + Date.now();
    let previewPlaceholder = "";
    if(type === 'image') previewPlaceholder = `<div class="media-attachment"><img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" alt="Asset"></div>`;
    else if(type === 'video') previewPlaceholder = `<div class="media-attachment"><video controls poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800"><source src="" type="video/mp4"></video></div>`;
    else if(type === 'audio') previewPlaceholder = `<div class="media-attachment"><audio controls></audio></div>`;

    const responseTemplate = `I have initiated the generation vectors for your request.<br>${previewPlaceholder}<br><small style="color:#9aa0a6;">Note: Production processing is offline until cloud configurations sync.</small>`;
    appendMessageUI(responseTemplate, 'ai', aiMsgId, false);
};

// =======================================================
// 📂 HISTORY CONTROLLER & TOUCH SCREEN DELETION ENGINE
// =======================================================
function writeToDB(sessionId, messageBlock) {
    return new Promise((resolve) => {
        if(!db) { resolve(); return; }
        
        const tx = db.transaction(["conversations"], "readwrite");
        const store = tx.objectStore("conversations");
        const getReq = store.get(sessionId);
        
        getReq.onsuccess = async () => {
            let cleanTitle = messageBlock.text;
            if (cleanTitle.length > 26) {
                cleanTitle = cleanTitle.substring(0, 24) + "...";
            }

            let record = getReq.result || { id: sessionId, title: cleanTitle, logs: [] };
            record.logs.push(messageBlock); 
            store.put(record); 
            
            tx.oncomplete = () => { renderHistorySidebar(); 
            resolve(); 
            };
        };
    });
}

function renderHistorySidebar() {
    const list = document.getElementById('history-list'); if(!list || !db) return; list.innerHTML = '';
    db.transaction(["conversations"], "readonly").objectStore("conversations").openCursor(null, 'prev').onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            const id = cursor.value.id, item = document.createElement('div');
            item.classList.add('history-item'); item.textContent = cursor.value.title;
            
            item.onclick = (event) => {
                if (!item.classList.contains('deleting')) {
                    loadActiveSession(id);
                }
            };

            // Mobile Long-Press Hold Trigger (700ms) for Deletion
            let pressTimer;
            const startPress = () => { 
                pressTimer = setTimeout(() => {
                    item.classList.add('deleting');
                    deleteSession(id);
                    setTimeout(() => item.classList.remove('deleting'), 1000);
                }, 700); 
            };
            const endPress = () => { clearTimeout(pressTimer); };
            
            item.addEventListener('touchstart', startPress, { passive: true });
            item.addEventListener('touchend', endPress, { passive: true });
            item.addEventListener('mousedown', startPress);
            item.addEventListener('mouseup', endPress);
            item.addEventListener('mouseleave', endPress);

            list.appendChild(item); 
            cursor.continue();
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

function deleteSession(sessionId) {
    if (confirm("Delete this chat session permanently from history?")) {
        const tx = db.transaction(["conversations"], "readwrite");
        tx.objectStore("conversations").delete(sessionId);
        tx.oncomplete = () => { 
            renderHistorySidebar(); 
            if (currentSessionId === sessionId) { 
                document.getElementById('new-chat-btn')?.click(); 
            } 
        };
    }
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

// =======================================================
// 📱 MOBILE TAP-TO-DISMISS SIDEBAR LISTENERS
// =======================================================
document.addEventListener("DOMContentLoaded", () => {
    const mainChatView = document.getElementById('chat-container');
    const mobileSidebar = document.getElementById('sidebar');
    
    if (mainChatView && mobileSidebar) {
        mainChatView.addEventListener('click', () => {
            if (mobileSidebar.classList.contains('open')) {
                mobileSidebar.classList.remove('open');
            }
        });
        
        mainChatView.addEventListener('touchstart', () => {
            if (mobileSidebar.classList.contains('open')) {
                mobileSidebar.classList.remove('open');
            }
        }, { passive: true });
    }
});
