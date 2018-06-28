let cacheName = 'Currency_Converter_v1';
let dataCacheName = 'Currency_Converter_v1_Data';
let filesToCache = [
  '/Currency-Converter/',
  '/Currency-Converter/index.html',
  '/Currency-Converter/css/materialize.css',
  '/Currency-Converter/css/style.css',
  '/Currency-Converter/js/localforage.js',
  '/Currency-Converter/js/materialize.js',
  '/Currency-Converter/js/main.js',
  '/Currency-Converter/manifest.json',
  '/Currency-Converter/js/currencies.json',
  '/Currency-Converter/images/neo.png'
];

//cache site assets
self.addEventListener('install',e => {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', e => {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if(key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache ', key);
          return caches.delete(key);
        }
      }));
    })
  );
});
