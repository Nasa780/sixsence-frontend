import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { TeamCrest } from "./TeamParts";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";

/** « il y a 12 min », « il y a 3 h », « hier », puis la date. */
function ago(iso) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  if (hours < 48) return "hier";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Maps gagnées par chaque camp, d'après le score de chaque map ([manches A, manches B]). */
function mapsWon(scores) {
  let a = 0;
  let b = 0;
  for (const [left, right] of scores || []) {
    if (left > right) a += 1;
    else if (right > left) b += 1;
  }
  return [a, b];
}

/**
 * « Derniers matchs de Division » (classement des équipes, 2026-11-13) : les 6 derniers matchs qui ont compté pour
 * les points cette saison, en cartes « A VS B » (blasons, maps gagnées, le gagnant en lumière, le perdant atténué),
 * vers la feuille du match. Relu quand le classement change ; rien tant qu'aucun match n'a été joué.
 * `initial` : matchs d'aperçu (démonstration locale), sans lecture de la base.
 */
export function RecentTeamMatches({ teams, seasonStart = null, initial = null }) {
  const [loaded, setLoaded] = useState(null);
  const matches = initial ?? loaded;
  const signature = teams.map((team) => `${team.id}:${team.points}`).join(",");

  useEffect(() => {
    if (initial) return;
    let query = supabase
      .from("team_matches")
      .select("id, team_a, team_b, scores, points_changes, completed_at")
      .eq("status", "completed")
      .not("points_changes", "is", null)
      .order("completed_at", { ascending: false })
      .limit(6);
    if (seasonStart) query = query.gte("completed_at", seasonStart);
    query.then(({ data }) => setLoaded(data ?? []));
  }, [signature, seasonStart, initial]);

  const rows = (matches ?? [])
    .map((match) => {
      const a = teams.find((team) => team.id === match.team_a);
      const b = teams.find((team) => team.id === match.team_b);
      if (!a || !b) return null;
      const aWon = (match.points_changes?.A ?? 0) > 0;
      const [mapsA, mapsB] = mapsWon(match.scores);
      // Sans score de maps (forfait), seulement V / D.
      const score = mapsA + mapsB > 0 ? [mapsA, mapsB] : aWon ? ["V", "D"] : ["D", "V"];
      return { id: match.id, sides: [a, b], aWon, score, when: ago(match.completed_at) };
    })
    .filter(Boolean);
  if (!rows.length) return null;

  return (
    <section aria-labelledby="titre-derniers-matchs" className="mb-10">
      <h2 id="titre-derniers-matchs" className="mb-3 flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.3em] text-white/55">
        <span aria-hidden className="h-1.5 w-1.5 animate-pulse bg-ember shadow-[0_0_8px_var(--color-ember)]" />
        Derniers matchs de Division
      </h2>
      {/* Téléphone et tablette : défilement au doigt ; ordinateur : grille de 3. */}
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
        {rows.map((match, index) => (
          <motion.li key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="shrink-0 snap-start lg:shrink">
            <Link href={`/cod/equipes/match/${match.id}`} className="group clip-tactical relative flex w-72 items-center gap-2 lg:w-auto overflow-hidden bg-white/[0.04] px-3.5 py-3 transition-colors [--cut:10px] hover:bg-white/[0.07]">
              {/* Lueur du gagnant, de son côté */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-1/2"
                style={{ [match.aWon ? "left" : "right"]: 0, background: `linear-gradient(${match.aWon ? "90deg" : "270deg"}, ${match.sides[match.aWon ? 0 : 1].color}26, transparent)` }}
              />
              {match.sides.map((team, side) => {
                const won = side === 0 ? match.aWon : !match.aWon;
                const sideNode = (
                  <span key={team.id} className={cn("relative flex min-w-0 flex-1 items-center gap-2", side === 1 && "flex-row-reverse text-right", !won && "opacity-50")}>
                    <TeamCrest team={team} size={32} />
                    <span className="min-w-0">
                      <span className="block truncate font-display text-sm font-black uppercase leading-none">{team.tag}</span>
                      <span className={cn("mt-0.5 block font-tech text-xl font-black leading-none tabular-nums", won ? "text-win" : "text-loss")}>{match.score[side]}</span>
                    </span>
                  </span>
                );
                return side === 0 ? (
                  sideNode
                ) : (
                  <span key="vs" className="contents">
                    <span aria-label="contre" className="relative shrink-0 -skew-x-[12deg] px-1 font-display text-lg font-black italic leading-none text-gold [text-shadow:0_0_12px_color-mix(in_srgb,var(--color-gold)_70%,transparent)]">
                      VS
                    </span>
                    {sideNode}
                  </span>
                );
              })}
            </Link>
            <p className="mt-1 px-1 font-tech text-[9px] uppercase tracking-[0.2em] text-white/35">{match.when}</p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
