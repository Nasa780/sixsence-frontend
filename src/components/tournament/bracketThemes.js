/**
 * Thème du tableau des tournois (BracketBoard) : habillage complet (fond, cartes des rencontres, liaisons, titres,
 * bandeaux des tours, numéros, carte du champion). Le calcul du tableau ne dépend pas du thème.
 * `univers` : couleur d'accent imposée au tableau (« or ») ou celle du mode (null) ; `focus` : couleur du survol.
 */

const GOLD = "#e7c05a";

export const THEMES = {
  // Luxe noir et or (soirée de finale) : noir profond, liseré feuille d'or, rayons derrière le trophée.
  luxe: {
    label: "Luxe noir & or",
    univers: "or",
    focus: "#ffd970",
    frame: "border-gold/30 bg-black",
    stage: {
      background: "radial-gradient(ellipse 120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.8)), #000000",
      backgroundAttachment: "local",
    },
    section: { wb: GOLD, lb: "rgba(231,192,90,0.7)", gradient: true },
    pill: { className: "", style: { background: "transparent" }, name: "rgba(231,192,90,0.9)", bo: "#fff1c1", line: "linear-gradient(90deg, #ffd970, rgba(231,192,90,0.15))" },
    final: { style: { background: "linear-gradient(90deg, rgba(255,217,112,0.18), transparent)" }, color: "#ffd970" },
    line: { idle: "rgba(231,192,90,0.2)", adv: "rgba(231,192,90,0.5)" },
    champ: { color: "#ffd970", width: 3, glow: true, flow: { color: "#ffffff", width: 2, dash: "10 22" } },
    dim: { card: 0.5, line: 0.35 },
    card: {
      className: "overflow-hidden",
      background: "linear-gradient(180deg, #0f0f0f 0%, #060606 100%)",
      edge: "inset 0 0 0 1px rgba(231,192,90,0.5), 0 0 0 1px rgba(0,0,0,0.8)",
      divider: "rgba(231,192,90,0.18)",
    },
    text: { name: "#f5efdc", winName: "#fff1c1", lost: "#857e6b", empty: "#6b6555", score: "#857e6b", win: "#ffd970" },
    badge: { className: "", style: { background: "#000000", borderColor: "rgba(231,192,90,0.5)", color: GOLD } },
    champCard: {
      className: "",
      background: "linear-gradient(180deg, #14110a 0%, #050505 100%)",
      glow: "inset 0 0 0 1px #ffd970, 0 0 70px rgba(231,192,90,0.35)",
      text: "#fff1c1",
      // Rayons qui tournent derrière le trophée, trophée qui flotte.
      rays: true,
    },
  },
};

export const DEFAULT_THEME = "luxe";
