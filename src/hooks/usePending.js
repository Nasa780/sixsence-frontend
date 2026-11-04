import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import useSession from "./useSession";

const EMPTY = { invites: 0, requests: 0, challenges: 0, cards: 0, confirm: 0 };
const REFRESH_MS = 120_000;

// Lecture partagée : la barre d'onglets et le menu affichent les mêmes nombres.
let cache = { userId: null, value: EMPTY };
const listeners = new Set();
let lastRead = 0;

async function lookup(userId) {
  lastRead += 1;
  const read = lastRead;
  const value = await api("/cod/pending");
  // Une réponse lente ne remplace pas une lecture plus récente.
  if (read !== lastRead) return;
  cache = { userId, value };
  listeners.forEach((listener) => listener(value));
}

/** Relit les pastilles tout de suite, après une action qui les change (cartes vues, invitation, défi, résultat). */
export function refreshPending() {
  if (cache.userId) lookup(cache.userId).catch(() => {});
}

/**
 * Ce qui attend le joueur connecté (pastilles du menu du téléphone).
 * Relu à chaque changement de page et toutes les 2 min, onglet visible et sur téléphone seulement.
 */
export default function usePending() {
  const { userId } = useSession();
  const { asPath } = useRouter();
  const [value, setValue] = useState(cache.userId === userId ? cache.value : EMPTY);

  useEffect(() => {
    if (!userId || !window.matchMedia("(max-width: 1023px)").matches) {
      setValue(EMPTY);
      return undefined;
    }
    listeners.add(setValue);
    cache = cache.userId === userId ? cache : { userId, value: EMPTY };
    setValue(cache.value);
    lookup(userId).catch(() => {});
    const timer = setInterval(() => document.visibilityState === "visible" && lookup(userId).catch(() => {}), REFRESH_MS);
    return () => {
      listeners.delete(setValue);
      clearInterval(timer);
    };
  }, [userId, asPath]);

  return value;
}
