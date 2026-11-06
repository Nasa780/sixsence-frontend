import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import useSession from "./useSession";

const seenKey = (id) => `sixsence-rappel-capture-${id}`;

function alreadySeen(id) {
  try {
    return Boolean(localStorage.getItem(seenKey(id)));
  } catch {
    return false;
  }
}

// Lecture partagée : le bandeau l'affiche, la feuille de match la relance quand le match change.
let lastRead = 0;
let signedIn = false;
const listeners = new Set();
const publish = (value) => listeners.forEach((listener) => listener(value));

async function lookup() {
  lastRead += 1;
  const read = lastRead;
  const { reminder } = await api("/cod/capture-reminder");
  // Une réponse lente ne remplace pas une lecture plus récente.
  if (read === lastRead) publish(reminder && !alreadySeen(reminder.id) ? reminder : null);
}

/** Relit le rappel tout de suite : match validé, capture envoyée. */
export function refreshCaptureReminder() {
  if (signedIn) lookup().catch(() => {});
}

/** Rappel fermé à la croix : il ne revient plus pour ce match. */
export function dismissCaptureReminder(id) {
  try {
    localStorage.setItem(seenKey(id), "1");
  } catch {
    // Stockage indisponible : le rappel reviendra à la prochaine lecture.
  }
  publish(null);
}

/** Capture à ajouter sur le dernier match du joueur connecté : { kind, id, text } ou null. Relu à chaque changement de page. */
export default function useCaptureReminder() {
  const { userId } = useSession();
  const { asPath } = useRouter();
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    signedIn = Boolean(userId);
    listeners.add(setReminder);
    if (userId) lookup().catch(() => {});
    else setReminder(null);
    return () => {
      listeners.delete(setReminder);
    };
  }, [userId, asPath]);

  return reminder;
}
