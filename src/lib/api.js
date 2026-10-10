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

/**
 * Appel au backend Render. Le jeton de session est ajouté automatiquement
 * quand le joueur est connecté (obligatoire pour les actions : file, vote,
 * chat, inscription aux événements).
 */
export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Serveur injoignable. Il se réveille peut-être : réessaie dans quelques secondes.");
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error?.code || "ERROR",
      data?.error?.message || "Une erreur est survenue. Réessaie dans un instant.",
    );
  }
  return data;
}
