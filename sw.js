const static_cache_name = 'procurrency-static-v3';
const img_cache_name = 'procurrency-img-v1';
const dynamic_obj_cache_name = 'procurrency-dynamic-v1';
const precache_object_cache_name = 'procurrency-precached-v1';
const precachedURLs = []
const all_caches = [
    {
        name: static_cache_name, urls: [
            './',
            './static/js/idb.js',
            './static/js/main.js',
            './static/css/main.css',
            'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
            'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
        ]
    },
    {
        name: img_cache_name, urls: [
            './favicon.ico'
        ]
    },
    {
        name: dynamic_obj_cache_name, urls: []
    },
    {
        name: precache_object_cache_name, urls: precachedURLs
    }
];


self.addEventListener('install', event => {
    console.log('[service worker]: installing sw');
    event.waitUntil(
        Promise.all(all_caches.map(cacheConf => {
            return caches.open(cacheConf.name).then(cache => {
                console.log(`[SW]: caching ${cacheConf.urls.length} items for ${cacheConf.name}`);
                return cache.addAll(cacheConf.urls);
            }).catch(e => {
                console.error(`[SW]: Failed to chace ${cacheConf.name}: `, e.message);
                throw e;
            });
        })
        ).catch(error => {
            console.error(`[SW: install]: `, error.message);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[service worker]: activating sw');
    event.waitUntil(
        caches.keys().then(cache_names => Promise.all(
            cache_names.filter(cache_name => cache_name.startsWith('procurrency-') && !all_caches.includes(cache_name)
            ).map(cache_name => caches.delete(cache_name))
        )
    ));
    //Claim this domain as the client of this SW, making immediate activation on new installs
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    let cacheName = ''

    if(precachedURLs.includes(url.pathname)){
        event.respondWith(cacheOnly(request));
    }
    // use Cache-First for static assets
    if (request.destination === 'style' || request.destination === 'script' || request.destination === 'font' || url.pathname.match(/\.(css|js|woff2?|ttf|eot)$/)) {
        cacheName = static_cache_name;
        event.respondWith(cacheFirst(request, cacheName));
    }
    // use Stale While Revalidate for images
    else if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
        cacheName = img_cache_name
        event.respondWith(staleWhileRevalidate(request, cacheName))
    }
    // NetworkFirst for everything else
    else {
        cacheName = dynamic_obj_cache_name
        event.respondWith(networkFirst(request, cacheName))
    }
});

self.addEventListener('message', event => {
    console.log('[service worker]: handling message');
    if (event.data.uresponse === 'skipwaiting') self.skipWaiting();
});

const cacheFirst = async (request, cacheName) => {
    const cached = await caches.match(request);
    if (cached) {
        console.log('[SW] Cache hit: ', request.url);
        return cached
    }
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Cache first failed: ', error.message);
        throw error;
    }
}

const networkFirst = async (request, cacheName) => {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        throw error;
    }
}

const staleWhileRevalidate = async (request, cacheName) => {
    const cached = await caches.match(request);
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            const cache = caches.open(cacheName);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    }).catch(error => {
        console.log('[SW] Revalidation failed:', error.message);
    });
    return cached || fetchPromise; // immediately returns cached response, if not cached it calls network and returns response
}

const cacheOnly = async (request) => {
    return await caches.match(request);
}

