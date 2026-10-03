const CACHE_NAME = "multi-trip-v10.7.0-weather-profiles-20261004";

const CORE_FILES = [
    "./",
    "./index.html",
    "./live.html",
    "./itinerary.html",
    "./trip-info.html",
    "./attractions.html",
    "./manifest.webmanifest",
    "./trips/registry.json",
    "./trips/shirakawago-shinhotaka-2027/trip.json",
    "./trips/shirakawago-shinhotaka-2027/itinerary.json",
    "./trips/shirakawago-shinhotaka-2027/trip-info.json",
    "./trips/shirakawago-shinhotaka-2027/hotels.json",
    "./trips/shirakawago-shinhotaka-2027/attractions.json",
    "./trips/shirakawago-shinhotaka-2027/live-cams.json",
    "./trips/shirakawago-shinhotaka-2027/weather.json",
    "./assets/multi-trip-context-v1.js",
    "./assets/multi-trip-data-v1.js",
    "./assets/multi-trip-itinerary-renderer-v1.js",
    "./assets/multi-trip-attractions-renderer-v1.js",
    "./assets/multi-trip-live-renderer-v1.js",
    "./assets/multi-trip-weather-v1.js",
    "./assets/weather-profile-standard-v1.js",
    "./assets/itinerary-hotel-detail-v1.js",
    "./assets/multi-trip-trip-info-renderer-v1.js",
    "./assets/info-icon-repair-v1.js",
    "./assets/attraction-info.css",
    "./assets/attraction-info.js",
    "./assets/attractions-catalog.js",
    "./assets/attractions-layout-v2.js",
    "./assets/attractions-group-fix.js",
    "./assets/catalog-link.js",
    "./assets/nav-enhancements-v1.js",
    "./assets/i18n-v1.js",
    "./assets/i18n-content-en-v1.js",
    "./assets/i18n-polish-en-v1.js",
    "./assets/travel-mode-v1.js",
    "./assets/travel-mode-nav-fix-v1.js",
    "./assets/driving-mode-v1.js",
    "./assets/live-v9-1-sync.js",
    "./assets/live-v9-2-sync.js",
    "./assets/trip-core-v1.js",
    "./assets/weather-suitability-v1.js",
    "./assets/d6-d8-weather-decision-v1.js",
    "./assets/trip-no-observers-v2.js",
    "./assets/trip-v9-1-routing.js",
    "./assets/trip-v9-1-visit-fix.js",
    "./assets/version-v901-fix.js",
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
    "./assets/trip-v9-final-fixes.js",
    "./assets/trip-v9-hotfix.js",
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
    "./assets/images/d4-aeon-suzaka.jpg",
    "./assets/images/d4-monkey-trail.jpg",
    "./assets/images/d4-snow-monkey.jpg",
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
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_FILES)));
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
    self.clients.claim();
});

async function patchLiveDocument(response, url) {
    if (!response || !url.pathname.endsWith("/live.html")) return response;
    try {
        const text = await response.text();
        if (text.includes("assets/live-v9-2-sync.js")) {
            return new Response(text, {status: response.status, statusText: response.statusText, headers: response.headers});
        }
        const injected = text.replace(/<\/body>/i,'<script src="assets/live-v9-2-sync.js?v=8"><\/script>\n</body>');
        const headers = new Headers(response.headers);
        headers.delete("content-length");headers.delete("content-encoding");
        return new Response(injected,{status:response.status,statusText:response.statusText,headers});
    } catch (e) { return response; }
}

self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET") return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    if (url.pathname.endsWith("/version.json")) {
        event.respondWith(fetch(request,{cache:"no-store"}).catch(()=>new Response(JSON.stringify({version:null,offline:true}),{headers:{"Content-Type":"application/json"}})));
        return;
    }

    if (request.mode === "navigate" || request.destination === "document") {
        event.respondWith((async()=>{
            try {
                const response=await fetch(request);
                const delivered=await patchLiveDocument(response,url);
                const copy=delivered.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
                return delivered;
            } catch(e) {
                const cached=await caches.match(request);
                if(cached)return patchLiveDocument(cached,url);
                return caches.match("./itinerary.html");
            }
        })());
        return;
    }

    if (request.destination === "script" || request.destination === "style" || /\.(?:js|css)$/.test(url.pathname)) {
        event.respondWith(fetch(request,{cache:"no-store"}).then(response=>{
            if(response&&response.status===200){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
            return response;
        }).catch(()=>caches.match(request,{ignoreSearch:true})));
        return;
    }

    event.respondWith(caches.match(request,{ignoreSearch:true}).then(cached=>{
        if(cached)return cached;
        return fetch(request).then(response=>{
            if(!response||response.status!==200)return response;
            const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));return response;
        });
    }));
});
