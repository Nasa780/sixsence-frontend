import Head from "next/head";
import { useEffect, useState } from "react";
import { LuPlus, LuTrophy, LuUsers } from "react-icons/lu";
import { SlantTab } from "../../../components/teams/TeamParts";
import { TeamSeasonArchive } from "../../../components/teams/TeamSeasonArchive";
import { TeamStandings } from "../../../components/teams/TeamStandings";
import { ButtonLink } from "../../../components/ui/Button";
import { Container } from "../../../components/ui/Container";
import { EmptyState, Loading, Notice } from "../../../components/ui/Feedback";
import { PageHeader } from "../../../components/ui/Typography";
import useSeasons from "../../../hooks/useSeasons";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";
import { supabase } from "../../../lib/supabase";
import { TEAM_LIMITS } from "../../../lib/teams";

/** Places qualificatives par défaut, tant qu'aucun tournoi n'est prévu (sinon, celles du tournoi). */
const QUALIFIED_SPOTS = 16;

/** Classement des équipes de la Division. Public. */
export default function TeamsPage() {
  const { userId } = useSession();
  const { seasons, active, label } = useSeasons();
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

  // Tournoi prévu ou en cours : son nombre de places et sa date remplacent le top 16 par défaut.
  const [tournament, setTournament] = useState(null);
  useEffect(() => {
    api("/teams/tournament")
      .then(({ tournament: next }) => setTournament(next && (next.status === "scheduled" || next.status === "running") ? next : null))
      .catch(() => setTournament(null));
  }, []);
  const spots = tournament?.size ?? QUALIFIED_SPOTS;

  useEffect(() => {
    if (!userId) return setMine(null);
    api("/teams/me")
      .then((data) => setMine(data.team))
      .catch(() => setMine(null));
  }, [userId]);

  const qualified = (team) => team.position <= spots && team.played >= TEAM_LIMITS.qualifyMatches;

  return (
    <>
      <Head>
        <title>Équipes — SixSence</title>
        <meta name="description" content="Classement des équipes de la Division de SixSence : BO3 en 4v4, points en direct, tournoi de fin de saison." />
      </Head>
      <PageHeader
        image="/images/mw4.webp"
        eyebrow={`${label} · Division`}
        title={
          <>
            Classement <span className="text-gold-gradient">équipes</span>
          </>
        }
        description={
          tournament
            ? `Équipes jusqu'à 8 joueurs, BO3 en 4v4. Le top ${spots} (${TEAM_LIMITS.qualifyMatches} matchs minimum) dispute le tournoi du ${new Date(tournament.startsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}.`
            : `Équipes jusqu'à 8 joueurs, BO3 en 4v4. Les meilleures équipes (${TEAM_LIMITS.qualifyMatches} matchs minimum) disputeront le tournoi de fin de saison.`
        }
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

            {teams && teams.length > 0 ? (
              <>
                <p className="mb-5 inline-flex items-center gap-2 text-xs text-gold">
                  <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold" />
                  Classement en direct
                </p>
                <TeamStandings teams={teams} mineId={mine?.id ?? null} qualified={qualified} qualifiedSpots={spots} seasonStart={active?.starts_at ?? null} />
              </>
            ) : null}

            {teams && teams.length > 0 ? (
              <Notice className="mt-8">
                Liseré : Équipe qualifiée pour le tournoi de fin de saison (Top {spots}, {TEAM_LIMITS.qualifyMatches} matchs min.). Toutes les équipes
                débutent à 1 000 points.
              </Notice>
            ) : null}
          </>
        )}
      </Container>
    </>
  );
}

