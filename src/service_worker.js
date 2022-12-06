// https://qiita.com/poster-keisuke/items/6651140fa20c7aa18474

let CACHE_NAME = 'pwa-sample-caches';
let urlsToCache = [
    '/toshi-ara.github.io/simla/src/',
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches
            .match(event.request)
            .then(function(response) {
                return response ? response : fetch(event.request);
            })
    );
});
