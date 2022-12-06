const cacheName = 'simla-caches';
const cacheFiles = [
    'index.html',
    '/js/ConstVal.js',
    '/js/Draw.js',
    '/js/Labels.js',
    '/js/MyStat.js',
    '/js/Parameter.js',
    '/js/SimLocalAnesthesia.js',
    '/js/Timer.js',
    '/js/main.js',
    '/fig/fig_back.png',
    '/css/style.css'
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
