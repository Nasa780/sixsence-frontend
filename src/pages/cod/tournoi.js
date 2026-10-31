import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuTrophy } from "react-icons/lu";
import { AnubisTeaser, HorusTeaser } from "../../components/tournament/AnubisCup";
import { CupList, CupTabs } from "../../components/tournament/CupCards";
import { CupFiche } from "../../components/tournament/CupFiche";
import { ButtonLink } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { Loading, Notice } from "../../components/ui/Feedback";
import { TacticalCard } from "../../components/ui/TacticalCard";
import { PageHeader } from "../../components/ui/Typography";
import useSession from "../../hooks/useSession";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/cn";
import { TEAM_LIMITS } from "../../lib/teams";

const dateFr = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/**
 * Tournois : sans paramètre, la liste des coupes (prochaines et passées, avec leur affiche) ; ?id= la fiche d'une
 * coupe ; ?coupe=horus|anubis|saison|playin la coupe du moment de ce type. Coupe Horus (équipes, inscription libre),
 * Coupe Anubis (inscription solo, équipes tirées au sort, médailles), tournoi de fin de saison (qualification). La
 * fiche (components/tournament/CupFiche) est commune à tous : en-tête, podium, phases, inscription, tableau en direct,
 * participants, récompenses, règles. Public.
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

  const load = useCallback(async () => {
    if (!router.isReady) return;
    try {
      // Liste des coupes : page « Toutes les coupes » et prochaines dates des onglets.
      const list = api("/teams/cups").then(setCups, () => null);
      if (listView) await list;
      else if (cupId) setTournament(await api(`/teams/tournaments/${cupId}`));
      else setTournament((await api(`/teams/tournament?kind=${asked}`)).tournament);
      setError(null);
    } catch (caught) {
      setError(caught.message);
    }
  }, [router.isReady, listView, cupId, asked]);

  // Changement d'onglet ou de coupe : on repart d'un chargement.
  useEffect(() => setTournament(undefined), [asked, cupId, listView]);

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
        <CupTabs active={listView ? null : kind} cups={cups} onChange={tab} extra={playin ? "Play-in" : null} />
        {error ? <Notice tone="error">{error}</Notice> : null}
        {listView ? cups ? <CupList cups={cups} now={now} /> : !error ? <Loading /> : null : null}
        {!listView && tournament === undefined && !error ? <Loading /> : null}
        {!listView && tournament === null ? anubis ? <AnubisTeaser /> : horus ? <HorusTeaser /> : <TournamentTeaser /> : null}
        {!listView && tournament ? <CupFiche tournament={tournament} userId={userId} now={now} onDone={load} cups={cups} /> : null}
      </Container>
    </>
  );
}

/** Aucun tournoi prévu : tableau en filigrane (8 → 4 → 2 → 1) et accès à la Division pour se préparer. */
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
