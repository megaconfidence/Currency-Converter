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
  '/Currency-Converter/json/currencies.json',
  '/Currency-Converter/json/manifest.json'
];
// let filesToCache = [
//   '/',
//   '/index.html',
//   '/css/materialize.css',
//   '/css/style.css',
//   '/js/localforage.js',
//   '/js/materialize.js',
//   '/js/main.js',
//   '/json/currencies.json',
//   '/json/manifest.json'
// ];

let currencyconverteAPIUrlBase = 'https://free.currencyconverterapi.com/api/v5/currencies';

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


self.addEventListener('fetch', function(e) {
  if (e.request.url.startsWith(currencyconverteAPIUrlBase)) {
    e.respondWith(
      fetch(e.request)
        .then(function(response) {
          return caches.open(dataCacheName).then(function(cache) {
            cache.put(e.request.url, response.clone());
            console.log('[ServiceWorker] Fetched & Cached', e.request.url);
            return response;
          });
        })
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(function(response) {
        console.log('[ServiceWorker] Fetch Only', e.request.url);
        return response || fetch(e.request);
      })
    );
  }
});