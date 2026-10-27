import Link from "next/link";
import { useEffect, useState } from "react";
import { LuChevronRight, LuShield } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { nextRank, rankFor } from "../../lib/ranks";
import { TeamCrest } from "../teams/TeamParts";
import { RankEmblem } from "./RankEmblem";

const rateOf = (wins, losses) => (wins + losses > 0 ? `${Math.round((wins / (wins + losses)) * 100)} %` : "—");

/** Un chiffre de la barre : valeur en grand, libellé discret. */
function Figure({ label, value, accent = false }) {
  return (
    <span className="min-w-0">
      <span className="block whitespace-nowrap font-tech text-[9px] uppercase tracking-[0.2em] text-white/40">{label}</span>
      <span className={cn("block whitespace-nowrap font-display text-xl font-black leading-tight tabular-nums", accent && "text-gold")}>{value}</span>
    </span>
  );
}

/**
 * « Ma saison » en haut de la page MW4 (joueur connecté) : une ligne, Classé à gauche (rang, points, place, bilan,
 * taux, progression vers le rang suivant), Division à droite (équipe, place, points, bilan) ; liens vers le profil et
 * Mon équipe. Remplace l'ancien bloc « Mon résumé ».
 */
export function MySeason({ profile, position }) {
  const [team, setTeam] = useState(undefined);

  useEffect(() => {
    if (!MATCH_TEAM_ENABLED) return undefined;
    let alive = true;
    api("/teams/me")
      .then((data) => alive && setTeam(data.team ?? null))
      .catch(() => alive && setTeam(null));
    return () => {
      alive = false;
    };
  }, []);

  const rank = rankFor(profile.points);
  const next = nextRank(profile.points);

  return (
    <section aria-label="Ma saison" className={cn("grid gap-px overflow-hidden border border-white/10 bg-white/10", MATCH_TEAM_ENABLED && "lg:grid-cols-[3fr_2fr]")}>
      <Link href="/cod/profile" data-univers="classe" className="group flex flex-wrap items-center gap-x-6 gap-y-3 bg-ink-800 px-5 py-3.5 transition-colors hover:bg-white/[0.04]">
        <span className="flex min-w-0 items-center gap-3">
          <RankEmblem rank={rank} size={40} />
          <span className="min-w-0">
            <span className="block font-tech text-[9px] uppercase tracking-[0.2em] text-gold">Classé</span>
            <span className="block font-display text-xl font-black uppercase leading-tight" style={{ color: rank.text }}>
              {rank.name}
            </span>
            {next.rank ? (
              <span className="mt-1 block h-1 w-28 bg-white/10" title={`${Math.round(next.progress * 100)} % vers ${next.rank.name}`}>
                <span className="block h-full" style={{ width: `${Math.round(next.progress * 100)}%`, background: next.rank.color }} />
              </span>
            ) : null}
          </span>
        </span>
        <span className="grid basis-full grid-cols-4 gap-3 sm:flex-1 sm:basis-auto sm:gap-4">
          <Figure label="Points" value={profile.points} accent />
          <Figure label="Place" value={position ? `#${position}` : "—"} />
          <Figure label="V / D" value={`${profile.wins} / ${profile.losses}`} />
          <Figure label="Taux" value={rateOf(profile.wins, profile.losses)} />
        </span>
        <LuChevronRight aria-hidden className="hidden h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-gold sm:block" />
      </Link>

      {MATCH_TEAM_ENABLED ? (
        team ? (
          <Link href="/cod/equipe" data-univers="division" className="group flex flex-wrap items-center gap-x-6 gap-y-3 bg-ink-800 px-5 py-3.5 transition-colors hover:bg-white/[0.04]">
            <span className="flex min-w-0 items-center gap-3">
              <TeamCrest team={team} size={40} />
              <span className="min-w-0">
                <span className="block font-tech text-[9px] uppercase tracking-[0.2em] text-gold">Division</span>
                <span className="block truncate font-display text-xl font-black uppercase leading-tight">
                  <span className="normal-case text-white/50">[{team.tag}]</span> {team.name}
                </span>
              </span>
            </span>
            <span className="grid basis-full grid-cols-3 gap-3 sm:flex-1 sm:basis-auto sm:gap-4">
              <Figure label="Place" value={team.position ? `#${team.position}` : "—"} />
              <Figure label="Points" value={team.points} accent />
              <Figure label="V / D" value={`${team.wins} / ${team.losses}`} />
            </span>
            <LuChevronRight aria-hidden className="hidden h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-gold sm:block" />
          </Link>
        ) : team === null ? (
          <Link href="/cod/equipes" data-univers="division" className="group flex items-center gap-3 bg-ink-800 px-5 py-3.5 transition-colors hover:bg-white/[0.04]">
            <span className="grid h-10 w-10 shrink-0 place-items-center border border-gold/40 bg-gold/10">
              <LuShield aria-hidden className="h-5 w-5 text-gold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-tech text-[9px] uppercase tracking-[0.2em] text-gold">Division</span>
              <span className="block font-display text-xl font-black uppercase leading-tight">Pas encore d&apos;équipe</span>
              <span className="block text-xs text-white/45">Trouve une équipe ou crée la tienne</span>
            </span>
            <LuChevronRight aria-hidden className="h-4 w-4 shrink-0 text-white/25 transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
          </Link>
        ) : (
          <span className="bg-ink-800" />
        )
      ) : null}
    </section>
  );
}
