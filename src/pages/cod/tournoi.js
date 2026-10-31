import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuCheck, LuDices, LuFlag, LuListOrdered, LuLoaderCircle, LuShield, LuSwords, LuTrophy, LuUserMinus, LuUserPlus, LuUsers } from "react-icons/lu";
import { MatchRulesCard } from "../../components/cod/MatchRules";
import { SlantTab, TeamCrest } from "../../components/teams/TeamParts";
import { AnubisCup, AnubisTeaser, HorusTeaser } from "../../components/tournament/AnubisCup";
import { BracketBoard } from "../../components/tournament/BracketBoard";
import { CupHero, CupList } from "../../components/tournament/CupCards";
import { Avatar } from "../../components/ui/Avatar";
import { Button, ButtonLink } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { Chip, Loading, Notice, StatTile } from "../../components/ui/Feedback";
import { TacticalCard } from "../../components/ui/TacticalCard";
import { Eyebrow, PageHeader } from "../../components/ui/Typography";
import useSession from "../../hooks/useSession";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/cn";
import { TEAM_LIMITS } from "../../lib/teams";

const dateFr = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

function countdown(target, now) {
  const seconds = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return d > 0 ? `${d} j ${h} h ${String(m).padStart(2, "0")}` : `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Onglets de la fiche d'une coupe (Horus) ou du tournoi de saison. */
const VIEWS = [
  ["infos", "Infos"],
  ["tableau", "Tableau"],
  ["equipes", "Équipes"],
  ["recompenses", "Récompenses"],
  ["regles", "Règles"],
];

const PODIUM = [
  ["winner", "Or", "🥇"],
  ["finalist", "Argent", "🥈"],
  ["third", "Bronze", "🥉"],
];

/**
 * Tournois, façon Sked : sans paramètre, la liste des coupes (prochaines et passées, avec leur affiche) ; ?id= la fiche
 * d'une coupe ; ?coupe=horus|anubis|saison|playin la coupe du moment de ce type (anciens liens). Coupe Horus (équipes,
 * inscription libre), Coupe Anubis (inscription solo, équipes tirées au sort, médailles), tournoi de fin de saison
 * (qualification par le classement). Inscription, check-in, tableau en direct (petite finale comprise), podium. Public.
 */
export default function TournamentPage() {
  const router = useRouter();
  const cupId = typeof router.query.id === "string" ? router.query.id : null;
  // Sans paramètre : liste des coupes (même rendu côté serveur et au premier rendu du navigateur).
  const listView = !cupId && !router.query.coupe;
  const asked = router.query.coupe === "saison" || router.query.coupe === "anubis" || router.query.coupe === "playin" ? router.query.coupe : "horus";
  const tab = (coupe) => router.replace({ pathname: router.pathname, query: coupe ? { coupe } : {} }, undefined, { shallow: true });
  const { userId } = useSession();
  const [tournament, setTournament] = useState(undefined);
  const [cups, setCups] = useState(null);
  const [error, setError] = useState(null);
  // Type de la coupe affichée : celui de la coupe ouverte par ?id=, sinon celui demandé.
  const kind = cupId && tournament ? tournament.kind : asked;
  const playin = kind === "playin";
  const horus = kind === "horus";
  const anubis = kind === "anubis";
  const [now, setNow] = useState(Date.now());
  const [view, setView] = useState(null);

  const load = useCallback(async () => {
    if (!router.isReady) return;
    try {
      if (listView) setCups(await api("/teams/cups"));
      else if (cupId) setTournament(await api(`/teams/tournaments/${cupId}`));
      else setTournament((await api(`/teams/tournament?kind=${asked}`)).tournament);
      setError(null);
    } catch (caught) {
      setError(caught.message);
    }
  }, [router.isReady, listView, cupId, asked]);

  // Changement d'onglet ou de coupe : on repart d'un chargement.
  useEffect(() => setTournament(undefined), [asked, cupId, listView]);
  useEffect(() => setView(null), [tournament?.id]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [load, userId]);

  // Temps réel : tableau et matchs du tournoi.
  const tournamentId = tournament?.id;
  useEffect(() => {
    if (!tournamentId) return undefined;
    const channel = supabase
      .channel(`tournament-${tournamentId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_bracket", filter: `tournament_id=eq.${tournamentId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "team_matches", filter: `tournament_id=eq.${tournamentId}` }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, load]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const scheduled = tournament?.status === "scheduled";
  // Check-in : de 2 h à 15 min avant le début ; à la fermeture, tirage dévoilé, premiers matchs à l'heure du début.
  const closesAt = tournament?.checkInClosesAt ?? tournament?.startsAt;
  const checkInOpen = scheduled && now >= new Date(tournament.checkInOpensAt).getTime() && now < new Date(closesAt).getTime();
  const drawnWaiting = tournament?.status === "running" && now < new Date(tournament.startsAt).getTime();
  const currentView = view ?? (scheduled ? "infos" : "tableau");

  return (
    <>
      <Head>
        <title>{listView ? "Tournois — SixSence" : tournament ? `${tournament.name} — SixSence` : horus ? "Coupe Horus — SixSence" : anubis ? "Coupe Anubis — SixSence" : "Tournoi — SixSence"}</title>
        <meta
          name="description"
          content={
            horus
              ? "Coupe Horus de SixSence : coupes d'équipe ouvertes à l'inscription, trophées or, argent, bronze et points de Division."
              : anubis
                ? "Coupe Anubis de SixSence : inscris-toi seul, les équipes sont tirées au sort. Médailles or, argent et bronze."
                : "Tournoi de fin de saison de SixSence : les meilleures équipes s'affrontent en BO3, finale en BO5."
          }
        />
      </Head>
      <PageHeader
        image="/images/mw4.webp"
        eyebrow={listView ? "Coupes et tournois" : horus ? "Tournoi · Coupe Horus" : anubis ? "Tournoi · Coupe Anubis" : playin ? "Tournoi · Play-in de la grande finale" : "Tournoi · Fin de saison"}
        title={
          listView || tournament ? (
            <>
              Les <span className="text-gold-gradient">tournois</span>
            </>
          ) : horus ? (
            <>
              Coupe <span className="text-gold-gradient">Horus</span>
            </>
          ) : anubis ? (
            <>
              Coupe <span className="text-gold-gradient">Anubis</span>
            </>
          ) : playin ? (
            <>
              Play-<span className="text-gold-gradient">in</span>
            </>
          ) : (
            <>
              Tournoi <span className="text-gold-gradient">final</span>
            </>
          )
        }
        description={
          listView || tournament
            ? "Coupes Horus en équipe, Coupes Anubis en solo et tournoi de fin de saison : inscris-toi, fais le check-in et vise le podium."
            : tournament?.kind === "anubis"
            ? `Inscription solo · équipes de ${tournament.teamSize} tirées au sort · ${tournament.status === "completed" ? "terminée" : dateFr(tournament.startsAt)}`
            : tournament
            ? `${tournament.teams.length} équipe${tournament.teams.length > 1 ? "s" : ""} · BO${tournament.bestOf}, finale en BO${tournament.finalBestOf} · ${tournament.status === "completed" ? "terminé" : dateFr(tournament.startsAt)}`
            : horus
              ? "Les coupes d'équipe ouvertes à tous : inscris ton équipe, gagne un trophée et des points de Division."
              : anubis
                ? "La coupe en solo : inscris-toi seul, le site forme les équipes au hasard. Médailles or, argent et bronze."
                : `Les meilleures équipes du classement (${TEAM_LIMITS.qualifyMatches} matchs minimum) s'affrontent à la fin de la saison.`
        }
        actions={
          <ButtonLink href="/cod/equipes" variant="outline">
            Classement de la Division
          </ButtonLink>
        }
      />
      <Container className="space-y-10 py-12">
        <div role="tablist" aria-label="Tournois" className="flex gap-2 overflow-x-auto pb-1">
          <SlantTab active={listView} onClick={() => tab(null)}>
            Toutes les coupes
          </SlantTab>
          <SlantTab active={!listView && horus && !cupId} onClick={() => tab("horus")}>
            Coupe Horus
          </SlantTab>
          <SlantTab active={!listView && anubis && !cupId} onClick={() => tab("anubis")}>
            Coupe Anubis
          </SlantTab>
          <SlantTab active={!listView && kind === "saison" && !cupId} onClick={() => tab("saison")}>
            Fin de saison
          </SlantTab>
          {playin ? <SlantTab active>Play-in</SlantTab> : null}
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
        {listView ? cups ? <CupList cups={cups} now={now} /> : !error ? <Loading /> : null : null}
        {!listView && tournament === undefined && !error ? <Loading /> : null}
        {!listView && tournament === null ? anubis ? <AnubisTeaser /> : horus ? <HorusTeaser /> : <TournamentTeaser /> : null}
        {!listView && tournament ? <CupHero tournament={tournament} now={now} /> : null}

        {!listView && tournament?.kind === "anubis" ? (
          <AnubisCup
            tournament={tournament}
            userId={userId}
            now={now}
            countdown={(target) => countdown(target, now)}
            onDone={load}
            bracket={<Bracket tournament={tournament} myTeamId={tournament.viewer?.teamId} />}
          />
        ) : null}

        {!listView && tournament && tournament.kind !== "anubis" ? (
          <>
            <div role="tablist" aria-label="Fiche du tournoi" className="flex gap-1 overflow-x-auto border-b border-white/10">
              {VIEWS.filter(([id]) => id !== "recompenses" || tournament.kind !== "playin").map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={currentView === id}
                  onClick={() => setView(id)}
                  className={cn(
                    "-mb-px shrink-0 border-b-2 px-4 py-3 font-display text-sm font-black uppercase tracking-[0.14em] transition-colors",
                    currentView === id ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {currentView === "infos" ? (
              <>
                {tournament.status === "completed" && tournament.winner && tournament.kind === "horus" ? (
                  <ol className="grid gap-3 sm:grid-cols-3">
                    {PODIUM.map(([key, label, medal]) =>
                      tournament[key] ? (
                        <li key={key}>
                          <TacticalCard highlight={key === "winner"} cut={20} innerClassName={cn("flex items-center gap-4 p-5", key === "winner" && "holo")}>
                            <span aria-hidden className="text-3xl">
                              {medal}
                            </span>
                            <TeamCrest team={tournament[key]} size={52} />
                            <div className="min-w-0">
                              <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">{label}</p>
                              <Link href={`/cod/equipes/${tournament[key].id}`} className="block truncate font-display text-2xl font-black uppercase leading-none hover:text-gold">
                                {tournament[key].name}
                              </Link>
                            </div>
                          </TacticalCard>
                        </li>
                      ) : null,
                    )}
                  </ol>
                ) : null}
                {tournament.status === "completed" && tournament.winner && tournament.kind !== "horus" ? (
                  <TacticalCard highlight cut={28} innerClassName="holo overflow-hidden p-6 sm:p-10">
                    <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-gold)_22%,transparent),transparent_65%)]" />
                    <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                      <TeamCrest team={tournament.winner} size={104} />
                      <div>
                        <p className="inline-flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-gold">
                          <LuTrophy aria-hidden className="h-4 w-4" />
                          {tournament.kind === "playin" ? "Qualifiée pour la grande finale" : "Vainqueur"}
                        </p>
                        <Link href={`/cod/equipes/${tournament.winner.id}`} className="mt-2 block font-display text-5xl font-black uppercase leading-[0.9] hover:text-gold sm:text-6xl">
                          {tournament.winner.name}
                        </Link>
                        {tournament.finalist ? <p className="mt-2 text-sm text-white/55">{tournament.kind === "playin" ? "Qualifiée aussi" : "Finaliste"} : {tournament.finalist.name}</p> : null}
                      </div>
                    </div>
                  </TacticalCard>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {[
                    tournament.minTeams ? [LuListOrdered, `Min. ${tournament.minTeams} équipes`] : null,
                    [LuDices, tournament.kind === "horus" ? "Tirage aléatoire" : "Têtes de série au classement"],
                    tournament.kind === "horus" ? [LuFlag, "Compte au circuit"] : null,
                  ]
                    .filter(Boolean)
                    .map(([Icon, label]) => (
                      <span key={label} className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-3 py-1.5 font-tech text-[11px] uppercase tracking-[0.14em] text-gold">
                        <Icon aria-hidden className="h-3.5 w-3.5" />
                        {label}
                      </span>
                    ))}
                </div>
                {scheduled ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatTile label={checkInOpen ? "Tirage dans" : "Check-in dans"} value={countdown(checkInOpen ? closesAt : tournament.checkInOpensAt, now)} accent />
                    <StatTile label={tournament.kind === "horus" ? "Inscrites" : "Équipes"} value={tournament.kind === "horus" ? `${tournament.teams.length} / ${tournament.size}` : tournament.teams.length} />
                    <StatTile label="Check-in" value={`${tournament.teams.filter((team) => team.checkedIn).length} / ${tournament.teams.length}`} />
                    <StatTile
                      label="Format"
                      value={`BO${tournament.bestOf}`}
                      hint={`Finale en BO${tournament.finalBestOf}${tournament.bracket === "double" ? " · double élimination" : tournament.kind === "horus" ? " · petite finale" : ""}`}
                    />
                  </div>
                ) : null}
                {drawnWaiting ? <Notice>Tirage effectué : premiers matchs dans {countdown(tournament.startsAt, now)}. Rejoins ton équipe et prépare la partie.</Notice> : null}
                {tournament.status === "running" && !drawnWaiting ? <Notice>Le tournoi est en cours : le tableau se met à jour après chaque match.</Notice> : null}
                {tournament.status === "cancelled" ? <Notice tone="error">{tournament.kind === "horus" ? "Cette coupe a été annulée (pas assez d'équipes présentes)." : "Ce tournoi a été annulé."}</Notice> : null}

                {tournament.kind === "horus" && scheduled ? <RegistrationPanel tournament={tournament} userId={userId} onDone={load} /> : null}
                {tournament.viewer?.registered !== false && tournament.viewer ? <CheckInPanel tournament={tournament} open={checkInOpen} onDone={load} /> : null}
                <HowItWorks tournament={tournament} />
              </>
            ) : null}

            {currentView === "tableau" ? <Bracket tournament={tournament} myTeamId={tournament.viewer?.teamId} /> : null}
            {currentView === "equipes" ? (
                <section aria-labelledby="titre-qualifies">
                  <h2 id="titre-qualifies" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
                    {tournament.kind === "horus" ? "Équipes inscrites" : "Qualifiés"}
                  </h2>
                  {tournament.teams.length === 0 ? <p className="mt-4 text-sm text-white/50">Aucune équipe inscrite pour l&apos;instant.</p> : null}
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {tournament.teams.map((team) => (
                      <li key={team.id}>
                        <Link href={`/cod/equipes/${team.id}`} className={cn("flex items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.06]", team.forfeit ? "border-loss/60 opacity-60" : "border-white/10")}>
                          {tournament.kind !== "horus" || !scheduled ? <span className="w-6 font-tech text-xs text-white/45">#{team.seed}</span> : null}
                          <TeamCrest team={team} size={32} />
                          <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase leading-none">{team.name}</span>
                          {team.reserve ? <Chip>Remplaçante</Chip> : null}
                          {team.forfeit ? (
                            <Chip tone="loss">Forfait</Chip>
                          ) : team.bench ? (
                            <Chip tone="neutral">Non retenue</Chip>
                          ) : scheduled ? (
                            <Chip tone={team.checkedIn ? "win" : "neutral"}>{team.checkedIn ? "Prête" : "En attente"}</Chip>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
            ) : null}
            {currentView === "recompenses" ? <Rewards tournament={tournament} /> : null}
            {currentView === "regles" ? (
              <section aria-labelledby="titre-regles-tournoi" className="space-y-4">
                <h2 id="titre-regles-tournoi" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
                  Règles
                </h2>
                <p className="text-sm text-white/60">
                  {tournament.kind === "horus"
                    ? `Matchs en BO${tournament.bestOf}, finale en BO${tournament.finalBestOf}${tournament.bracket === "double" ? ", double élimination" : ", petite finale pour le bronze"}. Hôte tiré au sort, code de la partie dans le tchat de la feuille de match. Pas d'annulation : un match bloqué est tranché par l'équipe SixSence.`
                    : `Matchs en BO${tournament.bestOf}, finale en BO${tournament.finalBestOf}. Effectifs figés à la qualification, check-in d'un joueur de l'équipe. Pas de points en jeu ; un match bloqué est tranché par l'équipe SixSence.`}{" "}
                  <Link href="/reglement" className="text-gold underline underline-offset-4">
                    Règlement complet
                  </Link>
                </p>
                <MatchRulesCard bestOf={tournament.bestOf} />
              </section>
            ) : null}
          </>
        ) : null}
      </Container>
    </>
  );
}

/** Coupe Horus : inscription ou désinscription de son équipe (un Leader), jusqu'au début. */
function RegistrationPanel({ tournament, userId, onDone }) {
  const viewer = tournament.viewer;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const full = tournament.teams.length >= tournament.size;

  async function run(method) {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/tournaments/${tournament.id}/register`, { method });
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  let content;
  if (!userId) content = <p className="text-sm text-white/55">Connecte-toi avec Discord pour inscrire ton équipe.</p>;
  else if (!viewer)
    content = (
      <p className="text-sm text-white/55">
        Il faut une équipe pour participer.{" "}
        <Link href="/cod/equipes/creer" className="font-semibold text-gold underline underline-offset-4">
          Crée la tienne
        </Link>{" "}
        ou rejoins-en une.
      </p>
    );
  else if (viewer.registered)
    content = (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/65">
          {viewer.reserveRank
            ? `Ton équipe est remplaçante n°${viewer.reserveRank} : elle prend la place d'une équipe titulaire qui ne fait pas son check-in. Faites quand même le check-in (2 h à 15 min avant le début).`
            : "Ton équipe est inscrite. Le check-in est ouvert de 2 h à 15 min avant le début."}
        </p>
        {viewer.canUnregister ? (
          <Button variant="outline" size="sm" disabled={pending} onClick={() => run("DELETE")}>
            <LuUserMinus aria-hidden className="h-4 w-4" />
            Désinscrire
          </Button>
        ) : null}
      </div>
    );
  else if (viewer.canRegister)
    content = (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/65">
          {viewer.asReserve
            ? "Coupe complète : inscris ton équipe comme remplaçante. Elle jouera si une équipe titulaire ne fait pas son check-in (dans l'ordre d'inscription)."
            : `${tournament.size - tournament.teams.length} place${tournament.size - tournament.teams.length > 1 ? "s" : ""} libre${tournament.size - tournament.teams.length > 1 ? "s" : ""}.`}{" "}
          Il faut au moins {viewer.rosterSize} joueur{viewer.rosterSize > 1 ? "s" : ""} dans l&apos;équipe.
        </p>
        <Button disabled={pending} onClick={() => run("POST")}>
          {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuUserPlus aria-hidden className="h-5 w-5" />}
          {viewer.asReserve ? "Inscrire comme remplaçante" : "Inscrire mon équipe"}
        </Button>
      </div>
    );
  else content = <p className="text-sm text-white/55">{viewer.isLeader || tournament.teams.length >= tournament.size + (tournament.reserveSlots ?? 0) ? "La coupe est complète, places de remplaçant comprises." : full ? "Coupe complète : un Leader de ton équipe peut l'inscrire comme remplaçante." : "Un Leader de ton équipe peut l'inscrire."}</p>;

  return (
    <TacticalCard cut={20} innerClassName="space-y-3 p-6">
      <Eyebrow>Inscription</Eyebrow>
      {content}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </TacticalCard>
  );
}

function CheckInPanel({ tournament, open, onDone }) {
  const viewer = tournament.viewer;
  const [roster, setRoster] = useState(() => viewer.matchRoster ?? viewer.frozenRoster.slice(0, viewer.rosterSize).map((player) => player.id));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const toggle = (id) => setRoster((current) => (current.includes(id) ? current.filter((x) => x !== id) : current.length < viewer.rosterSize ? [...current, id] : current));

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/tournaments/${tournament.id}/checkin`, { method: "POST", body: { roster } });
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  if (tournament.status !== "scheduled") return null;
  return (
    <TacticalCard highlight cut={24} innerClassName="space-y-4 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>{tournament.kind === "horus" ? "Ton équipe est inscrite" : "Ton équipe est qualifiée"}</Eyebrow>
          <p className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">{viewer.checkedIn ? "Check-in validé" : "Check-in"}</p>
        </div>
        {viewer.checkedIn ? (
          <Chip tone="win">
            <LuCheck aria-hidden className="h-3 w-3" />
            Prête
          </Chip>
        ) : null}
      </div>
      {!open ? (
        <p className="text-sm text-white/55">Le check-in est ouvert de 2 h à 15 min avant le début. N&apos;importe quel joueur de l&apos;équipe peut le faire ; sans check-in à sa fermeture, ton équipe est déclarée forfait.</p>
      ) : viewer.canCheckIn ? (
        <>
          <p className="text-sm text-white/55">
            Choisis tes {viewer.rosterSize} joueurs parmi l&apos;effectif inscrit au tournoi ({roster.length} / {viewer.rosterSize}). Tu peux les changer jusqu&apos;au début.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {viewer.frozenRoster.map((player) => {
              const selected = roster.includes(player.id);
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggle(player.id)}
                    className={cn("flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition", selected ? "border-gold bg-gold/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]")}
                  >
                    <Avatar full src={player.avatarUrl} name={player.username} size={32} />
                    <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase leading-none">{player.username}</span>
                    {selected ? <Chip>Joue</Chip> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Button disabled={pending || roster.length !== viewer.rosterSize} onClick={submit}>
            {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuCheck aria-hidden className="h-5 w-5" />}
            {viewer.checkedIn ? "Mettre à jour les joueurs" : "Valider le check-in"}
          </Button>
        </>
      ) : (
        <p className="text-sm text-white/55">{viewer.checkedIn ? "Le check-in est validé : soyez prêts à l'heure." : "Le check-in est fermé."}</p>
      )}
    </TacticalCard>
  );
}

/** Tableau du tournoi : gagnants, perdants, grande finale et champion d'un seul tenant (components/tournament/BracketBoard). */
function Bracket({ tournament, myTeamId }) {
  return (
    <section aria-label="Tableau du tournoi">
      <BracketBoard tournament={tournament} myTeamId={myTeamId} />
    </section>
  );
}

/** Aucun tournoi prévu : tableau en filigrane (8 → 4 → 2 → 1) et accès à la Division pour se préparer. */
/** Ce que rapporte chaque place : points de Division et de circuit (Coupe Horus, d'après le serveur), trophées. */
function Rewards({ tournament }) {
  const r = tournament.rewards;
  if (!r) {
    return (
      <section className="space-y-3">
        <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Ce que rapporte le tournoi</p>
        <ul className="space-y-2 text-sm text-white/65">
          <li className="flex items-center gap-2"><LuTrophy aria-hidden className="h-4 w-4 text-[#d4af37]" /> Vainqueur : trophée dans la vitrine et rôle Discord « Vainqueur — {tournament.name} ».</li>
          <li className="flex items-center gap-2"><LuTrophy aria-hidden className="h-4 w-4 text-[#c0c7d0]" /> Finaliste : trophée dans la vitrine.</li>
          <li className="flex items-center gap-2"><LuShield aria-hidden className="h-4 w-4 text-white/40" /> Pas de points de Division en jeu ; +500 XP par match gagné, +150 XP par match perdu.</li>
        </ul>
      </section>
    );
  }
  const rows = [
    ["1re place", "#d4af37", "Coupe Horus or", "winner"],
    ["2e place", "#c0c7d0", "Coupe Horus argent", "finalist"],
    ["3e place", "#c97b4b", "Coupe Horus bronze", "third"],
    ["Autres présentes", null, "check-in fait", "present"],
  ];
  return (
    <section aria-labelledby="titre-recompenses">
      <p id="titre-recompenses" className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">
        Ce que rapporte chaque place
      </p>
      <div className="mt-3 overflow-hidden border border-white/10">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-white/[0.04] px-4 py-2 font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">
          <span>Place</span>
          <span className="text-right">Division</span>
          <Link href="/cod/circuit" className="text-right hover:text-gold">Circuit</Link>
        </div>
        {rows.map(([place, color, sub, key]) => (
          <div key={key} className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-t border-white/5 px-4 py-3">
            <span className="flex items-center gap-2.5">
              {color ? <LuTrophy aria-hidden className="h-5 w-5 shrink-0" style={{ color }} /> : <LuShield aria-hidden className="h-5 w-5 shrink-0 text-white/30" />}
              <span className="min-w-0">
                <span className="block font-semibold">{place}</span>
                <span className="block text-[11px] text-white/45">{color ? `${sub} : vitrine de l'équipe et profil des joueurs` : sub}</span>
              </span>
            </span>
            <span className="text-right font-display text-xl font-black text-[#22d3ee]">+{r.division[key]}</span>
            <span className="text-right font-display text-xl font-black text-gold">+{r.circuit[key]}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/50">
        Et pour chaque joueur du match : <span className="text-white/75">+{r.xp.win} XP par match gagné, +{r.xp.loss} XP par match perdu</span>. Le vainqueur reçoit le rôle Discord « Vainqueur — Coupe Horus »
        jusqu&apos;à la coupe suivante.
      </p>
    </section>
  );
}

/** Déroulé d'une coupe ou du tournoi de saison, en 5 étapes. */
function HowItWorks({ tournament }) {
  const horus = tournament.kind === "horus";
  const steps = [
    [
      LuUsers,
      horus ? "Inscription" : "Qualification",
      horus
        ? "Un Leader inscrit l'équipe, jusqu'à la fermeture du check-in."
        : tournament.kind === "playin"
          ? "7e et 8e du circuit contre les 2 meilleures équipes de la Division, effectifs figés."
          : "Les meilleures équipes (circuit, puis Division) sont qualifiées, effectifs figés.",
    ],
    [LuCheck, "Check-in", "De 2 h à 15 min avant : un joueur de l'équipe confirme sa présence et choisit les joueurs du match."],
    [LuDices, "Tirage", horus ? "15 min avant : tableau tiré au sort parmi les présentes, dévoilé à tous." : "15 min avant : tableau dévoilé, équipes absentes forfait."],
    [LuSwords, "Matchs", `BO${tournament.bestOf}, finale en BO${tournament.finalBestOf}${horus && tournament.bracket !== "double" ? ", petite finale pour le bronze" : ""}. Hôte tiré au sort.`],
    [
      LuTrophy,
      tournament.kind === "playin" ? "Grande finale" : "Podium",
      horus ? "Trophées, points de Division et de circuit, rôle Discord du vainqueur." : tournament.kind === "playin" ? "Les 2 vainqueurs prennent les dernières places de la grande finale." : "Trophées et rôle Discord du vainqueur.",
    ],
  ];
  return (
    <TacticalCard cut={18} innerClassName="p-5 sm:p-6">
      <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Comment ça marche</p>
      <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map(([Icon, title, text], index) => (
          <li key={title} className="flex gap-3 lg:flex-col">
            <span className="grid h-9 w-9 shrink-0 place-items-center border border-gold/40 bg-gold/10 text-gold">
              <Icon aria-hidden className="h-4 w-4" />
            </span>
            <div>
              <p className="font-display text-lg font-black uppercase leading-none">
                <span className="text-white/35">{index + 1}.</span> {title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </TacticalCard>
  );
}

function TournamentTeaser({ horus = false }) {
  const rounds = [8, 4, 2, 1];
  return (
    <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden p-6 sm:p-10">
      <div aria-hidden className="pointer-events-none absolute inset-y-6 right-6 hidden w-[40%] grid-cols-4 gap-4 opacity-40 lg:grid">
        {rounds.map((count, round) => (
          <div key={count} className="flex flex-col justify-around">
            {Array.from({ length: count }, (_, index) => (
              <span key={index} className={cn("block h-6 border", round === rounds.length - 1 ? "border-gold bg-gold/15" : "border-white/15 bg-white/[0.03]")} />
            ))}
          </div>
        ))}
      </div>
      <div className="relative max-w-lg">
        <LuTrophy aria-hidden className="h-10 w-10 text-gold" />
        <p className="mt-5 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
          {horus ? "Aucune coupe" : "Aucun tournoi"} <span className="text-gold-gradient">prévu{horus ? "e" : ""}</span>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          {horus
            ? "La prochaine Coupe Horus sera annoncée ici et sur Discord : inscription de ton équipe, check-in, tableau en direct et trophées or, argent, bronze. En attendant, fais grimper ton équipe en Division."
            : "Le tournoi de fin de saison sera annoncé ici : tableau en direct, check-in des équipes et finale en BO5. En attendant, fais grimper ton équipe en Division."}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/cod/division" size="lg">
            File Division
          </ButtonLink>
          <ButtonLink href="/cod/equipes" size="lg" variant="outline">
            Classement des équipes
          </ButtonLink>
        </div>
      </div>
    </TacticalCard>
  );
}
