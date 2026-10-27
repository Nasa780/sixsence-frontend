import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Une seule lecture partagée par tous les composants de la page (panneau de l'accueil, badges du hub MW4).
let cache = null;
let request = null;
const listeners = new Set();
const REFRESH_MS = 20_000;

function refresh() {
  if (!request) {
    request = api("/live")
      .then((data) => {
        cache = { at: Date.now(), data };
        listeners.forEach((listener) => listener(data));
      })
      .catch(() => {})
      .finally(() => {
        request = null;
      });
  }
  return request;
}

/**
 * Activité du moment (GET /live du backend) : connectés, Classé, Division, coupe, GTA 6, fil récent ; chaque bloc
 * vaut null s'il n'y a rien. Relu toutes les 20 s tant que l'onglet est visible. `initial` : données d'aperçu.
 */
export default function useLive(initial = null) {
  const [data, setData] = useState(initial ?? cache?.data ?? null);

  useEffect(() => {
    if (initial) return undefined;
    listeners.add(setData);
    if (!cache || Date.now() - cache.at > REFRESH_MS) refresh();
    const timer = setInterval(() => document.visibilityState === "visible" && refresh(), REFRESH_MS);
    return () => {
      listeners.delete(setData);
      clearInterval(timer);
    };
  }, [initial]);

  return data;
}
