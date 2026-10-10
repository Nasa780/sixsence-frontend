import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Session Supabase du visiteur (connexion Discord), mise à jour en direct
 * à la connexion, à la déconnexion et au rafraîchissement du jeton.
 *
 * Renvoie { session, userId, loading }.
 */
export default function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return { session, userId: session?.user?.id ?? null, loading };
}
