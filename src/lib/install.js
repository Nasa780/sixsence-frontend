import { useEffect, useState } from "react";
import { isIos, isStandalone } from "./push";

/**
 * Installation de l'appli (PWA).
 *
 * Chrome, Edge, Samsung Internet et Opera (Android et ordinateur) permettent
 * d'installer en un clic : la proposition est capturée au chargement (_document.js)
 * et rejouée par installApp(). Safari (iPhone, Mac) et Firefox ne le permettent pas :
 * on affiche alors la marche à suivre (browserGuide).
 */

/** Navigateur, pour adapter la marche à suivre. */
export function detectBrowser() {
  if (typeof navigator === "undefined") return "autre";
  const ua = navigator.userAgent;
  if (isIos()) return /CriOS|FxiOS|EdgiOS/.test(ua) ? "ios-autre" : "ios-safari";
  if (/SamsungBrowser/.test(ua)) return "samsung";
  if (/Firefox/.test(ua)) return /Android/.test(ua) ? "firefox-android" : "firefox";
  if (/Edg\//.test(ua)) return "edge";
  if (/Safari/.test(ua) && !/Chrome|Chromium/.test(ua)) return "safari-mac";
  if (/Chrome|Chromium/.test(ua)) return /Android/.test(ua) ? "chrome-android" : "chrome";
  return "autre";
}

/** Étapes d'installation quand le clic direct n'est pas possible (iPhone avec Safari : étapes illustrées d'InstallGuide). */
export function browserGuide(browser) {
  switch (browser) {
    case "ios-safari":
      return ["Touche le bouton Partager dans la barre du bas (un carré avec une flèche).", "Touche « En voir plus », puis « Sur l'écran d'accueil ».", "Touche « Ajouter » : l'icône SixSence apparaît sur ton écran d'accueil."];
    case "ios-autre":
      return ["Touche le bouton Partager (un carré avec une flèche) : à côté de la barre d'adresse, ou dans le menu du navigateur (⋯, ⋮ ou ≡).", "Cherche « Ajouter à l'écran d'accueil » ou « Installer » (parfois après « Plus » ou « En voir plus »).", "Confirme avec « Ajouter », puis ouvre SixSence depuis ton écran d'accueil pour recevoir les notifications."];
    case "samsung":
      return ["Touche le menu ≡ en bas à droite.", "Choisis « Ajouter la page à », puis « Écran d'accueil »."];
    case "firefox-android":
      return ["Touche le menu ⋮.", "Choisis « Installer » ou « Ajouter à l'écran d'accueil »."];
    case "chrome-android":
      return ["Touche le menu ⋮ en haut à droite.", "Choisis « Ajouter à l'écran d'accueil », puis « Installer »."];
    case "chrome":
      return ["Clique sur l'icône d'installation à droite de la barre d'adresse (un écran avec une flèche).", "Ou : menu ⋮ → « Caster, enregistrer et partager » → « Installer la page en tant qu'appli »."];
    case "edge":
      return ["Menu ⋯ en haut à droite → « Applications ».", "Choisis « Installer ce site en tant qu'application »."];
    case "safari-mac":
      return ["Menu Fichier (ou bouton Partager) → « Ajouter au Dock »."];
    case "firefox":
      return ["Firefox sur ordinateur n'installe pas les applis web : ouvre sixsence.fr dans Chrome ou Edge pour l'installer."];
    default:
      return ["Touche le bouton Partager (un carré avec une flèche) : à côté de la barre d'adresse, ou dans le menu du navigateur (⋯, ⋮ ou ≡).", "Cherche « Ajouter à l'écran d'accueil » ou « Installer » (parfois après « Plus » ou « En voir plus »).", "Confirme avec « Ajouter », puis ouvre SixSence depuis ton écran d'accueil pour recevoir les notifications."];
  }
}

/**
 * État de l'installation :
 *   installed   l'appli est déjà ouverte en mode installé
 *   alreadyInstalled  l'appli est installée sur cet appareil, mais la page est ouverte dans le navigateur
 *   canPrompt   installation possible en un clic
 *   browser     navigateur détecté (pour la marche à suivre)
 */
export function useInstall() {
  const [state, setState] = useState({ installed: false, alreadyInstalled: false, canPrompt: false, browser: "autre", ready: false });

  useEffect(() => {
    const update = () =>
      setState((prev) => ({
        ...prev,
        installed: isStandalone(),
        alreadyInstalled: prev.alreadyInstalled || Boolean(window.__appInstalled),
        canPrompt: Boolean(window.__installPrompt),
        browser: detectBrowser(),
        ready: true,
      }));
    update();
    // Chrome et Edge savent dire si l'appli est déjà installée (manifeste : related_applications).
    if ("getInstalledRelatedApps" in navigator) {
      navigator
        .getInstalledRelatedApps()
        .then((apps) => apps.length > 0 && setState((prev) => ({ ...prev, alreadyInstalled: true })))
        .catch(() => {});
    }
    window.addEventListener("sixsence:installable", update);
    window.addEventListener("sixsence:installed", update);
    return () => {
      window.removeEventListener("sixsence:installable", update);
      window.removeEventListener("sixsence:installed", update);
    };
  }, []);

  return state;
}

/** Lance l'installation en un clic. Renvoie true si le joueur a accepté. */
export async function installApp() {
  const prompt = typeof window !== "undefined" ? window.__installPrompt : null;
  if (!prompt) return false;
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  // Une proposition ne sert qu'une fois : le navigateur en renverra une si besoin.
  window.__installPrompt = null;
  window.dispatchEvent(new Event("sixsence:installable"));
  return outcome === "accepted";
}
