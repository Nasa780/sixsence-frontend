import { api } from "./api";

/**
 * Appli installable et notifications push.
 *
 *   registerServiceWorker()  au chargement du site (rend l'installation possible)
 *   pushSupport()            "ok" | "unsupported" | "ios-needs-install" | "denied"
 *   isPushEnabled()          cet appareil est-il abonné ?
 *   enablePush()             demande l'autorisation, abonne l'appareil, l'enregistre côté serveur
 *   disablePush()            désabonne cet appareil
 *
 * Sur iPhone / iPad, les notifications ne fonctionnent qu'une fois le site ajouté à
 * l'écran d'accueil (iOS 16.4 ou plus récent).
 */

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

export function isIos() {
  return typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function isStandalone() {
  return typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
}

export function pushSupport() {
  if (typeof window === "undefined") return "unsupported";
  if (isIos() && !isStandalone()) return "ios-needs-install";
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  return "ok";
}

async function registration() {
  registerServiceWorker();
  return navigator.serviceWorker.ready;
}

export async function isPushEnabled() {
  if (pushSupport() !== "ok") return false;
  try {
    const reg = await registration();
    return Boolean(await reg.pushManager.getSubscription());
  } catch {
    return false;
  }
}

/** Clé publique VAPID (base64url) -> tableau d'octets attendu par le navigateur. */
function keyBytes(base64) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

export async function enablePush() {
  const support = pushSupport();
  if (support === "ios-needs-install") throw new Error("Sur iPhone, ajoute d'abord SixSence à l'écran d'accueil (Partager → « Sur l'écran d'accueil »), puis ouvre l'appli.");
  if (support === "denied") throw new Error("Les notifications sont bloquées pour ce site : autorise-les dans les réglages du navigateur.");
  if (support !== "ok") throw new Error("Ce navigateur ne gère pas les notifications.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Autorisation refusée : tu ne recevras pas de notifications.");

  const [{ key }, reg] = await Promise.all([api("/push/key"), registration()]);
  const subscription =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
  await api("/push/subscribe", { method: "POST", body: { subscription: subscription.toJSON() } });
}

export async function disablePush() {
  const reg = await registration();
  const subscription = await reg.pushManager.getSubscription();
  if (!subscription) return;
  await api("/push/unsubscribe", { method: "POST", body: { endpoint: subscription.endpoint } }).catch(() => {});
  await subscription.unsubscribe();
}
