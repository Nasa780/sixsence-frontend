import Link from "next/link";
import { TeamCrest } from "./TeamParts";
import { TeamBackdrop } from "./TeamStandings";
import { TEAM_LIMITS } from "../../lib/teams";

/** Effectif en crans (un par place), dans la couleur de l'équipe. */
function RosterPips({ size, color }) {
  return (
    <span className="flex items-center gap-2">
      <span className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: TEAM_LIMITS.maxMembers }, (_, index) => (
          <span key={index} className="h-3 w-1 -skew-x-[16deg]" style={{ background: index < size ? color : "rgba(255,255,255,0.1)", boxShadow: index < size ? `0 0 6px ${color}88` : "none" }} />
        ))}
      </span>
      <span className="font-tech text-[10px] tabular-nums text-white/55">
        {size}/{TEAM_LIMITS.maxMembers} joueurs
      </span>
    </span>
  );
}

/**
 * « Ils recrutent » (classement des équipes, 2026-11-13) : les équipes qui cherchent des joueurs (réglage Recrutement
 * de Mon équipe), dans l'ordre du classement, avec leurs places libres et leur message. Rien si aucune ne recrute.
 */
export function RecruitingTeams({ teams }) {
  const list = teams.filter((team) => team.recruiting && (team.size ?? 1) < TEAM_LIMITS.maxMembers).slice(0, 9);
  if (!list.length) return null;
  return (
    <section aria-labelledby="titre-recrutent" className="mt-16">
      <p className="font-tech text-[10px] uppercase tracking-[0.32em] text-win sm:text-xs">Recrutement ouvert</p>
      <h2 id="titre-recrutent" className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
        Ils recrutent
      </h2>
      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((team) => {
          const free = TEAM_LIMITS.maxMembers - (team.size ?? 1);
          return (
            <li key={team.id}>
              <Link href={`/cod/equipes/${team.id}`} className="group clip-tactical relative flex h-full flex-col overflow-hidden bg-ink-800 p-5 [--cut:14px]">
                <TeamBackdrop team={team} strength={0.3} />
                <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ink-800 via-ink-800/85 to-ink-800/40" />
                <span aria-hidden className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, ${team.color}, transparent)` }} />
                <span className="relative flex items-center gap-3">
                  <TeamCrest team={team} size={48} />
                  <span className="min-w-0">
                    <span className="block truncate font-display text-2xl font-black uppercase leading-none transition-colors group-hover:text-gold">{team.name}</span>
                    <span className="font-tech text-[10px] tracking-[0.18em]" style={{ color: team.color }}>
                      [{team.tag}] · #{team.position}
                    </span>
                  </span>
                </span>
                <span className="relative mt-4 block">
                  <RosterPips size={team.size ?? 1} color={team.color} />
                  <span className="mt-1 block font-tech text-[9px] uppercase tracking-[0.24em] text-win">
                    {free} place{free > 1 ? "s" : ""} libre{free > 1 ? "s" : ""}
                  </span>
                </span>
                {team.recruitingNote ? <span className="relative mt-3 block break-words text-sm italic text-white/65">{team.recruitingNote}</span> : null}
                <span className="relative mt-auto pt-5 font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Voir l’équipe →</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
