import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Dernier match contesté du joueur, en attente de la décision d'un arbitre (lecture publique).
 * Un match contesté n'empêche pas de rejouer : on garde seulement un lien pour y revenir.
 */
export default function useDisputedMatch(userId) {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    supabase
      .from("cod_matches")
      .select("id, map, format")
      .eq("status", "disputed")
      .or(`team_a.cs.{${userId}},team_b.cs.{${userId}}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => active && setMatch(data ?? null));
    return () => {
      active = false;
    };
  }, [userId]);

  return match;
}
