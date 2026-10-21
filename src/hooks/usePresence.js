import { useEffect } from "react";
import { api } from "../lib/api";

const KEY = "sixsence:visiteur";

/** Identifiant aléatoire du navigateur (aucune donnée personnelle), gardé d'une visite à l'autre. */
function visitorId() {
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/**
 * Présence sur le site : tant que l'onglet est visible, un signal part toutes les 45 s (POST /presence).
 * Le compteur « En ligne maintenant » compte les visiteurs vus dans les 90 dernières secondes.
 */
export default function usePresence() {
  useEffect(() => {
    const id = visitorId();
    if (!id) return undefined;
    const ping = () => {
      if (document.visibilityState === "visible") api("/presence", { method: "POST", body: { id } }).catch(() => {});
    };
    ping();
    const timer = setInterval(ping, 45_000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", ping);
    };
  }, []);
}
