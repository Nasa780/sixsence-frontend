import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { rankFor, rankGradient, rankLevel } from "../../lib/ranks";
import { RankEmblem } from "./RankEmblem";

const SEEN_KEY = (matchId) => `sixsence:promotion:${matchId}`;

/**
 * Écran « Promotion » : affiché une seule fois au joueur dont le match terminé l'a
 * fait monter de rang (points avant = points actuels - variation du match).
 * Seulement juste après le match (2 h) : plus tard, d'autres matchs ont pu changer ses points.
 */
export function RankUpOverlay({ matchId, points, delta, completedAt }) {
  const [open, setOpen] = useState(false);
  const after = rankFor(points);
  const before = rankFor(Math.max(0, points - delta));
  const recent = Boolean(completedAt) && Date.now() - new Date(completedAt).getTime() < 2 * 60 * 60_000;
  const promoted = recent && typeof delta === "number" && delta > 0 && rankLevel(after) > rankLevel(before);

  useEffect(() => {
    if (!promoted) return;
    try {
      if (window.localStorage.getItem(SEEN_KEY(matchId))) return;
      window.localStorage.setItem(SEEN_KEY(matchId), "1");
    } catch {
      // Sans stockage : on l'affiche quand même.
    }
    setOpen(true);
  }, [promoted, matchId]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`Promotion : ${after.name}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[96] flex items-center justify-center overflow-hidden bg-ink/92 px-4 backdrop-blur-md"
          onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}
        >
          {/* Halo et onde de choc dans la teinte du nouveau rang */}
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 50% 42%, ${after.color}33, transparent 55%)` }} />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
            style={{ borderColor: after.color }}
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 3.2, opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut", delay: 0.35 }}
          />

          <div className="relative w-full max-w-lg text-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-tech text-xs uppercase tracking-[0.5em]"
              style={{ color: after.text }}
            >
              Promotion
            </motion.p>

            <motion.div
              className="mt-6 flex justify-center"
              initial={{ scale: 0.2, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 13, delay: 0.25 }}
            >
              <RankEmblem rank={after} size={168} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6 bg-clip-text font-display text-6xl font-black uppercase leading-none text-transparent sm:text-7xl"
              style={{ backgroundImage: rankGradient(after) }}
            >
              {after.name}
            </motion.p>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}>
              <p className="mt-4 inline-flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.14em] text-white/55">
                <span style={{ color: before.text }}>{before.name}</span>
                <span style={{ color: after.text }}>{after.name}</span>
              </p>
              <p className="mt-2 font-tech text-sm tabular-nums text-white/60">
                <span className="font-bold text-win">+{delta}</span> pts · {points} pts
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="clip-slant mt-8 px-8 py-3 font-display text-base font-black uppercase tracking-[0.16em] text-ink transition-transform hover:scale-[1.03]"
                style={{ backgroundImage: rankGradient(after, 100) }}
              >
                Continuer
              </button>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
