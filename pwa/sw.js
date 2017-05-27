importScripts('sw-toolbox.js');

toolbox.precache(['', 'index.html','style.css','app.js', 'slip.min.js', 'icons/close.png']);

toolbox.router.get('', toolbox.cacheFirst);
toolbox.router.get('index.html', toolbox.cacheFirst);
toolbox.router.get('style.css', toolbox.cacheFirst);
toolbox.router.get('app.js', toolbox.cacheFirst);
toolbox.router.get('slip.min.js', toolbox.cacheFirst);
toolbox.router.get('icons/close.png', toolbox.cacheFirst);

toolbox.router.get('/tvguide/server/data/images*', toolbox.cacheFirst); // localhost
toolbox.router.get('/server/data/images*', toolbox.cacheFirst); // appengine


