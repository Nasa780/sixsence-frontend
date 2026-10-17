import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuCheck, LuCrown, LuLoaderCircle, LuX } from "react-icons/lu";
import { RankEmblem } from "../../../../components/cod/RankEmblem";
import { TeamCrest, fieldClass, labelClass } from "../../../../components/teams/TeamParts";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { ConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import { Container } from "../../../../components/ui/Container";
import { Chip, EmptyState, Loading, Notice, StatTile } from "../../../../components/ui/Feedback";
import { TacticalCard } from "../../../../components/ui/TacticalCard";
import { Eyebrow } from "../../../../components/ui/Typography";
import useSession from "../../../../hooks/useSession";
import { api } from "../../../../lib/api";
import { cn } from "../../../../lib/cn";
import { rankFor, rankGradient } from "../../../../lib/ranks";

const ROUNDS = 6;
const mapsWon = (scores, side) => scores.filter(([a, b]) => (side === "A" ? a > b : b > a)).length;

/** Feuille d'un match d'équipe (BO3) : maps, scores, map 3, déclaration et confirmation par les Leaders. Public. */
export default function TeamMatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const { userId } = useSession();
  const [match, setMatch] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setMatch(await api(`/teams/matches/${id}`));
      setError(null);
    } catch (caught) {
      setError(caught.message);
    }
  }, [id]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load, userId]);

  if (error && !match) {
    return (
      <Container className="pb-16 pt-32">
        <EmptyState title="Match introuvable">{error}</EmptyState>
      </Container>
    );
  }
  if (!match) return <Loading />;

  const name = (side) => (side === "A" ? match.teamA : match.teamB)?.name ?? `Équipe ${side === "A" ? 1 : 2}`;
  const open = ["in_progress", "awaiting_confirmation", "disputed"].includes(match.status);
  const scoreA = mapsWon(match.scores, "A");
  const scoreB = mapsWon(match.scores, "B");

  return (
    <>
      <Head>
        <title>{`[${match.teamA?.tag}] vs [${match.teamB?.tag}] — Match team — SixSence`}</title>
      </Head>
      <Container className="space-y-8 pb-16 pt-28 sm:pt-32">
        <div>
          <Eyebrow>Match team · BO3 · {match.mode}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">Feuille de match</h1>
        </div>

        <TacticalCard highlight cut={24} innerClassName="p-5 sm:p-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
            <TeamSide team={match.teamA} side="A" winner={match.winner} change={match.pointsChanges?.A} />
            <div className="text-center">
              <p className="font-display text-5xl font-black leading-none tabular-nums sm:text-6xl">
                <span className={cn(match.winner === "A" && "text-gold")}>{scoreA}</span> <span className="text-white/30">–</span>{" "}
                <span className={cn(match.winner === "B" && "text-gold")}>{scoreB}</span>
              </p>
              <StatusChip match={match} />
            </div>
            <TeamSide team={match.teamB} side="B" winner={match.winner} change={match.pointsChanges?.B} right />
          </div>
        </TacticalCard>

        <MatchNotices match={match} name={name} />

        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <MapCard key={index} index={index} match={match} name={name} />
          ))}
        </div>

        {match.status === "in_progress" && match.scores.length === 2 && match.map3Picker ? <Map3Block match={match} name={name} onDone={load} /> : null}
        {match.viewer?.canReport ? <ReportForm key={match.scores.length} match={match} onDone={load} /> : null}
        {match.viewer?.canConfirm ? <ConfirmBlock match={match} name={name} onDone={load} /> : null}
        {match.viewer?.canResolve ? <ResolveForm match={match} onDone={load} /> : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Roster match={match} side="A" userId={userId} />
          <Roster match={match} side="B" userId={userId} />
        </div>

        {open ? (
          <TacticalCard innerClassName="p-6">
            <Eyebrow>Points en jeu</Eyebrow>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {["A", "B"].map((side) => (
                <StatTile
                  key={side}
                  label={name(side)}
                  value={
                    <>
                      <span className="text-win">+{match.stakes[side].win}</span> <span className="text-white/30">/</span> <span className="text-loss">−{match.stakes[side].loss}</span>
                    </>
                  }
                  hint={match.stakes[side].win > match.stakes[side].loss ? "Adversaire mieux classé : la victoire rapporte plus" : match.stakes[side].win < match.stakes[side].loss ? "Favori : la défaite coûte plus" : "Niveau égal"}
                />
              ))}
            </div>
          </TacticalCard>
        ) : null}

        <p>
          <Link href="/cod/equipes" className="text-sm font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
            Classement des équipes
          </Link>
        </p>
      </Container>
    </>
  );
}

function TeamSide({ team, side, winner, change, right = false }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-4", right && "flex-row-reverse text-right")}>
      <span className="hidden sm:inline-flex">
        <TeamCrest team={team} size={64} />
      </span>
      <div className="min-w-0">
        <Link href={`/cod/equipes/${team?.id}`} className={cn("block break-words font-display text-2xl font-black uppercase leading-none hover:text-gold sm:text-4xl", side === "A" && "text-gold")}>
          {team?.name}
        </Link>
        <p className="mt-1 font-tech text-xs uppercase tracking-[0.2em] text-white/45">
          [{team?.tag}]
          {winner === side ? <LuCrown aria-label="Vainqueur" className="ml-2 inline h-3.5 w-3.5 text-gold" /> : null}
        </p>
        {typeof change === "number" ? <p className={cn("mt-1 font-tech text-sm font-bold", change >= 0 ? "text-win" : "text-loss")}>{change >= 0 ? `+${change}` : change} pts</p> : null}
      </div>
    </div>
  );
}

function StatusChip({ match }) {
  if (match.status === "completed") return <Chip tone="win" className="mt-2">Terminé</Chip>;
  if (match.status === "cancelled") return <Chip tone="neutral" className="mt-2">Annulé</Chip>;
  if (match.status === "disputed") return <Chip tone="loss" className="mt-2">Contesté</Chip>;
  if (match.status === "awaiting_confirmation") return <Chip className="mt-2">Confirmation</Chip>;
  return <Chip className="mt-2">{match.scores.length === 2 ? "Map 3" : "En cours"}</Chip>;
}

function MatchNotices({ match, name }) {
  if (match.status === "completed") {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LuCrown aria-hidden className="h-7 w-7 text-gold" />
        <p className="font-display text-3xl font-black uppercase leading-none tracking-wide sm:text-4xl">
          Victoire de <span className="text-gold-gradient">{name(match.winner)}</span>
        </p>
      </div>
    );
  }
  if (match.status === "cancelled") {
    return <Notice>{match.cancelReason === "abandoned" ? "Match annulé : aucun résultat déclaré à temps. Aucun point n'a bougé." : "Match annulé par un arbitre : aucun point n'a bougé."}</Notice>;
  }
  if (match.status === "disputed") return <Notice tone="error">Les scores ont été contestés : un arbitre SixSence va trancher. Aucun point ne bouge d&apos;ici là.</Notice>;
  if (match.status === "awaiting_confirmation" && !match.viewer?.canConfirm) {
    return (
      <Notice>
        Scores déclarés par {name(match.reportedTeam)} : en attente de la confirmation d&apos;un Leader adverse (validés d&apos;office après {match.confirmMinutes} min).
      </Notice>
    );
  }
  return null;
}

function MapCard({ index, match, name }) {
  const map = match.maps[index];
  const confirmed = match.scores[index];
  const pendingIndex = index - match.scores.length;
  const pending = match.pendingScores && pendingIndex >= 0 ? match.pendingScores[pendingIndex] : null;
  const score = confirmed ?? pending;
  const decided = match.status === "completed" && index >= match.scores.length;
  const pick = map ? (map.pick === "random" ? "tirée au sort" : `choix ${name(map.pick)}`) : index === 2 ? "décisive" : "";

  return (
    <TacticalCard highlight={index === 2 && !map && !decided && match.scores.length === 2} innerClassName={cn("overflow-hidden p-5", decided && "opacity-50")}>
      {map ? <div aria-hidden className="absolute inset-0 bg-[url('/images/mw4.webp')] bg-cover bg-center opacity-15" /> : <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />}
      <div className="relative">
        <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
          Map {index + 1} · {pick}
        </p>
        <p className="mt-2 font-display text-3xl font-black uppercase leading-none">{map?.map ?? (decided ? "Non jouée" : "À venir")}</p>
        {score ? (
          <div className="mt-6 flex items-end justify-between font-display text-5xl font-black tabular-nums leading-none">
            <span className={score[0] > score[1] ? "text-gold" : "text-white/45"}>{score[0]}</span>
            <span className="pb-1 text-xs font-bold uppercase tracking-[0.2em] text-white/35">{confirmed ? "manches" : "déclaré"}</span>
            <span className={score[1] > score[0] ? "text-white" : "text-white/45"}>{score[1]}</span>
          </div>
        ) : (
          <p className="mt-6 text-sm text-white/40">{map ? "Score pas encore déclaré" : index === 2 ? (match.scores.length === 2 && !decided ? "Choix de la map en cours" : "Jouée seulement à 1 – 1") : ""}</p>
        )}
      </div>
    </TacticalCard>
  );
}

function Map3Block({ match, name, onDone }) {
  const [map, setMap] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [a, b] = match.scores.reduce(([x, y], [sa, sb]) => [x + sa, y + sb], [0, 0]);
  const picked = match.maps.length === 3;

  async function pick() {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/map3`, { method: "POST", body: { map } });
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <TacticalCard innerClassName="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>Qui choisit la map 3 ?</Eyebrow>
          <p className="mt-2 text-sm text-white/55">Total des manches gagnées sur les maps 1 et 2.</p>
        </div>
        <div className="flex min-w-[16rem] flex-1 items-center gap-3">
          <span className="font-display text-3xl font-black text-gold">{a}</span>
          <span className="flex h-2 flex-1 bg-white/10">
            <span className="h-full bg-gold" style={{ width: `${(a / Math.max(1, a + b)) * 100}%` }} />
            <span className="h-full bg-white/80" style={{ width: `${(b / Math.max(1, a + b)) * 100}%` }} />
          </span>
          <span className="font-display text-3xl font-black">{b}</span>
        </div>
      </div>
      <p className="font-display text-xl font-bold uppercase tracking-wide">
        {match.map3Picker === "random" ? (
          <>Égalité de manches : map 3 tirée au sort</>
        ) : (
          <>
            <span className="text-white">{name(match.map3Picker)}</span> <span className="text-white/60">{picked ? `a choisi ${match.maps[2].map}` : "choisit la map 3"}</span>
          </>
        )}
      </p>
      {match.viewer?.canPickMap3 ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <select className={fieldClass} value={map} onChange={(event) => setMap(event.target.value)} aria-label="Map 3">
            <option value="">Choisir la map…</option>
            {match.mapPool.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <Button disabled={!map || pending} onClick={pick} className="shrink-0">
            {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
            Valider la map
          </Button>
        </div>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </TacticalCard>
  );
}

/** Saisie d'un score de map : l'équipe gagnante (6 manches) et les manches du perdant (0 à 5). */
function MapScoreInput({ label, teamA, teamB, value, onChange }) {
  const winner = value ? (value[0] === ROUNDS ? "A" : "B") : null;
  const loserRounds = value ? Math.min(value[0], value[1]) : 0;
  const set = (nextWinner, rounds) => onChange(nextWinner === "A" ? [ROUNDS, rounds] : [rounds, ROUNDS]);
  return (
    <div className="border-l-2 border-white/10 bg-white/[0.03] p-4">
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        {[
          ["A", teamA],
          ["B", teamB],
        ].map(([side, team]) => (
          <button
            key={side}
            type="button"
            aria-pressed={winner === side}
            onClick={() => set(side, loserRounds)}
            className={cn(
              "clip-slant px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em] transition-colors",
              winner === side ? "bg-gold text-ink" : "bg-white/[0.06] text-white/70 hover:bg-white/10",
            )}
          >
            [{team?.tag}] gagne
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-white/60">
          Perdant
          <select className="border border-white/15 bg-ink-700 px-2.5 py-2 text-sm text-white" value={loserRounds} disabled={!winner} onChange={(event) => set(winner, Number(event.target.value))}>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          manche{loserRounds > 1 ? "s" : ""}
        </label>
      </div>
      {value ? (
        <p className="mt-2 font-tech text-xs tracking-[0.2em] text-white/45">
          [{teamA?.tag}] {value[0]} – {value[1]} [{teamB?.tag}]
        </p>
      ) : null}
    </div>
  );
}

function ReportForm({ match, onDone }) {
  const first = match.scores.length === 0;
  const [scores, setScores] = useState(first ? [null, null] : [null]);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/report`, { method: "POST", body: { scores } });
      setConfirming(false);
      await onDone();
    } catch (caught) {
      setError(caught.message);
      setConfirming(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <TacticalCard highlight innerClassName="space-y-4 p-6">
      <Eyebrow>{first ? "Déclarer les maps 1 et 2" : "Déclarer la map 3"}</Eyebrow>
      <div className={cn("grid gap-3", first && "md:grid-cols-2")}>
        {scores.map((value, i) => (
          <MapScoreInput
            key={i}
            label={match.maps[match.scores.length + i]?.map ?? `Map ${match.scores.length + i + 1}`}
            teamA={match.teamA}
            teamB={match.teamB}
            value={value}
            onChange={(next) => setScores((current) => current.map((v, j) => (j === i ? next : v)))}
          />
        ))}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-white/45">Un Leader adverse devra confirmer. Garde une capture du tableau des scores en cas de contestation.</p>
        <Button disabled={scores.some((v) => !v) || pending} onClick={() => setConfirming(true)}>
          Déclarer
        </Button>
      </div>
      <ConfirmDialog open={confirming} onClose={() => setConfirming(false)} title="Déclarer ces scores ?" confirmLabel="Déclarer" pending={pending} onConfirm={submit}>
        {scores.filter(Boolean).map((v, i) => (
          <p key={i}>
            {match.maps[match.scores.length + i]?.map} : [{match.teamA?.tag}] {v[0]} – {v[1]} [{match.teamB?.tag}]
          </p>
        ))}
      </ConfirmDialog>
    </TacticalCard>
  );
}

function ConfirmBlock({ match, name, onDone }) {
  const [ask, setAsk] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  async function answer(accept) {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/confirm`, { method: "POST", body: { accept } });
      setAsk(null);
      await onDone();
    } catch (caught) {
      setError(caught.message);
      setAsk(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <TacticalCard highlight innerClassName="space-y-4 p-6">
      <Eyebrow>Scores déclarés par {name(match.reportedTeam)}</Eyebrow>
      <ul className="space-y-1 font-display text-2xl font-black uppercase">
        {match.pendingScores.map((v, i) => (
          <li key={i}>
            <span className="text-white/55">{match.maps[match.scores.length + i]?.map} :</span> [{match.teamA?.tag}] {v[0]} – {v[1]} [{match.teamB?.tag}]
          </li>
        ))}
      </ul>
      <p className="text-sm text-white/55">Sans réponse de ta part, ils seront validés d&apos;office après {match.confirmMinutes} min.</p>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending} onClick={() => setAsk("accept")}>
          <LuCheck aria-hidden className="h-5 w-5" />
          Confirmer
        </Button>
        <Button variant="danger" disabled={pending} onClick={() => setAsk("refuse")}>
          <LuX aria-hidden className="h-5 w-5" />
          Contester
        </Button>
      </div>
      <ConfirmDialog
        open={Boolean(ask)}
        onClose={() => setAsk(null)}
        title={ask === "accept" ? "Confirmer ces scores ?" : "Contester ces scores ?"}
        confirmLabel={ask === "accept" ? "Confirmer" : "Contester"}
        tone={ask === "accept" ? "gold" : "danger"}
        pending={pending}
        onConfirm={() => answer(ask === "accept")}
      >
        {ask === "accept" ? "Les scores seront définitifs." : "Un arbitre SixSence tranchera : garde une capture du tableau des scores."}
      </ConfirmDialog>
    </TacticalCard>
  );
}

function ResolveForm({ match, onDone }) {
  const [scores, setScores] = useState(() => [0, 1, 2].map((i) => match.scores[i] ?? match.pendingScores?.[i - match.scores.length] ?? null));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const filled = scores.filter(Boolean);

  async function resolve(body) {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/resolve`, { method: "POST", body });
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <TacticalCard innerClassName="space-y-4 p-6">
      <Eyebrow>Arbitrage</Eyebrow>
      <p className="text-sm text-white/55">Saisis les scores définitifs de la série (la map 3 seulement si elle a été jouée), ou annule le match.</p>
      <div className="grid gap-3 md:grid-cols-3">
        {scores.map((value, i) => (
          <div key={i} className="space-y-2">
            <MapScoreInput label={match.maps[i]?.map ?? `Map ${i + 1}`} teamA={match.teamA} teamB={match.teamB} value={value} onChange={(next) => setScores((current) => current.map((v, j) => (j === i ? next : v)))} />
            {value && i === 2 ? (
              <button type="button" className="text-xs text-white/45 underline hover:text-loss" onClick={() => setScores((current) => [current[0], current[1], null])}>
                Map 3 non jouée
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending || filled.length < 2 || !scores[0] || !scores[1]} onClick={() => resolve({ scores: filled })}>
          Valider les scores
        </Button>
        <Button variant="danger" disabled={pending} onClick={() => resolve({ scores: null })}>
          Annuler le match
        </Button>
      </div>
    </TacticalCard>
  );
}

function Roster({ match, side, userId }) {
  const team = side === "A" ? match.teamA : match.teamB;
  const ids = side === "A" ? match.rosterA : match.rosterB;
  const byId = new Map(match.players.map((player) => [player.id, player]));
  const lost = match.status === "completed" && match.winner !== side;
  return (
    <section aria-label={team?.name} className={cn("transition-opacity", lost && "opacity-60")}>
      <header className={cn("flex items-end justify-between border-b-2 pb-3", side === "A" ? "border-gold" : "border-white/70")}>
        <h2 className={cn("font-display text-3xl font-black uppercase leading-none sm:text-4xl", side === "A" && "text-gold")}>{team?.name}</h2>
        {match.winner === side ? <Chip tone="win">Victoire</Chip> : <span className="font-tech text-xs uppercase tracking-[0.2em] text-white/45">{match.pointsBefore[side]} pts</span>}
      </header>
      <ul className="mt-3 space-y-2">
        {ids.map((id) => {
          const player = byId.get(id);
          const rank = rankFor(player?.points ?? 0);
          return (
            <li key={id} className={cn("flex items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-3", id === userId ? "border-gold bg-gold/8" : "border-white/10")}>
              <Avatar src={player?.avatarUrl} name={player?.username ?? "?"} size={42} ring={rankGradient(rank, 160)} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <RankEmblem rank={rank} size={20} animated={false} />
                  <Link href={`/cod/profile/${id}`} className="truncate font-display text-xl font-bold uppercase leading-none tracking-wide hover:!text-gold" style={{ color: rank.text }}>
                    {player?.username ?? "Joueur"}
                  </Link>
                  {id === userId ? <Chip className="shrink-0">Toi</Chip> : null}
                </p>
                <p className="mt-1.5 truncate text-xs text-white/50">{player?.activisionId ?? "Identifiant Activision non renseigné"}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
