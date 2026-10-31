import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuArrowRight, LuCrown, LuMedal, LuSwords, LuTrophy } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { teamResults, tournamentStats } from "../../lib/tournamentResults";
import { TeamCrest } from "../teams/TeamParts";
import { Chip } from "../ui/Feedback";
import { bracketMatches } from "./BracketBoard";

/**
 * Onglets Matchs, Participants et Statistiques de la fiche d'un tournoi, calculés depuis le tableau
 * (mêmes numéros de match que BracketBoard).
 */

const LIVE = "#34d399";
const MEDALS = { 1: "#e7c05a", 2: "#c0c7d0", 3: "#c97b4b" };

/** Statut d'une rencontre : libellé et ton. */
function statusOf(entry) {
  if (entry.status === "playing") return ["En cours", "live"];
  if (entry.status === "blocked") return ["Décision", "gold"];
  if (entry.status === "done") return [entry.teamA && entry.teamB ? "Terminé" : "Exempt", "neutral"];
  return ["À venir", "neutral"];
}

export function useTournamentMatches(tournament) {
  return useMemo(() => bracketMatches(tournament), [tournament]);
}

// --- Matchs ---------------------------------------------------------------------------------------

export function TournamentMatches({ tournament, myTeamId }) {
  const matches = useTournamentMatches(tournament);
  const [filter, setFilter] = useState("tous");
  const mine = (m) => myTeamId && [m.entry.teamA?.id, m.entry.teamB?.id].includes(myTeamId);
  const filters = [
    ["tous", "Tous", () => true],
    ["live", "En cours", (m) => m.entry.status === "playing"],
    ["avenir", "À venir", (m) => m.entry.status === "pending"],
    ["finis", "Terminés", (m) => m.entry.status === "done" || m.entry.status === "blocked"],
    ...(myTeamId ? [["mes", "Mes matchs", mine]] : []),
  ];
  const test = filters.find(([id]) => id === filter)?.[2] ?? (() => true);
  const shown = matches.filter(test);
  const reduce = useReducedMotion();

  if (!matches.length) return <p className="text-sm text-white/50">Les matchs apparaîtront ici après le tirage.</p>;
  return (
    <section aria-labelledby="titre-matchs" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="titre-matchs" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
          Matchs <span className="font-tech text-base text-white/35">{matches.length}</span>
        </h2>
        <div role="tablist" aria-label="Filtrer les matchs" className="flex flex-wrap gap-1">
          {filters.map(([id, label, fn]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={cn(
                "clip-slant px-3 py-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.16em] transition-colors [--slant:8px]",
                filter === id ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:bg-white/10",
              )}
            >
              {label} <span className="opacity-60">{matches.filter(fn).length}</span>
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? <p className="text-sm text-white/50">Aucun match ici pour l&apos;instant.</p> : null}
      <ul className="space-y-2">
        {shown.map((m, index) => {
          const [label, tone] = statusOf(m.entry);
          const live = tone === "live";
          const side = (team, i) => {
            const won = m.entry.status === "done" && team && m.entry.winner === team.id;
            return (
              <span className={cn("flex min-w-0 flex-1 items-center gap-2", i === 1 && "flex-row-reverse text-right")}>
                {team ? <TeamCrest team={team} size={24} /> : <span className="h-6 w-6 shrink-0 border border-dashed border-white/15" />}
                <span className={cn("truncate font-display text-base font-bold uppercase leading-none sm:text-lg", !team && "text-sm font-semibold normal-case italic text-white/35", m.entry.status === "done" && team && !won && "text-white/45")}>
                  {team ? team.name : m.waiting[i]}
                </span>
              </span>
            );
          };
          const body = (
            <div
              className={cn("clip-tactical flex items-center gap-3 bg-white/[0.03] px-3 py-3 transition-colors [--cut:10px] sm:gap-4 sm:px-4", m.entry.matchId && "hover:bg-white/[0.06]", mine(m) && "bg-gold/[0.08]")}
              style={live ? { boxShadow: `inset 0 0 0 1px ${LIVE}88` } : undefined}
            >
              <span className="grid h-8 min-w-8 place-items-center border border-white/15 px-1 font-tech text-[10px] font-bold text-white/70" style={live ? { borderColor: LIVE, color: LIVE } : undefined}>
                {m.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="mb-1.5 font-tech text-[9px] uppercase tracking-[0.18em] text-white/45">
                  {m.roundName} · BO{m.bestOf}
                </p>
                <div className="flex items-center gap-2 sm:gap-3">
                  {side(m.entry.teamA, 0)}
                  <span className="shrink-0 px-1 text-center font-tech text-base font-bold tabular-nums sm:text-lg">
                    {m.entry.score ? (
                      <>
                        <span className={cn(m.entry.winner === m.entry.teamA?.id ? "text-gold" : "text-white/55")}>{m.entry.score[0]}</span>
                        <span className="mx-1 text-white/25">–</span>
                        <span className={cn(m.entry.winner === m.entry.teamB?.id ? "text-gold" : "text-white/55")}>{m.entry.score[1]}</span>
                      </>
                    ) : (
                      <span className="text-sm text-white/30">vs</span>
                    )}
                  </span>
                  {side(m.entry.teamB, 1)}
                </div>
              </div>
              <span className="hidden shrink-0 sm:block">
                {live ? (
                  <span className="flex items-center gap-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: LIVE }}>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: LIVE }} />
                    {label}
                  </span>
                ) : (
                  <Chip tone={tone === "gold" ? "gold" : "neutral"}>{label}</Chip>
                )}
              </span>
              {m.entry.matchId ? <LuArrowRight aria-hidden className="h-4 w-4 shrink-0 text-white/35" /> : null}
            </div>
          );
          return (
            <motion.li key={m.key} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: reduce ? 0 : Math.min(index, 12) * 0.025 }}>
              {m.entry.matchId ? (
                <Link href={`/cod/equipes/match/${m.entry.matchId}`} className="block" aria-label={`Match ${m.number} : feuille de match`}>
                  {body}
                </Link>
              ) : (
                body
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

// --- Participants ---------------------------------------------------------------------------------

/** Statut d'inscription d'une équipe avant le tirage (Coupe Horus et fin de saison). */
function signupChip(team, scheduled) {
  if (team.forfeit) return <Chip tone="loss">Forfait</Chip>;
  if (team.bench) return <Chip tone="neutral">Non retenue</Chip>;
  if (team.reserve) return <Chip>Remplaçante</Chip>;
  if (scheduled) return <Chip tone={team.checkedIn ? "win" : "neutral"}>{team.checkedIn ? "Prête" : "En attente"}</Chip>;
  return null;
}

export function TournamentParticipants({ tournament, myTeamId, extra = null }) {
  const matches = useTournamentMatches(tournament);
  const results = useMemo(() => teamResults(tournament, matches), [tournament, matches]);
  const scheduled = tournament.status === "scheduled";
  const byId = new Map((tournament.teams ?? []).map((team) => [team.id, team]));
  const capacity = tournament.kind === "anubis" ? null : tournament.size;
  const count = tournament.kind === "anubis" ? tournament.squads?.length ?? 0 : tournament.teams?.length ?? 0;
  const reduce = useReducedMotion();
  // Avant le tirage : ordre d'inscription ; ensuite : classement du tournoi.
  const list = scheduled ? (tournament.teams ?? []).map((team) => ({ team, played: 0, wins: 0, losses: 0, mapsFor: 0, mapsAgainst: 0, result: null })) : results;

  return (
    <section aria-labelledby="titre-participants" className="space-y-5">
      <h2 id="titre-participants" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
        Participants{" "}
        <span className="font-tech text-base text-white/35">
          {count}
          {capacity ? ` / ${capacity}` : ""}
        </span>
      </h2>
      {extra}
      {list.length === 0 ? <p className="text-sm text-white/50">Aucune équipe pour l&apos;instant.</p> : null}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r, index) => {
          const info = byId.get(r.team.id) ?? r.team;
          const medal = MEDALS[r.place];
          const cup = tournament.kind === "anubis" || r.team.cup;
          const inner = (
            <div
              className={cn("clip-tactical relative flex h-full items-center gap-3 overflow-hidden bg-white/[0.03] p-4 transition-colors [--cut:12px]", !cup && "hover:bg-white/[0.06]", r.team.id === myTeamId && "bg-gold/[0.08]", r.out && "opacity-70")}
              style={medal ? { boxShadow: `inset 0 0 0 1px ${medal}88` } : undefined}
            >
              {medal ? <span aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 15% 50%, ${medal}55, transparent 60%)` }} /> : null}
              {!scheduled && info.seed ? <span className="relative w-7 font-tech text-xs text-white/40">#{info.seed}</span> : null}
              <TeamCrest team={r.team} size={40} className="relative" />
              <div className="relative min-w-0 flex-1">
                <p className="truncate font-display text-xl font-black uppercase leading-none">{r.team.name}</p>
                {r.result ? (
                  <p className="mt-1.5 flex items-center gap-1.5 font-tech text-[10px] uppercase tracking-[0.16em]" style={{ color: medal ?? (r.result === "En lice" ? LIVE : "rgba(255,255,255,0.5)") }}>
                    {r.place === 1 ? <LuCrown aria-hidden className="h-3.5 w-3.5" /> : medal ? <LuMedal aria-hidden className="h-3.5 w-3.5" /> : null}
                    {r.result}
                  </p>
                ) : null}
              </div>
              <div className="relative shrink-0 text-right">
                {!scheduled && r.played ? (
                  <p className="font-tech text-sm font-bold tabular-nums">
                    <span className="text-win">{r.wins}V</span> <span className="text-white/25">·</span> <span className="text-loss">{r.losses}D</span>
                  </p>
                ) : null}
                {signupChip(info, scheduled)}
              </div>
            </div>
          );
          return (
            <motion.li key={r.team.id} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: reduce ? 0 : Math.min(index, 12) * 0.03 }}>
              {cup ? inner : (
                <Link href={`/cod/equipes/${r.team.id}`} className="block h-full">
                  {inner}
                </Link>
              )}
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

// --- Statistiques ---------------------------------------------------------------------------------

export function TournamentStats({ tournament, myTeamId }) {
  const matches = useTournamentMatches(tournament);
  const results = useMemo(() => teamResults(tournament, matches), [tournament, matches]);
  const stats = useMemo(() => tournamentStats(matches), [matches]);
  if (!matches.length) return <p className="text-sm text-white/50">Les statistiques apparaîtront après le tirage.</p>;
  const tiles = [
    ["Matchs joués", `${stats.played} / ${stats.total}`, stats.live ? `${stats.live} en cours` : null],
    ["Maps jouées", stats.maps, null],
    ["Victoires sèches", stats.sweeps, "sans perdre de map (BO3 et plus)"],
    ["Maps décisives", stats.deciders, "séries allées au bout"],
  ];
  const champion = results.find((r) => r.place === 1);
  return (
    <section aria-labelledby="titre-stats" className="space-y-8">
      <h2 id="titre-stats" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
        Statistiques
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, hint]) => (
          <div key={label} className="clip-tactical bg-white/[0.03] p-4 [--cut:12px]">
            <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</p>
            <p className="mt-2 font-display text-4xl font-black leading-none tabular-nums">{value}</p>
            {hint ? <p className="mt-1.5 text-xs text-white/40">{hint}</p> : null}
          </div>
        ))}
      </div>

      {champion ? (
        <div className="clip-tactical flex items-center gap-4 bg-white/[0.03] p-4 [--cut:12px]" style={{ boxShadow: `inset 0 0 0 1px ${MEDALS[1]}66` }}>
          <LuTrophy aria-hidden className="h-8 w-8 shrink-0" style={{ color: MEDALS[1] }} />
          <TeamCrest team={champion.team} size={36} />
          <div className="min-w-0 flex-1">
            <p className="font-tech text-[10px] uppercase tracking-[0.2em]" style={{ color: MEDALS[1] }}>
              Parcours du champion
            </p>
            <p className="truncate font-display text-2xl font-black uppercase leading-none">{champion.team.name}</p>
          </div>
          <p className="shrink-0 text-right font-tech text-sm tabular-nums text-white/70">
            {champion.wins}V · {champion.losses}D
            <br />
            <span className="text-xs text-white/45">
              maps {champion.mapsFor}–{champion.mapsAgainst}
            </span>
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="font-tech text-[10px] uppercase tracking-[0.18em] text-white/45">
              <th className="py-2 pr-3 font-normal">#</th>
              <th className="py-2 pr-3 font-normal">Équipe</th>
              <th className="py-2 pr-3 text-center font-normal">J</th>
              <th className="py-2 pr-3 text-center font-normal">V</th>
              <th className="py-2 pr-3 text-center font-normal">D</th>
              <th className="py-2 pr-3 text-center font-normal">Maps</th>
              <th className="py-2 font-normal">Résultat</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, index) => (
              <tr key={r.team.id} className={cn("border-t border-white/[0.06]", r.team.id === myTeamId && "bg-gold/[0.08]")}>
                <td className="py-2.5 pr-3 font-tech text-xs text-white/45">{index + 1}</td>
                <td className="py-2.5 pr-3">
                  <span className="flex items-center gap-2">
                    <TeamCrest team={r.team} size={22} />
                    <span className="truncate font-display text-base font-bold uppercase">{r.team.name}</span>
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-center font-tech tabular-nums">{r.played}</td>
                <td className="py-2.5 pr-3 text-center font-tech tabular-nums text-win">{r.wins}</td>
                <td className="py-2.5 pr-3 text-center font-tech tabular-nums text-loss">{r.losses}</td>
                <td className="py-2.5 pr-3 text-center font-tech tabular-nums">
                  {r.mapsFor}–{r.mapsAgainst}
                </td>
                <td className="py-2.5 font-tech text-[10px] uppercase tracking-[0.14em]" style={{ color: MEDALS[r.place] ?? "rgba(255,255,255,0.55)" }}>
                  {r.result ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="flex items-center gap-2 text-xs text-white/40">
        <LuSwords aria-hidden className="h-3.5 w-3.5" />
        Les forfaits et exemptions ne comptent pas dans les matchs joués.
      </p>
    </section>
  );
}
