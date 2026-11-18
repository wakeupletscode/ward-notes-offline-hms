const C='ward-notes-v4',SHELL=['/','/index.html','/app.js','/style.css','/manifest.json','/icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
// App shell: network first, cache fallback (so the app opens with no internet). API calls are never cached.
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.pathname.startsWith('/api'))return;
  e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));return r})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match('/index.html'))));
});
// Background Sync API: browser fires this when connectivity returns, even after the tab was idle
self.addEventListener('sync',e=>{if(e.tag==='sync-patients')e.waitUntil(clients.matchAll().then(l=>l.forEach(c=>c.postMessage('sync'))))});
