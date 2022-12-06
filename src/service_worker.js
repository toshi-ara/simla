const CACHE_NAME = 'simla-caches';
const urlsToCache = [
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
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache.map);
                // return cache.addAll(urlsToCache.map(url => new Request(url, {credentials: 'same-origin'})));
            })
    );
});

self.addEventListener('fetch', event =>  {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});
