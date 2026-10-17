import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/** Équipe de chaque joueur déjà lue (gardée pendant la visite) : userId → équipe ou null. */
const cache = new Map();

/**
 * Équipe (Match team) de plusieurs joueurs, pour afficher leur tag à côté du pseudo.
 * Renvoie une Map userId → { id, name, tag, color, logoUrl } (absent = sans équipe).
 */
export default function useTeamTags(userIds) {
  const key = [...new Set((userIds || []).filter(Boolean))].sort().join(",");
  const [tags, setTags] = useState(() => fromCache(key));

  useEffect(() => {
    if (!key) return undefined;
    let active = true;
    const missing = key.split(",").filter((id) => !cache.has(id));
    if (missing.length === 0) {
      setTags(fromCache(key));
      return undefined;
    }
    supabase
      .from("team_members")
      .select("user_id, teams(id, name, tag, color, logo_url)")
      .in("user_id", missing)
      .then(({ data }) => {
        for (const id of missing) cache.set(id, null);
        for (const row of data || []) {
          const team = Array.isArray(row.teams) ? row.teams[0] : row.teams;
          if (team) cache.set(row.user_id, { id: team.id, name: team.name, tag: team.tag, color: team.color, logoUrl: team.logo_url });
        }
        if (active) setTags(fromCache(key));
      });
    return () => {
      active = false;
    };
  }, [key]);

  return tags;
}

function fromCache(key) {
  const map = new Map();
  for (const id of key ? key.split(",") : []) {
    const team = cache.get(id);
    if (team) map.set(id, team);
  }
  return map;
}
