/* Offline support for the deck (class Wi-Fi is unreliable).
 * - Pages: network first, cached copy as fallback (always fresh when online).
 * - /_next/static/*: cache first (content-hashed, immutable).
 * - On install, the three routes and every static asset they reference are precached,
 *   so `/`, `/presenter` and `/print` all work offline after the first visit.
 */
const CACHE = "spark-g6-v1";
const PAGES = ["/", "/presenter", "/print"];

async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set();
  await Promise.all(
    PAGES.map(async (page) => {
      try {
        const res = await fetch(page, { cache: "no-store" });
        if (!res.ok) return;
        const html = await res.clone().text();
        await cache.put(page, res);
        for (const m of html.matchAll(/\/_next\/static\/[^"'\s)\\]+/g)) assets.add(m[0]);
      } catch {
        /* offline during install: runtime caching will fill in */
      }
    }),
  );
  await Promise.all(
    [...assets].map(async (url) => {
      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      } catch {
        /* ignore */
      }
    }),
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    const key = PAGES.includes(url.pathname) ? url.pathname : url.pathname + url.search;
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(key, copy));
          }
          return res;
        })
        .catch(async () => (await caches.match(key)) ?? (await caches.match("/")) ?? Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ??
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // Everything else (favicon, RSC payloads…): network, falling back to cache.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => (await caches.match(req)) ?? Response.error()),
  );
});
