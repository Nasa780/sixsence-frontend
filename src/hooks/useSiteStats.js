import { useEffect, useState } from "react";
import { api } from "../lib/api";

/**
 * Compteurs publics du site (page d'accueil et page Ranked) :
 *   players, matchesPlayed, matchesInProgress, averagePoints  (GET /stats)
 *   playersInQueue, playersOnline                              (GET /cod/status)
 * Rafraîchis toutes les 30 secondes. Valeurs à null tant qu'elles chargent.
 */
export default function useSiteStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [site, status] = await Promise.all([api("/stats"), api("/cod/status")]);
        if (active) setStats({ ...site, playersInQueue: status.playersInQueue, playersOnline: status.siteOnline ?? status.playersOnline });
      } catch {
        // Serveur en veille ou injoignable : on garde les dernières valeurs connues.
      }
    };
    load();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 30_000);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  return stats;
}

/** Nombre formaté à la française (12 847), ou « — » pendant le chargement. */
export function formatCount(value) {
  return typeof value === "number" ? value.toLocaleString("fr-FR") : "—";
}
