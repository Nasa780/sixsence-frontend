import { supabase } from "./supabase";

/**
 * Lance la connexion Discord. Après validation sur Discord, le joueur revient
 * sur /auth/callback, puis sur la page `next` (par défaut, la page actuelle).
 */
export async function signInWithDiscord(next) {
  const target = next || window.location.pathname + window.location.search;
  // Seuls les chemins internes sont acceptés (évite une redirection vers un autre site).
  const safeNext = target.startsWith("/") && !target.startsWith("//") ? target : "/";

  await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      scopes: "identify",
    },
  });
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = "/";
}

/** Jeton de la session en cours (pour les appels au backend), ou null. */
export async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
