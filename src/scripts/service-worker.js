// The site's service worker; pages/sw.js.ts puts SITE in front of this code.
// It shows the pushes and opens their page. It has no fetch handler, so
// pages, prefetches and view transitions never pass through it.

/** The page a push opens: lib/notices.ts's TARGETS for its target. */
const pageOf = (data) => {
  const path = SITE.targets[data?.target_kind];
  return new URL(path ? path.replace('{id}', data.target_id ?? '') : SITE.other, self.location.origin).href;
};

self.addEventListener('install', () => self.skipWaiting());

// FCM's web push: { notification: { title, body, tag }, data: { target_kind, target_id, ... } }.
self.addEventListener('push', (e) => {
  let msg = {};
  try {
    msg = e.data?.json() ?? {};
  } catch {}
  const n = msg.notification ?? {};
  const url = pageOf(msg.data);
  e.waitUntil(
    (async () => {
      // A tab in front on that page shows the change already.
      const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (tabs.some((t) => t.focused && t.url.startsWith(url))) return;
      await self.registration.showNotification(n.title ?? 'ShopNexus', {
        body: n.body,
        tag: n.tag,
        renotify: !!n.tag,
        icon: SITE.icon,
        badge: SITE.badge,
        lang: 'vi',
        data: { url },
      });
    })(),
  );
});

// A click focuses a tab already on the page, or opens one.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? self.location.origin + '/';
  e.waitUntil(
    (async () => {
      const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const open = tabs.find((t) => t.url === url);
      return open ? open.focus() : self.clients.openWindow(url);
    })(),
  );
});
