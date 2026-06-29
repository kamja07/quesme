/* QuesMe service worker — app shell cache + push scaffold (P1 skeleton) */
var CACHE = 'quesme-v10';
var SHELL = [
  './', 'index.html', 'home.html', 'customer.html', 'console.html', 'board.html', 'qr.html',
  'admin.html', 'register.html', 'dev.html', 'spa.html', 'therapist.html',
  'app.css', 'i18n.js', 'inapp.js', 'pwa.js', 'config.js', 'supabase-store.js', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png'
];

self.addEventListener('install', function (e){
  e.waitUntil(caches.open(CACHE).then(function (c){ return c.addAll(SHELL).catch(function(){}); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e){
  e.waitUntil(caches.keys().then(function (keys){ return Promise.all(keys.map(function (k){ if (k !== CACHE) return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e){
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res){
      var copy = res.clone();
      caches.open(CACHE).then(function (c){ c.put(e.request, copy).catch(function(){}); });
      return res;
    }).catch(function(){ return caches.match(e.request).then(function (m){ return m || caches.match('customer.html'); }); })
  );
});

/* Push notifications (wired up in P3 with a backend-issued subscription) */
self.addEventListener('push', function (e){
  var data = {}; try { data = e.data ? e.data.json() : {}; } catch (err){}
  var title = data.title || 'QuesMe';
  var body = data.body || '대기 알림이 도착했어요.';
  e.waitUntil(self.registration.showNotification(title, { body: body, icon: 'icon-192.png', badge: 'icon-192.png' }));
});
self.addEventListener('notificationclick', function (e){
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(function (cl){ if (cl.length) return cl[0].focus(); return clients.openWindow('customer.html?store=gangnam'); }));
});
