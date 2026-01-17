// 详细注释版 Service Worker：预缓存 + 运行时缓存
const CACHE_NAME = 'site-cache-v2';
const PRECACHE_ASSETS = [
  '/',
  // 关键 CSS（根据主题配置 libs.css）
  '/libs/materialize/materialize.min.css',
  '/css/matery.css',
  // 关键 JS（根据主题配置 libs.js）
  '/libs/jquery/jquery.min.js',
  '/js/matery.js',
  // 可选：首屏常用第三方库
  '/libs/aos/aos.js',
  '/libs/lightGallery/js/lightgallery-all.min.js',
];

self.addEventListener('install', (event) =&gt; {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =&gt; cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) =&gt; {
  event.waitUntil(
    caches.keys().then((keys) =&gt; Promise.all(keys.map((key) =&gt; (key === CACHE_NAME ? null : caches.delete(key)))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) =&gt; {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) =&gt; {
      if (cached) return cached;
      return fetch(req).then((res) =&gt; {
        if (!res || res.status !== 200 || (res.type !== 'basic' &amp;&amp; res.type !== 'cors')) return res;
        const accept = req.headers.get('Accept') || '';
        if (!accept.includes('text/html')) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) =&gt; cache.put(req, clone));
        }
        return res;
      }).catch(() =&gt; caches.match('/index.html'));
    })
  );
});
