/*
 * Service worker SixSence : rend le site installable (appli) et affiche les
 * notifications push (match trouvé, rappels d'événements GTA), même site fermé.
 *
 * Volontairement minimal : aucune mise en cache des pages (le site reste toujours à
 * jour). Si une page du site est ouverte et visible, elle gère déjà l'alerte (son,
 * fenêtre « Match trouvé ») : la notification n'est alors pas affichée en double.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "SixSence", body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (windows.some((client) => client.visibilityState === "visible")) return;
      await self.registration.showNotification(data.title || "SixSence", {
        body: data.body || "",
        icon: "/icons/icon-192-v2.png",
        badge: "/icons/icon-192-v2.png",
        tag: data.tag || "sixsence",
        renotify: true,
        requireInteraction: Boolean(data.urgent),
        vibrate: data.urgent ? [250, 120, 250, 120, 400] : [150],
        data: { url: data.url || "/" },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // Un onglet du site déjà ouvert : on le réutilise.
      for (const client of windows) {
        if (new URL(client.url).origin === self.location.origin) {
          await client.focus();
          if ("navigate" in client) await client.navigate(target);
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
