// =======================================================
// 💎 TENORA LABS ECONOMY CONTROLLER (FIREBASE STORAGE ENGINE)
// =======================================================
const TenoraBilling = {
    credits: 5,
    isPremium: false,
    currentTier: 'free', 
    expirationTimestamp: null,
    displayCurrency: 'USD', // Default tracking configuration
    isSyncing: false,       // Prevents duplicate sync loops during operations

    currencyProfiles: {
        USD: { symbol: '$', label: 'USD ($)', daily: 0.50, weekly: 2.50, monthly: 8.50, creditValue: 0.05 },
        NGN: { symbol: '₦', label: 'NGN (₦)', daily: 500,  weekly: 2500, monthly: 8500, creditValue: 50 },
        GHS: { symbol: '₵', label: 'GHS (₵)', daily: 7.00,  weekly: 35.00, monthly: 120.00, creditValue: 0.70 },
        KES: { symbol: 'KSh', label: 'KES (KSh)', daily: 65.00, weekly: 325.00, monthly: 1100.00, creditValue: 6.50 },
        ZAR: { symbol: 'R', label: 'ZAR (R)', daily: 10.00, weekly: 50.00, monthly: 160.00, creditValue: 0.95 },
        GBP: { symbol: '£', label: 'GBP (£)', daily: 0.40,  weekly: 2.00,  monthly: 7.00, creditValue: 0.04 }
    },

    init() {
        this.injectBillingInterface();
        this.bindDockTriggers();
        
        // 🔐 Listen for Firebase authentication states before attempting storage hooks
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.loadAccountEconomyState(user.uid);
            } else {
                // Reset display state if user logs out completely
                this.credits = 0;
                this.isPremium = false;
                this.currentTier = 'free';
                this.updateInterfaceVisibility();
            }
        });
    },

    async loadAccountEconomyState(uid) {
        try {
            const userDocRef = firebase.firestore().collection('users').doc(uid);
            const doc = await userDocRef.get();

            if (doc.exists && doc.data().billing) {
                const data = doc.data().billing;
                this.credits = parseInt(data.credits ?? 5);
                this.isPremium = data.isPremium === true;
                this.currentTier = data.currentTier || 'free';
                this.displayCurrency = data.displayCurrency || 'USD';
                this.expirationTimestamp = data.expirationTimestamp ? parseInt(data.expirationTimestamp) : null;
            } else {
                // 🎁 FIRST TIME REGISTERED USER INITIALIZATION
                this.credits = 10; // Sign-up bonus
                this.isPremium = false;
                this.currentTier = 'free';
                this.displayCurrency = 'USD';
                this.expirationTimestamp = null;
                
                await this.saveAccountEconomyState(uid);
            }
            
            this.validatePassExpiration(uid);
            this.updateInterfaceVisibility();
        } catch (error) {
            console.error("Cloud Retrieval Error: Unable to sync user ledger.", error);
        }
    },

    async saveAccountEconomyState(uid = firebase.auth().currentUser?.uid) {
        if (!uid) return;
        this.isSyncing = true;
        try {
            await firebase.firestore().collection('users').doc(uid).set({
                billing: {
                    credits: this.credits,
                    isPremium: this.isPremium,
                    currentTier: this.currentTier,
                    displayCurrency: this.displayCurrency,
                    expirationTimestamp: this.expirationTimestamp,
                    lastSyncTimestamp: Date.now()
                }
            }, { merge: true });
        } catch (error) {
            console.error("Cloud Serialization Failure: Security override active.", error);
        } finally {
            this.isSyncing = false;
            this.updateInterfaceVisibility();
        }
    },

    async validatePassExpiration(uid = firebase.auth().currentUser?.uid) {
        if (this.isPremium && this.expirationTimestamp) {
            if (Date.now() > this.expirationTimestamp) {
                this.isPremium = false;
                this.currentTier = 'free';
                this.expirationTimestamp = null;
                await this.saveAccountEconomyState(uid);
                alert("Workspace Status Alert: Your daily workspace access pass has expired.");
            }
        }
    },

    // =======================================================
    // ⚙️ BILLING OPERATIONS AND MESSAGE VALIDATION LAYER
    // =======================================================
    canUserSendMessage() {
        this.validatePassExpiration();
        if (this.isPremium) return true;
        return this.credits > 0;
    },

    async deductUsageCredit() {
        if (this.isPremium) return;
        if (this.credits > 0) {
            this.credits--;
            await this.saveAccountEconomyState();
        }
    },

    // 🌐 SYSTEM ROUTINE TO SWITCH CURRENCIES DYNAMICALLY
    async changeCurrencySystem(newCurrency) {
        if (this.currencyProfiles[newCurrency]) {
            this.displayCurrency = newCurrency;
            await this.saveAccountEconomyState();
            this.rebuildDynamicModalPricingUI();
        }
    },

    watchAdForCredits() {
        const btn = document.getElementById('watch-ad-btn');
        if (btn) btn.textContent = "Loading Sponsored Video Node...";
        
        setTimeout(async () => {
            this.isPremium = true;
            this.currentTier = 'daily';
            this.expirationTimestamp = Date.now() + (24 * 60 * 60 * 1000); 
            await this.saveAccountEconomyState();
            alert("Reward Confirmed: 1-Day Pass unlocked via Ad completion network.");
            if (btn) btn.textContent = "🎬 Watch Ad (Get 1-Day Pass)";
            document.getElementById('premium-upgrade-modal').style.display = 'none';
        }, 4000);
    },

    async activateSubscription(tier) {
        const profile = this.currencyProfiles[this.displayCurrency];
        let baseAmount = 0;
        
        if (tier === 'daily') baseAmount = profile.daily;
        if (tier === 'weekly') baseAmount = profile.weekly;
        if (tier === 'monthly') baseAmount = profile.monthly;

        const userEmail = firebase.auth().currentUser?.email || "billing@tenora.labs";

        try {
            const handler = PaystackPop.setup({
                key: 'pk_test_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6', 
                email: userEmail,
                amount: Math.round(baseAmount * 100), 
                currency: this.displayCurrency,       
                metadata: {
                    custom_fields: [
                        { display_name: "Subscription Tier", variable_name: "tier", value: tier },
                        { display_name: "Workspace Brand", variable_name: "brand", value: "Tenora Labs" }
                    ]
                },
                callback: async (response) => {
                    this.isPremium = true;
                    this.currentTier = tier;
                    
                    let duration = 0;
                    if (tier === 'daily') duration = 1 * 24 * 60 * 60 * 1000;
                    if (tier === 'weekly') duration = 7 * 24 * 60 * 60 * 1000;
                    if (tier === 'monthly') duration = 30 * 24 * 60 * 60 * 1000;
                    
                    this.expirationTimestamp = Date.now() + duration;
                    await this.saveAccountEconomyState();
                    
                    alert(`Payment Received! OmniPad Ultra ${tier.toUpperCase()} channel active.`);
                    document.getElementById('premium-upgrade-modal').style.display = 'none';
                }
            });
            handler.openIframe();
        } catch (error) {
            alert("Paystack Transaction initialization Error: " + error.message);
        }
    },

    injectBillingInterface() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // Prevent duplicate injections on state changes
        if (document.getElementById('tenora-billing-widget')) return;

        const widget = document.createElement('div');
        widget.id = "tenora-billing-widget";
        widget.style.cssText = "margin-top: 15px; padding: 12px; background: #1a1a1c; border: 1px solid #2c2c2e; border-radius: 14px; font-size: 0.85rem;";
        widget.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-weight:600;">
                <span style="color:#9aa0a6;">Workspace Status:</span>
                <span id="tier-display-badge" style="color:#4285f4; text-transform:uppercase;">FREE</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span>
                    Balance: <strong id="credit-counter" style="color:#fff;">${this.credits} Credits</strong>
                </span>
                <button id="upgrade-panel-trigger" style="background:#4285f4; border:none; padding:4px 10px; border-radius:6px; color:#fff; font-weight:bold; cursor:pointer;">Upgrade</button>
            </div>
        `;
        sidebar.insertBefore(widget, document.getElementById('logout-btn'));

        const modal = document.createElement('div');
        modal.id = "premium-upgrade-modal";
        modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100dvh; background:rgba(19,19,20,0.95); z-index:2000; display:none; flex-direction:column; align-items:center; justify-content:center; padding:20px;";
        modal.innerHTML = `
            <div style="background:#1e1f20; border:1px solid #2c2c2e; width:100%; max-width:400px; padding:24px; border-radius:24px; text-align:center;">
                <h3 style="font-size:1.4rem; font-weight:800; color:#fff; margin-bottom:4px;">🚀 UPGRADE TO OMNIPAD ULTRA</h3>
                <p style="color:#9aa0a6; font-size:0.85rem; margin-bottom:16px;">Protect production velocities. Choose your regional checkout currency parameters.</p>
                
                <div style="margin-bottom: 20px; text-align: left;">
                    <label style="color: #9aa0a6; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 6px;">Select Local Currency:</label>
                    <select id="billing-currency-selector" onchange="TenoraBilling.changeCurrencySystem(this.value)" style="width: 100%; background: #2b2a2a; color: #fff; border: 1px solid #444746; padding: 10px; border-radius: 10px; font-weight: 600; outline: none; cursor: pointer;">
                        ${Object.keys(this.currencyProfiles).map(key => `
                            <option value="${key}" ${this.displayCurrency === key ? 'selected' : ''}>${this.currencyProfiles[key].label}</option>
                        `).join('')}
                    </select>
                </div>

                <div id="dynamic-pricing-deck" style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;"></div>

                <div style="border-top:1px solid #2c2c2e; padding-top:16px; margin-bottom:16px;">
                    <button id="watch-ad-btn" onclick="TenoraBilling.watchAdForCredits()" style="width:100%; background:#137333; color:#fff; border:none; padding:12px; border-radius:12px; font-weight:bold; cursor:pointer;">🎬 Watch Ad (Get 1-Day Pass)</button>
                </div>

                <button onclick="document.getElementById('premium-upgrade-modal').style.display='none'" style="background:transparent; border:none; color:#9aa0a6; cursor:pointer; font-size:0.9rem;">Dismiss Workspace Panel</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('upgrade-panel-trigger').onclick = () => {
            document.getElementById('premium-upgrade-modal').style.display = 'flex';
        };

        this.rebuildDynamicModalPricingUI();
    },

    rebuildDynamicModalPricingUI() {
        const deck = document.getElementById('dynamic-pricing-deck');
        if (!deck) return;

        const profile = this.currencyProfiles[this.displayCurrency];
        const symbol = profile.symbol;

        deck.innerHTML = `
            <button onclick="TenoraBilling.activateSubscription('daily')" style="background:#2b2a2a; border:1px solid #444746; color:#fff; padding:12px; border-radius:12px; font-weight:bold; text-align:left; display:flex; justify-content:space-between; cursor:pointer; width:100%;">
                <span>☀️ Daily Unlimited Pass</span>
                <strong>${symbol}${profile.daily.toLocaleString()}</strong>
            </button>
            <button onclick="TenoraBilling.activateSubscription('weekly')" style="background:#2b2a2a; border:1px solid #444746; color:#fff; padding:12px; border-radius:12px; font-weight:bold; text-align:left; display:flex; justify-content:space-between; cursor:pointer; width:100%;">
                <span>⚡ Weekly Unlimited Pass</span>
                <strong>${symbol}${profile.weekly.toLocaleString()}</strong>
            </button>
            <button onclick="TenoraBilling.activateSubscription('monthly')" style="background:linear-gradient(45deg, #4285f4, #a500ff); border:none; color:#fff; padding:14px; border-radius:12px; font-weight:bold; text-align:left; display:flex; justify-content:space-between; cursor:pointer; width:100%;">
                <span>💎 Monthly OmniPad Pro</span>
                <strong>${symbol}${profile.monthly.toLocaleString()}</strong>
            </button>
        `;

        const selector = document.getElementById('billing-currency-selector');
        if (selector) selector.value = this.displayCurrency;

        this.updateInterfaceVisibility();
    },

    bindDockTriggers() {
        const plusBtn = document.getElementById('dock-refill-trigger');
        if (plusBtn) {
            plusBtn.onclick = () => {
                document.getElementById('premium-upgrade-modal').style.display = 'flex';
            };
        }
    },

    updateInterfaceVisibility() {
        const counter = document.getElementById('credit-counter');
        const badge = document.getElementById('tier-display-badge');
        const userInput = document.getElementById('user-input');
        const sendBtn = document.getElementById('send-btn');

        if (counter) {
            if (this.isPremium) {
                counter.textContent = "∞";
            } else {
                // 🛠️ FIXED: Removed currency formatting completely when tracking standard credit balance
                counter.textContent = `${this.credits} Credits`;
            }
        }
        if (badge) badge.textContent = this.isPremium ? this.currentTier : "FREE";

        if (!this.canUserSendMessage()) {
            if (userInput) { userInput.disabled = true; userInput.placeholder = "Account limit depleted. Refill to continue..."; }
            if (sendBtn) sendBtn.style.opacity = "0.3";
        } else {
            if (userInput) { userInput.disabled = false; userInput.placeholder = "Ask OmniPad AI..."; }
            if (sendBtn) sendBtn.style.opacity = "1";
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    TenoraBilling.init();
});
              
