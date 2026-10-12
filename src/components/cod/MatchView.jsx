import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuCheck, LuCrown, LuFlag, LuImagePlus, LuLoaderCircle, LuMap, LuSend, LuShieldAlert, LuStar, LuSwords, LuX } from "react-icons/lu";
import useCountdown from "../../hooks/useCountdown";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { ARBITRATION_REASONS, REPORT_REASONS } from "../../lib/moderation";
import { groupLabel } from "../../lib/ranks";
import { supabase } from "../../lib/supabase";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Chip, EmptyState, Loading, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { ReasonDialog } from "../ui/ReasonDialog";
import { Eyebrow } from "../ui/Typography";

const STATUS_LABEL = {
  ready_check: "En attente des joueurs",
  in_progress: "Match en cours",
  awaiting_confirmation: "Résultat à confirmer",
  disputed: "Résultat contesté",
  completed: "Match terminé",
  cancelled: "Match annulé",
};

const PLATFORM_LABEL = { pc: "PC", playstation: "PlayStation", xbox: "Xbox" };

const signed = (value) => (value > 0 ? `+${value}` : `${value}`);
const teamLabel = (team) => (team === "A" ? "Équipe 1" : "Équipe 2");

/**
 * Salon de match : carte, mode, les deux équipes, le chat, et les actions selon l'état.
 *
 * Cycle de vie d'un match :
 *   « Prêt ? » (1 min) -> en cours -> un joueur déclare le vainqueur -> l'équipe adverse confirme -> terminé (points mis à jour)
 *                                              -> ou conteste -> un admin tranche
 *
 * Tout le monde peut regarder ; seuls les joueurs du match agissent et écrivent.
 * La page s'actualise seule (Supabase Realtime sur le match et ses messages).
 */
export function MatchView({ matchId }) {
  const { userId } = useSession();
  const user = useUser();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [me, setMe] = useState({ myVote: null, arbitrations: [] });
  const [dialog, setDialog] = useState(null); // { kind: "arbitration" } | { kind: "report", target }

  const loadMe = useCallback(async () => {
    try {
      setMe(await api(`/cod/matches/${matchId}/me`));
    } catch {
      // Sans importance : ces informations ne servent qu'à l'affichage.
    }
  }, [matchId]);

  const load = useCallback(async () => {
    try {
      setData(await api(`/cod/matches/${matchId}`));
    } catch (caught) {
      if (caught.status === 404 || caught.status === 400) setNotFound(true);
      else setError(caught.message);
    }
  }, [matchId]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`match-${matchId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "cod_matches", filter: `id=eq.${matchId}` }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "cod_match_messages", filter: `match_id=eq.${matchId}` }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "cod_match_proofs", filter: `match_id=eq.${matchId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "cod_mvp_votes", filter: `match_id=eq.${matchId}` }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, load]);

  const playerById = useMemo(() => new Map((data?.players || []).map((player) => [player.id, player])), [data]);
  const isPlayer = Boolean(userId && data && (data.match.team_a.includes(userId) || data.match.team_b.includes(userId)));

  // Mon vote MVP et mes demandes d'arbitrage (joueurs du match uniquement).
  useEffect(() => {
    if (isPlayer) loadMe();
  }, [isPlayer, loadMe, data?.match?.status]);

  /** Appelle une action du backend puis recharge le match. */
  async function act(action, body, key) {
    setPending(key);
    setError(null);
    try {
      await api(`/cod/matches/${matchId}/${action}`, { method: "POST", body });
      await load();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  if (notFound) {
    return (
      <EmptyState title="Match introuvable">
        Ce match n&apos;existe pas ou plus.{" "}
        <Link href="/cod/ranked" className="text-gold underline underline-offset-4">
          Retour à la file
        </Link>
      </EmptyState>
    );
  }
  if (!data) return <Loading label="Chargement du match…" />;

  const { match, messages, proofs } = data;
  const myTeam = match.team_a.includes(userId) ? "A" : match.team_b.includes(userId) ? "B" : null;
  const reporterTeam = match.reported_by ? (match.team_a.includes(match.reported_by) ? "A" : "B") : null;
  const reporterName = match.reported_by ? playerById.get(match.reported_by)?.username ?? "Un joueur" : "Un joueur";
  const hostName = playerById.get(match.team_a[0])?.username ?? "L'hôte";
  const isAdmin = user?.role === "admin";
  const spinner = <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" />;
  const readyUsers = match.ready_users || [];
  const canProve = Boolean(myTeam) && ["in_progress", "awaiting_confirmation", "disputed"].includes(match.status);
  const canArbitrate = canProve;
  const canReport = Boolean(userId);
  const mvpVotes = data.mvpVotes || {};
  const topVotes = Math.max(0, ...Object.values(mvpVotes));
  const mvpIds = topVotes > 0 ? Object.keys(mvpVotes).filter((id) => mvpVotes[id] === topVotes) : [];

  return (
    <div className="space-y-8">
      {/* --- Bandeau : carte, mode, état ---------------------------------- */}
      <TacticalCard highlight cut={28} innerClassName="holo overflow-hidden p-6 sm:p-10">
        <div aria-hidden className="absolute inset-0 bg-[url('/images/call-of-duty-black-3840x2160-22670.jpg')] bg-cover bg-center opacity-15" />
        <div aria-hidden className="absolute -right-10 top-0 h-full w-40 -skew-x-[24deg] bg-linear-to-b from-gold/14 to-transparent" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-gold">
              <LuMap aria-hidden className="h-4 w-4" />
              Carte
            </p>
            <p className="mt-2 font-display text-6xl font-black uppercase leading-[0.85] sm:text-8xl">{match.map}</p>
            <p className="mt-3 font-display text-2xl font-bold uppercase tracking-[0.14em] text-white/70">{match.mode}</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Chip tone={match.status === "completed" ? "win" : match.status === "cancelled" || match.status === "disputed" ? "loss" : "gold"}>
              {STATUS_LABEL[match.status]}
            </Chip>
            <p className="font-tech text-xs uppercase tracking-[0.2em] text-white/40">
              {match.format ?? `${match.team_size}v${match.team_size}`} ·{" "}
              {new Date(match.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </TacticalCard>

      {/* --- Actions selon l'état ----------------------------------------- */}
      <div aria-live="polite" className="space-y-4">
        {error ? <Notice tone="error">{error}</Notice> : null}

        {match.status === "ready_check" ? (
          <ReadyCheckBlock
            match={match}
            isPlayer={Boolean(myTeam)}
            iAmReady={readyUsers.includes(userId)}
            pending={pending === "ready"}
            onAccept={() => act("ready", undefined, "ready")}
          />
        ) : null}

        {match.status === "in_progress" ? (
          <>
            <Notice>
              <strong className="font-semibold text-white">{hostName}</strong> crée la partie privée et invite les autres joueurs
              avec les identifiants Activision ci-dessous. Une fois le match joué, n&apos;importe quel joueur déclare le vainqueur ;
              l&apos;équipe adverse confirme.
            </Notice>
            {myTeam ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="font-display text-xl font-bold uppercase tracking-[0.12em] text-white/80 sm:mr-2">Qui a gagné ?</p>
                <Button onClick={() => act("report", { winner: "A" }, "report-A")} disabled={pending !== null}>
                  {pending === "report-A" ? spinner : <LuSwords aria-hidden className="h-5 w-5" />}
                  Équipe 1
                </Button>
                <Button variant="outline" onClick={() => act("report", { winner: "B" }, "report-B")} disabled={pending !== null}>
                  {pending === "report-B" ? spinner : <LuSwords aria-hidden className="h-5 w-5" />}
                  Équipe 2
                </Button>
              </div>
            ) : null}
          </>
        ) : null}

        {match.status === "awaiting_confirmation" ? (
          <>
            <Notice>
              <strong className="font-semibold text-white">{reporterName}</strong> a déclaré la victoire de l&apos;
              <strong className="font-semibold text-gold">{teamLabel(match.reported_winner).toLowerCase()}</strong>. Sans réponse de
              l&apos;équipe adverse, le résultat est validé automatiquement après 15 minutes.
            </Notice>
            {myTeam && reporterTeam && myTeam !== reporterTeam ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => act("confirm", { accept: true }, "accept")} disabled={pending !== null}>
                  {pending === "accept" ? spinner : <LuCheck aria-hidden className="h-5 w-5" />}
                  Confirmer le résultat
                </Button>
                <Button variant="danger" onClick={() => act("confirm", { accept: false }, "refuse")} disabled={pending !== null}>
                  {pending === "refuse" ? spinner : <LuX aria-hidden className="h-5 w-5" />}
                  Contester
                </Button>
              </div>
            ) : myTeam ? (
              <p className="text-sm text-white/55">En attente de la confirmation de l&apos;équipe adverse.</p>
            ) : null}
          </>
        ) : null}

        {match.status === "disputed" ? (
          <>
            <Notice tone="error">Le résultat a été contesté. Un administrateur va trancher : aucun point ne bouge d&apos;ici là.</Notice>
            {isAdmin ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="font-display text-xl font-bold uppercase tracking-[0.12em] text-white/80 sm:mr-2">Arbitrage</p>
                <Button onClick={() => act("resolve", { winner: "A" }, "resolve-A")} disabled={pending !== null}>
                  {pending === "resolve-A" ? spinner : null}
                  Victoire équipe 1
                </Button>
                <Button variant="outline" onClick={() => act("resolve", { winner: "B" }, "resolve-B")} disabled={pending !== null}>
                  {pending === "resolve-B" ? spinner : null}
                  Victoire équipe 2
                </Button>
                <Button variant="danger" onClick={() => act("resolve", { winner: null }, "resolve-cancel")} disabled={pending !== null}>
                  {pending === "resolve-cancel" ? spinner : null}
                  Annuler le match
                </Button>
              </div>
            ) : null}
          </>
        ) : null}

        {match.status === "completed" ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <LuCrown aria-hidden className="h-7 w-7 text-gold" />
            <p className="font-display text-3xl font-black uppercase leading-none tracking-wide sm:text-4xl">
              Victoire de l&apos;<span className="text-gold-gradient">{teamLabel(match.winner).toLowerCase()}</span>
            </p>
            <Link href="/cod/ranked" className="text-sm font-semibold text-gold underline underline-offset-4 hover:text-gold-light sm:ml-auto">
              Relancer une recherche
            </Link>
          </div>
        ) : null}

        {match.status === "cancelled" ? (
          <Notice>
            {match.cancel_reason === "ready_check_failed"
              ? "Match annulé : tous les joueurs n'ont pas accepté à temps. Les joueurs prêts ont été remis en tête de file."
              : "Ce match a été annulé : aucun point n'a été modifié."}{" "}
            <Link href="/cod/ranked" className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              Retourner à la file
            </Link>
          </Notice>
        ) : null}

        {/* Demande d'arbitrage : pendant le match, pour les joueurs. */}
        {canArbitrate ? (
          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/55">Un problème pendant le match (triche, joueur absent, partie impossible…) ?</p>
            <Button variant="outline" size="sm" onClick={() => setDialog({ kind: "arbitration" })}>
              <LuShieldAlert aria-hidden className="h-4 w-4" />
              Demander un arbitrage
            </Button>
          </div>
        ) : null}
        {me.arbitrations.length > 0 ? (
          <ul className="space-y-2">
            {me.arbitrations.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-2 border-l-2 border-gold/40 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
                <LuShieldAlert aria-hidden className="h-4 w-4 text-gold" />
                Ta demande « {ARBITRATION_REASONS[request.reason] ?? request.reason} » :
                <span className={cn("font-semibold", request.status === "open" ? "text-gold" : request.status === "resolved" ? "text-win" : "text-white/60")}>
                  {request.status === "open" ? "en attente d'un admin" : request.status === "resolved" ? "traitée" : "classée sans suite"}
                </span>
                {request.resolution ? <span className="text-white/50">— {request.resolution}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* --- Vote du MVP (24 h après la fin du match) ---------------------- */}
      {match.status === "completed" ? (
        <MvpVote match={match} playerById={playerById} votes={mvpVotes} myVote={me.myVote} userId={userId} isPlayer={isPlayer} onVoted={() => Promise.all([load(), loadMe()])} />
      ) : null}

      {/* --- Les deux équipes --------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 pt-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <TeamColumn team="A" match={match} ids={match.team_a} playerById={playerById} currentUserId={userId} readyUsers={readyUsers} mvpIds={mvpIds} onReport={canReport ? (target) => setDialog({ kind: "report", target }) : null} />
        <div aria-hidden className="flex items-center justify-center lg:pt-16">
          <span className="font-display text-5xl font-black italic leading-none text-outline">VS</span>
        </div>
        <TeamColumn team="B" match={match} ids={match.team_b} playerById={playerById} currentUserId={userId} readyUsers={readyUsers} mvpIds={mvpIds} onReport={canReport ? (target) => setDialog({ kind: "report", target }) : null} />
      </div>

      <ReasonDialog
        open={dialog?.kind === "arbitration"}
        onClose={() => setDialog(null)}
        title="Demander un arbitrage"
        intro="Un admin est prévenu et peut consulter le chat et les captures du match. Ajoute une capture si tu en as une."
        reasons={ARBITRATION_REASONS}
        submitLabel="Envoyer la demande"
        onSubmit={async ({ reason, details }) => {
          await api(`/cod/matches/${matchId}/arbitration`, { method: "POST", body: { reason, details } });
          await loadMe();
        }}
      />
      <ReasonDialog
        open={dialog?.kind === "report"}
        onClose={() => setDialog(null)}
        title={`Signaler ${dialog?.target?.username ?? "ce joueur"}`}
        intro="Ton signalement reste confidentiel : seule l'équipe SixSence le voit."
        reasons={REPORT_REASONS}
        submitLabel="Envoyer le signalement"
        onSubmit={({ reason, details }) =>
          api("/cod/reports", { method: "POST", body: { targetId: dialog?.target?.id, matchId, reason, details } })
        }
      />

      {/* --- Preuves (captures du tableau des scores) -------------------- */}
      {canProve || (proofs || []).length > 0 ? (
        <MatchProofs matchId={match.id} proofs={proofs || []} canUpload={canProve} currentUserId={userId} onUploaded={load} />
      ) : null}

      {/* --- Chat ----------------------------------------------------------- */}
      <MatchChat matchId={match.id} messages={messages || []} canWrite={Boolean(myTeam)} currentUserId={userId} />
    </div>
  );
}

/** Couleur par groupe du match : les membres d'un même groupe partagent la même marque. */
const GROUP_COLORS = ["#f1d77a", "#7dd3fc", "#c4b5fd", "#86efac", "#fca5a5", "#fdba74"];

/**
 * Vote du MVP : chaque joueur du match élit un autre joueur, pendant 24 h après la fin.
 * Tout le monde voit le décompte ; le plus élu du mois reçoit le badge « MVP du mois ».
 */
function MvpVote({ match, playerById, votes, myVote, userId, isPlayer, onVoted }) {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const open = match.completed_at && Date.now() - new Date(match.completed_at).getTime() < 24 * 3600 * 1000;
  const total = Object.values(votes).reduce((sum, count) => sum + count, 0);
  if (!open && total === 0) return null;

  async function vote(targetId) {
    setPending(targetId);
    setError(null);
    try {
      await api(`/cod/matches/${match.id}/mvp`, { method: "POST", body: { targetId } });
      await onVoted();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  const players = [...match.team_a, ...match.team_b];
  return (
    <TacticalCard cut={20} innerClassName="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Vote</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none">MVP du match</h2>
        </div>
        <p className="text-xs text-white/45">
          {open ? (isPlayer ? "Vote pour le meilleur joueur (pas toi), pendant 24 h." : "Les joueurs du match votent pendant 24 h.") : "Vote terminé."} {total} vote
          {total > 1 ? "s" : ""}
        </p>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {players.map((id) => {
          const player = playerById.get(id);
          const count = votes[id] ?? 0;
          const mine = myVote === id;
          const canVote = open && isPlayer && id !== userId;
          return (
            <li key={id}>
              <button
                type="button"
                disabled={!canVote || pending !== null}
                onClick={() => vote(id)}
                aria-pressed={mine}
                className={cn(
                  "flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors disabled:cursor-default",
                  mine ? "border-gold bg-gold/10" : "border-white/10 bg-white/[0.02]",
                  canVote && !mine && "hover:border-gold/50",
                )}
              >
                <Avatar src={player?.avatar_url} name={player?.username ?? "?"} size={30} />
                <span className="min-w-0 flex-1 truncate font-display text-base font-bold uppercase tracking-wide">
                  {player?.username ?? "Joueur"}
                  {id === userId ? <span className="ml-2 text-xs text-white/40">· Toi</span> : null}
                </span>
                {pending === id ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin text-gold" /> : null}
                {mine ? <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-gold">Ton vote</span> : null}
                <span className="w-8 text-right font-tech text-sm font-bold tabular-nums text-gold">{count || ""}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
    </TacticalCard>
  );
}

function TeamColumn({ team, match, ids, playerById, currentUserId, readyUsers = [], mvpIds = [], onReport = null }) {
  const groupMarks = new Map();
  for (const id of [...match.team_a, ...match.team_b]) {
    const group = match.groups?.[id];
    if (group && (match.group_sizes?.[id] ?? 1) > 1 && !groupMarks.has(group)) {
      groupMarks.set(group, GROUP_COLORS[groupMarks.size % GROUP_COLORS.length]);
    }
  }
  const won = match.status === "completed" && match.winner === team;
  const lost = match.status === "completed" && match.winner !== team;
  const known = ids.map((id) => playerById.get(id)).filter(Boolean);
  const average = known.length > 0 ? Math.round(known.reduce((sum, player) => sum + player.points, 0) / known.length) : null;

  return (
    <section aria-label={teamLabel(team)} className={cn("transition-opacity duration-500", lost && "opacity-60")}>
      <header className={cn("flex items-end justify-between border-b-2 pb-3", team === "A" ? "border-gold" : "border-white/70")}>
        <h2 className={cn("font-display text-4xl font-black uppercase leading-none", team === "A" ? "text-gold" : "text-white")}>
          {teamLabel(team)}
        </h2>
        <div className="flex items-center gap-3">
          {won ? <Chip tone="win">Victoire</Chip> : null}
          {average !== null ? <span className="font-tech text-xs uppercase tracking-[0.2em] text-white/45">Moy. {average} pts</span> : null}
        </div>
      </header>

      <ul className="mt-3 space-y-2">
        {ids.map((id, index) => {
          const player = playerById.get(id);
          const delta = match.points_changes?.[id];
          const isMe = id === currentUserId;
          const isHost = team === "A" && index === 0;
          const groupSize = match.group_sizes?.[id] ?? 1;
          const groupMark = groupSize > 1 ? groupMarks.get(match.groups?.[id]) : null;

          return (
            <li
              key={id}
              className={cn("flex items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-3 sm:px-4", isMe ? "border-gold bg-gold/8" : "border-white/10")}
            >
              <Avatar src={player?.avatar_url} name={player?.username ?? "?"} size={42} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  <Link href={`/cod/profile/${id}`} className="truncate font-display text-xl font-bold uppercase leading-none tracking-wide hover:text-gold">
                    {player?.username ?? "Joueur inconnu"}
                  </Link>
                  {isMe ? <Chip className="shrink-0">Toi</Chip> : null}
                  {groupMark ? (
                    <span
                      title={`Joue en groupe (${groupLabel(groupSize).toLowerCase()})`}
                      className="inline-flex shrink-0 items-center gap-1.5 border px-1.5 py-0.5 font-tech text-[10px] uppercase tracking-[0.16em]"
                      style={{ borderColor: groupMark, color: groupMark }}
                    >
                      <span aria-hidden className="h-1.5 w-1.5" style={{ background: groupMark }} />
                      {groupLabel(groupSize)}
                    </span>
                  ) : null}
                  {match.status === "ready_check" ? (
                    <Chip tone={readyUsers.includes(id) ? "win" : "neutral"} className="shrink-0">
                      {readyUsers.includes(id) ? "Prêt" : "En attente"}
                    </Chip>
                  ) : null}
                  {isHost ? (
                    <Chip tone="neutral" className="shrink-0">
                      Hôte
                    </Chip>
                  ) : null}
                  {mvpIds.includes(id) ? (
                    <Chip className="shrink-0">
                      <LuStar aria-hidden className="h-3 w-3" />
                      MVP
                    </Chip>
                  ) : null}
                </p>
                <p className="mt-1.5 truncate text-xs text-white/50">
                  {player?.activision_id ?? "Identifiant Activision non renseigné"}
                  {player?.platform ? ` · ${PLATFORM_LABEL[player.platform] ?? player.platform}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-tech text-base font-bold tabular-nums">{player?.points ?? "—"}</p>
                {typeof delta === "number" ? (
                  <p className={cn("font-tech text-xs font-bold tabular-nums", delta >= 0 ? "text-win" : "text-loss")}>{signed(delta)}</p>
                ) : (
                  <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/35">pts</p>
                )}
              </div>
              {onReport && !isMe ? (
                <button
                  type="button"
                  onClick={() => onReport({ id, username: player?.username ?? "ce joueur" })}
                  className="shrink-0 p-1.5 text-white/25 transition-colors hover:text-loss"
                  aria-label={`Signaler ${player?.username ?? "ce joueur"}`}
                  title="Signaler ce joueur"
                >
                  <LuFlag aria-hidden className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Chat du salon : lecture pour tous, écriture pour les joueurs du match. */
function MatchChat({ matchId, messages, canWrite, currentUserId }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages.length]);

  async function send(event) {
    event.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      await api(`/cod/matches/${matchId}/messages`, { method: "POST", body: { body } });
      setText("");
    } catch (caught) {
      setError(caught.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section aria-labelledby="titre-chat">
      <Eyebrow>Salon</Eyebrow>
      <h2 id="titre-chat" className="mt-3 font-display text-4xl font-black uppercase leading-none">
        Chat du match
      </h2>

      <TacticalCard cut={20} className="mt-6" innerClassName="flex flex-col">
        <div ref={listRef} className="max-h-[360px] min-h-[200px] space-y-3 overflow-y-auto p-5 sm:p-6">
          {messages.length === 0 ? (
            <p className="text-sm italic text-white/40">Le match a démarré — bonne chance à tous !</p>
          ) : (
            messages.map((message) => (
              <div key={message.id}>
                <p className="flex items-baseline gap-2">
                  <span className={cn("font-display text-base font-bold uppercase tracking-wide", message.user_id === currentUserId ? "text-gold" : "text-white")}>
                    {message.username}
                  </span>
                  <span className="font-tech text-[10px] text-white/35">
                    {new Date(message.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
                <p className="mt-0.5 break-words text-sm text-white/75">{message.body}</p>
              </div>
            ))
          )}
        </div>

        {canWrite ? (
          <form onSubmit={send} className="flex items-center gap-3 border-t border-white/10 p-4">
            <label htmlFor="message-chat" className="sr-only">
              Ton message
            </label>
            <input
              id="message-chat"
              value={text}
              maxLength={300}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ton message…"
              className="h-11 min-w-0 flex-1 border border-white/12 bg-ink px-3 text-sm text-white placeholder:text-white/35 focus:border-gold focus:outline-none"
            />
            <Button type="submit" size="sm" disabled={sending || !text.trim()} aria-label="Envoyer">
              {sending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuSend aria-hidden className="h-4 w-4" />}
              Envoyer
            </Button>
          </form>
        ) : (
          <p className="border-t border-white/10 p-4 text-xs text-white/45">Seuls les joueurs du match peuvent écrire.</p>
        )}
        {error ? <p className="px-4 pb-4 text-xs text-loss">{error}</p> : null}
      </TacticalCard>
    </section>
  );
}

/** Vérification « Prêt ? » : chaque joueur a une minute pour accepter. */
function ReadyCheckBlock({ match, isPlayer, iAmReady, pending, onAccept }) {
  const left = useCountdown(match.ready_deadline);
  const total = match.team_a.length + match.team_b.length;
  const accepted = (match.ready_users || []).length;

  return (
    <TacticalCard highlight cut={20} innerClassName="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-2xl font-black uppercase tracking-wide">
          {accepted} / {total} joueurs prêts
        </p>
        <p className="mt-1 text-sm text-white/60">
          Encore <span className="font-tech font-bold tabular-nums text-white">{Math.ceil(left)} s</span> pour accepter. Sans réponse de
          tous, le match est annulé et les absents reçoivent un avertissement.
        </p>
      </div>
      {isPlayer ? (
        iAmReady ? (
          <p className="inline-flex items-center gap-2 font-display text-xl font-bold uppercase tracking-[0.12em] text-win">
            <LuCheck aria-hidden className="h-5 w-5" />
            Tu es prêt
          </p>
        ) : (
          <Button size="lg" onClick={onAccept} disabled={pending || left <= 0}>
            {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuCheck aria-hidden className="h-5 w-5" />}
            Accepter le match
          </Button>
        )
      ) : null}
    </TacticalCard>
  );
}

const PROOF_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MAX_PROOF_BYTES = 5 * 1024 * 1024;

/**
 * Preuves du match : captures du tableau des scores, utiles en cas de contestation.
 * Le fichier part directement dans Supabase Storage (dossier <match>/<joueur>/),
 * puis le backend l'enregistre (5 captures maximum par joueur).
 */
function MatchProofs({ matchId, proofs, canUpload, currentUserId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const extension = PROOF_TYPES[file.type];
    if (!extension) return setError("Formats acceptés : PNG, JPEG ou WebP.");
    if (file.size > MAX_PROOF_BYTES) return setError("Image trop lourde : 5 Mo maximum.");

    setUploading(true);
    setError(null);
    try {
      const path = `${matchId}/${currentUserId}/${Date.now()}.${extension}`;
      const { error: storageError } = await supabase.storage.from("match-proofs").upload(path, file, { contentType: file.type });
      if (storageError) throw new Error("Envoi de l'image impossible. Réessaie dans un instant.");
      await api(`/cod/matches/${matchId}/proofs`, { method: "POST", body: { path } });
      await onUploaded();
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
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={upload}
            />
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuImagePlus aria-hidden className="h-4 w-4" />}
              Ajouter une capture
            </Button>
          </>
        ) : null}
      </div>
      {canUpload ? (
        <p className="mt-3 text-sm text-white/55">
          Une capture du tableau des scores en fin de partie permet à un administrateur de trancher en cas de contestation (PNG, JPEG ou
          WebP, 5 Mo max).
        </p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}

      {proofs.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {proofs.map((proof) => (
            <li key={proof.id}>
              <a href={proof.url} target="_blank" rel="noopener noreferrer" className="group block border border-white/10 bg-white/[0.03] hover:border-gold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={proof.url} alt={`Capture envoyée par ${proof.username}`} loading="lazy" className="aspect-video w-full object-cover" />
                <p className="truncate px-3 py-2 text-xs text-white/60 group-hover:text-white">
                  {proof.username} · {new Date(proof.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
