/**
 * Created by Benjamin on 07-06-2017.
 */
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
    // 'manifest.json',
    'icons/close.png',
    'icons/icon_32.ico',
    'icons/icon_128.png',
    'icons/icon_256.png',
    'icons/icon_512.png',
];

const removeCharsAtStart = location.host === "localhost" ? 8 : 0;


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
    let path = url.pathname.substr(removeCharsAtStart);
    let path_first_part = url.origin + (removeCharsAtStart === 0 ? "" : "/tvguide" );

    if (path === "/pwa/") {
        path += "index.html";
    }

    let full_path = path_first_part + path;


    if (path.startsWith("/pwa/") && !path.endsWith("sw.js")) {
        event.respondWith(
            caches.match(full_path)
        );
        return;
    }

    if (path.startsWith("/server/data/images/")) {
        event.respondWith(
            caches.open(imageCacheName).then(cache =>
                cache.match(full_path).then(result => {
                    if (result) {
                        return result;
                    }
                    return fetch(event.request).then(imageResponse => {
                        cache.put(full_path, imageResponse.clone());
                        return imageResponse;
                    })
                })
            )
        );
        return;
    }

    if (path === "/server/data/channels/dk_channel_names_manuel.json") {
        event.respondWith(
            caches.open(channelNameCacheName).then(cache =>
                cache.match(full_path).then(result => {
                    let networkFetch = fetch(event.request).then(response => {
                        cache.put(full_path, response.clone());
                        return response;
                    });
                    return result || networkFetch;
                })
            )
        );
        return;
    }

    event.respondWith(fetch(event.request));


});