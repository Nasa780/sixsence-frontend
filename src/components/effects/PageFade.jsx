import { motion, useAnimate, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Effet de changement de page. En local seulement, la page /dev-animations permet d'en essayer un autre (choix gardé
 * dans le navigateur) ; en ligne, c'est toujours celui-ci.
 */
export const PAGE_TRANSITION = "rideau";
export const PAGE_TRANSITIONS = {
  biais: "Balayage en biais",
  rideau: "Rideau doré",
  scan: "Scan",
  iris: "Iris",
  flou: "Flou",
};
const DEV_KEY = "sixsence:dev-transition";

function chosenTransition() {
  if (process.env.NODE_ENV === "production") return PAGE_TRANSITION;
  try {
    const value = window.localStorage.getItem(DEV_KEY);
    return PAGE_TRANSITIONS[value] ? value : PAGE_TRANSITION;
  } catch {
    return PAGE_TRANSITION;
  }
}

/** Page de démonstration : choisit l'effet essayé en local. */
export function setDevTransition(value) {
  try {
    window.localStorage.setItem(DEV_KEY, value);
  } catch {
    // Sans stockage : effet par défaut.
  }
}

const DURATION = 0.5;
const EASE = [0.65, 0, 0.35, 1];
/** Bord en biais (même pente que les boutons `clip-slant`) : `x` = position du bord, en % de la largeur. */
const slant = (x) => `polygon(0% 0%, ${x}% 0%, ${x - 12}% 100%, 0% 100%)`;

/**
 * Images clés de chaque effet, sur la page qui arrive. Les masques en pixels sont calculés sur l'écran visible
 * (`top` = haut de la page sous le menu, `w` / `h` = taille de la fenêtre).
 */
function keyframesFor(variant, { top, w, h }) {
  switch (variant) {
    case "rideau":
      return { opacity: [0, 0, 1], offset: [0, 0.45, 0.55], duration: 0.7 };
    case "scan": {
      const end = Math.max(0, h - top);
      const band = (y) => `polygon(0% 0%, 100% 0%, 100% ${y}px, 0% ${y}px)`;
      return { clipPath: [band(0), band(end)], duration: 0.55 };
    }
    case "iris": {
      const cy = h / 2 - top;
      const radius = Math.hypot(w / 2, h / 2) + 20;
      return { clipPath: [`circle(0px at 50% ${cy}px)`, `circle(${radius}px at 50% ${cy}px)`], duration: 0.55 };
    }
    case "flou":
      return { opacity: [0, 1], filter: ["blur(14px) brightness(1.6)", "blur(0px) brightness(1)"], duration: 0.45 };
    default:
      return { clipPath: [slant(0), slant(112)], opacity: [0.4, 1], duration: DURATION };
  }
}

/** Style de départ (avant l'effet) : la page part masquée, sans éclair de la page entière. */
const HIDDEN = {
  biais: { clipPath: slant(0), opacity: 0.4 },
  rideau: { opacity: 0 },
  scan: { clipPath: "polygon(0% 0%, 100% 0%, 100% 0px, 0% 0px)" },
  iris: { clipPath: "circle(0px at 50% 50%)" },
  flou: { opacity: 0, filter: "blur(14px)" },
};

/**
 * Changement de page (2026-11-11) : effet `PAGE_TRANSITION` sur la page qui arrive, accompagné d'une ligne ou d'un
 * volet dorés. Pas de transformation sur la page (elle décalerait les éléments fixes) : masque `clip-path`, opacité
 * ou flou, retirés à la fin pour que rien ne reste rogné (menus, fenêtres, ombres). Rien au premier affichage (la page
 * du serveur reste visible tout de suite) ; fondu simple si l'utilisateur réduit les animations.
 */
export function PageFade({ pageKey, children }) {
  const reduce = useReducedMotion();
  // Page du premier affichage : jamais animée ; dès qu'on en change, toutes les pages le sont (retour compris).
  const [firstKey] = useState(pageKey);
  const [moved, setMoved] = useState(false);
  if (pageKey !== firstKey && !moved) setMoved(true);

  return (
    <Reveal key={pageKey} animate={moved || pageKey !== firstKey} reduce={reduce}>
      {children}
    </Reveal>
  );
}

function Reveal({ animate, reduce, children }) {
  const [scope, run] = useAnimate();
  const [done, setDone] = useState(!animate);
  const [variant] = useState(() => (animate ? chosenTransition() : PAGE_TRANSITION));

  useEffect(() => {
    if (!animate || !scope.current) return undefined;
    const box = scope.current;
    const { offset, duration, ...frames } = reduce
      ? { opacity: [0, 1], duration: 0.2 }
      : keyframesFor(variant, { top: Math.max(0, box.getBoundingClientRect().top), w: window.innerWidth, h: window.innerHeight });
    const controls = run(box, frames, { duration, ease: EASE, ...(offset ? { times: offset } : {}) });
    controls.then(() => {
      box.style.clipPath = "";
      box.style.opacity = "";
      box.style.filter = "";
      setDone(true);
    });
    return () => controls.stop();
  }, [animate, reduce, run, scope, variant]);

  const hidden = animate && !done ? (reduce ? { opacity: 0 } : HIDDEN[variant]) : undefined;

  return (
    <>
      <div ref={scope} style={hidden}>
        {children}
      </div>
      {animate && !done && !reduce ? <Accent variant={variant} /> : null}
    </>
  );
}

const GLOW = "shadow-[0_0_18px_4px_rgba(241,215,122,0.55)]";

/** Ligne ou volet dorés qui accompagnent l'effet. */
function Accent({ variant }) {
  if (variant === "biais") {
    return (
      <motion.span
        aria-hidden
        className={`pointer-events-none fixed inset-y-0 z-[60] w-[3px] -skew-x-[8deg] bg-gold-light ${GLOW}`}
        initial={{ left: "-2%", opacity: 1 }}
        animate={{ left: "104%", opacity: [1, 1, 0] }}
        transition={{ duration: DURATION, ease: EASE }}
      />
    );
  }
  if (variant === "rideau") {
    return (
      <motion.span
        aria-hidden
        className="pointer-events-none fixed inset-y-0 z-[60] w-[130vw] -skew-x-[12deg] bg-linear-to-r from-gold-dark via-gold to-gold-light"
        initial={{ left: "-140vw" }}
        animate={{ left: "120vw" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <span className="absolute inset-y-0 right-0 w-[3px] bg-white/80" />
      </motion.span>
    );
  }
  if (variant === "scan") {
    return (
      <motion.span
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 z-[60] h-[2px] bg-gold-light ${GLOW}`}
        initial={{ top: "0%", opacity: 1 }}
        animate={{ top: "100%", opacity: [1, 1, 0] }}
        transition={{ duration: 0.55, ease: EASE }}
      />
    );
  }
  if (variant === "iris") {
    return (
      <motion.span
        aria-hidden
        className={`pointer-events-none fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold-light ${GLOW}`}
        initial={{ width: "0vmax", height: "0vmax", opacity: 1 }}
        animate={{ width: "150vmax", height: "150vmax", opacity: [1, 1, 0] }}
        transition={{ duration: 0.55, ease: EASE }}
      />
    );
  }
  return null;
}
