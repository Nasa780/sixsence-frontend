/**
 * Alertes « Match trouvé » : son, notification du navigateur et titre d'onglet
 * qui clignote, pour prévenir le joueur même si l'onglet est en arrière-plan.
 *
 * Les sons sont synthétisés par le navigateur (Web Audio) : aucun fichier à charger.
 * Un seul AudioContext est partagé et « débloqué » au premier clic du joueur
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

/** Note « cloche » : fondamentale + harmoniques qui s'éteignent vite. */
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

/** Alerte « Match trouvé » : impact + arpège montant (mi majeur), environ 1,2 s. */
export function playMatchSound({ force = false } = {}) {
  if (!force && isSoundMuted()) return;
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

/** Tic du compte à rebours (10 dernières secondes). */
export function playTick(urgent = false) {
  if (isSoundMuted()) return;
  try {
    const ctx = audio();
    if (!ctx) return;
    const t = ctx.currentTime + 0.01;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = urgent ? 1760 : 1320;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.07, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + 0.08);
  } catch {
    // Sans importance.
  }
}

/** Confirmation : tout le monde est prêt, le match démarre. */
export function playStartSound() {
  if (isSoundMuted()) return;
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

/** Joue l'alerte puis la répète toutes les 3 s jusqu'à stopMatchAlarm() (au plus jusqu'à `until`). */
export function startMatchAlarm(until) {
  stopMatchAlarm();
  playMatchSound();
  const end = until ? new Date(until).getTime() : Date.now() + 60_000;
  alarmTimer = setInterval(() => {
    if (Date.now() >= end) stopMatchAlarm();
    else playMatchSound();
  }, 3000);
}

export function stopMatchAlarm() {
  if (alarmTimer) clearInterval(alarmTimer);
  alarmTimer = null;
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
        icon: "/favicon.svg",
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
