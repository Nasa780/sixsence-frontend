import { API_URL } from "./config";

/**
 * Surveillance des erreurs du site : les erreurs JavaScript des joueurs sont envoyées
 * au backend (POST /errors), qui les signale à l'équipe dans un salon Discord privé.
 *
 * Aucune donnée personnelle : le message, la pile d'appels, la page (sans paramètres)
 * et le type de navigateur. Au plus 5 envois par page chargée, une fois par erreur.
 */

const MAX_REPORTS = 5;
const sent = new Set();

/** Site lancé en local (développement) : ses erreurs ne partent jamais sur Discord. */
const isLocal = () => ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);

/** « Chrome · Android », « Safari · iPhone »… */
function browserName() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox|FxiOS/.test(ua)
          ? "Firefox"
          : /Chrome|CriOS/.test(ua)
            ? "Chrome"
            : /Safari/.test(ua)
              ? "Safari"
              : "Autre";
  const system = /Android/.test(ua) ? "Android" : /iPhone|iPad|iPod/.test(ua) ? "iPhone" : /Windows/.test(ua) ? "Windows" : /Mac/.test(ua) ? "Mac" : "Autre";
  const app = window.matchMedia?.("(display-mode: standalone)").matches ? " · appli" : "";
  return `${browser} · ${system}${app}`;
}

/** Envoie une erreur au backend (au mieux : une panne ici ne doit rien casser). */
export function reportClientError(error, where) {
  try {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? "Erreur inconnue");
    if (isLocal() || sent.size >= MAX_REPORTS || sent.has(message)) return;
    sent.add(message);
    fetch(`${API_URL}/errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message.slice(0, 500),
        stack: error instanceof Error ? (error.stack ?? "").slice(0, 2000) : undefined,
        page: where || window.location.pathname,
        browser: browserName(),
      }),
    }).catch(() => {});
  } catch {
    // Sans importance.
  }
}

let installed = false;

/** Écoute les erreurs non rattrapées de la page (appelé une fois, dans _app). */
export function installErrorReporting() {
  if (installed || typeof window === "undefined" || isLocal()) return;
  installed = true;
  window.addEventListener("error", (event) => {
    // Erreurs de chargement de ressources (image, script tiers) : ignorées.
    if (!event.error && !event.message) return;
    reportClientError(event.error ?? event.message);
  });
  window.addEventListener("unhandledrejection", (event) => reportClientError(event.reason));
}
