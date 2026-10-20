import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuCrown, LuPlus, LuTrophy, LuUsers } from "react-icons/lu";
import { SlantTab, TeamCrest } from "../../../components/teams/TeamParts";
import { TeamSeasonArchive } from "../../../components/teams/TeamSeasonArchive";
import { ButtonLink } from "../../../components/ui/Button";
import { Container } from "../../../components/ui/Container";
import { EmptyState, Loading, Notice } from "../../../components/ui/Feedback";
import { TacticalCard } from "../../../components/ui/TacticalCard";
import { PageHeader } from "../../../components/ui/Typography";
import useSeasons from "../../../hooks/useSeasons";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import { cn } from "../../../lib/cn";
import { TEAM_LIMITS } from "../../../lib/teams";

/** Places qualificatives pour le tournoi de fin de saison (réglable plus tard selon l'activité). */
const QUALIFIED_SPOTS = 16;

/** Classement des équipes du Division. Public. */
export default function TeamsPage() {
  const { userId } = useSession();
  const { seasons, label } = useSeasons();
  const [selected, setSelected] = useState("live");
  const past = (seasons || []).filter((season) => !season.is_active);
  const archived = past.find((season) => String(season.id) === selected);
  const [teams, setTeams] = useState(null);
  const [error, setError] = useState(null);
  const [mine, setMine] = useState(undefined);

  // Classement en direct : rechargé à chaque changement d'une équipe (points, nom…), regroupé sur 1 s.
  useEffect(() => {
    const load = () =>
      api("/teams")
        .then((data) => setTeams(data.teams))
        .catch((caught) => setError(caught.message));
    load();
    let timer = null;
    const channel = supabase
      .channel(`teams-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, () => {
        clearTimeout(timer);
        timer = setTimeout(load, 1000);
      })
      .subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!userId) return setMine(null);
    api("/teams/me")
      .then((data) => setMine(data.team))
      .catch(() => setMine(null));
  }, [userId]);

  const qualified = (team) => team.position <= QUALIFIED_SPOTS && team.played >= TEAM_LIMITS.qualifyMatches;
  const podium = (teams ?? []).slice(0, 3);
  const others = (teams ?? []).slice(3);

  return (
    <>
      <Head>
        <title>Équipes — SixSence</title>
        <meta name="description" content="Classement des équipes du Division de SixSence : BO3 en 4v4, points en direct, tournoi de fin de saison." />
      </Head>
      <PageHeader
        image="/images/mw4.webp"
        eyebrow={`${label} · Division`}
        title={
          <>
            Classement <span className="text-gold-gradient">équipes</span>
          </>
        }
        description={`Équipes jusqu'à 8 joueurs, BO3 en 4v4. Le top ${QUALIFIED_SPOTS} (${TEAM_LIMITS.qualifyMatches} matchs minimum) dispute le tournoi de fin de saison.`}
        actions={
          <>
            <ButtonLink href="/cod/tournoi" variant="outline" size="lg">
              <LuTrophy aria-hidden className="h-5 w-5" />
              Tournoi
            </ButtonLink>
            {mine ? (
              <ButtonLink href="/cod/equipe" size="lg">
                <LuUsers aria-hidden className="h-5 w-5" />
                Mon équipe
              </ButtonLink>
            ) : (
              <ButtonLink href={userId ? "/cod/equipes/creer" : "/cod/equipe"} size="lg">
                <LuPlus aria-hidden className="h-5 w-5" />
                Créer une équipe
              </ButtonLink>
            )}
          </>
        }
      />
      <Container className="py-12">
        {past.length > 0 ? (
          <div role="tablist" aria-label="Saison affichée" className="mb-8 flex flex-wrap gap-2">
            <SlantTab active={selected === "live"} onClick={() => setSelected("live")}>
              {label} · en cours
            </SlantTab>
            {past.map((season) => (
              <SlantTab key={season.id} active={selected === String(season.id)} onClick={() => setSelected(String(season.id))}>
                {season.name}
              </SlantTab>
            ))}
          </div>
        ) : null}
        {archived ? (
          <TeamSeasonArchive season={archived} myTeamId={mine?.id ?? null} />
        ) : (
          <>
            {error ? <Notice tone="error">{error}</Notice> : null}
            {!teams && !error ? <Loading /> : null}
            {teams && teams.length === 0 ? (
              <EmptyState title="Aucune équipe pour l'instant">Crée la première équipe SixSence et invite tes coéquipiers.</EmptyState>
            ) : null}

            {podium.length > 0 ? (
              <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {podium.map((team, index) => (
                  <li key={team.id} className={cn(index === 0 && "md:-mt-4")}>
                    <Link href={`/cod/equipes/${team.id}`} className="block h-full">
                      <TacticalCard highlight={index === 0} interactive className="h-full" innerClassName={cn("overflow-hidden p-6", index === 0 && "holo")}>
                        <span
                          aria-hidden
                          className="absolute -right-2 -top-5 select-none font-display text-[8rem] font-black leading-none text-outline opacity-60"
                        >
                          {index + 1}
                        </span>
                        <div className="relative">
                          <p className="flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-gold">
                            {index === 0 ? <LuCrown aria-hidden className="h-4 w-4" /> : null}#{index + 1}
                            {team.id === mine?.id ? <span className="text-white/60">· Ton équipe</span> : null}
                          </p>
                          <div className="mt-4 flex items-center gap-3.5">
                            <TeamCrest team={team} size={56} />
                            <div className="min-w-0">
                              <p className="truncate font-display text-3xl font-black uppercase leading-none">{team.name}</p>
                              <p className="mt-1.5 font-display text-sm font-bold uppercase tracking-[0.16em]" style={{ color: team.color }}>
                                <span className="normal-case">[{team.tag}]</span>
                              </p>
                            </div>
                          </div>
                          <dl className="mt-6 grid grid-cols-3 gap-px bg-white/10">
                            <PodiumStat label="Points" value={team.points} accent />
                            <PodiumStat label="V / D" value={`${team.wins} / ${team.losses}`} />
                            <PodiumStat label="Joueurs" value={`${team.size} / ${TEAM_LIMITS.maxMembers}`} />
                          </dl>
                        </div>
                      </TacticalCard>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : null}

            {others.length > 0 ? (
              <div className="mt-10 overflow-x-auto">
                <table className="w-full min-w-[34rem] border-separate border-spacing-y-1.5 text-left">
                  <caption className="sr-only">Classement des équipes</caption>
                  <thead>
                    <tr className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/40">
                      <th scope="col" className="w-16 px-4 py-2 font-medium">
                        Rang
                      </th>
                      <th scope="col" className="px-4 py-2 font-medium">
                        Équipe
                      </th>
                      <th scope="col" className="px-4 py-2 text-right font-medium">
                        Points
                      </th>
                      <th scope="col" className="whitespace-nowrap px-4 py-2 text-right font-medium">
                        V / D
                      </th>
                      <th scope="col" className="px-4 py-2 text-right font-medium">
                        Matchs
                      </th>
                      <th scope="col" className="px-4 py-2 text-right font-medium">
                        Joueurs
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {others.map((team) => {
                      const isMine = team.id === mine?.id;
                      return (
                        <tr key={team.id} className={cn("transition-colors", isMine ? "bg-gold/10" : "bg-white/[0.03] hover:bg-white/[0.06]")}>
                          <td
                            className={cn(
                              "border-l-2 px-4 py-3 font-tech text-sm font-bold tabular-nums",
                              qualified(team) ? "border-gold text-gold" : "border-transparent text-white/50",
                            )}
                          >
                            {team.position}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/cod/equipes/${team.id}`} className="group flex items-center gap-3">
                              <TeamCrest team={team} size={34} />
                              <span className="min-w-0">
                                <span className="block truncate font-display text-lg font-bold uppercase leading-none tracking-wide group-hover:text-gold">
                                  {team.name}
                                  {isMine ? <span className="ml-2 text-xs text-gold">· Ton équipe</span> : null}
                                </span>
                                <span className="mt-1 block text-xs text-white/45">
                                  <span className="normal-case">[{team.tag}]</span>
                                  {team.played < TEAM_LIMITS.qualifyMatches
                                    ? ` · ${TEAM_LIMITS.qualifyMatches - team.played} matchs avant d'être qualifiable`
                                    : ""}
                                </span>
                              </span>
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-right font-tech text-base font-bold tabular-nums text-gold">{team.points}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm tabular-nums text-white/70">
                            {team.wins} / {team.losses}
                          </td>
                          <td className="px-4 py-3 text-right text-sm tabular-nums text-white/70">{team.played}</td>
                          <td className="px-4 py-3 text-right text-sm tabular-nums text-white/70">
                            {team.size} / {TEAM_LIMITS.maxMembers}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}

            {teams && teams.length > 0 ? (
              <Notice className="mt-8">
                Bordure dorée : équipe qualifiée pour le tournoi de fin de saison (top {QUALIFIED_SPOTS} et {TEAM_LIMITS.qualifyMatches} matchs minimum). Toutes
                les équipes démarrent à 1 000 points ; les matchs d&apos;équipe arrivent bientôt.
              </Notice>
            ) : null}
          </>
        )}
      </Container>
    </>
  );
}

function PodiumStat({ label, value, accent = false }) {
  return (
    <div className="bg-ink-800 px-3 py-3">
      <dt className="font-tech text-[9px] uppercase tracking-[0.22em] text-white/40">{label}</dt>
      <dd className={cn("mt-1 whitespace-nowrap font-display text-xl font-black leading-none tabular-nums sm:text-2xl", accent && "text-gold")}>{value}</dd>
    </div>
  );
}
