import { supabase } from "../lib/supabase";

/** Vrai si une session Discord est ouverte dans ce navigateur. */
export async function isAuthenticated() {
  const { data } = await supabase.auth.getSession();
  return Boolean(data.session);
}

/** Ligne `users` du joueur connecté, ou null. */
export async function getUser() {
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user?.id;
  if (!userId) return null;
  const { data: user } = await supabase.from("users").select("*").eq("id", userId).maybeSingle();
  return user ?? null;
}
