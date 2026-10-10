import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/** Les N premiers du classement COD (lecture publique), ou null pendant le chargement. */
export default function useTopPlayers(limit = 10) {
  const [players, setPlayers] = useState(null);

  useEffect(() => {
    supabase
      .from("cod_leaderboard")
      .select("user_id, username, points")
      .order("points", { ascending: false })
      .order("wins", { ascending: false })
      .limit(limit)
      .then(({ data }) => setPlayers(data || []));
  }, [limit]);

  return players;
}
