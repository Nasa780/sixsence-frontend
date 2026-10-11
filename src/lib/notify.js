/**
 * Alertes « Match trouvé » : son, notification du navigateur et titre d'onglet
 * qui clignote, pour prévenir le joueur même si l'onglet est en arrière-plan.
 */

/** Demande l'autorisation d'afficher des notifications (à appeler sur un clic). */
export function askNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission().catch(() => {});
}

/** Petit carillon en trois notes, généré par le navigateur (aucun fichier audio). */
export function playMatchSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    [659, 880, 1175].forEach((frequency, index) => {
      const start = context.currentTime + index * 0.16;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.32);
    });
    setTimeout(() => context.close().catch(() => {}), 1200);
  } catch {
    // Son bloqué par le navigateur : la notification et le titre suffisent.
  }
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

/** Tout en un : son + notification (si l'onglet est caché) + titre clignotant. */
export function alertMatchFound({ map, mode }) {
  playMatchSound();
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
