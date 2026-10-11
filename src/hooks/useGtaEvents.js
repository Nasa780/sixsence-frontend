import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import useSession from "./useSession";

/**
 * Événements GTA 6 (publics) et inscriptions du joueur connecté.
 * Renvoie { events, mine } : events = null pendant le chargement,
 * mine = Set des identifiants d'événements auxquels le joueur est inscrit.
 */
export default function useGtaEvents(scope = "all") {
  const { userId } = useSession();
  const [events, setEvents] = useState(null);
  const [mine, setMine] = useState(new Set());

  useEffect(() => {
    api(`/gta/events?scope=${scope}`)
      .then((data) => setEvents(data.events))
      .catch(() => setEvents([]));
  }, [scope]);

  useEffect(() => {
    if (!userId) {
      setMine(new Set());
      return;
    }
    supabase
      .from("gta_registrations")
      .select("event_id")
      .eq("user_id", userId)
      .then(({ data }) => setMine(new Set((data || []).map((row) => row.event_id))));
  }, [userId]);

  return { events, mine };
}
