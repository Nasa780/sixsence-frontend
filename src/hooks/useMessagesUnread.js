import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";

const EVENT = "sixsence-messages";

/** Relit le nombre de messages non lus partout sur la page (après une lecture ou un envoi). */
export function refreshMessagesUnread() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/**
 * Nombre de messages privés non lus du joueur connecté (GET /messages/unread) : relu au changement de page,
 * à chaque message reçu (temps réel, table dm_messages, lignes du joueur seulement) et toutes les 2 minutes.
 */
export default function useMessagesUnread(userId) {
  const [unread, setUnread] = useState(0);
  const { asPath } = useRouter();
  const load = useCallback(() => {
    if (!userId) return;
    api("/messages/unread").then((result) => setUnread(result.unread ?? 0), () => {});
  }, [userId]);

  useEffect(load, [load, asPath]);

  useEffect(() => {
    if (!userId) return undefined;
    const channel = supabase
      .channel(`messages-non-lus-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "dm_messages", filter: `recipient_id=eq.${userId}` }, load)
      .subscribe();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 120_000);
    window.addEventListener(EVENT, load);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
      window.removeEventListener(EVENT, load);
    };
  }, [userId, load]);

  return userId ? unread : 0;
}
