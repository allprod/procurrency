const static_cache_name = 'procurrency-static-v1';
const all_caches = [
    static_cache_name
];
const cache_urls = [
    './',
    './static/js/idb.js',
    //'./static/js/main.js',
    //'./static/css/main.css',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
];

self.addEventListener('install', event => {
    console.log('[service worker]: installing sw');
    event.waitUntil(caches.open(static_cache_name).then(cache => cache.addAll(cache_urls)));
});


self.addEventListener('activate', event => {
    console.log('[service worker]: activating sw');
    event.waitUntil(
        caches.keys().then(cache_names => Promise.all(
                cache_names.filter(cache_name => cache_name.startsWith('procurrency-') && !all_caches.includes(cache_name)
                    ).map(cache_name => caches.delete(cache_name))
            )
        )
    );
    self.clients.claim();
});


self.addEventListener('fetch', event => {
    console.log('[service worker]: fetching from sw');
    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

self.addEventListener('message', event => {
    console.log('[service worker]: handling message');
    if (event.data.uresponse === 'skipwaiting') self.skipWaiting();
});