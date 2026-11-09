import { getAccessToken } from "./auth";
import { API_URL } from "./config";

/** Erreur renvoyée par le backend : { error: { code, message } }. */
export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/** Requête refusée pour excès de débit (429) : nouvelles tentatives, après 2 s, 4 s puis 8 s. */
const RATE_LIMIT_DELAYS = [2000, 4000, 8000];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Appel au backend Render. Le jeton de session est ajouté automatiquement
 * quand le joueur est connecté (obligatoire pour les actions : file, vote,
 * chat, inscription aux événements).
 * Une réponse 429 (limite de requêtes du serveur) est réessayée en silence : le serveur refuse la requête
 * avant de la traiter, la renvoyer ne fait donc rien en double. Le message n'apparaît qu'après la dernière tentative.
 */
export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  for (let attempt = 0; ; attempt += 1) {
    try {
      res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, "NETWORK", "Serveur injoignable. Il se réveille peut-être : réessaie dans quelques secondes.");
    }
    if (res.status !== 429 || attempt >= RATE_LIMIT_DELAYS.length) break;
    await wait(RATE_LIMIT_DELAYS[attempt]);
  }

  const data = await res.json().catch(() => null);
  if (res.status === 429) {
    throw new ApiError(429, "RATE_LIMITED", "Beaucoup de monde sur le site en ce moment : réessaie dans quelques secondes.");
  }
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error?.code || "ERROR",
      data?.error?.message || "Une erreur est survenue. Réessaie dans un instant.",
    );
  }
  return data;
}
