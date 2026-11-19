/* PawScribe service worker — cache-first for same-origin static assets,
   network-first for HTML with an offline fallback to cached index.html. */
const CACHE_NAME = "pawscribe-v2";
const CORE_ASSETS = [
  "/pawscribe/",
  "/pawscribe/index.html",
  "/pawscribe/assets/style.css",
  "/pawscribe/assets/app.js",
  "/pawscribe/assets/config.js",
  "/pawscribe/assets/pawscribe-logo.jpg",
  "/pawscribe/assets/icon-192.png",
  "/pawscribe/assets/icon-512.png",
  "/pawscribe/assets/favicon.ico",
  "/pawscribe/assets/favicon-16x16.png",
  "/pawscribe/assets/favicon-32x32.png",
  "/pawscribe/assets/apple-touch-icon.png"
  "/pawscribe/assets/icons.svg",
  "/pawscribe/assets/marketing.css",
  "/pawscribe/assets/demo.js",
  "/pawscribe/assets/workspace.js",
  "/pawscribe/assets/templates.js",
  "/pawscribe/assets/paypal.js",
  "/pawscribe/assets/ai.js",
  "/pawscribe/assets/audio.js",
  "/pawscribe/templates.html",
  "/pawscribe/app.html",
  "/pawscribe/dashboard.html",
  "/pawscribe/auth.html",
  "/pawscribe/pricing.html",
  "/pawscribe/about.html",
  "/pawscribe/privacy.html",
  "/pawscribe/terms.html",
  "/pawscribe/contact.html",
  "/pawscribe/how-to-write-a-soap-note.html",
  "/pawscribe/veterinary-soap-note-template.html",
  "/pawscribe/how-to-save-time-on-vet-notes.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isHtml = request.mode === "navigate" || request.headers.get("accept")?.includes("text/html");

  if (isHtml) {
    // Network-first for HTML, offline fallback to cached index.html.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/pawscribe/index.html")))
    );
    return;
  }

  // Cache-first for same-origin static assets.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
