import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MATCH_TEAM_ENABLED } from "../lib/config";
import { supabase } from "../lib/supabase";
import useSession from "./useSession";

/** Étapes d'un match d'équipe pendant lesquelles on y revient (la contestation passe par un arbitre). */
const TEAM_ACTIVE = ["in_progress", "awaiting_confirmation", "forfeit_claimed"];
const REFRESH_MS = 60_000;

// Lecture partagée par toute la page (carte du hub MW4, bandeau des autres pages).
let cache = { userId: null, value: null };
const listeners = new Set();

async function lookup(userId) {
  const [classe, division] = await Promise.all([
    supabase.rpc("cod_active_match_id", { p_user: userId }).then(({ data }) => data ?? null),
    MATCH_TEAM_ENABLED
      ? supabase
          .from("team_matches")
          .select("id")
          .in("status", TEAM_ACTIVE)
          .or(`roster_a.cs.{${userId}},roster_b.cs.{${userId}}`)
          .order("created_at", { ascending: false })
          .limit(1)
          .then(({ data }) => data?.[0]?.id ?? null)
      : null,
  ]);
  const value = classe ? { kind: "classe", id: classe } : division ? { kind: "division", id: division } : null;
  cache = { userId, value };
  listeners.forEach((listener) => listener(value));
}

/**
 * Match en cours du joueur connecté, Classé ou Division : { kind: "classe" | "division", id } ou null.
 * Relu à chaque changement de page et toutes les minutes (onglet visible).
 */
export default function useActiveMatch() {
  const { userId } = useSession();
  const { asPath } = useRouter();
  const [value, setValue] = useState(cache.userId === userId ? cache.value : null);

  useEffect(() => {
    if (!userId) {
      setValue(null);
      return undefined;
    }
    listeners.add(setValue);
    if (cache.userId === userId) setValue(cache.value);
    lookup(userId).catch(() => {});
    const timer = setInterval(() => document.visibilityState === "visible" && lookup(userId).catch(() => {}), REFRESH_MS);
    return () => {
      listeners.delete(setValue);
      clearInterval(timer);
    };
  }, [userId, asPath]);

  return value;
}
