const CACHE_NAME = "japan-winter-2027-v8.9-user-plan-20260930";

const CORE_FILES = [
    "./",
    "./index.html",
    "./live.html",
    "./itinerary.html",
    "./trip-info.html",
    "./manifest.webmanifest",
    "./assets/attraction-info.css",
    "./assets/attraction-info.js",
    "./assets/site-shell-v7.css",
    "./assets/site-shell-v7.js",
    "./assets/trip-v8.css",
    "./assets/trip-v8-1.css",
    "./assets/trip-v8-data.js",
    "./assets/trip-v8-1-overrides.js",
    "./assets/trip-v8-ui.js",
    "./assets/trip-enhancement-data.js",
    "./assets/trip-user-overrides.js",
    "./assets/trip-v8-7-user-plan.js",
    "./assets/trip-v8-8-d2-plan.js",
    "./assets/trip-v8-9-user-fixes.js",
    "./assets/checklist-sync.js",
    "./assets/trip-enhancements-v2.css",
    "./assets/trip-enhancements-v3.css",
    "./assets/trip-deep-info-d1-d4.js",
    "./assets/trip-deep-info-d5-d9.js",
    "./assets/trip-deep-info-backups.js",
    "./assets/trip-enhancements-v3.js",

    "./assets/images/d1-matsumoto-castle.jpg",
    "./assets/images/d1-shinano.jpg",
    "./assets/images/d1-centrair.jpg",

    "./assets/images/d2-shiraito.jpg",
    "./assets/images/d2-onioshidashi.jpg",
    "./assets/images/d2-karuizawa-outlet.jpg",

    "./assets/images/d3-obuse.jpg",
    "./assets/images/d3-shibu-onsen.jpg",
    "./assets/images/d3-shibu-onsen-day.jpg",

    "./assets/images/d4-monkey-trail.jpg",
    "./assets/images/d4-snow-monkey.jpg",
    "./assets/images/d4-aeon-suzaka.jpg",

    "./assets/images/d5-hakuba-iwatake.jpg",
    "./assets/images/d5-mountain-harbor.jpg",
    "./assets/images/d5-white-park.jpg",

    "./assets/images/d6-shinhotaka.jpg",
    "./assets/images/d6-takayama.jpg",
    "./assets/images/d6-hida-cave.jpg",

    "./assets/images/d7-shirakawago.jpg",
    "./assets/images/d7-shirakawago-view.jpg",
    "./assets/images/d7-hida-furukawa.jpg",

    "./assets/images/d8-daio-wasabi.jpg",

    "./assets/images/d9-aeon-matsumoto.jpg",
    "./assets/images/d9-matsumoto-station.jpg"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET") return;

    const url = new URL(request.url);

    /* External Live Cam / YouTube / Google Maps / Weather API are never cached here. */
    if (url.origin !== self.location.origin) return;

    /* version.json must always come from network when online. */
    if (url.pathname.endsWith("/version.json")) {
        event.respondWith(
            fetch(request, { cache: "no-store" }).catch(() =>
                new Response(JSON.stringify({version:null,offline:true}), {
                    headers:{"Content-Type":"application/json"}
                })
            )
        );
        return;
    }

    /* HTML: Network first, cached copy when offline. */
    if (request.mode === "navigate" || request.destination === "document") {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                    return response;
                })
                .catch(() =>
                    caches.match(request).then(cached =>
                        cached || caches.match("./itinerary.html")
                    )
                )
        );
        return;
    }

    /* Same-origin photos / manifest / enhancement assets: cache first.
       Ignore ?v= query strings so precached files also work offline. */
    event.respondWith(
        caches.match(request, {ignoreSearch:true}).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (!response || response.status !== 200) return response;
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
                return response;
            });
        })
    );
});
