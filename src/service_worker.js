const cacheName = 'simla-caches';
const cacheFiles = [
    'index.html'
];


self.addEventListener('install', event => {
    caches
        .open(cacheName).
        then(cache => cache.addAll(cacheFiles));
});

// self.addEventListener('install', event => {
//     event.waitUntil(
//         caches
//             .open(CACHE_NAME)
//             .then(cache => {
//                 return cache.addAll(urlsToCache.map);
//                 // return cache.addAll(urlsToCache.map(url => new Request(url, {credentials: 'same-origin'})));
//             })
//     );
// });

self.addEventListener('fetch', event =>  {
    event.respondWith(
        caches
            .match(event.request)
            .then(response => {
                return response ? response : fetch(event.request);
            })
    );
});
