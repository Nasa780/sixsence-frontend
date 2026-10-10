import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useSession from "./useSession";

/**
 * Joueur connecté, ou null pour un visiteur.
 *
 * Forme renvoyée (compatible avec les composants existants) :
 *   { id, username, avatar, role, profile: { activision_id, platform, points, xp, wins, ... } }
 *
 * `reload` est ajouté pour rafraîchir après une modification du profil.
 */
export default function useUser() {
  const { userId } = useSession();
  const [user, setUser] = useState(null);

  const load = useCallback(async () => {
    if (!userId) {
      setUser(null);
      return;
    }
    const [{ data: row }, { data: profile }] = await Promise.all([
      supabase.from("users").select("id, username, avatar_url, role, created_at").eq("id", userId).maybeSingle(),
      supabase.from("cod_profiles").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    if (!row) {
      setUser(null);
      return;
    }
    setUser({
      id: row.id,
      username: row.username,
      avatar: row.avatar_url,
      role: row.role,
      created_at: row.created_at,
      profile,
      reload: load,
    });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return user;
}
