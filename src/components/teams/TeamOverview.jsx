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
              [{team.tag}]
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
export function TeamGoals({ team, insights }) {
  const { ahead } = insights;
  const goals = [];
  if (team.position === 1) {
    goals.push({ icon: LuCrown, title: "Numéro 1 de la Division", text: "Défends ta place : chaque défaite peut coûter le trône.", progress: 1 });
  } else if (ahead) {
    const gap = Math.max(1, ahead.points - team.points + 1);
    goals.push({
      icon: LuTarget,
      title: `Dépasser [${ahead.tag}] ${ahead.name}`,
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
      <ul className="mt-6 grid gap-3 md:grid-cols-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          return (
            <li key={goal.title} className="border-l-2 border-gold bg-white/[0.03] p-4">
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
export function TeamRecent({ insights, onSeeAll }) {
  return (
    <section aria-labelledby="titre-derniers-matchs">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Division</Eyebrow>
          <h2 id="titre-derniers-matchs" className="mt-3 font-display text-4xl font-black uppercase leading-none">
            Derniers matchs
          </h2>
        </div>
        {insights.history?.length > 5 ? (
          <button type="button" onClick={onSeeAll} className="inline-flex items-center gap-1 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-light">
            Tout l&apos;historique
            <LuArrowUpRight aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <TeamMatchHistory history={insights.history} limit={5} />
    </section>
  );
}

/** Statistiques Division d'un membre avec l'équipe (pour la liste de l'effectif). */
export function memberLine(insights, memberId) {
  const stats = insights.playerStats.get(memberId);
  if (!stats || stats.played === 0) return "Pas encore de match avec l'équipe";
  return `${stats.played} match${stats.played > 1 ? "s" : ""} · ${winRate(stats.wins, stats.played)} % de victoires`;
}
