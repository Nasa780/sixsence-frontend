import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuCheck, LuCopy, LuCrown, LuFlag, LuGamepad2, LuHouse, LuImagePlus, LuLoaderCircle, LuPencil, LuSend, LuX } from "react-icons/lu";
import { RankEmblem } from "../../../../components/cod/RankEmblem";
import { TeamCrest, fieldClass, labelClass } from "../../../../components/teams/TeamParts";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button } from "../../../../components/ui/Button";
import { ConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import { Container } from "../../../../components/ui/Container";
import { Chip, EmptyState, Loading, Notice, StatTile } from "../../../../components/ui/Feedback";
import { TacticalCard } from "../../../../components/ui/TacticalCard";
import { Eyebrow } from "../../../../components/ui/Typography";
import useCountdown from "../../../../hooks/useCountdown";
import useSession from "../../../../hooks/useSession";
import { MatchRulesCard, RulesLink } from "../../../../components/cod/MatchRules";
import { api } from "../../../../lib/api";
import { cn } from "../../../../lib/cn";
import { mapImage } from "../../../../lib/maps";
import { rankFor, rankGradient } from "../../../../lib/ranks";
import { supabase } from "../../../../lib/supabase";
import { STAFF_CHAT } from "../../../../lib/roles";

const ROUNDS = 6;
const mapsWon = (scores, side) => scores.filter(([a, b]) => (side === "A" ? a > b : b > a)).length;

/** Feuille d'un match d'équipe en direct (BO3, BO5 en finale de tournoi) : maps, scores, map décisive, déclaration et confirmation par les Leaders. Public. */
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

  // Temps réel : chaque changement du match recharge la feuille ; filet de sécurité toutes les 30 s (captures, coupure).
  useEffect(() => {
    load();
    if (!id) return undefined;
    const channel = supabase
      .channel(`team-match-${id}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "team_matches", filter: `id=eq.${id}` }, load)
      .subscribe();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 30000);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
      supabase.removeChannel(channel);
    };
  }, [load, userId, id]);

  if (error && !match) {
    return (
      <Container className="pb-16 pt-32">
        <EmptyState title="Match introuvable">{error}</EmptyState>
      </Container>
    );
  }
  if (!match) return <Loading />;

  const name = (side) => (side === "A" ? match.teamA : match.teamB)?.name ?? `Équipe ${side === "A" ? 1 : 2}`;
  const open = ["in_progress", "awaiting_confirmation", "forfeit_claimed", "disputed"].includes(match.status);
  const scoreA = mapsWon(match.scores, "A");
  const scoreB = mapsWon(match.scores, "B");

  return (
    <>
      <Head>
        <title>{`[${match.teamA?.tag}] vs [${match.teamB?.tag}] — Division — SixSence`}</title>
      </Head>
      {/* Match de tournoi : palette rouge des tournois ; Division et défis gardent l'or. */}
      <div data-univers={match.tournament ? "tournoi" : undefined}>
      <Container className="space-y-8 pb-16 pt-28 sm:pt-32">
        <div>
          <Eyebrow>
            {match.tournament ? `${match.tournament.name} · ${match.tournament.round}` : "Division"} · BO{match.bestOf} · {match.mode}
          </Eyebrow>
          <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">Feuille de match</h1>
        </div>

        <TacticalCard highlight cut={24} innerClassName="p-5 sm:p-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4">
            <TeamSide team={match.teamA} side="A" winner={match.winner} change={match.pointsChanges?.A} host={match.hostSide === "A"} />
            <div className="text-center">
              <p className="font-display text-5xl font-black leading-none tabular-nums sm:text-6xl">
                <span className={cn(match.winner === "A" && "text-gold")}>{scoreA}</span> <span className="text-white/30">–</span>{" "}
                <span className={cn(match.winner === "B" && "text-gold")}>{scoreB}</span>
              </p>
              <StatusChip match={match} />
            </div>
            <TeamSide team={match.teamB} side="B" winner={match.winner} change={match.pointsChanges?.B} host={match.hostSide === "B"} right />
          </div>
        </TacticalCard>

        <MatchNotices match={match} name={name} />

        {match.status === "in_progress" && match.scores.length === 0 && !match.pendingScores ? <KickoffBlock match={match} name={name} onDone={load} /> : null}
        {match.status === "forfeit_claimed" ? <ForfeitBlock match={match} name={name} onDone={load} /> : null}
        {match.messages ? <MatchChat match={match} name={name} userId={userId} onDone={load} /> : null}

        <div className={cn("grid gap-4 md:grid-cols-3", match.bestOf === 5 && "lg:grid-cols-5")}>
          {Array.from({ length: match.bestOf }, (_, index) => index).map((index) => (
            <MapCard key={index} index={index} match={match} name={name} />
          ))}
        </div>

        {match.status === "in_progress" && match.scores.length === match.bestOf - 1 && match.map3Picker ? <Map3Block match={match} name={name} onDone={load} /> : null}
        {match.viewer?.canReport ? <ReportForm key={`${match.scores.length}-${match.reportedAt ?? ""}`} match={match} onDone={load} /> : null}
        {match.viewer?.canConfirm ? <ConfirmBlock match={match} name={name} onDone={load} /> : null}
        {match.viewer?.canResolve ? <ResolveForm match={match} onDone={load} /> : null}
        {match.viewer?.canCorrect ? <CorrectionForm key={match.correctedAt ?? "initial"} match={match} onDone={load} /> : null}

        {match.proofs ? <Proofs match={match} userId={userId} onDone={load} /> : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Roster match={match} side="A" userId={userId} />
          <Roster match={match} side="B" userId={userId} />
        </div>

        {open && !match.tournament ? (
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

        {/* Réglages de la partie privée, en bas (le lien du lancement y descend) : toute l'équipe hôte. */}
        {match.status === "in_progress" && match.viewer?.side && match.viewer.side === match.hostSide ? <MatchRulesCard bestOf={match.bestOf} isHost /> : null}

        <p>
          <Link href="/cod/equipes" className="group/l inline-flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light">
            Classement des équipes
            <span aria-hidden className="h-px w-5 bg-gold/50 transition-all duration-300 group-hover/l:w-10 group-hover/l:bg-gold" />
          </Link>
        </p>
      </Container>
      </div>
    </>
  );
}

function TeamSide({ team, side, winner, change, host = false, right = false }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-4", right && "flex-row-reverse text-right")}>
      <span className="hidden sm:inline-flex">
        <TeamCrest team={team} size={64} />
      </span>
      <div className="min-w-0">
        {team?.cup ? (
          <p className={cn("block break-words font-display text-2xl font-black uppercase leading-none sm:text-4xl", side === "A" && "text-gold")}>{team?.name}</p>
        ) : (
          <Link href={`/cod/equipes/${team?.id}`} className={cn("block break-words font-display text-2xl font-black uppercase leading-none hover:text-gold sm:text-4xl", side === "A" && "text-gold")}>
            {team?.name}
          </Link>
        )}
        <p className="mt-1 font-tech text-xs uppercase tracking-[0.2em] text-white/45">
          <span className="normal-case">[{team?.tag}]</span>
          {winner === side ? <LuCrown aria-label="Vainqueur" className="ml-2 inline h-3.5 w-3.5 text-gold" /> : null}
          {host ? <HostChip className={cn("align-middle", right ? "mr-2" : "ml-2")} /> : null}
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
  if (match.status === "forfeit_claimed") return <Chip tone="loss" className="mt-2">Forfait demandé</Chip>;
  return <Chip className="mt-2">{match.bestOf > 1 && match.scores.length === match.bestOf - 1 ? "Map décisive" : "En cours"}</Chip>;
}

function MatchNotices({ match, name }) {
  const corrected = match.correctedAt ? (
    <Notice>
      <strong className="font-semibold text-white">Résultat corrigé par l&apos;équipe SixSence</strong>
      {` le ${new Date(match.correctedAt).toLocaleString("fr-FR", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}`}
      {match.correctionReason ? <span className="text-white/60"> · Motif : {match.correctionReason}</span> : null}
    </Notice>
  ) : null;
  if (match.status === "completed") {
    return (
      <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <LuCrown aria-hidden className="h-7 w-7 text-gold" />
        <p className="font-display text-3xl font-black uppercase leading-none tracking-wide sm:text-4xl">
          Victoire de <span className="text-gold-gradient">{name(match.winner)}</span>
          {match.forfeit ? <span className="text-white/55"> par forfait</span> : null}
        </p>
      </div>
      {match.forfeit ? <Notice>{name(match.winner === "A" ? "B" : "A")} {FORFEIT_REASONS[match.forfeitReason] ?? "a déclaré forfait"} : victoire par forfait, points et XP comme une victoire normale.</Notice> : null}
      {corrected}
      </>
    );
  }
  if (match.status === "cancelled") {
    if (corrected) return corrected;
    return <Notice>{match.cancelReason === "abandoned" ? "Match annulé : aucun résultat déclaré à temps. Aucun point n'a bougé." : "Match annulé par un arbitre : aucun point n'a bougé."}</Notice>;
  }
  if (match.status === "disputed" && match.forfeitBy && match.scores.length === 0 && !match.pendingScores) {
    return <Notice tone="error">Forfait demandé par {name(match.forfeitBy)} et non validé : un arbitre SixSence va trancher. Aucun point ne bouge d&apos;ici là.</Notice>;
  }
  if (match.status === "disputed") return <Notice tone="error">Les scores ont été contestés : un arbitre SixSence va trancher. Aucun point ne bouge d&apos;ici là.</Notice>;
  if (match.status === "awaiting_confirmation" && !match.viewer?.canConfirm) {
    return (
      <Notice>
        Scores déclarés par {name(match.reportedTeam)} : en attente de la confirmation de l&apos;équipe adverse (validés d&apos;office après {match.confirmMinutes} min).
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
  const decider = match.bestOf > 1 && index === match.bestOf - 1;
  const pick = map ? (map.pick === "random" ? "tirée au sort" : `choix ${name(map.pick)}`) : decider ? "décisive" : "";

  return (
    <TacticalCard highlight={decider && !map && !decided && match.scores.length === match.bestOf - 1} innerClassName={cn("overflow-hidden p-5", decided && "opacity-50")}>
      {/* Fond : l'image de la map (MW4 générique si la map n'a pas d'image), assombrie pour garder le score lisible. */}
      {map ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img aria-hidden src={mapImage(map.map) ?? "/images/mw4.webp"} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-45" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-ink/30" />
        </>
      ) : (
        <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
      )}
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
          <p className="mt-6 text-sm text-white/40">{decided ? "Non jouée : série déjà gagnée" : map && decider && !decided ? `Jouée seulement à ${match.bestOf === 5 ? "2 – 2" : "1 – 1"}` : map ? "Score pas encore déclaré" : decider ? (match.scores.length === match.bestOf - 1 && !decided ? "Choix de la map en cours" : `Jouée seulement à ${match.bestOf === 5 ? "2 – 2" : "1 – 1"}`) : ""}</p>
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
  const picked = match.maps.length === match.bestOf;

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
          <Eyebrow>Qui choisit la map décisive ?</Eyebrow>
          <p className="mt-2 text-sm text-white/55">Total des manches gagnées sur les maps déjà jouées.</p>
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
          <>Égalité de manches : map décisive tirée au sort</>
        ) : (
          <>
            <span className="text-white">{name(match.map3Picker)}</span> <span className="text-white/60">{picked ? `a choisi ${match.maps[match.bestOf - 1].map}` : "choisit la map décisive"}</span>
          </>
        )}
      </p>
      {match.viewer?.canPickMap3 ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <select className={fieldClass} value={map} onChange={(event) => setMap(event.target.value)} aria-label="Map décisive">
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
            <span className="normal-case">[{team?.tag}]</span> gagne
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
          <span className="normal-case">[{teamA?.tag}]</span> {value[0]} – {value[1]} <span className="normal-case">[{teamB?.tag}]</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * Déclaration unique, à la fin : toute la série d'un coup (BO3 : 2 maps, ou 3 à 1-1). Les maps suivantes
 * n'apparaissent que si la série n'est pas encore gagnée. L'équipe adverse confirme une seule fois.
 */
function ReportForm({ match, onDone }) {
  const start = match.scores.length;
  const need = Math.ceil(match.bestOf / 2);
  const [scores, setScores] = useState(() => Array.from({ length: match.bestOf - start }, () => null));
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  // Maps à saisir : on s'arrête dès qu'une équipe a gagné la série.
  const visible = [];
  for (let i = 0; i < scores.length; i += 1) {
    visible.push(i);
    const all = [...match.scores, ...scores.slice(0, i + 1)];
    if (scores[i] === null) break;
    if (mapsWon(all, "A") >= need || mapsWon(all, "B") >= need) break;
  }
  const declared = scores.slice(0, visible.length);
  const all = [...match.scores, ...declared];
  const complete = declared.every(Boolean) && (mapsWon(all, "A") >= need || mapsWon(all, "B") >= need);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/report`, { method: "POST", body: { scores: declared } });
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
      <Eyebrow>Déclarer le résultat</Eyebrow>
      <p className="text-sm text-white/55">À la fin de la série, saisis le score de chaque map jouée ; la map décisive n&apos;apparaît qu&apos;à égalité.</p>
      <div className={cn("grid gap-3 md:grid-cols-2", match.bestOf === 3 && "lg:grid-cols-3")}>
        {visible.map((i) => (
          <MapScoreInput
            key={i}
            label={`Map ${start + i + 1} · ${match.maps[start + i]?.map ?? "?"}`}
            teamA={match.teamA}
            teamB={match.teamB}
            value={scores[i]}
            onChange={(next) => setScores((current) => current.map((v, j) => (j === i ? next : j > i ? null : v)))}
          />
        ))}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-white/45">L&apos;équipe adverse devra confirmer. Ajoute une capture du tableau des scores plus bas en cas de doute.</p>
        <Button disabled={!complete || pending} onClick={() => setConfirming(true)}>
          Déclarer le résultat
        </Button>
      </div>
      <ConfirmDialog open={confirming} onClose={() => setConfirming(false)} title="Déclarer ce résultat ?" confirmLabel="Déclarer" pending={pending} onConfirm={submit}>
        {declared.filter(Boolean).map((v, i) => (
          <p key={i}>
            {match.maps[start + i]?.map} : <span className="normal-case">[{match.teamA?.tag}]</span> {v[0]} – {v[1]} <span className="normal-case">[{match.teamB?.tag}]</span>
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
            <span className="text-white/55">{match.maps[match.scores.length + i]?.map} :</span> <span className="normal-case">[{match.teamA?.tag}]</span> {v[0]} – {v[1]} <span className="normal-case">[{match.teamB?.tag}]</span>
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
  const [scores, setScores] = useState(() =>
    Array.from({ length: match.bestOf }, (_, i) => match.scores[i] ?? match.pendingScores?.[i - match.scores.length] ?? null),
  );
  const need = Math.ceil(match.bestOf / 2);
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
      <p className="text-sm text-white/55">Saisis les scores définitifs des maps jouées (dans l’ordre, la série se termine sur la dernière), ou annule le match.</p>
      <div className={cn("grid gap-3 md:grid-cols-3", match.bestOf === 5 && "lg:grid-cols-5")}>
        {scores.map((value, i) => (
          <div key={i} className="space-y-2">
            <MapScoreInput label={match.maps[i]?.map ?? `Map ${i + 1}`} teamA={match.teamA} teamB={match.teamB} value={value} onChange={(next) => setScores((current) => current.map((v, j) => (j === i ? next : v)))} />
            {value && i >= need ? (
              <button type="button" className="text-xs text-white/45 underline hover:text-loss" onClick={() => setScores((current) => current.map((v, j) => (j >= i ? null : v)))}>
                Map non jouée
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending || filled.length < need || scores.slice(0, need).some((v) => !v)} onClick={() => resolve({ scores: filled })}>
          Valider les scores
        </Button>
        <Button variant="danger" disabled={pending} onClick={() => resolve({ scores: null })}>
          Annuler le match
        </Button>
      </div>
      {match.scores.length === 0 ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <p className="text-sm text-white/55">Match pas joué (hôte muet, équipe absente) :</p>
          {["A", "B"].map((side) => (
            <Button key={side} variant="outline" size="sm" disabled={pending} onClick={() => resolve({ forfeitWinner: side })}>
              <LuFlag aria-hidden className="h-4 w-4" />
              Victoire par forfait <span className="normal-case">[{(side === "A" ? match.teamA : match.teamB)?.tag}]</span>
            </Button>
          ))}
        </div>
      ) : null}
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
        <h2 className={cn("flex flex-wrap items-center gap-3 font-display text-3xl font-black uppercase leading-none sm:text-4xl", side === "A" && "text-gold")}>
          {team?.name}
          {match.hostSide === side ? <HostChip /> : null}
        </h2>
        {match.winner === side ? <Chip tone="win">Victoire</Chip> : <span className="font-tech text-xs uppercase tracking-[0.2em] text-white/45">{match.pointsBefore[side]} pts</span>}
      </header>
      <ul className="mt-3 space-y-2">
        {ids.map((id) => {
          const player = byId.get(id);
          const rank = rankFor(player?.points ?? 0);
          return (
            <li key={id} className={cn("flex items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-3", id === userId ? "border-gold bg-gold/8" : "border-white/10")}>
              <Avatar full src={player?.avatarUrl} name={player?.username ?? "?"} size={42} ring={rankGradient(rank, 160)} />
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

const PROOF_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/** Captures du tableau des scores : envoyées par les joueurs du match, visibles des joueurs du match et des arbitres. */
function Proofs({ match, userId, onDone }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const canUpload = match.viewer?.canProve;

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const extension = PROOF_TYPES[file.type];
    if (!extension) return setError("Formats acceptés : PNG, JPEG ou WebP.");
    if (file.size > 5 * 1024 * 1024) return setError("Image trop lourde : 5 Mo maximum.");
    setUploading(true);
    setError(null);
    try {
      const path = `${match.id}/${userId}/${Date.now()}.${extension}`;
      const { error: storageError } = await supabase.storage.from("team-match-proofs").upload(path, file, { contentType: file.type });
      if (storageError) throw new Error("Envoi de l'image impossible. Réessaie dans un instant.");
      await api(`/teams/matches/${match.id}/proofs`, { method: "POST", body: { path } });
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <section aria-labelledby="titre-preuves">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Preuves</Eyebrow>
          <h2 id="titre-preuves" className="mt-3 font-display text-4xl font-black uppercase leading-none">
            Captures du match
          </h2>
        </div>
        {canUpload ? (
          <>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} aria-hidden onChange={upload} />
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuImagePlus aria-hidden className="h-4 w-4" />}
              Ajouter une capture
            </Button>
          </>
        ) : null}
      </div>
      {canUpload ? (
        <p className="mt-3 text-sm text-white/55">
          Une capture du tableau des scores de chaque map permet à un arbitre de trancher en cas de contestation (PNG, JPEG ou WebP, 5 Mo max, 5 par joueur).
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
      {match.proofs.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {match.proofs.map((proof) => (
            <li key={proof.id}>
              <a href={proof.url} target="_blank" rel="noopener noreferrer" className="group block border border-white/10 bg-white/[0.03] hover:border-gold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proof.url} alt={`Capture envoyée par ${proof.username}`} loading="lazy" className="aspect-video w-full object-cover" />
                <p className="truncate px-3 py-2 text-xs text-white/60 group-hover:text-white">
                  {proof.username} · {new Date(proof.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/45">Aucune capture pour l&apos;instant.</p>
      )}
    </section>
  );
}

/** Correction d'un match terminé (équipe SixSence) : nouveaux scores de la série ou annulation, avec un motif. */
function CorrectionForm({ match, onDone }) {
  const [scores, setScores] = useState(() => Array.from({ length: match.bestOf }, (_, i) => match.scores[i] ?? null));
  const [reason, setReason] = useState("");
  const [ask, setAsk] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const need = Math.ceil(match.bestOf / 2);
  const filled = scores.filter(Boolean);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/correct`, { method: "POST", body: { scores: ask === "cancel" ? null : filled, reason } });
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
    <TacticalCard innerClassName="space-y-4 p-6">
      <Eyebrow>Corriger le résultat</Eyebrow>
      <p className="text-sm text-white/55">
        {match.tournament
          ? "Mauvaise déclaration ? Saisis les bons scores. Le vainqueur ne peut changer que si aucune des deux équipes n'a joué la rencontre suivante : le tableau est alors refait."
          : "Mauvaise déclaration ? Saisis les bons scores (le vainqueur peut changer) ou annule le match : les points des deux équipes sont recalculés."}
      </p>
      <div className={cn("grid gap-3 md:grid-cols-3", match.bestOf === 5 && "lg:grid-cols-5")}>
        {scores.map((value, i) => (
          <div key={i} className="space-y-2">
            <MapScoreInput label={match.maps[i]?.map ?? `Map ${i + 1}`} teamA={match.teamA} teamB={match.teamB} value={value} onChange={(next) => setScores((current) => current.map((v, j) => (j === i ? next : v)))} />
            {value && i >= need ? (
              <button type="button" className="text-xs text-white/45 underline hover:text-loss" onClick={() => setScores((current) => current.map((v, j) => (j >= i ? null : v)))}>
                Map non jouée
              </button>
            ) : null}
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="correction-reason" className={labelClass}>
          Motif (obligatoire)
        </label>
        <input id="correction-reason" className={fieldClass} maxLength={500} placeholder="Mauvais clic, capture à l'appui…" value={reason} onChange={(event) => setReason(event.target.value)} />
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending || reason.trim().length < 3 || filled.length < need || scores.slice(0, need).some((v) => !v)} onClick={() => setAsk("scores")}>
          Corriger les scores
        </Button>
        {match.tournament ? null : (
          <Button variant="danger" disabled={pending || reason.trim().length < 3} onClick={() => setAsk("cancel")}>
            Annuler le match
          </Button>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(ask)}
        onClose={() => setAsk(null)}
        title={ask === "cancel" ? "Annuler ce match ?" : "Corriger les scores ?"}
        confirmLabel={ask === "cancel" ? "Annuler le match" : "Corriger"}
        tone={ask === "cancel" ? "danger" : "gold"}
        pending={pending}
        onConfirm={submit}
      >
        {ask === "cancel" ? "Les points des deux équipes leur sont rendus." : filled.map(([a, b], i) => `${match.maps[i]?.map ?? `Map ${i + 1}`} ${a}-${b}`).join(" · ")}
      </ConfirmDialog>
    </TacticalCard>
  );
}

const FORFEIT_REASONS = {
  host_silent: "(équipe hôte) n'a pas donné le code de la partie à temps",
  absent: "n'a pas lancé la partie à temps",
};

const mmss = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

function HostChip({ className = "" }) {
  return (
    <Chip className={cn("shrink-0", className)}>
      <LuHouse aria-hidden className="h-3 w-3" />
      Hôte
    </Chip>
  );
}

/**
 * Lancement du match : l'équipe hôte (tirée au sort) crée la partie privée et donne son code sous 10 min
 * (champ dédié, modifiable en cas d'erreur) ; 15 min pour lancer la partie, ensuite forfait possible.
 * Sinon, l'autre équipe peut déclarer forfait (l'équipe visée valide ou conteste ; sans réponse en 15 min,
 * un arbitre tranche).
 */
function KickoffBlock({ match, name, onDone }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [ask, setAsk] = useState(null);
  const [code, setCode] = useState("");
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const hostLeft = useCountdown(match.hostDeadline);
  const presenceLeft = useCountdown(match.presenceDeadline);
  const viewer = match.viewer;
  const isHost = viewer?.side && viewer.side === match.hostSide;
  const given = Boolean(match.gameCodeAt);

  async function run(key, path, body) {
    setPending(key);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/${path}`, { method: "POST", body });
      setAsk(null);
      await onDone();
      return true;
    } catch (caught) {
      setError(caught.message);
      setAsk(null);
      return false;
    } finally {
      setPending(null);
    }
  }

  async function saveCode(event) {
    event.preventDefault();
    if (await run("code", "code", { code: code.trim() })) {
      setEditing(false);
      setCode("");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(match.gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Presse-papiers indisponible : le code reste affiché.
    }
  }

  const codeForm = (
    <form onSubmit={saveCode} className="flex flex-col gap-2 sm:flex-row">
      <input
        className={fieldClass}
        maxLength={40}
        autoFocus={editing}
        placeholder="Code de la partie privée"
        aria-label="Code de la partie privée"
        value={code}
        onChange={(event) => setCode(event.target.value)}
      />
      <Button type="submit" disabled={pending !== null || !code.trim()} className="shrink-0">
        {pending === "code" ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuCheck aria-hidden className="h-5 w-5" />}
        {given ? "Modifier" : "Valider le code"}
      </Button>
      {editing ? (
        <Button type="button" variant="ghost" onClick={() => setEditing(false)} className="shrink-0">
          Annuler
        </Button>
      ) : null}
    </form>
  );

  return (
    <TacticalCard highlight innerClassName="space-y-5 p-6">
      <div>
        <Eyebrow>Lancement du match</Eyebrow>
        <div
          className={cn(
            "mt-3 flex flex-wrap items-center gap-3 border-l-2 px-4 py-3",
            isHost ? "border-gold bg-gold/10" : "border-white/30 bg-white/[0.04]",
          )}
        >
          <LuHouse aria-hidden className={cn("h-6 w-6 shrink-0", isHost ? "text-gold" : "text-white/60")} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl font-black uppercase leading-none">
              {isHost ? (
                <span className="text-gold">Ton équipe est l&apos;hôte</span>
              ) : (
                <>
                  Hôte : <span className="text-gold">{name(match.hostSide)}</span>
                </>
              )}
            </p>
            <p className="mt-1.5 text-sm text-white/60">
              {isHost
                ? "Crée la partie privée en mode CDL Recherche et destruction, puis donne son code ci-dessous."
                : viewer?.side
                  ? "L'équipe hôte crée la partie privée et donne son code ici : rejoins-la dès qu'il apparaît."
                  : "L'équipe hôte crée la partie privée et donne son code aux deux équipes."}
            </p>
            {isHost ? <RulesLink className="mt-2" /> : null}
          </div>
        </div>
      </div>

      {/* Code de la partie : délai tant qu'il n'est pas donné, puis le code (modifiable par l'hôte). */}
      <div className="border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Code de la partie privée</p>
            {given ? (
              match.gameCode ? (
                <p className="mt-2 break-all font-tech text-3xl font-bold tracking-[0.12em] text-gold sm:text-4xl">{match.gameCode}</p>
              ) : (
                <p className="mt-2 font-display text-3xl font-black uppercase leading-none text-win">Donné</p>
              )
            ) : (
              <p className={cn("mt-2 font-display text-4xl font-black leading-none tabular-nums", hostLeft > 0 ? "text-white" : "text-loss")}>
                {hostLeft > 0 ? mmss(hostLeft) : "En retard"}
              </p>
            )}
            <p className="mt-2 text-xs text-white/45">
              {given
                ? `Donné à ${new Date(match.gameCodeAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}${
                    match.gameCodeUpdatedAt && match.gameCodeUpdatedAt !== match.gameCodeAt
                      ? ` · modifié à ${new Date(match.gameCodeUpdatedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                      : ""
                  }`
                : `${name(match.hostSide)} a 10 min pour le donner.`}
            </p>
          </div>
          {given && match.gameCode ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <LuCheck aria-hidden className="h-4 w-4" /> : <LuCopy aria-hidden className="h-4 w-4" />}
                {copied ? "Copié" : "Copier"}
              </Button>
              {viewer?.canSetCode && !editing ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCode(match.gameCode);
                    setEditing(true);
                  }}
                >
                  <LuPencil aria-hidden className="h-4 w-4" />
                  Modifier
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
        {viewer?.canSetCode && (!given || editing) ? <div className="mt-4">{codeForm}</div> : null}
      </div>

      {/* Plus de bouton de présence : 15 min pour lancer la partie, ensuite l'autre équipe peut déclarer forfait. */}
      <div className="flex items-center justify-between gap-4 border-l-2 border-gold/60 bg-white/[0.03] px-4 py-3">
        <div className="min-w-0">
          <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Lancement de la partie</p>
          <p className="mt-1 text-xs text-white/45">Tous les joueurs ont 15 minutes max pour rejoindre la partie.</p>
        </div>
        <p className={cn("font-display text-3xl font-black leading-none tabular-nums", presenceLeft > 0 ? "text-white" : "text-loss")}>{presenceLeft > 0 ? mmss(presenceLeft) : "Temps écoulé"}</p>
      </div>

      {viewer?.canClaimForfeit?.host_silent || viewer?.canClaimForfeit?.absent ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <p className="text-sm text-white/60">Délai dépassé côté adverse :</p>
          {viewer.canClaimForfeit.host_silent ? (
            <Button variant="danger" size="sm" disabled={pending !== null} onClick={() => setAsk("host_silent")}>
              <LuFlag aria-hidden className="h-4 w-4" />
              Forfait : pas de code
            </Button>
          ) : null}
          {viewer.canClaimForfeit.absent ? (
            <Button variant="danger" size="sm" disabled={pending !== null} onClick={() => setAsk("absent")}>
              <LuFlag aria-hidden className="h-4 w-4" />
              Forfait : partie pas lancée
            </Button>
          ) : null}
        </div>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <ConfirmDialog
        open={Boolean(ask)}
        onClose={() => setAsk(null)}
        title="Déclarer forfait ?"
        confirmLabel="Déclarer forfait"
        tone="danger"
        pending={pending === "forfeit"}
        onConfirm={() => run("forfeit", "forfeit", { reason: ask })}
      >
        L&apos;équipe adverse a 15 min pour valider (victoire pour toi) ou contester ; sans réponse, un arbitre SixSence tranche.
      </ConfirmDialog>
    </TacticalCard>
  );
}

/** Forfait déclaré : l'équipe visée valide ou conteste ; sans réponse en 15 min, un arbitre tranche. */
function ForfeitBlock({ match, name, onDone }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [ask, setAsk] = useState(null);
  const left = useCountdown(match.forfeitAnswerDeadline);
  const accused = match.forfeitBy === "A" ? "B" : "A";

  async function answer(accept) {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/forfeit/answer`, { method: "POST", body: { accept } });
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
      <Eyebrow>Forfait demandé</Eyebrow>
      <p className="font-display text-2xl font-black uppercase leading-tight">
        {name(match.forfeitBy)} <span className="text-white/60">demande la victoire par forfait :</span> {name(accused)} {FORFEIT_REASONS[match.forfeitReason]}.
      </p>
      <p className="text-sm text-white/55">
        {match.viewer?.canAnswerForfeit ? "Valide si c'est vrai, conteste sinon." : `En attente de la réponse de ${name(accused)}.`} Sans réponse dans{" "}
        <span className="font-tech font-bold tabular-nums text-white">{mmss(left)}</span>, un arbitre SixSence tranchera.
      </p>
      {match.viewer?.canAnswerForfeit ? (
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled={pending} onClick={() => setAsk("accept")}>
            <LuCheck aria-hidden className="h-5 w-5" />
            Valider le forfait
          </Button>
          <Button variant="danger" disabled={pending} onClick={() => setAsk("refuse")}>
            <LuX aria-hidden className="h-5 w-5" />
            Contester
          </Button>
        </div>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <ConfirmDialog
        open={Boolean(ask)}
        onClose={() => setAsk(null)}
        title={ask === "accept" ? "Valider le forfait ?" : "Contester le forfait ?"}
        confirmLabel={ask === "accept" ? "Valider" : "Contester"}
        tone={ask === "accept" ? "gold" : "danger"}
        pending={pending}
        onConfirm={() => answer(ask === "accept")}
      >
        {ask === "accept" ? "Ton équipe perd le match (points et XP d'une défaite)." : "Un arbitre SixSence tranchera : explique la situation dans le tchat."}
      </ConfirmDialog>
    </TacticalCard>
  );
}

/** Chat du match : joueurs du match, Leaders des deux équipes et arbitres (le code de la partie y est donné). */
function MatchChat({ match, name, userId, onDone }) {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);
  const count = match.messages.length;

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [count]);

  async function send(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setPending(true);
    setError(null);
    try {
      await api(`/teams/matches/${match.id}/messages`, { method: "POST", body: { body: text.trim() } });
      setText("");
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <TacticalCard innerClassName="space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Eyebrow>Tchat du match</Eyebrow>
        <p className="text-xs text-white/40">Joueurs du match, Leaders et arbitres seulement</p>
      </div>
      <ul ref={listRef} className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {count === 0 ? <li className="text-sm text-white/45">Aucun message pour l&apos;instant.</li> : null}
        {match.messages.map((message) => {
          // Message de l'équipe SixSence (admin, staff, arbitre) : pseudo, rôle et texte dans sa couleur.
          const staff = STAFF_CHAT[message.role];
          return (
            <li
              key={message.id}
              className={cn("border-l-2 bg-white/[0.03] px-3 py-2", message.side === "A" ? "border-gold" : message.side === "B" ? "border-white/70" : !staff && "border-loss")}
              style={staff ? { borderColor: staff.color } : undefined}
            >
              <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">
                <span className={cn(!staff && (message.userId === userId ? "text-gold" : "text-white/70"))} style={staff ? { color: staff.color } : undefined}>
                  {message.username}
                </span>
                {" · "}
                {message.side ? name(message.side) : <span style={staff ? { color: staff.color } : undefined}>{staff?.label ?? "Arbitre"}</span>}
                {message.side && message.side === match.hostSide ? " (hôte)" : ""}
                {" · "}
                {new Date(message.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className={cn("mt-1 whitespace-pre-wrap break-words text-sm", !staff && "text-white/85")} style={staff ? { color: staff.color } : undefined}>
                {message.body}
              </p>
            </li>
          );
        })}
      </ul>
      {match.viewer?.canChat && !["cancelled"].includes(match.status) ? (
        <form onSubmit={send} className="flex gap-2">
          <input className={fieldClass} maxLength={300} placeholder="Message aux deux équipes…" value={text} onChange={(event) => setText(event.target.value)} aria-label="Message" />
          <Button type="submit" disabled={pending || !text.trim()} className="shrink-0">
            {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuSend aria-hidden className="h-4 w-4" />}
            Envoyer
          </Button>
        </form>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </TacticalCard>
  );
}
