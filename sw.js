const CACHE_NAME = "japan-winter-2027-v2";

const CORE_FILES = [
    "./",
    "./index.html",
    "./itinerary.html",
    "./trip-info.html",
    "./manifest.webmanifest",

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


/* =====================================================
   INSTALL
===================================================== */

self.addEventListener(
    "install",
    event => {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(cache => {
                    return cache.addAll(CORE_FILES);
                })

        );

        self.skipWaiting();

    }
);


/* =====================================================
   ACTIVATE
===================================================== */

self.addEventListener(
    "activate",
    event => {

        event.waitUntil(

            caches
                .keys()
                .then(keys => {

                    return Promise.all(

                        keys
                            .filter(
                                key => key !== CACHE_NAME
                            )
                            .map(
                                key => caches.delete(key)
                            )

                    );

                })

        );

        self.clients.claim();

    }
);


/* =====================================================
   FETCH
===================================================== */

self.addEventListener(
    "fetch",
    event => {

        const request = event.request;

        if (request.method !== "GET") {
            return;
        }


        const url = new URL(request.url);


        /*
         * 外部 Live Cam / YouTube / Google Maps
         * 一律唔 Cache。
         */

        if (url.origin !== self.location.origin) {
            return;
        }


        /*
         * HTML：
         * Network first。
         *
         * 有網絡就永遠優先攞最新版；
         * 無網絡先用 Cache。
         */

        if (
            request.mode === "navigate" ||
            request.destination === "document"
        ) {

            event.respondWith(

                fetch(request)

                    .then(response => {

                        const copy =
                            response.clone();


                        caches
                            .open(CACHE_NAME)
                            .then(cache => {
                                cache.put(
                                    request,
                                    copy
                                );
                            });


                        return response;

                    })

                    .catch(() => {

                        return caches.match(request)

                            .then(cached => {

                                if (cached) {
                                    return cached;
                                }


                                return caches.match(
                                    "./itinerary.html"
                                );

                            });

                    })

            );


            return;

        }


        /*
         * 本站相片 / Manifest：
         * Cache first。
         */

        event.respondWith(

            caches
                .match(request)
                .then(cached => {

                    if (cached) {
                        return cached;
                    }


                    return fetch(request)

                        .then(response => {

                            if (
                                !response ||
                                response.status !== 200
                            ) {
                                return response;
                            }


                            const copy =
                                response.clone();


                            caches
                                .open(CACHE_NAME)
                                .then(cache => {

                                    cache.put(
                                        request,
                                        copy
                                    );

                                });


                            return response;

                        });

                })

        );

    }
);
