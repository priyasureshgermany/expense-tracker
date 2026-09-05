/* The build you are running changes when you ask it to, and not before.
   ---------------------------------------------------------------------------
   The page used to be fetched network-first, so opening the app while online
   always served whatever had just been deployed. That kept everyone current
   without asking — which is exactly what was not wanted: an update should be a
   thing you decide to take.

   So the page is served from a cache of its own, SHELL, which nothing replaces
   on its own. Installing a new worker fills the versioned asset cache and
   leaves SHELL alone, activating purges the old asset caches and leaves SHELL
   alone. The only thing that empties it is the Update button, which clears the
   caches and reloads — and the reload, finding SHELL empty, takes the new page
   from the network and keeps it.

   The check that raises the Update badge is unaffected: it asks the network
   directly with a cache-busting query, so it still sees a newer version even
   while this worker keeps serving the old one. */
const VERSION = "2.0.38";
const ASSETS = "panappai-" + VERSION;   /* icons, manifest — versioned, purged */
const SHELL = "panappai-shell";         /* the page itself — replaced only on request */

/* Straight from the server, past the browser's own HTTP cache. cache.add() and
   a plain fetch both go through it, and it will happily hand back the copy the
   browser kept from before the deploy — which would seed the shell with a build
   older than the one being installed, and make Update look like it did nothing. */
function freshPage(){
  return fetch(new Request("./index.html", { cache: "reload" }));
}

const ASSET_URLS = [
  "./manifest.webmanifest",
  "./RELEASES.md",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(ASSETS)
      .then((cache) => cache.addAll(ASSET_URLS))
      /* Seed the shell only if there is nothing there yet — a first install, or
         the reload straight after an Update. Overwriting it here is what would
         make a new worker update the app behind your back. */
      .then(() => caches.open(SHELL))
      .then((shell) => shell.match("./index.html").then((hit) =>
        hit ? null : freshPage().then((res) =>
          res && res.ok ? shell.put("./index.html", res) : null)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== ASSETS && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return;

  const isDocument = req.mode === "navigate" || req.destination === "document";

  if (isDocument) {
    /* The kept page, whatever has since been deployed. Only an empty SHELL —
       a first run, or the reload after Update — goes to the network, and what
       comes back is kept until you ask again. */
    event.respondWith(
      caches.open(SHELL).then((shell) =>
        shell.match("./index.html").then((hit) => {
          if (hit) return hit;
          return freshPage()
            .then((res) => {
              if (res && res.ok) shell.put("./index.html", res.clone());
              return res;
            })
            .catch(() => caches.match(req).then((c) => c || caches.match("./index.html")));
        })
      )
    );
    return;
  }

  /* Everything else (icons, manifest): serve fast from cache, refresh behind. */
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(ASSETS).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

/* A notification raised by the page is shown through this worker, so the tap
   lands here. Focus a window that is already open rather than adding another. */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list){
        if ("focus" in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("./");
    })
  );
});
