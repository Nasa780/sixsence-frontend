import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LuArrowUpRight, LuSwords } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { SlantTab, TeamCrest } from "../teams/TeamParts";
import { EmptyState, StatTile } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

/** Couleurs des modes (Classé vert, Division cyan, Tournoi rouge), en dur : la page est commune aux trois. */
const MODE = {
  classe: { label: "Classé", color: "#34d399" },
  division: { label: "Division", color: "#22d3ee" },
  tournoi: { label: "Tournoi", color: "#e5484d" },
};
const OPEN_COD = ["ready_check", "in_progress", "awaiting_confirmation", "disputed"];
const OPEN_TEAM = ["in_progress", "awaiting_confirmation", "forfeit_claimed", "disputed"];
const signed = (n) => (n > 0 ? `+${n}` : `${n}`);
const dayKey = (iso) => new Date(iso).toLocaleDateString("sv-SE");
const timeFr = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function dayLabel(iso) {
  const key = dayKey(iso);
  if (key === dayKey(new Date().toISOString())) return "Aujourd'hui";
  if (key === dayKey(new Date(Date.now() - 86400000).toISOString())) return "Hier";
  return new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

/** Match classé (cod_matches_for) → ligne commune. */
export function fromRanked(match, userId) {
  const side = match.team_a.includes(userId) ? "A" : "B";
  const done = match.status === "completed";
  return {
    key: `c-${match.id}`,
    mode: "classe",
    href: `/cod/match/${match.id}`,
    date: match.completed_at ?? match.created_at,
    open: OPEN_COD.includes(match.status),
    cancelled: match.status === "cancelled",
    won: done ? match.winner === side : null,
    title: match.map,
    detail: `${match.team_size}v${match.team_size} · ${match.mode}`,
    points: done ? (match.points_changes?.[userId] ?? null) : null,
  };
}

/** Match d'équipe (GET /teams/players/:id/matches, Division ou coupe) → ligne commune. */
export function fromTeam(match) {
  const done = match.status === "completed";
  return {
    key: `t-${match.id}`,
    mode: match.tournament ? "tournoi" : "division",
    href: `/cod/equipes/match/${match.id}`,
    date: match.date,
    open: OPEN_TEAM.includes(match.status),
    cancelled: match.status === "cancelled",
    won: done ? match.won : null,
    title: `vs ${match.opponent?.name ?? "Équipe"}`,
    opponent: match.opponent,
    detail: `Avec [${match.team?.tag ?? "?"}]${done ? ` · ${match.mapsFor}-${match.mapsAgainst}` : ""}${match.forfeit ? " · forfait" : ""}`,
    points: done && !match.tournament ? match.teamPoints : null,
    xp: done ? match.xp : null,
  };
}

/** Match en cours en tête, chiffres de la saison, filtres, historique groupé par jour. */
export function MatchesView({ rows, seasonStart = 0 }) {
  const [filter, setFilter] = useState("all");
  const stats = useMemo(() => {
    const played = rows.filter((r) => r.won !== null && new Date(r.date).getTime() >= seasonStart);
    return {
      played: played.length,
      wins: played.filter((r) => r.won).length,
      ranked: played.filter((r) => r.mode === "classe").length,
      team: played.filter((r) => r.mode !== "classe").length,
      form: rows.filter((r) => r.won !== null).slice(0, 5),
    };
  }, [rows, seasonStart]);

  const live = rows.filter((r) => r.open);
  const list = rows.filter((r) => !r.open && (filter === "all" || r.mode === filter));
  const groups = [];
  for (const row of list) {
    const key = dayKey(row.date);
    const group = groups[groups.length - 1];
    if (group?.key === key) group.rows.push(row);
    else groups.push({ key, label: dayLabel(row.date), rows: [row] });
  }

  return (
    <>
      {live.map((row) => (
        <LiveMatch key={row.key} row={row} />
      ))}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Matchs (saison)" value={stats.played} />
        <StatTile label="Victoires" value={stats.wins} hint={stats.played ? `${Math.round((stats.wins / stats.played) * 100)} %` : null} accent />
        <StatTile label="Classé / équipe" value={`${stats.ranked} / ${stats.team}`} />
        <StatTile
          label="Forme"
          value={
            stats.form.length ? (
              <span className="flex gap-1">
                {stats.form.map((r) => (
                  <span key={r.key} className={cn("grid h-7 w-7 place-items-center text-sm", r.won ? "bg-win/15 text-win" : "bg-loss/15 text-loss")}>
                    {r.won ? "V" : "D"}
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )
          }
        />
      </div>

      <div role="tablist" aria-label="Type de matchs" className="flex gap-2 overflow-x-auto pb-1">
        {[
          ["all", "Tous"],
          ["classe", "Classé"],
          ...(MATCH_TEAM_ENABLED
            ? [
                ["division", "Division"],
                ["tournoi", "Tournoi"],
              ]
            : []),
        ].map(([key, label]) => (
          <SlantTab key={key} active={filter === key} onClick={() => setFilter(key)}>
            {label}
          </SlantTab>
        ))}
      </div>

      {groups.length === 0 ? (
        <EmptyState title="Aucun match pour l'instant">
          Lance une recherche en{" "}
          <Link href="/cod/ranked" className="text-gold underline underline-offset-4">
            Classé
          </Link>
          {MATCH_TEAM_ENABLED ? (
            <>
              {" "}
              ou en{" "}
              <Link href="/cod/division" className="text-gold underline underline-offset-4">
                Division
              </Link>
            </>
          ) : null}
          .
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.key} aria-label={group.label}>
              <p className="font-tech text-[10px] uppercase tracking-[0.26em] text-white/45">{group.label}</p>
              <ul className="mt-3 space-y-2">
                {group.rows.map((row, index) => (
                  <MatchRow key={row.key} row={row} index={index} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function LiveMatch({ row }) {
  const mode = MODE[row.mode];
  return (
    <TacticalCard highlight cut={20} innerClassName="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 0% 50%, ${mode.color}22, transparent 60%)` }} />
      <Link href={row.href} className="relative flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: mode.color }} />
          <span className="relative inline-flex h-3 w-3 rounded-full" style={{ background: mode.color }} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-tech text-[10px] uppercase tracking-[0.26em]" style={{ color: mode.color }}>
            {mode.label} · en cours
          </p>
          <p className="mt-1 truncate font-display text-3xl font-black uppercase leading-none">{row.title}</p>
          <p className="mt-1 text-sm text-white/55">{row.detail}</p>
        </div>
        <span className="inline-flex items-center gap-2 font-display text-lg font-bold uppercase text-gold">
          <LuSwords aria-hidden className="h-5 w-5" />
          Ouvrir la feuille
        </span>
      </Link>
    </TacticalCard>
  );
}

function MatchRow({ row, index }) {
  const mode = MODE[row.mode];
  const tone = row.cancelled ? "border-white/15" : row.won ? "border-win" : row.won === false ? "border-loss" : "border-gold";
  return (
    <motion.li initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(index, 10) * 0.03 }}>
      <Link href={row.href} className={cn("group flex items-center gap-3 border-l-2 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.07] sm:gap-4", tone)}>
        <span className="w-16 shrink-0 font-tech text-[9px] font-bold uppercase tracking-[0.18em] sm:w-20" style={{ color: mode.color }}>
          {mode.label}
        </span>
        {row.opponent ? (
          <span className="hidden sm:inline-flex">
            <TeamCrest team={row.opponent} size={28} />
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold uppercase leading-none tracking-wide">
            <span className={cn("mr-2", row.cancelled ? "text-white/40" : row.won ? "text-win" : "text-loss")}>{row.cancelled ? "Annulé" : row.won ? "Victoire" : "Défaite"}</span>
            <span className="text-white/85">{row.title}</span>
          </p>
          <p className="mt-1 truncate text-xs text-white/45">{row.detail}</p>
        </div>
        <div className="shrink-0 text-right font-tech tabular-nums">
          {typeof row.points === "number" ? <p className={cn("text-sm font-bold", row.points > 0 ? "text-win" : row.points < 0 ? "text-loss" : "text-white/40")}>{signed(row.points)} pts</p> : null}
          {row.xp ? <p className="text-[10px] text-white/40">+{row.xp} XP</p> : null}
        </div>
        <span className="hidden w-12 shrink-0 text-right text-xs text-white/40 sm:block">{timeFr(row.date)}</span>
        <LuArrowUpRight aria-hidden className="h-4 w-4 shrink-0 text-white/25 transition group-hover:text-gold" />
      </Link>
    </motion.li>
  );
}
