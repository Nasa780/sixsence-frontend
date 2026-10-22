/*
 * Service worker SixSence : rend le site installable (appli) et affiche les
 * notifications push (match trouvé, rappels d'événements GTA), même site fermé.
 *
 * Match trouvé : bouton « Accepter » (Android, ordinateur ; jeton signé fourni par le serveur), sans vibration.
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
        // Match trouvé : bouton « Accepter », pas de vibration.
        ...(data.ready ? { actions: [{ action: "accept", title: "✅ Accepter" }], vibrate: [] } : { vibrate: data.urgent ? [250, 120, 250, 120, 400] : [150] }),
        data: { url: data.url || "/", ready: data.ready || null },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  const ready = event.notification.data?.ready;

  // « Accepter » : le match est accepté sans ouvrir le site ; une petite notification confirme.
  if (event.action === "accept" && ready?.url && ready?.token) {
    event.waitUntil(
      (async () => {
        try {
          const response = await fetch(ready.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: ready.token }) });
          const result = await response.json().catch(() => ({}));
          const body = response.ok
            ? `Tu es prêt (${result.ready ?? "?"}/${result.total ?? "?"} joueurs prêts).`
            : result?.error?.message || "Impossible d'accepter : ouvre la feuille de match.";
          await self.registration.showNotification(response.ok ? "✅ Match accepté" : "⚠️ Match non accepté", {
            body,
            icon: "/icons/icon-192-v2.png",
            badge: "/icons/icon-192-v2.png",
            tag: event.notification.tag,
            vibrate: [],
            data: { url: event.notification.data?.url || "/" },
          });
        } catch {
          await self.clients.openWindow(target);
        }
      })(),
    );
    return;
  }

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
