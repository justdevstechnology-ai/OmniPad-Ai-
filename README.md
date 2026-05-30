# OmniPad AI — Powered by Tenora Labs

OmniPad AI is a premium, high-performance Progressive Web Application (PWA) designed as an advanced operational workspace. Built on an asynchronous standalone client shell, OmniPad provides multi-modal data processing and deep historical session persistence, wrapped in an elegant dark neon visual interface.

---

## 🚀 Core Systems Architecture

* **Typewriter AI Streaming Engine:** Features responsive chunk-rendering parameters leveraging Markdown interpretation (`marked.umd.js`) and inline code-block containment blocks with zero-latency visual transitions.
* **Persistent Offline Architecture:** Orchestrated utilizing a native client-side `IndexedDB` vector (`OmniPadStructuredDB`) ensuring chat history retention across application cycles.
* **Progressive Web App Implementation:** Backed by an intelligent lifecycle Service Worker tracking custom multi-level cache maps (`v2`), utilizing immediate context takeovers (`clients.claim()`) and skip execution barriers for installation on mobile devices.
* **Dynamic Localized Economy Control:** Full multi-currency monetization ledger (`billing.js`) integrated seamlessly with Firebase Firestore tracking real-time usage parameters. Supports automated countdown cycles for unlimited daily, weekly, or monthly subscription keys.
* **Secure Payment Infrastructures:** Outfitted with robust test/live hooks invoking the Paystack API inline processing window for seamless checkouts in local regional currencies (NGN, USD, GHS, KES, etc.).

---

## 📂 File Structure Layout

```text
├── index.html            # Main interface shell, CSS system typography, and layout nodes
├── app.js                # Core controller, Firebase routing protocols, and UI handlers
├── billing.js            # Monetization layer, regional profile maps, and Paystack pipelines
├── manifest.json         # PWA installation parameters and maskable branding metadata
├── service-worker.js     # Intercept network guardrails, cache maps, and offline fallback maps
└── icons/                # High-definition low-poly PWA brand assets
    ├── lion-poly-192.png # 192x192 mobile app drawer icon
    └── lion-poly-512.png # 512x512 splash page launch graphic
