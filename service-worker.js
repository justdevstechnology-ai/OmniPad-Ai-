const CACHE_NAME = "omnipad-cache-v2";
const ASSETS_TO_CACHE = [
  "/",
  "index.html",
  "app.js",
  "billing.js",
  "manifest.json",
  "icons/lion-poly-192.png",
  "icons/lion-poly-512.png",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdn.jsdelivr.net/npm/marked/lib/marked.umd.js"
];

// Installs cache maps inside browser memory
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Tenora Worker Engine: Pre-caching application shells");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activates core network layers and flushes obsolete assets
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Tenora Worker Engine: Flushing obsolete asset cache");
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Intercepts offline operations gracefully
self.addEventListener("fetch", (event) => {
  // 🛑 CRITICAL SECURITY SHIELD: Never block or cache your backend API, Paystack, or Firebase traffic
  if (
    event.request.url.includes('/api/') || 
    event.request.url.includes('firebase') || 
    event.request.url.includes('paystack') || 
    event.request.url.includes('supabase')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback rule if asset is totally unreachable offline
        if (event.request.mode === "navigate") {
          return caches.match("index.html");
        }
      });
    })
  );
});
