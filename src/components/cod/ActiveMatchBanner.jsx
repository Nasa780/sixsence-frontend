import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuMap } from "react-icons/lu";
import { mapImage } from "../../lib/maps";
import { supabase } from "../../lib/supabase";

export const MATCH_STEPS = {
  ready_check: "Match trouvé",
  in_progress: "Partie en cours",
  awaiting_confirmation: "Résultat à confirmer",
  forfeit_claimed: "Forfait déclaré",
  disputed: "Arbitrage en cours",
};

/**
 * Map, format, étape et couleur (univers) d'un match en cours (Classé : cod_matches ; Division : team_matches, map en
 * cours ; match de coupe : rouge des tournois, nom de la coupe).
 */
export function useMatchSummary(kind, matchId) {
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    if (!matchId) return undefined;
    let alive = true;
    const query =
      kind === "division"
        ? supabase.from("team_matches").select("id, status, maps, scores, best_of, roster_a, tournament:tournaments(name)").eq("id", matchId).maybeSingle()
        : supabase.from("cod_matches").select("id, status, map, format").eq("id", matchId).maybeSingle();
    query.then(({ data }) => {
      if (!alive || !data) return;
      if (kind === "division") {
        const maps = data.maps ?? [];
        const current = maps[Math.min((data.scores ?? []).length, Math.max(0, maps.length - 1))];
        const size = (data.roster_a ?? []).length;
        const label = data.tournament?.name ?? `Division${size ? ` ${size}v${size}` : ""}`;
        setSummary({ map: current?.map ?? null, format: `${label} · BO${data.best_of ?? 3}`, status: data.status, univers: data.tournament ? "tournoi" : "division" });
      } else {
        setSummary({ map: data.map, format: `Classé${data.format ? ` ${data.format}` : ""}`, status: data.status, univers: "classe" });
      }
    });
    return () => {
      alive = false;
    };
  }, [kind, matchId]);
  return summary;
}

export const matchHref = (kind, matchId) => (kind === "division" ? `/cod/equipes/match/${matchId}` : `/cod/match/${matchId}`);

export function LiveDot({ className = "" }) {
  return (
    <span className={`relative flex h-2.5 w-2.5 shrink-0 ${className}`}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-75" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-win" />
    </span>
  );
}

/**
 * Carte « Match en cours » (hub MW4, page de la file) aux couleurs du mode (vert Classé, cyan Division, rouge pour un match de coupe) : image de la
 * map en fond, format, map, étape du match et un seul bouton « Retour au match ». `text` : note facultative.
 */
export function ActiveMatchBanner({ matchId, kind = "classe", text = null }) {
  const summary = useMatchSummary(kind, matchId);
  if (!matchId) return null;
  const image = summary?.map ? mapImage(summary.map) : null;

  return (
    <motion.div data-univers={summary?.univers ?? (kind === "division" ? "division" : "classe")} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <Link href={matchHref(kind, matchId)} className="group relative block overflow-hidden border border-gold/50 bg-ink-800 clip-tactical [--cut:18px] transition-colors hover:border-gold">
        {image ? (
          <div aria-hidden className="absolute inset-0 bg-cover bg-center opacity-35 transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${image}')` }} />
        ) : null}
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/40" />
        <div aria-hidden className="absolute inset-y-0 left-0 w-1 bg-gold" />
        <div className="relative flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.28em] text-gold">
              <LiveDot />
              En direct{summary ? ` · ${summary.format}` : ""}
            </p>
            <p className="mt-2 flex items-center gap-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
              <LuMap aria-hidden className="h-7 w-7 shrink-0 text-gold" />
              <span className="truncate">{summary?.map ?? "Match en cours"}</span>
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {summary ? (
                <span className="border border-gold/40 bg-gold/10 px-2 py-0.5 font-tech text-[10px] uppercase tracking-[0.2em] text-gold">{MATCH_STEPS[summary.status] ?? "En cours"}</span>
              ) : null}
              {text ? <span className="text-white/70">{text}</span> : null}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center justify-center gap-2.5 bg-gold px-6 py-3.5 font-display text-lg font-black uppercase tracking-[0.12em] text-ink clip-slant">
            Retour au match
            <LuArrowRight aria-hidden className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
