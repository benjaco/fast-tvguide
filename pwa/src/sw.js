const version = "[AIV]{version}[/AIV]";
const staticCacheName = "tvguide-static-" + version;
const imageCacheName = "tvguide-icon-images";
const channelNameCacheName = "tvguide-channel-name";

const assets = [
    'index.html',
    'style.min.css',
    'app.js',
    'show_program.js',
    'channel_editor.js',
    'slip.min.js',
    'icons/close.png',
    'icons/icon_32.ico',

    'manifest.json',
    'icons/icon_128.png',
    'icons/icon_256.png',
    'icons/icon_512.png',
];


self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                return cache.addAll(assets);
            })
            .then(() => {
                return self.skipWaiting();
            })
    )
});


self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.filter(function (cacheName) {
                        return cacheName.startsWith('tvguide-static-') &&
                            cacheName !== staticCacheName;
                    }).map(function (cacheName) {
                        return caches.delete(cacheName);
                    })
                );
            })
            .then(_ => {
                return self.clients.claim();
            })
    );
});


self.addEventListener('fetch', event => {
    let url = new URL(event.request.url);
    let path = url.pathname;

    if (path === "/") {
        path += "index.html";
    }


    if (path.startsWith("/images/")) {
        event.respondWith(
            caches.open(imageCacheName).then(cache =>
                cache.match(path).then(response => {
                    return response || fetch(event.request).then(imageResponse => {
                        cache.put(path, imageResponse.clone());
                        return imageResponse;
                    })
                })
            )
        );
        return;
    }

    if (path === "/channel_names") {
        event.respondWith(
            caches.open(channelNameCacheName).then(cache =>
                cache.match(path).then(result => {
                    let networkFetch = fetch(event.request).then(response => {
                        cache.put(path, response.clone());
                        return response;
                    });
                    return result || networkFetch;
                })
            )
        );
        return;
    }

    if (path.endsWith("sw.js")) {
        event.respondWith(fetch(event.request));
        return;
    }


    event.respondWith(
        caches.match(path).then(function(response) {
            return response || fetch(event.request);
        })
    );

});