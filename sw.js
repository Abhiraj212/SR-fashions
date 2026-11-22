const CACHE = "sr-fashions-shell-v3";
const FILES = ["./", "./index.html", "./styles.css", "./app.js", "./config.js", "./manifest.webmanifest", "./admin.html", "./staff.html"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.includes("/rest/") || url.pathname.includes("/auth/")) return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request)));
});