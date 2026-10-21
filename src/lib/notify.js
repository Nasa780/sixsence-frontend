/**
 * Alertes « Match trouvé » : son, notification du navigateur et titre d'onglet
 * qui clignote, pour prévenir le joueur même si l'onglet est en arrière-plan.
 *
 * Les sons sont synthétisés par le navigateur (Web Audio) : aucun fichier à charger.
 * Un seul AudioContext est partagé et « débloqué » au premier clic du joueur
 * (rejoindre la file), sinon certains navigateurs refusent de jouer un son
 * déclenché plus tard par le serveur.
 */

const MUTE_KEY = "sixsence:son-coupe";

let context = null;
let master = null;
let alarmTimer = null;

/** Contexte audio partagé, avec une sortie commune (volume + léger écho). */
function audio() {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!context) {
    context = new AudioContextClass();
    master = context.createGain();
    master.gain.value = 0.9;

    // Écho court : donne de l'ampleur au son sans le rendre brouillon.
    const delay = context.createDelay();
    delay.delayTime.value = 0.14;
    const feedback = context.createGain();
    feedback.gain.value = 0.22;
    const wet = context.createGain();
    wet.gain.value = 0.28;
    master.connect(context.destination);
    master.connect(delay);
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(context.destination);
  }
  if (context.state === "suspended") context.resume().catch(() => {});
  return context;
}

/** À appeler sur un clic : autorise les sons joués plus tard (match trouvé). */
export function unlockAudio() {
  const ctx = audio();
  if (!ctx) return;
  // Un son silencieux suffit à débloquer la lecture sur Safari / iOS.
  const source = ctx.createBufferSource();
  source.buffer = ctx.createBuffer(1, 1, 22050);
  source.connect(ctx.destination);
  source.start(0);
  loadSamples();
}

export function isSoundMuted() {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundMuted(muted) {
  try {
    window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    // Stockage indisponible (navigation privée) : le réglage vaut pour la session.
  }
  if (muted) stopMatchAlarm();
}

/** Note « cloche » : fondamentale + harmoniques qui s'éteignent vite. */
function bell(ctx, frequency, start, { duration = 0.9, volume = 0.32 } = {}) {
  [
    [1, 1],
    [2, 0.35],
    [3.01, 0.12],
  ].forEach(([ratio, level]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = ratio === 1 ? "triangle" : "sine";
    osc.frequency.value = frequency * ratio;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume * level, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration / ratio);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  });
}

/** Impact grave en début d'alerte. */
function impact(ctx, start) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, start);
  osc.frequency.exponentialRampToValueAtTime(45, start + 0.35);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.55, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
  osc.connect(gain).connect(master);
  osc.start(start);
  osc.stop(start + 0.5);
}

// --- Sons enregistrés (public/sounds) ---------------------------------------------
// Extraits de « War Is War » (audioknap, Pixabay, licence libre d'usage) :
//   match-found.mp3 : 0:00.3 → 1:03 de la piste, jouée pendant la vérification « Prêt ? » ;
//   match-start.wav : l'impact de 0:29, quand le match démarre.
// Chargés une fois, au premier clic ; en cas d'échec, les sons synthétisés prennent le relais.
const SAMPLES = { found: "/sounds/match-found.mp3", start: "/sounds/match-start.wav" };
/** Le fichier commence à 0,235 s de la piste : décalage pour démarrer pile à 0,3 s. */
const FOUND_OFFSET = 0.065;
/** Durée jouée : de 0,3 s à 1:03 de la piste. */
const FOUND_LENGTH = 62.7;
/** « Tester le son » : de 0:17 à 0:22 de la piste (le fichier commence à 0,235 s). */
const PREVIEW_OFFSET = 17 - 0.235;
const PREVIEW_LENGTH = 5;
const buffers = {};
let samplesLoading = null;
let music = null; // { source, gain } de la musique « match trouvé » en cours
let alarmArmed = false; // vrai entre « match trouvé » et l'arrêt de l'alarme

export function loadSamples() {
  const ctx = audio();
  if (!ctx || samplesLoading) return samplesLoading;
  samplesLoading = Promise.all(
    Object.entries(SAMPLES).map(async ([key, url]) => {
      try {
        const data = await (await fetch(url)).arrayBuffer();
        buffers[key] = await ctx.decodeAudioData(data);
      } catch {
        // Fichier indisponible : repli sur le son synthétisé.
      }
    }),
  );
  return samplesLoading;
}

/**
 * Joue un son enregistré s'il est chargé (renvoie null sinon).
 * offset / duration en secondes ; fadeOut : fondu de fin (secondes).
 */
function playSample(key, { volume = 1, offset = 0, duration, fadeOut = 0 } = {}) {
  const ctx = audio();
  if (!ctx || !buffers[key]) return null;
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffers[key];
  const length = Math.max(0.1, Math.min(duration ?? Infinity, buffers[key].duration - offset));
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(volume, now);
  if (fadeOut > 0) {
    gain.gain.setValueAtTime(volume, now + Math.max(0, length - fadeOut));
    gain.gain.linearRampToValueAtTime(0.0001, now + length);
  }
  source.connect(gain).connect(ctx.destination);
  source.start(now, offset, length);
  return { source, gain };
}

/** Synthèse de secours : impact + arpège montant (si le fichier n'a pas pu être chargé). */
function playFallbackAlert() {
  try {
    const ctx = audio();
    if (!ctx) return;
    const t = ctx.currentTime + 0.03;
    impact(ctx, t);
    [659.25, 830.61, 987.77, 1318.51].forEach((frequency, index) => {
      bell(ctx, frequency, t + index * 0.09, { duration: index === 3 ? 1.1 : 0.6, volume: index === 3 ? 0.38 : 0.28 });
    });
  } catch {
    // Son bloqué par le navigateur : la notification et le titre suffisent.
  }
}

/** Confirmation : tout le monde est prêt, le match démarre. */
export function playStartSound() {
  if (isSoundMuted()) return;
  if (playSample("start", { volume: 0.9 })) return;
  try {
    const ctx = audio();
    if (!ctx) return;
    const t = ctx.currentTime + 0.02;
    [523.25, 783.99, 1046.5].forEach((frequency) => bell(ctx, frequency, t, { duration: 1.4, volume: 0.22 }));
    bell(ctx, 1567.98, t + 0.12, { duration: 1.2, volume: 0.2 });
  } catch {
    // Sans importance.
  }
}

/**
 * Match trouvé : la musique joue en continu (0:00.3 → 1:03 de la piste). Elle est
 * coupée en fondu dès que le match démarre ou est annulé (fin du délai pour accepter).
 */
export function startMatchAlarm(until) {
  stopMatchAlarm({ fade: 0 });
  if (isSoundMuted()) return;
  music = playSample("found", { offset: FOUND_OFFSET, duration: FOUND_LENGTH, fadeOut: 1.5 });
  if (!music) {
    // Fichier pas encore chargé : alerte synthétisée, et la musique prend le relais dès qu'elle est prête.
    playFallbackAlert();
    loadSamples()?.then(() => {
      if (music || !alarmArmed) return;
      const left = until ? (new Date(until).getTime() - Date.now()) / 1000 : 0;
      if (left > 3) music = playSample("found", { offset: FOUND_OFFSET, duration: FOUND_LENGTH, fadeOut: 1.5 });
    });
  }
  alarmArmed = true;
}


/** Le joueur a accepté : la musique continue, moins fort, en attendant les autres. */
export function duckMatchAlarm() {
  const ctx = audio();
  if (!ctx || !music) return;
  const now = ctx.currentTime;
  music.gain.gain.cancelScheduledValues(now);
  music.gain.gain.setValueAtTime(music.gain.gain.value, now);
  music.gain.gain.linearRampToValueAtTime(0.35, now + 0.6);
}

/** Coupe la musique avec un court fondu (match démarré, annulé, joueur parti). */
export function stopMatchAlarm({ fade = 0.5 } = {}) {
  alarmArmed = false;
  if (alarmTimer) clearInterval(alarmTimer);
  alarmTimer = null;
  const current = music;
  music = null;
  if (!current) return;
  try {
    const ctx = audio();
    const now = ctx.currentTime;
    current.gain.gain.cancelScheduledValues(now);
    current.gain.gain.setValueAtTime(current.gain.gain.value, now);
    current.gain.gain.linearRampToValueAtTime(0.0001, now + fade);
    current.source.stop(now + fade + 0.05);
  } catch {
    // Déjà arrêtée.
  }
}

/** Bouton « Tester le son » : de 0:17 à 0:22 de la piste (ou l'alerte de secours). */
export async function previewMatchSound() {
  unlockAudio();
  await loadSamples();
  stopMatchAlarm({ fade: 0.2 });
  music = playSample("found", { offset: PREVIEW_OFFSET, duration: PREVIEW_LENGTH, fadeOut: 0.8 });
  if (!music) playFallbackAlert();
}

/** Demande l'autorisation d'afficher des notifications (à appeler sur un clic). */
export function askNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission().catch(() => {});
}

let titleTimer = null;
let originalTitle = null;

/** Fait clignoter le titre de l'onglet jusqu'à ce que le joueur revienne sur la page. */
export function flashTitle(message) {
  if (typeof document === "undefined") return;
  stopFlashTitle();
  originalTitle = document.title;
  let on = false;
  titleTimer = setInterval(() => {
    document.title = on ? originalTitle : message;
    on = !on;
  }, 900);
  const stop = () => {
    if (!document.hidden) {
      stopFlashTitle();
      document.removeEventListener("visibilitychange", stop);
    }
  };
  document.addEventListener("visibilitychange", stop);
  if (!document.hidden) setTimeout(stopFlashTitle, 5000);
}

export function stopFlashTitle() {
  if (titleTimer) clearInterval(titleTimer);
  titleTimer = null;
  if (originalTitle) document.title = originalTitle;
  originalTitle = null;
}

/** Tout en un : alarme sonore + notification (si l'onglet est caché) + titre clignotant. */
export function alertMatchFound({ map, mode, deadline }) {
  startMatchAlarm(deadline);
  flashTitle("⚡ MATCH TROUVÉ");
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted" && document.hidden) {
    try {
      const notification = new Notification("Match trouvé sur SixSence", {
        body: `${map} · ${mode} — accepte dans la minute !`,
        icon: "/icons/icon-192.png",
        tag: "sixsence-match",
        requireInteraction: true,
      });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Certains navigateurs mobiles refusent les notifications hors service worker.
    }
  }
}

/**
 * Division : alerte sans « Prêt ? » (match trouvé, « Toujours là ? », recherche arrêtée) :
 * son court, titre clignotant et notification du navigateur si l'onglet est caché.
 */
export function alertTeamEvent({ title, body, flash, tag = "sixsence-division" }) {
  playStartSound();
  flashTitle(flash);
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted" && document.hidden) {
    try {
      const notification = new Notification(title, { body, icon: "/icons/icon-192.png", tag });
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Certains navigateurs mobiles refusent les notifications hors service worker.
    }
  }
}
