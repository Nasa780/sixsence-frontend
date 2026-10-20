import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LuArrowUpRight, LuCrown, LuFlame, LuSwords, LuTarget, LuTrophy, LuUsers } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { rankFor, rankGradient } from "../../lib/ranks";
import { supabase } from "../../lib/supabase";
import { TEAM_LIMITS } from "../../lib/teams";
import { Avatar } from "../ui/Avatar";
import { ButtonLink } from "../ui/Button";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";
import { TeamMatchHistory } from "./TeamMatchHistory";
import { TeamCrest } from "./TeamParts";

/**
 * Données de « Mon équipe » : historique, forme, série, statistiques par joueur (matchs joués et gagnés
 * avec l'équipe) et équipe juste devant au classement. Lectures publiques (API et Supabase).
 */
export function useTeamInsights(team) {
  const [history, setHistory] = useState(null);
  const [rosters, setRosters] = useState(null);
  const [teams, setTeams] = useState(null);
  const [play, setPlay] = useState(null);

  useEffect(() => {
    let alive = true;
    api(`/teams/${team.id}/matches`)
      .then((data) => alive && setHistory(data.matches))
      .catch(() => alive && setHistory([]));
    supabase
      .from("team_matches")
      .select("team_a, roster_a, roster_b, winner")
      .or(`team_a.eq.${team.id},team_b.eq.${team.id}`)
      .eq("status", "completed")
      .limit(500)
      .then(({ data }) => alive && setRosters(data ?? []));
    api("/teams")
      .then((data) => alive && setTeams(data.teams))
      .catch(() => alive && setTeams([]));
    api("/teams/me/play")
      .then((data) => alive && setPlay(data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [team.id]);

  return useMemo(() => {
    const done = (history ?? []).filter((match) => match.status === "completed");
    let streak = 0;
    for (const match of done) {
      if (match.won) streak += 1;
      else break;
    }
    const playerStats = new Map();
    for (const row of rosters ?? []) {
      const side = row.team_a === team.id ? "A" : "B";
      for (const id of side === "A" ? row.roster_a : row.roster_b) {
        const current = playerStats.get(id) ?? { played: 0, wins: 0 };
        playerStats.set(id, { played: current.played + 1, wins: current.wins + (row.winner === side ? 1 : 0) });
      }
    }
    const ahead = team.position && team.position > 1 ? (teams ?? []).find((other) => other.position === team.position - 1) ?? null : null;
    return { history, form: done.slice(0, 5), streak, playerStats, ahead, play };
  }, [history, rosters, teams, play, team.id, team.position]);
}

const winRate = (wins, played) => (played > 0 ? Math.round((wins / played) * 100) : null);

/** Bannière de l'équipe : blason, nom, place, points, bilan, forme, trophées et action du moment. */
export function TeamHero({ team, insights, isLeader }) {
  const rate = winRate(team.wins, team.played);
  const { form, streak, play } = insights;
  const live = play?.activeMatchId;
  const searching = !live && Boolean(play?.queued);

  return (
    <TacticalCard highlight cut={30} innerClassName="relative overflow-hidden">
      {/* Bannière de l'équipe (ou dégradé de sa couleur), voilée pour la lisibilité. */}
      {team.bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={team.bannerUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-35" />
      ) : (
        <div aria-hidden className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at 15% 20%, ${team.color}66, transparent 60%)` }} />
      )}
      <div aria-hidden className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-ink/30" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30 mask-fade" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="flex flex-wrap items-center gap-5">
          <span className="relative">
            <TeamCrest team={team} size={104} />
            {team.position === 1 ? <LuCrown aria-label="Numéro 1" className="absolute -right-3 -top-4 h-8 w-8 rotate-12 text-gold drop-shadow" /> : null}
          </span>
          <div className="min-w-0">
            <p className="font-tech text-xs uppercase tracking-[0.3em]" style={{ color: team.color }}>
              <span className="normal-case">[{team.tag}]</span>
            </p>
            <h2 className="mt-1 break-words font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{team.name}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {team.position ? (
                <span className="clip-slant bg-gold px-3 py-1 font-display text-sm font-black uppercase tracking-wide text-ink">#{team.position} au classement</span>
              ) : null}
              {streak >= 2 ? (
                <span className="clip-slant inline-flex items-center gap-1 bg-gold/15 px-3 py-1 font-display text-sm font-bold uppercase tracking-wide text-gold">
                  <LuFlame aria-hidden className="h-4 w-4" />
                  {streak} victoires d&apos;affilée
                </span>
              ) : null}
              {team.trophies?.map((trophy) => (
                <span key={trophy.tournamentId} title={trophy.name} className="clip-slant inline-flex items-center gap-1 border border-gold/50 px-3 py-1 font-display text-sm font-bold uppercase tracking-wide text-gold">
                  <LuTrophy aria-hidden className="h-4 w-4" />
                  {trophy.place === "winner" ? "Vainqueur" : "Finaliste"}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:items-end">
          <dl className="grid grid-cols-3 gap-3 text-center">
            <HeroStat label="Points" value={team.points} gold />
            <HeroStat label="V / D" value={`${team.wins}-${team.losses}`} />
            <HeroStat label="Victoires" value={rate === null ? "—" : `${rate} %`} />
          </dl>
          <div className="flex items-center gap-1.5 lg:justify-end" aria-label="Forme sur les 5 derniers matchs">
            <span className="mr-1 font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Forme</span>
            {Array.from({ length: 5 }, (_, index) => {
              const match = form[index];
              return (
                <span
                  key={index}
                  title={match ? `${match.won ? "Victoire" : "Défaite"} contre ${match.opponent?.name ?? "?"}` : "Pas encore joué"}
                  className={cn(
                    "grid h-7 w-7 place-items-center font-display text-sm font-black",
                    !match ? "border border-dashed border-white/15 text-white/20" : match.won ? "bg-win/80 text-ink" : "bg-loss/80 text-ink",
                  )}
                >
                  {match ? (match.won ? "V" : "D") : "·"}
                </span>
              );
            })}
          </div>
          {live ? (
            <ButtonLink href={`/cod/equipes/match/${live}`} size="lg">
              <span aria-hidden className="h-2 w-2 animate-pulse-gold bg-ink" />
              Match en cours · Feuille de match
            </ButtonLink>
          ) : (
            <ButtonLink href="/cod/division" size="lg" variant={searching ? "outline" : "primary"}>
              <LuSwords aria-hidden className="h-5 w-5" />
              {searching ? "Recherche en cours…" : isLeader ? "Lancer un match" : "File Division"}
            </ButtonLink>
          )}
        </div>
      </div>
    </TacticalCard>
  );
}

function HeroStat({ label, value, gold = false }) {
  return (
    <div className="min-w-[5.5rem] border border-white/10 bg-ink/60 px-3 py-2.5 backdrop-blur-sm">
      <dt className="font-tech text-[9px] uppercase tracking-[0.24em] text-white/45">{label}</dt>
      <dd className={cn("mt-1 font-display text-3xl font-black leading-none tabular-nums", gold && "text-gold")}>{value}</dd>
    </div>
  );
}

/** Objectifs : équipe à dépasser, qualification au tournoi, effectif complet. */
export function TeamGoals({ team, insights, compact = false }) {
  const { ahead } = insights;
  const goals = [];
  if (team.position === 1) {
    goals.push({ icon: LuCrown, title: "Numéro 1 de la Division", text: "Défends ta place : chaque défaite peut coûter le trône.", progress: 1 });
  } else if (ahead) {
    const gap = Math.max(1, ahead.points - team.points + 1);
    goals.push({
      icon: LuTarget,
      title: (
        <>
          Dépasser <span className="normal-case">[{ahead.tag}]</span> {ahead.name}
        </>
      ),
      key: "ahead",
      text: `${gap} point${gap > 1 ? "s" : ""} pour prendre la ${ahead.position}e place (environ ${Math.ceil(gap / 25)} victoire${Math.ceil(gap / 25) > 1 ? "s" : ""}).`,
      progress: Math.min(1, team.points / Math.max(1, ahead.points + 1)),
    });
  }
  goals.push({
    icon: LuTrophy,
    title: team.played >= TEAM_LIMITS.qualifyMatches ? "Qualifiable pour le tournoi" : "Se qualifier pour le tournoi",
    text:
      team.played >= TEAM_LIMITS.qualifyMatches
        ? "Le nombre de matchs est atteint : reste dans le haut du classement."
        : `${TEAM_LIMITS.qualifyMatches - team.played} match${TEAM_LIMITS.qualifyMatches - team.played > 1 ? "s" : ""} à jouer pour être qualifiable.`,
    progress: Math.min(1, team.played / TEAM_LIMITS.qualifyMatches),
  });
  goals.push({
    icon: LuUsers,
    title: team.members.length >= TEAM_LIMITS.maxMembers ? "Effectif complet" : "Compléter l'effectif",
    text: team.members.length >= TEAM_LIMITS.maxMembers ? "8 joueurs : de quoi tourner à chaque match." : `${team.members.length} / ${TEAM_LIMITS.maxMembers} joueurs : recrute pour avoir des remplaçants sous la main.`,
    progress: team.members.length / TEAM_LIMITS.maxMembers,
  });

  return (
    <section aria-labelledby="titre-objectifs">
      <Eyebrow>Objectifs</Eyebrow>
      <h2 id="titre-objectifs" className="mt-3 font-display text-4xl font-black uppercase leading-none">
        Prochaines étapes
      </h2>
      <ul className={cn("mt-6 grid gap-3", !compact && "md:grid-cols-3")}>
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <li key={goal.key ?? goal.title} className="border-l-2 border-gold bg-white/[0.03] p-4">
              <Icon aria-hidden className="h-6 w-6 text-gold" />
              <p className="mt-3 font-display text-xl font-bold uppercase leading-none tracking-wide">{goal.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{goal.text}</p>
              <div className="mt-4 h-1.5 -skew-x-[20deg] bg-white/10">
                <div className="h-full bg-gold" style={{ width: `${Math.round(goal.progress * 100)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Joueurs clés : le plus de matchs joués et le meilleur taux de victoire avec l'équipe (3 matchs mini). */
export function TeamStandouts({ team, insights }) {
  const stats = team.members.map((member) => ({ member, ...(insights.playerStats.get(member.id) ?? { played: 0, wins: 0 }) }));
  const engaged = [...stats].sort((a, b) => b.played - a.played)[0];
  const sharp = [...stats].filter((row) => row.played >= 3).sort((a, b) => b.wins / b.played - a.wins / a.played || b.played - a.played)[0];
  const best = [...stats].sort((a, b) => (b.member.points ?? 0) - (a.member.points ?? 0))[0];
  const cards = [
    engaged && engaged.played > 0 ? { label: "Le plus engagé", row: engaged, value: `${engaged.played} match${engaged.played > 1 ? "s" : ""}` } : null,
    sharp ? { label: "Le plus décisif", row: sharp, value: `${winRate(sharp.wins, sharp.played)} % de victoires` } : null,
    best ? { label: "Meilleur rang en classé", row: best, value: rankFor(best.member.points ?? 0).name } : null,
  ].filter(Boolean);
  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="titre-joueurs-cles">
      <Eyebrow>Effectif</Eyebrow>
      <h2 id="titre-joueurs-cles" className="mt-3 font-display text-4xl font-black uppercase leading-none">
        Joueurs clés
      </h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {cards.map(({ label, row, value }) => {
          const rank = rankFor(row.member.points ?? 0);
          return (
            <li key={label}>
              <Link href={`/cod/profile/${row.member.id}`} className="group flex items-center gap-4 border border-white/10 bg-white/[0.03] p-4 transition hover:border-gold/60">
                <Avatar src={row.member.avatarUrl} name={row.member.username} size={52} ring={rankGradient(rank, 160)} />
                <div className="min-w-0">
                  <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">{label}</p>
                  <p className="mt-1 truncate font-display text-xl font-black uppercase leading-none" style={{ color: rank.text }}>
                    {row.member.username}
                  </p>
                  <p className="mt-1 text-xs text-white/50">{value}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Derniers matchs (5) avec lien vers l'onglet complet. */
export function TeamRecent({ insights }) {
  const [all, setAll] = useState(false);
  const count = insights.history?.length ?? 0;
  return (
    <section aria-labelledby="titre-derniers-matchs">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Division</Eyebrow>
          <h2 id="titre-derniers-matchs" className="mt-3 font-display text-4xl font-black uppercase leading-none">
            Derniers matchs
          </h2>
        </div>
        {count > 5 ? (
          <button type="button" onClick={() => setAll((value) => !value)} className="inline-flex items-center gap-1 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-light">
            {all ? "Réduire" : `Tout l'historique · ${count}`}
            <LuArrowUpRight aria-hidden className={cn("h-4 w-4 transition", all && "rotate-180")} />
          </button>
        ) : null}
      </div>
      <TeamMatchHistory history={insights.history} limit={all ? null : 5} />
    </section>
  );
}

/** Statistiques Division d'un membre avec l'équipe (pour la liste de l'effectif). */
export function memberLine(insights, memberId) {
  const stats = insights.playerStats.get(memberId);
  if (!stats || stats.played === 0) return "Pas encore de match avec l'équipe";
  return `${stats.played} match${stats.played > 1 ? "s" : ""} · ${winRate(stats.wins, stats.played)} % de victoires`;
}

const DAY = 24 * 3600_000;
const WEEKLY_TARGET = 5;

/** Début de la semaine (lundi 0 h, heure locale). */
function weekStart(now = new Date()) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return date.getTime();
}

/** Objectif de la semaine : 5 matchs joués, avec le bilan de la semaine. */
export function TeamWeekly({ insights }) {
  const start = weekStart();
  const week = (insights.history ?? []).filter((match) => match.status === "completed" && new Date(match.date).getTime() >= start);
  const wins = week.filter((match) => match.won).length;
  const points = week.reduce((sum, match) => sum + (typeof match.points === "number" ? match.points : 0), 0);
  const done = week.length >= WEEKLY_TARGET;
  return (
    <TacticalCard highlight={done} innerClassName="p-5">
      <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Objectif de la semaine</p>
      <p className="mt-2 font-display text-2xl font-black uppercase leading-none">{done ? "Objectif atteint" : `Jouer ${WEEKLY_TARGET} matchs`}</p>
      <div className="mt-4 flex gap-1.5">
        {Array.from({ length: WEEKLY_TARGET }, (_, index) => (
          <span key={index} className={cn("h-2.5 flex-1 -skew-x-[20deg]", index < week.length ? "bg-gold shadow-[0_0_10px_var(--color-gold)]" : "bg-white/10")} />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Joués" value={week.length} />
        <MiniStat label="Gagnés" value={wins} />
        <MiniStat label="Points" value={points > 0 ? `+${points}` : points} tone={points > 0 ? "win" : points < 0 ? "loss" : null} />
      </dl>
      <p className="mt-3 text-xs text-white/40">Remis à zéro chaque lundi.</p>
    </TacticalCard>
  );
}

function MiniStat({ label, value, tone = null }) {
  return (
    <div className="bg-white/[0.04] px-2 py-2">
      <dt className="font-tech text-[9px] uppercase tracking-[0.2em] text-white/45">{label}</dt>
      <dd className={cn("mt-1 font-display text-xl font-black tabular-nums leading-none", tone === "win" && "text-win", tone === "loss" && "text-loss")}>{value}</dd>
    </div>
  );
}

/** Rivalité : l'adversaire le plus affronté (2 matchs au moins) et le face-à-face. */
export function TeamRival({ insights }) {
  const byOpponent = new Map();
  for (const match of insights.history ?? []) {
    if (match.status !== "completed" || !match.opponent) continue;
    const row = byOpponent.get(match.opponent.id) ?? { team: match.opponent, wins: 0, losses: 0 };
    if (match.won) row.wins += 1;
    else row.losses += 1;
    byOpponent.set(match.opponent.id, row);
  }
  const rival = [...byOpponent.values()].filter((row) => row.wins + row.losses >= 2).sort((a, b) => b.wins + b.losses - (a.wins + a.losses))[0];
  if (!rival) return null;
  const lead = rival.wins > rival.losses ? "Tu mènes la rivalité" : rival.wins < rival.losses ? "Ils mènent la rivalité" : "Rivalité à égalité";
  return (
    <TacticalCard innerClassName="p-5">
      <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Rival</p>
      <Link href={`/cod/equipes/${rival.team.id}`} className="mt-3 flex items-center gap-3 hover:opacity-90">
        <TeamCrest team={rival.team} size={44} />
        <div className="min-w-0">
          <p className="truncate font-display text-2xl font-black uppercase leading-none">{rival.team.name}</p>
          <p className="mt-1 font-tech text-xs uppercase tracking-[0.2em] text-white/45"><span className="normal-case">[{rival.team.tag}]</span></p>
        </div>
      </Link>
      <p className="mt-4 font-display text-4xl font-black tabular-nums leading-none">
        <span className="text-win">{rival.wins}</span> <span className="text-white/30">–</span> <span className="text-loss">{rival.losses}</span>
      </p>
      <p className="mt-1 text-xs text-white/50">
        {lead} · {rival.wins + rival.losses} matchs
      </p>
    </TacticalCard>
  );
}

/** Records de l'équipe : plus longue série, victoires 2-0, plus gros gain de points. */
export function TeamRecords({ insights }) {
  const done = [...(insights.history ?? [])].filter((match) => match.status === "completed").reverse();
  if (done.length === 0) return null;
  let best = 0;
  let run = 0;
  for (const match of done) {
    run = match.won ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const sweeps = done.filter((match) => match.won && !match.forfeit && match.mapsAgainst === 0).length;
  const biggest = done.reduce((max, match) => (typeof match.points === "number" && match.points > (max?.points ?? 0) ? match : max), null);
  const records = [
    { label: "Plus longue série", value: `${best} victoire${best > 1 ? "s" : ""}` },
    { label: "Victoires 2-0", value: sweeps },
    biggest ? { label: "Plus gros gain", value: `+${biggest.points} pts`, hint: `vs ${biggest.opponent?.name ?? "?"}` } : null,
  ].filter(Boolean);
  return (
    <TacticalCard innerClassName="p-5">
      <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Records</p>
      <ul className="mt-3 divide-y divide-white/10">
        {records.map((record) => (
          <li key={record.label} className="flex items-baseline justify-between gap-3 py-2.5">
            <span className="text-sm text-white/60">{record.label}</span>
            <span className="text-right font-display text-xl font-black uppercase leading-none">
              {record.value}
              {record.hint ? <span className="mt-0.5 block font-sans text-[11px] font-normal normal-case text-white/40">{record.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </TacticalCard>
  );
}

/** Fil d'activité de l'équipe : création, arrivées, matchs, trophées (les 10 derniers événements). */
export function TeamActivity({ team, insights }) {
  const events = [];
  if (team.createdAt) events.push({ date: team.createdAt, icon: LuFlame, text: <>L&apos;équipe <strong className="text-white">{team.name}</strong> est créée.</> });
  for (const member of team.members) {
    if (member.joinedAt && !member.crown) {
      events.push({ date: member.joinedAt, icon: LuUsers, text: <><strong className="text-white">{member.username}</strong> rejoint l&apos;équipe.</> });
    }
  }
  for (const match of insights.history ?? []) {
    if (match.status !== "completed") continue;
    events.push({
      date: match.date,
      icon: LuSwords,
      tone: match.won ? "win" : "loss",
      href: `/cod/equipes/match/${match.id}`,
      text: (
        <>
          {match.won ? "Victoire" : "Défaite"} contre{" "}
          <strong className="text-white">
            <span className="normal-case">[{match.opponent?.tag}]</span> {match.opponent?.name}
          </strong>{" "}
          {match.forfeit ? "par forfait" : `${match.mapsFor}-${match.mapsAgainst}`}
          {typeof match.points === "number" ? ` (${match.points > 0 ? "+" : ""}${match.points} pts)` : ""}.
        </>
      ),
    });
  }
  for (const trophy of team.trophies ?? []) {
    events.push({ date: trophy.date, icon: LuTrophy, text: <>{trophy.place === "winner" ? "Vainqueur" : "Finaliste"} du <strong className="text-white">{trophy.name}</strong>.</> });
  }
  const recent = events
    .filter((event) => event.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
  if (recent.length === 0) return null;
  const when = (iso) => {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY);
    if (days <= 0) return "Aujourd’hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} j`;
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <section aria-labelledby="titre-activite">
      <Eyebrow>Journal</Eyebrow>
      <h2 id="titre-activite" className="mt-3 font-display text-4xl font-black uppercase leading-none">
        Activité de l&apos;équipe
      </h2>
      <ol className="relative mt-6 space-y-4 border-l border-white/10 pl-6">
        {recent.map((event, index) => {
          const Icon = event.icon;
          const body = (
            <>
              <span
                aria-hidden
                className={cn(
                  "absolute -left-9 top-0 grid h-6 w-6 place-items-center border bg-ink",
                  event.tone === "win" ? "border-win text-win" : event.tone === "loss" ? "border-loss text-loss" : "border-gold text-gold",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <p className="text-sm text-white/65">{event.text}</p>
              <p className="mt-0.5 font-tech text-[10px] uppercase tracking-[0.2em] text-white/35">{when(event.date)}</p>
            </>
          );
          return (
            <li key={index} className="relative">
              {event.href ? (
                <Link href={event.href} className="block hover:opacity-90">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Badges d'un membre : Fondateur, Pilier (le plus de matchs), Vétéran (30 j ou 20 matchs), Recrue (moins de 7 j). */
export function memberBadges(team, insights, member) {
  const badges = [];
  const stats = insights.playerStats.get(member.id) ?? { played: 0, wins: 0 };
  const top = Math.max(0, ...team.members.map((other) => insights.playerStats.get(other.id)?.played ?? 0));
  const days = member.joinedAt ? (Date.now() - new Date(member.joinedAt).getTime()) / DAY : 0;
  if (member.crown) badges.push("Fondateur");
  if (top > 0 && stats.played === top) badges.push("Pilier");
  if (!member.crown && (days >= 30 || stats.played >= 20)) badges.push("Vétéran");
  if (!member.crown && days < 7) badges.push("Recrue");
  return badges;
}

/**
 * Frise des matchs de l'équipe (du plus ancien au plus récent, 30 derniers) : un losange par match,
 * vert pour une victoire, rouge pour une défaite, d'autant plus gros que l'écart de points est grand ;
 * les séries de victoires sont reliées. Survol : adversaire, score, points ; clic : feuille de match.
 */
export function TeamMatchTimeline({ insights }) {
  const [hover, setHover] = useState(null);
  const matches = (insights.history ?? []).filter((match) => match.status === "completed").slice(0, 30).reverse();
  if (matches.length === 0) return null;
  const width = 1000;
  const height = 120;
  const mid = 60;
  const pad = 30;
  const step = matches.length > 1 ? (width - pad * 2) / (matches.length - 1) : 0;
  const x = (index) => (matches.length > 1 ? pad + index * step : width / 2);
  const size = (match) => 12 + Math.min(18, Math.abs(match.points ?? 25) * 0.45);
  const wins = matches.filter((match) => match.won).length;
  const total = matches.reduce((sum, match) => sum + (typeof match.points === "number" ? match.points : 0), 0);
  const active = hover === null ? null : matches[hover];

  return (
    <section aria-labelledby="titre-frise">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Saison</Eyebrow>
          <h2 id="titre-frise" className="mt-3 font-display text-4xl font-black uppercase leading-none">
            Fil des matchs
          </h2>
        </div>
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/60">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rotate-45 bg-win" />
            Victoire
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rotate-45 bg-loss" />
            Défaite
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-[3px] w-4 bg-win" />
            Série
          </span>
          <span className="font-tech tabular-nums text-white/80">
            {wins} V · {matches.length - wins} D · {total > 0 ? "+" : ""}
            {total} pts
          </span>
        </p>
      </div>

      <TacticalCard className="mt-6" innerClassName="relative px-3 pb-3 pt-4 sm:px-5">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full overflow-visible" role="img" aria-label={`${matches.length} derniers matchs : ${wins} victoires, ${matches.length - wins} défaites`}>
          <line x1={pad / 2} y1={mid} x2={width - pad / 2} y2={mid} stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
          {matches.map((match, index) =>
            index > 0 && match.won && matches[index - 1].won ? (
              <line key={`serie-${match.id}`} x1={x(index - 1)} y1={mid} x2={x(index)} y2={mid} stroke="var(--color-win)" strokeWidth="4" strokeLinecap="round" />
            ) : null,
          )}
          {matches.map((match, index) => {
            const s = size(match);
            return (
              <a key={match.id} href={`/cod/equipes/match/${match.id}`} onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(index)} onBlur={() => setHover(null)}>
                <circle cx={x(index)} cy={mid} r={Math.max(16, s)} fill="transparent" />
                <rect
                  x={x(index) - s / 2}
                  y={mid - s / 2}
                  width={s}
                  height={s}
                  rx="2"
                  transform={`rotate(45 ${x(index)} ${mid})`}
                  fill={match.won ? "var(--color-win)" : "var(--color-loss)"}
                  stroke="var(--color-ink-800)"
                  strokeWidth="2"
                  opacity={hover === null || hover === index ? 1 : 0.35}
                  className="transition-opacity"
                >
                  <title>{`${match.won ? "Victoire" : "Défaite"} contre ${match.opponent?.name ?? "?"}`}</title>
                </rect>
              </a>
            );
          })}
        </svg>
        <div className="mt-1 flex justify-between font-tech text-[10px] uppercase tracking-[0.2em] text-white/35">
          <span>{new Date(matches[0].date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
          <span>Aujourd&apos;hui</span>
        </div>
        {active ? (
          <div
            className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 border border-white/15 bg-ink/95 px-3 py-2 text-xs shadow-lg"
            style={{ left: `${(x(hover) / width) * 100}%` }}
          >
            <p className="font-display text-sm font-bold uppercase leading-none">
              <span className={active.won ? "text-win" : "text-loss"}>{active.won ? "Victoire" : "Défaite"}</span> vs {active.opponent?.name ?? "?"}
            </p>
            <p className="mt-1 font-tech tabular-nums text-white/60">
              {active.forfeit ? "par forfait" : `${active.mapsFor}-${active.mapsAgainst}`}
              {typeof active.points === "number" ? ` · ${active.points > 0 ? "+" : ""}${active.points} pts` : ""}
              {" · "}
              {new Date(active.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </p>
          </div>
        ) : null}
      </TacticalCard>
    </section>
  );
}
