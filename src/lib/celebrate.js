/**
 * Pluie de paillettes dorées (canvas-confetti, chargé seulement au moment de fêter quelque chose) : promotion de rang,
 * victoire en coupe, palier du pass, carte débloquée. Rien si l'utilisateur réduit les animations.
 */

const GOLD = ["#d4af37", "#f1d77a", "#fff3c4", "#b8902a", "#ffffff"];

let loading = null;
const load = () => (loading ??= import("canvas-confetti").then((module) => module.default));

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * @param {"promotion" | "victoire" | "petit"} kind
 *   promotion : deux canons depuis les coins du bas puis une gerbe au centre ;
 *   victoire : gerbe centrale plus longue ; petit : une seule gerbe discrète (palier, carte).
 * @param {string[]} [colors] couleurs à la place de l'or (ex. teinte du rang).
 */
export async function celebrate(kind = "petit", colors = GOLD) {
  if (typeof window === "undefined" || reducedMotion()) return;
  const confetti = await load();
  const base = { colors, zIndex: 80, disableForReducedMotion: true, scalar: 1.05, ticks: 220 };

  if (kind === "petit") {
    confetti({ ...base, particleCount: 60, spread: 70, startVelocity: 38, origin: { x: 0.5, y: 0.65 } });
    return;
  }
  if (kind === "promotion") {
    confetti({ ...base, particleCount: 70, angle: 60, spread: 55, startVelocity: 62, origin: { x: 0, y: 0.95 } });
    confetti({ ...base, particleCount: 70, angle: 120, spread: 55, startVelocity: 62, origin: { x: 1, y: 0.95 } });
    setTimeout(() => confetti({ ...base, particleCount: 110, spread: 100, startVelocity: 45, origin: { x: 0.5, y: 0.55 } }), 280);
    return;
  }
  // victoire : trois vagues
  for (let i = 0; i < 3; i += 1) {
    setTimeout(() => confetti({ ...base, particleCount: 90, spread: 120, startVelocity: 50, origin: { x: 0.2 + i * 0.3, y: 0.6 } }), i * 260);
  }
}
