import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuMap, LuSwords } from "react-icons/lu";
import { supabase } from "../../lib/supabase";

const STATUS = {
  ready_check: "En attente des joueurs",
  in_progress: "Partie en cours",
  awaiting_confirmation: "Résultat à confirmer",
  disputed: "Arbitrage en cours",
};

/**
 * Bandeau « Match en cours » (hub MW4, page de la file) : impossible à rater, carte animée (point « en direct »,
 * lueur), map, format et étape du match, gros bouton vers le salon de match.
 */
export function ActiveMatchBanner({ matchId, text = "Ton salon de match t'attend." }) {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (!matchId) return undefined;
    let alive = true;
    supabase
      .from("cod_matches")
      .select("id, map, mode, format, status")
      .eq("id", matchId)
      .maybeSingle()
      .then(({ data }) => alive && setMatch(data));
    return () => {
      alive = false;
    };
  }, [matchId]);

  if (!matchId) return null;
  const href = `/cod/match/${matchId}`;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="relative">
      {/* Lueur qui respire derrière la carte */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-2 bg-gold/20 blur-2xl"
        animate={{ opacity: [0.35, 0.8, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <Link
        href={href}
        className="group relative block overflow-hidden border border-gold/50 bg-linear-to-br from-gold/[0.16] via-ink-800 to-ink clip-tactical [--cut:18px] transition-colors hover:border-gold"
      >
        <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.06]" />
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-center gap-4">
            <span className="relative grid h-14 w-14 shrink-0 place-items-center border border-gold/60 bg-ink text-gold">
              <LuSwords aria-hidden className="h-7 w-7" />
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-75" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-win" />
              </span>
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.28em] text-win">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-win" />
                {match ? STATUS[match.status] ?? "En direct" : "En direct"}
              </p>
              <p className="mt-1 font-display text-3xl font-black uppercase leading-none sm:text-4xl">
                Match <span className="text-gold-gradient">en cours</span>
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/65">
                {match ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-white/85">
                      <LuMap aria-hidden className="h-4 w-4 text-gold" />
                      {match.map}
                    </span>
                    {match.format ? <span className="border border-gold/40 px-1.5 py-0.5 font-tech text-[10px] uppercase tracking-[0.2em] text-gold">{match.format}</span> : null}
                  </>
                ) : null}
                <span>{text}</span>
              </p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center gap-2.5 bg-gold-sheen px-6 py-3.5 font-display text-lg font-black uppercase tracking-[0.12em] text-ink clip-slant">
            Ouvrir le salon
            <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} className="inline-flex">
              <LuArrowRight aria-hidden className="h-5 w-5" />
            </motion.span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
