// Keep live schedules, expenses, scripts and map tiles on the network.
// Only the connection-help page is stored, so updates cannot be hidden by an app-shell cache.
const CACHE='europe-trip-connection-v1';
const OFFLINE=new URL('./offline.html',self.registration.scope).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.add(OFFLINE))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('europe-trip-connection-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||request.mode!=='navigate'||!request.url.startsWith(self.registration.scope))return;
  event.respondWith(fetch(request).catch(async()=>await caches.match(OFFLINE)||new Response('인터넷에 연결한 뒤 다시 열어주세요.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
