import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuCheck, LuCrown, LuLoaderCircle, LuTrophy } from "react-icons/lu";
import { TeamCrest } from "../../components/teams/TeamParts";
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

/** Tournoi de fin de saison (section à part, équipes de la Division) : check-in, tableau en direct, vainqueur. Public. */
export default function TournamentPage() {
  const { userId } = useSession();
  const [tournament, setTournament] = useState(undefined);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    try {
      setTournament((await api("/teams/tournament")).tournament);
      setError(null);
    } catch (caught) {
      setError(caught.message);
    }
  }, []);

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
  const checkInOpen = scheduled && now >= new Date(tournament.checkInOpensAt).getTime();

  return (
    <>
      <Head>
        <title>{tournament ? `${tournament.name} — SixSence` : "Tournoi — SixSence"}</title>
        <meta name="description" content="Tournoi de fin de saison de SixSence : les meilleures équipes s'affrontent en BO3, finale en BO5." />
      </Head>
      <PageHeader
        image="/images/mw4.webp"
        eyebrow="Tournoi · Fin de saison"
        title={
          tournament ? (
            tournament.name
          ) : (
            <>
              Tournoi <span className="text-gold-gradient">final</span>
            </>
          )
        }
        description={
          tournament
            ? `${tournament.teams.length} équipes · BO3, finale en BO5 · ${tournament.status === "completed" ? "terminé" : dateFr(tournament.startsAt)}`
            : `Les meilleures équipes du classement (${TEAM_LIMITS.qualifyMatches} matchs minimum) s'affrontent à la fin de la saison.`
        }
        actions={
          <ButtonLink href="/cod/equipes" variant="outline">
            Classement de la Division
          </ButtonLink>
        }
      />
      <Container className="space-y-10 py-12">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {tournament === undefined && !error ? <Loading /> : null}
        {tournament === null ? (
          <TournamentTeaser />
        ) : null}

        {tournament ? (
          <>
            {tournament.status === "completed" && tournament.winner ? (
              <TacticalCard highlight cut={28} innerClassName="holo overflow-hidden p-6 sm:p-10">
                <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_srgb,var(--color-gold)_22%,transparent),transparent_65%)]" />
                <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  <TeamCrest team={tournament.winner} size={104} />
                  <div>
                    <p className="inline-flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-gold">
                      <LuTrophy aria-hidden className="h-4 w-4" />
                      Vainqueur
                    </p>
                    <Link href={`/cod/equipes/${tournament.winner.id}`} className="mt-2 block font-display text-5xl font-black uppercase leading-[0.9] hover:text-gold sm:text-6xl">
                      {tournament.winner.name}
                    </Link>
                    {tournament.finalist ? <p className="mt-2 text-sm text-white/55">Finaliste : {tournament.finalist.name}</p> : null}
                  </div>
                </div>
              </TacticalCard>
            ) : null}

            {scheduled ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label={checkInOpen ? "Début dans" : "Check-in dans"} value={countdown(checkInOpen ? tournament.startsAt : tournament.checkInOpensAt, now)} accent />
                <StatTile label="Équipes" value={tournament.teams.length} />
                <StatTile label="Check-in" value={`${tournament.teams.filter((team) => team.checkedIn).length} / ${tournament.teams.length}`} />
                <StatTile label="Format" value="BO3" hint="Finale en BO5" />
              </div>
            ) : null}
            {tournament.status === "running" ? <Notice>Le tournoi est en cours : le tableau se met à jour après chaque match.</Notice> : null}
            {tournament.status === "cancelled" ? <Notice tone="error">Ce tournoi a été annulé.</Notice> : null}

            {tournament.viewer ? <CheckInPanel tournament={tournament} open={checkInOpen} onDone={load} /> : null}

            <Bracket tournament={tournament} myTeamId={tournament.viewer?.teamId} />

            <section aria-labelledby="titre-qualifies">
              <h2 id="titre-qualifies" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
                Qualifiés
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {tournament.teams.map((team) => (
                  <li key={team.id}>
                    <Link href={`/cod/equipes/${team.id}`} className={cn("flex items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-2.5 hover:bg-white/[0.06]", team.forfeit ? "border-loss/60 opacity-60" : "border-white/10")}>
                      <span className="w-6 font-tech text-xs text-white/45">#{team.seed}</span>
                      <TeamCrest team={team} size={32} />
                      <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase leading-none">{team.name}</span>
                      {team.forfeit ? <Chip tone="loss">Forfait</Chip> : scheduled ? <Chip tone={team.checkedIn ? "win" : "neutral"}>{team.checkedIn ? "Prête" : "En attente"}</Chip> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
      </Container>
    </>
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
          <Eyebrow>Ton équipe est qualifiée</Eyebrow>
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
        <p className="text-sm text-white/55">Le check-in ouvre 30 min avant le début. Sans check-in d&apos;un Leader à l&apos;heure du début, ton équipe est déclarée forfait.</p>
      ) : viewer.isLeader ? (
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
        <p className="text-sm text-white/55">{viewer.checkedIn ? "Un Leader a validé le check-in : soyez prêts à l'heure." : "Un Leader de ton équipe doit faire le check-in."}</p>
      )}
    </TacticalCard>
  );
}

function Bracket({ tournament, myTeamId }) {
  return (
    <section aria-labelledby="titre-tableau">
      <h2 id="titre-tableau" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
        Tableau
      </h2>
      <div className="mt-6 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-6">
          {tournament.rounds.map((round) => (
            <div key={round.round} className="flex w-64 flex-col">
              <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">
                {round.name} · BO{round.bestOf}
              </p>
              <ul className="mt-3 flex flex-1 flex-col justify-around gap-3">
                {round.entries.map((entry) => (
                  <li key={entry.slot}>
                    <BracketEntry entry={entry} myTeamId={myTeamId} final={round.round === tournament.rounds.length} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BracketEntry({ entry, myTeamId, final }) {
  const row = (team, index) => {
    const won = entry.winner && team && entry.winner === team.id;
    const lost = entry.status === "done" && team && !won;
    return (
      <div className={cn("flex items-center gap-2.5 px-3 py-2", index === 0 && "border-b border-white/8", lost && "opacity-45", team?.id === myTeamId && "bg-gold/8")}>
        {team ? <TeamCrest team={team} size={26} /> : <span className="h-[26px] w-[26px] shrink-0 border border-dashed border-white/15" />}
        <span className={cn("min-w-0 flex-1 truncate font-display text-base font-bold uppercase leading-none", !team && "text-white/30")}>
          {team ? team.name : entry.status === "done" || entry.status === "empty" ? "—" : "À déterminer"}
        </span>
        {team?.seed ? <span className="font-tech text-[10px] text-white/35">#{team.seed}</span> : null}
        {entry.score ? <span className={cn("w-4 text-right font-tech text-sm font-bold", won ? "text-gold" : "text-white/55")}>{entry.score[index]}</span> : null}
        {won && final ? <LuCrown aria-label="Vainqueur" className="h-4 w-4 text-gold" /> : null}
      </div>
    );
  };
  const body = (
    <TacticalCard cut={12} highlight={entry.status === "playing"} interactive={Boolean(entry.matchId)} innerClassName="overflow-hidden">
      {row(entry.teamA, 0)}
      {row(entry.teamB, 1)}
      {entry.status === "playing" ? <p className="bg-gold/10 px-3 py-1 font-tech text-[9px] uppercase tracking-[0.24em] text-gold">En cours</p> : null}
      {entry.status === "blocked" ? <p className="bg-loss/10 px-3 py-1 font-tech text-[9px] uppercase tracking-[0.24em] text-loss">Décision de l&apos;équipe SixSence</p> : null}
    </TacticalCard>
  );
  return entry.matchId ? (
    <Link href={`/cod/equipes/match/${entry.matchId}`} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Aucun tournoi prévu : tableau en filigrane (8 → 4 → 2 → 1) et accès à la Division pour se préparer. */
function TournamentTeaser() {
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
          Aucun tournoi <span className="text-gold-gradient">prévu</span>
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          Le tournoi de fin de saison sera annoncé ici : tableau en direct, check-in des équipes et finale en BO5. En attendant, fais grimper ton équipe en
          Division.
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
