import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/**
 * Client Supabase du navigateur (un seul pour tout le site).
 *
 * - Lecture : classement, profils, matchs, événements… (publics, via RLS).
 * - Connexion : Discord, via Supabase Auth. La session est gardée dans le
 *   navigateur et rafraîchie automatiquement.
 * - Écritures : jamais ici, sauf l'identifiant Activision de son propre profil.
 *   Tout le reste passe par le backend (voir lib/api.js).
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    flowType: "pkce",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
