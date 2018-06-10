importScripts('src/js/idb.js');
importScripts('src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v10';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
	'index.html',
	'offline.html',
  'src/css/materialize.min.css',
  'src/css/custom.css',
  'src/js/jquery-2.1.1.min.js',
  'src/js/materialize.min.js',
  'src/js/promise.js',
  'src/js/fetch.js',
  'src/js/idb.js',
  'src/js/utility.js',
	'src/js/app.js',
  'src/js/feed.js',
  'src/imagens/icons/app-icon-144x144.png',
  'src/imagens/icons/app-icon-256x256.png',
	'https://fonts.googleapis.com/icon?family=Material+Icons'
];

/*function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then(function (cache) {
      return cache.keys()
        .then(function (keys) {
          if (keys.length > maxItems) {
            cache.delete(keys[0])
              .then(trimCache(cacheName, maxItems));
          }
        });
    })
}*/

self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function(event) {
  var url = 'https://www.rpds.com.br/';
  if(isInArray(event.request.url, STATIC_FILES)){
    event.respondWith(
      //fetch(event.request).catch(function() {
        caches.match(event.request)
     // })
    );
  }else{
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function(res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function (err) {
                  return caches.open(CACHE_STATIC_NAME)
                    .then(function (cache) {
                      if (event.request.headers.get('accept').includes('text/html')) {
                        return cache.match('/offline.html');
                      }
                    });
                });
          }
        })
    );
  }
});