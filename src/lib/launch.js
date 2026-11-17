import { useSyncExternalStore } from "react";
import { GTA6_RELEASE } from "./config";

/**
 * Jour J de GTA 6 (sortie le 19 novembre 2026 à minuit, heure de Paris) : fenêtre de 48 h partagée par l'écran de
 * lancement de l'accueil (home/LaunchHero), le mode Vice City (layout/ViceCityMode) et le bandeau (layout/Gta6Strip).
 * Petit fichier à part : les pages n'ont pas à charger l'écran de lancement pour savoir si c'est le jour J.
 */

const START = new Date(GTA6_RELEASE).getTime();
/** Le jour J dure 48 h : le 19 et le 20 novembre (heure de Paris), puis tout redevient normal. */
const END = START + 2 * 86_400_000;

/** En local seulement : `?jourj=1` dans l'adresse fait comme si c'était le jour J (essais avant la date). */
export function launchPreview() {
  return process.env.NODE_ENV === "development" && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("jourj");
}

/** Vrai pendant les 48 h qui suivent la sortie de GTA 6. */
export const inLaunchWindow = (now) => (now >= START && now < END) || launchPreview();

const subscribe = (onChange) => {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
};

/**
 * Jour J en cours ? Valeur du serveur (`fromServer`, getStaticProps de l'accueil, sinon false) au premier affichage,
 * puis revérifié dans le navigateur chaque minute : le site passe tout seul au jour J, puis en revient.
 */
export function useLaunchWindow(fromServer = false) {
  return useSyncExternalStore(subscribe, () => inLaunchWindow(Date.now()), () => fromServer);
}
