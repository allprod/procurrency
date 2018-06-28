const static_cache_name = 'procurrency-static-v1';
const all_caches = [
    static_cache_name
];
const cache_urls = [
    '/',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(static_cache_name).then(cache => cache.addAll(cache_urls))
    );
});


self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cache_names => Promise.all(
                cache_names.filter(cache_name => cache_name.startsWith('procurrency-') && !all_caches.includes(cache_name)
                    ).map(cache_name => caches.delete(cache_name))
            )
        )
    );
});


self.addEventListener('fetch', event => {
    const request_url = new URL(event.request.url);

    if(request_url.origin === location.origin){
        if(request_url.pathname === '/'){
            event.respondWith(caches.match('/skeleton'))
        }
    }

    event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

self.addEventListener('message', event => {
    if (event.data.uresponse === 'skipwaiting') self.skipWaiting();
});