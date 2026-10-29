import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { rankFor } from "../../lib/ranks";
import { mapImage } from "../../lib/maps";
import { Portal } from "../ui/Portal";
import { CountUp } from "../effects/CountUp";
import { RankEmblem } from "./RankEmblem";

const SEEN_KEY = (matchId) => `sixsence:resultat:${matchId}`;
const signed = (value) => (value > 0 ? `+${value}` : value === 0 ? "±0" : `${value}`);

/**
 * Écran plein écran « Victoire » ou « Défaite » : affiché une seule fois au joueur, juste après la fin du match (2 h),
 * avec les points gagnés ou perdus qui défilent et le nouveau total. onDone : appelé à la fermeture (ou tout de suite
 * s'il n'y a rien à montrer), pour enchaîner sur l'écran « Promotion ».
 *   won    : victoire du joueur
 *   delta  : variation de points du match
 *   points : total actuel du joueur
 *   demo   : toujours affiché (page de démonstration)
 */
export function MatchResultOverlay({ matchId, won, delta, points, map, completedAt, onDone, demo = false }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const recent = Boolean(completedAt) && Date.now() - new Date(completedAt).getTime() < 2 * 60 * 60_000;
  const color = won ? "#34d399" : "#f87171";
  const rank = rankFor(points);

  useEffect(() => {
    if (demo) return setOpen(true);
    if (!recent || typeof delta !== "number") return onDone?.();
    try {
      if (window.localStorage.getItem(SEEN_KEY(matchId))) return onDone?.();
      window.localStorage.setItem(SEEN_KEY(matchId), "1");
    } catch {
      // Sans stockage : on l'affiche quand même.
    }
    setOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, recent, delta, demo]);

  const close = () => {
    setOpen(false);
    onDone?.();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const background = mapImage(map);

  return (
    <Portal>
      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={won ? "Victoire" : "Défaite"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[97] flex items-center justify-center overflow-hidden bg-ink/95 px-4 backdrop-blur-md"
            onMouseDown={(event) => event.target === event.currentTarget && close()}
          >
            {background ? <div aria-hidden className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url('${background}')` }} /> : null}
            <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 50% 45%, ${color}30, transparent 60%)` }} />
            {/* Bandes qui traversent l'écran */}
            {reduce ? null : (
              <>
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-[34%] h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-[66%] h-px"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </>
            )}
            {/* Onde de choc (victoire) */}
            {won && !reduce ? (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{ borderColor: color }}
                initial={{ scale: 0.3, opacity: 0.9 }}
                animate={{ scale: 3.4, opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.45 }}
              />
            ) : null}

            <div className="relative w-full max-w-xl text-center">
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-tech text-xs uppercase tracking-[0.5em] text-white/55"
              >
                Match terminé{map ? ` · ${map}` : ""}
              </motion.p>

              <motion.h2
                initial={reduce ? false : won ? { opacity: 0, scale: 2.4, letterSpacing: "0.4em" } : { opacity: 0, y: -40 }}
                animate={won ? { opacity: 1, scale: 1, letterSpacing: "0.02em" } : { opacity: 1, y: 0 }}
                transition={won ? { duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] } : { type: "spring", stiffness: 260, damping: 14, delay: 0.3 }}
                className="mt-4 font-display text-7xl font-black uppercase leading-none sm:text-9xl"
                style={{ color, textShadow: `0 0 40px ${color}66` }}
              >
                {won ? "Victoire" : "Défaite"}
              </motion.h2>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="mt-8 flex items-center justify-center gap-6"
              >
                <p className="font-display text-6xl font-black tabular-nums leading-none sm:text-7xl" style={{ color }}>
                  <CountUp value={delta} delay={950} duration={1300} format={signed} />
                  <span className="ml-2 text-2xl text-white/45">pts</span>
                </p>
              </motion.div>

              <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                <p className="mt-5 inline-flex items-center gap-2 font-tech text-sm tabular-nums text-white/65">
                  <RankEmblem rank={rank} size={26} animated={false} />
                  <span style={{ color: rank.text }}>{rank.name}</span>
                  <span className="text-white/35">·</span>
                  <CountUp value={points} from={Math.max(0, points - delta)} delay={1500} duration={1100} /> pts
                </p>
                <div>
                  <button
                    type="button"
                    onClick={close}
                    className="clip-slant mt-9 px-8 py-3 font-display text-base font-black uppercase tracking-[0.16em] text-ink transition-transform hover:scale-[1.03]"
                    style={{ background: color }}
                  >
                    Continuer
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Portal>
  );
}
