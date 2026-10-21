import { API_URL, SITE_URL } from "./config";

/**
 * Liens d'invitation du site, tous de la même forme : /invite/equipe/CODE (Division) et
 * /invite/groupe/CODE (groupe classé). Les anciennes adresses redirigent (next.config.js).
 */
export function inviteUrl(kind, code) {
  if (!code) return "";
  const origin = typeof window !== "undefined" ? window.location.origin : SITE_URL;
  return `${origin}/invite/${kind}/${code}`;
}

/**
 * Aperçu d'une invitation lu côté serveur, pour le titre du lien partagé (Discord, WhatsApp…).
 * Rien si le backend tarde (réveil de Render) : la page se charge quand même et lit l'aperçu ensuite.
 */
export async function fetchInvitePreview(path) {
  try {
    const response = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(2500) });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}
