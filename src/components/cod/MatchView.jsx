import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuCheck, LuCrown, LuFlag, LuImagePlus, LuLoaderCircle, LuLock, LuMap, LuRotateCcw, LuSend, LuShieldAlert, LuStar, LuSwords, LuX } from "react-icons/lu";
import useCountdown from "../../hooks/useCountdown";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { api } from "../../lib/api";
import { READY_REQUIRED } from "../../lib/config";
import { cn } from "../../lib/cn";
import { ARBITRATION_REASONS, REPORT_REASONS } from "../../lib/moderation";
import { groupLabel, rankFor, rankGradient } from "../../lib/ranks";
import { isReferee } from "../../lib/roles";
import { supabase } from "../../lib/supabase";
import useTeamTags from "../../hooks/useTeamTags";
import { TeamTag } from "../teams/TeamParts";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Chip, EmptyState, Loading, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ReasonDialog } from "../ui/ReasonDialog";
import { MatchRulesCard } from "./MatchRules";
import { PointsAtStake } from "./PointsAtStake";
import { ReadyCheckOverlay } from "./QueuePanel";
import { RequeueCard } from "./RequeueCard";
import { mapImage } from "../../lib/maps";
import { signInWithDiscord } from "../../lib/auth";
import { RankEmblem } from "./RankEmblem";
import { RankUpOverlay } from "./RankUpOverlay";
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

const signed = (value) => (value > 0 ? `+${value}` : value === 0 ? "±0" : `${value}`);
const teamLabel = (team) => (team === "A" ? "Équipe 1" : "Équipe 2");
/** Durée lisible : « 23 h 41 », « 45 min ». */
const formatHours = (hours) => {
  const minutes = Math.max(0, Math.floor(hours * 60));
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`;
};

/**
 * Correction d'un match terminé par l'équipe (mauvais clic, erreur de déclaration) : inverser le
 * vainqueur ou annuler, motif obligatoire, confirmation avec les points du match.
 */
function CorrectionPanel({ match, hoursSinceEnd, isAdmin, onCorrect, playerById }) {
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(null); // "swap" | "cancel"
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const late = hoursSinceEnd >= 48;
  const newWinner = match.winner === "A" ? "B" : "A";
  const names = (ids) => ids.map((id) => playerById.get(id)?.username ?? "?").join(", ");
  const teamOf = (userId) => (match.team_a.includes(userId) ? "A" : "B");
  // Demandes de correction ou d'arbitrage encore ouvertes pour ce match.
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    api(`/admin/arbitrations?status=open&match=${match.id}`)
      .then((data) => setRequests(data.items ?? []))
      .catch(() => setRequests([]));
  }, [match.id]);

  function ask(action) {
    if (reason.trim().length < 3) return setError("Indique un motif (au moins 3 caractères).");
    setError(null);
    setConfirm(action);
  }

  async function run() {
    setPending(true);
    try {
      await onCorrect(confirm, reason.trim());
      setConfirm(null);
      setReason("");
    } catch (caught) {
      setError(caught.message);
      setConfirm(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 border-t border-white/10 pt-4">
      <div className="flex items-start gap-3">
        <LuShieldAlert aria-hidden className="mt-1 h-6 w-6 shrink-0 text-gold" />
        <div>
          <p className="font-display text-2xl font-black uppercase leading-none">Corriger le résultat</p>
          <p className="mt-1 text-sm text-white/55">
            Validé il y a {formatHours(hoursSinceEnd)} ·{" "}
            {late ? (isAdmin ? "hors délai (48 h) : correction réservée à l'admin" : "délai dépassé") : `correction possible encore ${formatHours(48 - hoursSinceEnd)}`}
          </p>
        </div>
      </div>
      {requests.length > 0 ? (
        <ul className="space-y-2">
          {requests.map((request) => (
            <li key={request.id} className="border-l-2 border-loss/60 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
              <p>
                <span className="font-semibold text-white">{request.user_name ?? "Un joueur"}</span>{" "}
                <span className="text-white/40">
                  ({teamLabel(teamOf(request.user_id)).toLowerCase()}, {teamOf(request.user_id) === match.winner ? "gagnante" : "perdante"})
                </span>{" "}
                · <span className="text-gold">{request.reason_label}</span>
              </p>
              {request.details ? <p className="mt-1 text-white/55">« {request.details} »</p> : null}
              <button
                type="button"
                onClick={() => setReason(`${request.reason_label}${request.details ? ` : ${request.details}` : ""}`.slice(0, 500))}
                className="mt-1 text-xs text-gold underline underline-offset-4 hover:text-gold-light"
              >
                Reprendre comme motif
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <label className="block">
        <span className="mb-1.5 block text-xs uppercase tracking-[0.2em] text-white/50">Motif (obligatoire)</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Ex. : mauvais clic, l'équipe 1 a gagné 6-3 (capture dans les preuves)."
          className="w-full resize-y border border-white/15 bg-ink-800 px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold/60 focus:outline-none"
        />
      </label>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => ask("swap")} disabled={pending}>
          <LuRotateCcw aria-hidden className="h-5 w-5" />
          Inverser le vainqueur
        </Button>
        <Button variant="danger" onClick={() => ask("cancel")} disabled={pending}>
          <LuX aria-hidden className="h-5 w-5" />
          Annuler le match
        </Button>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        pending={pending}
        tone={confirm === "cancel" ? "danger" : "gold"}
        title={confirm === "cancel" ? "Annuler le match ?" : "Inverser le vainqueur ?"}
        confirmLabel={confirm === "cancel" ? "Annuler le match" : "Inverser"}
        onConfirm={run}
      >
        {confirm === "swap" ? (
          <p>
            La victoire passe à l&apos;<strong className="font-semibold text-gold">{teamLabel(newWinner).toLowerCase()}</strong> (
            {names(newWinner === "A" ? match.team_a : match.team_b)}). Les points du match sont retirés puis recalculés.
          </p>
        ) : (
          <p>Les points, victoires et défaites du match sont rendus à tous les joueurs.</p>
        )}
        <ul className="grid grid-cols-1 gap-1 font-tech text-xs sm:grid-cols-2">
          {[...match.team_a, ...match.team_b].map((id) => (
            <li key={id}>
              {playerById.get(id)?.username ?? "?"} : {signed(match.points_changes?.[id] ?? 0)} annulé
            </li>
          ))}
        </ul>
        <p className="text-white/50">Motif : {reason.trim()}</p>
        <p>Les joueurs sont prévenus (message privé) et l&apos;équipe en garde une trace.</p>
      </ConfirmDialog>
    </div>
  );
}

/**
 * Salon de match : carte, mode, les deux équipes, le chat, et les actions selon l'état.
 *
 * Cycle de vie d'un match :
 *   « Prêt ? » (1 min) -> en cours -> un joueur déclare le vainqueur -> l'équipe adverse confirme -> terminé (points mis à jour)
 *                                              -> ou conteste -> un admin tranche
 *
 * Tout le monde peut regarder le match ; le chat et les captures sont réservés à ses
 * joueurs et aux admins (privateAccess, renvoyé par le backend). Seuls les joueurs agissent.
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
  const [dialog, setDialog] = useState(null); // { kind: "arbitration" } | { kind: "report", target } | { kind: "confirm", … }

  const loadMe = useCallback(async () => {
    try {
      setMe(await api(`/cod/matches/${matchId}/me`));
    } catch {
      // Sans importance : ces informations ne servent qu'à l'affichage.
    }
  }, [matchId]);

  // Rechargé quand le joueur se connecte : le chat et les captures dépendent de qui regarde.
  const load = useCallback(async () => {
    try {
      setData(await api(`/cod/matches/${matchId}`));
    } catch (caught) {
      if (caught.status === 404 || caught.status === 400) setNotFound(true);
      else setError(caught.message);
    }
  }, [matchId, userId]);

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

  // Match annulé (absent au « Prêt ? », match abandonné, arbitre) : les joueurs du match repartent vers la file au lieu
  // de rester sur une feuille annulée. Absent au « Prêt ? » : les joueurs prêts y sont déjà remis en tête ; sinon la
  // recherche est relancée dans le même format (?rejoindre=). Seulement juste après l'annulation (vue en direct ou
  // il y a moins de 2 min), pas en relisant un vieux match.
  const router = useRouter();
  const previousStatus = useRef(null);
  useEffect(() => {
    const current = data?.match;
    if (!current) return;
    const before = previousStatus.current;
    previousStatus.current = current.status;
    const mine = current.team_a.includes(userId) || current.team_b.includes(userId);
    if (!mine || current.status !== "cancelled") return;
    const at = current.cancel_reason === "ready_check_failed" ? current.ready_deadline : current.completed_at;
    const recent = at && Date.now() - new Date(at).getTime() < 2 * 60_000;
    const live = before && before !== "cancelled";
    if (!live && !recent) return;
    router.replace(current.cancel_reason === "ready_check_failed" ? "/cod/ranked" : `/cod/ranked?rejoindre=${encodeURIComponent(current.format || "auto")}`);
  }, [data?.match, userId, router]);

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

  const { match, messages, proofs, privateAccess } = data;
  const myTeam = match.team_a.includes(userId) ? "A" : match.team_b.includes(userId) ? "B" : null;
  const reporterTeam = match.reported_by ? (match.team_a.includes(match.reported_by) ? "A" : "B") : null;
  const reporterName = match.reported_by ? playerById.get(match.reported_by)?.username ?? "Un joueur" : "Un joueur";
  const hostName = playerById.get(match.team_a[0])?.username ?? "L'hôte";
  // Pas d'arbitrage de son propre match : un arbitre qui joue déclare le résultat comme les autres (double validation).
  const canResolve = isReferee(user?.role) && !myTeam;
  const spinner = <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" />;
  const namesOf = (team) => (team === "A" ? match.team_a : match.team_b).map((id) => playerById.get(id)?.username ?? "?").join(", ");

  /**
   * Fenêtre de confirmation avant d'envoyer un résultat (évite les erreurs de clic) :
   * déclaration (report), confirmation de l'équipe adverse (accept), arbitrage (resolve).
   */
  function askResult(kind, team) {
    const action = kind === "accept" ? "confirm" : kind;
    const body = kind === "accept" ? { accept: true } : { winner: team };
    const key = kind === "accept" ? "accept" : `${kind}-${team ?? "cancel"}`;
    setDialog({ kind: "confirm", result: kind, team, action, body, key });
  }
  const readyUsers = match.ready_users || [];
  // Correction d'un match terminé : demande du joueur pendant 24 h, correction par l'équipe pendant 48 h (admin sans limite).
  const hoursSinceEnd = match.completed_at ? (Date.now() - new Date(match.completed_at).getTime()) / 3_600_000 : Infinity;
  const canRequestCorrection = Boolean(myTeam) && match.status === "completed" && hoursSinceEnd < 24;
  const canCorrect = canResolve && match.status === "completed" && (user?.role === "admin" || hoursSinceEnd < 48);
  // Captures : pendant le match, et 24 h après la validation pour appuyer une demande de correction.
  const canProve = Boolean(myTeam) && (["in_progress", "awaiting_confirmation", "disputed"].includes(match.status) || canRequestCorrection);
  const canArbitrate = canProve;
  const canReport = Boolean(userId);
  const mvpVotes = data.mvpVotes || {};
  const mvpIds = mvpWinners(mvpVotes, data.mvpVotesFromOthers || {});

  return (
    <div className="space-y-8">
      {/* --- Bandeau : carte, mode, état ---------------------------------- */}
      {/* Avec l'image de la map : pas de lignes « holo » par-dessus (elles faisaient un filtre sur l'image). */}
      <TacticalCard highlight cut={28} innerClassName={cn(!mapImage(match.map) && "holo", "overflow-hidden p-6 sm:p-10")}>
        {/* La map du match en fond (ancienne map sans image : visuel Call of Duty). */}
        <div
          aria-hidden
          className={cn("absolute inset-0 bg-cover bg-center", mapImage(match.map) ? "opacity-40" : "opacity-15")}
          style={{ backgroundImage: `url('${mapImage(match.map) ?? "/images/call-of-duty-black-3840x2160-22670.jpg"}')` }}
        />
        {mapImage(match.map) ? <div aria-hidden className="absolute inset-0 bg-linear-to-r from-ink via-ink/70 to-ink/20" /> : null}
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

      {/* --- Promotion : écran de montée de rang, une fois par match ------- */}
      {match.status === "completed" && myTeam && playerById.get(userId) ? (
        <RankUpOverlay matchId={match.id} points={playerById.get(userId).points} delta={match.points_changes?.[userId]} completedAt={match.completed_at} />
      ) : null}

      {/* --- Points en jeu pour moi (avant la fin du match) ----------------- */}
      {myTeam && data.pointsAtStake?.[userId] ? (
        <div className="flex flex-col gap-3 border-l-2 border-gold bg-gold/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">En jeu pour toi</p>
          <PointsAtStake stake={data.pointsAtStake[userId]} />
        </div>
      ) : null}

      {/* --- Actions selon l'état ----------------------------------------- */}
      <div aria-live="polite" className="space-y-4">
        {error ? <Notice tone="error">{error}</Notice> : null}

        {/* Vérification « Prêt ? » : le même plein écran que la page de la file pour les joueurs du match
            (arrivés par la notification ou le message Discord), impossible à rater. */}
        {match.status === "ready_check" && myTeam ? (
          <ReadyCheckOverlay
            userId={userId}
            started={false}
            check={{
              matchId: match.id,
              format: match.format,
              map: match.map,
              mode: match.mode,
              deadline: match.ready_deadline,
              total: match.team_a.length + match.team_b.length,
              accepted: readyUsers.length,
              readyUsers,
              points: data.pointsAtStake?.[userId] ?? null,
            }}
          />
        ) : null}
        {match.status === "ready_check" ? (
          <ReadyCheckBlock
            signedIn={Boolean(userId)}
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
                <Button onClick={() => askResult("report", "A")} disabled={pending !== null}>
                  {pending === "report-A" ? spinner : <LuSwords aria-hidden className="h-5 w-5" />}
                  Équipe 1
                </Button>
                <Button variant="outline" onClick={() => askResult("report", "B")} disabled={pending !== null}>
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
              l&apos;équipe adverse, le résultat est validé automatiquement après 15 minutes.
            </Notice>
            {myTeam && reporterTeam && myTeam !== reporterTeam ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => askResult("accept", match.reported_winner)} disabled={pending !== null}>
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
          <Notice tone="error">Le résultat a été contesté. Un arbitre SixSence va trancher : aucun point ne bouge d&apos;ici là.</Notice>
        ) : null}

        {/* Arbitrage (admin, staff, arbitre) : tant que le match est ouvert, pas seulement en cas de contestation. */}
        {["ready_check", "in_progress", "awaiting_confirmation", "disputed"].includes(match.status) ? (
          <>
            {canResolve ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="font-display text-xl font-bold uppercase tracking-[0.12em] text-white/80 sm:mr-2">Arbitrage</p>
                <Button onClick={() => askResult("resolve", "A")} disabled={pending !== null}>
                  {pending === "resolve-A" ? spinner : null}
                  Victoire équipe 1
                </Button>
                <Button variant="outline" onClick={() => askResult("resolve", "B")} disabled={pending !== null}>
                  {pending === "resolve-B" ? spinner : null}
                  Victoire équipe 2
                </Button>
                <Button variant="danger" onClick={() => askResult("resolve", null)} disabled={pending !== null}>
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
          </div>
        ) : null}
        {match.status === "completed" && myTeam ? (
          <RequeueCard
            format={match.format}
            title={match.winner === myTeam ? "On enchaîne ?" : "Prends ta revanche"}
          />
        ) : null}

        {/* Annulé par l'équipe SixSence (arbitre) : personne n'est remis en file automatiquement, on propose de relancer. */}
        {match.status === "cancelled" && match.cancel_reason !== "ready_check_failed" && myTeam ? <RequeueCard format={match.format} title="On relance ?" /> : null}
        {match.status === "cancelled" ? (
          <Notice>
            {match.cancel_reason === "ready_check_failed"
              ? "Match annulé : tous les joueurs n'ont pas accepté à temps. Les joueurs prêts ont été remis automatiquement en tête de file."
              : "Ce match a été annulé : aucun point n'a été modifié."}
          </Notice>
        ) : null}

        {match.correction_action ? (
          <Notice>
            <strong className="font-semibold text-white">Résultat corrigé par l&apos;équipe SixSence</strong>
            {match.corrected_at
              ? ` le ${new Date(match.corrected_at).toLocaleString("fr-FR", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" })}`
              : ""}
            {match.correction_action === "cancel" ? " : match annulé, points rendus." : " : vainqueur inversé, points recalculés."}
            {match.correction_reason ? <span className="text-white/60"> Motif : {match.correction_reason}</span> : null}
          </Notice>
        ) : null}

        {/* Correction d'un match terminé par l'équipe (mauvais clic…). */}
        {canCorrect ? (
          <CorrectionPanel
            match={match}
            hoursSinceEnd={hoursSinceEnd}
            isAdmin={user?.role === "admin"}
            onCorrect={async (action, reason) => {
              await api(`/cod/matches/${matchId}/correct`, { method: "POST", body: { action, reason } });
              await load();
            }}
            playerById={playerById}
          />
        ) : null}

        {/* Demande d'arbitrage : pendant le match, ou correction pendant 24 h après la validation. */}
        {canArbitrate ? (
          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/55">
              {canRequestCorrection
                ? `Le résultat est faux (mauvais clic, erreur de déclaration) ? Tu peux demander une correction pendant encore ${formatHours(24 - hoursSinceEnd)}.`
                : "Un problème pendant le match (triche, joueur absent, partie impossible…) ?"}
            </p>
            <Button variant="outline" size="sm" onClick={() => setDialog({ kind: "arbitration" })}>
              {canRequestCorrection ? <LuFlag aria-hidden className="h-4 w-4" /> : <LuShieldAlert aria-hidden className="h-4 w-4" />}
              {canRequestCorrection ? "Demander une correction" : "Demander un arbitrage"}
            </Button>
          </div>
        ) : null}
        {me.arbitrations.length > 0 ? (
          <ul className="space-y-2">
            {me.arbitrations.map((request) => (
              <li key={request.id} className="flex flex-wrap items-center gap-2 border-l-2 border-gold/40 bg-white/[0.03] px-3 py-2 text-sm text-white/70">
                <LuShieldAlert aria-hidden className="h-4 w-4 text-gold" />
                Ta demande « {ARBITRATION_REASONS[request.reason] ?? request.reason} » :
                <span className={cn("font-semibold", request.status === "open" ? "text-gold" : request.status === "resolved" ? "text-win" : "text-white/60")}>
                  {request.status === "open" ? "en attente d'un arbitre" : request.status === "resolved" ? "traitée" : "classée sans suite"}
                </span>
                {request.resolution ? <span className="text-white/50">— {request.resolution}</span> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* --- Vote du MVP (24 h après la fin du match) ---------------------- */}
      {match.status === "completed" ? (
        <MvpVote match={match} playerById={playerById} votes={mvpVotes} myVote={me.myVote} userId={userId} isPlayer={isPlayer} onVoted={() => Promise.all([load(), loadMe()])} />
      ) : null}

      {/* --- Les deux équipes --------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 pt-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        <TeamColumn team="A" match={match} ids={match.team_a} stakes={data.pointsAtStake} playerById={playerById} currentUserId={userId} readyUsers={readyUsers} mvpIds={mvpIds} onReport={canReport ? (target) => setDialog({ kind: "report", target }) : null} />
        <div aria-hidden className="flex items-center justify-center lg:pt-16">
          <span className="font-display text-5xl font-black italic leading-none text-outline">VS</span>
        </div>
        <TeamColumn team="B" match={match} ids={match.team_b} stakes={data.pointsAtStake} playerById={playerById} currentUserId={userId} readyUsers={readyUsers} mvpIds={mvpIds} onReport={canReport ? (target) => setDialog({ kind: "report", target }) : null} />
      </div>

      <ConfirmDialog
        open={dialog?.kind === "confirm"}
        onClose={() => setDialog(null)}
        pending={pending !== null}
        tone={dialog?.team === null ? "danger" : "gold"}
        title={dialog?.result === "accept" ? "Confirmer le résultat ?" : dialog?.team === null ? "Annuler le match ?" : "Déclarer le vainqueur ?"}
        confirmLabel={dialog?.result === "accept" ? "Oui, je confirme" : dialog?.team === null ? "Annuler le match" : "Oui, valider"}
        onConfirm={async () => {
          await act(dialog.action, dialog.body, dialog.key);
          setDialog(null);
        }}
      >
        {dialog?.team ? (
          <>
            <p>
              {dialog.result === "accept" ? "Tu confirmes la victoire de l'" : "Tu déclares la victoire de l'"}
              <strong className="font-semibold text-gold">{teamLabel(dialog.team).toLowerCase()}</strong> :
            </p>
            <p className="border-l-2 border-gold/50 pl-3 font-semibold text-white">{namesOf(dialog.team)}</p>
            <p>
              {dialog.result === "report"
                ? "L'équipe adverse devra confirmer (validation automatique après 15 minutes)."
                : "Les points seront appliqués tout de suite."}
            </p>
          </>
        ) : (
          <p>Aucun point ne sera appliqué et les joueurs seront prévenus.</p>
        )}
      </ConfirmDialog>
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

      {privateAccess ? (
        <>
          {/* --- Preuves (captures du tableau des scores) -------------------- */}
          {canProve || (proofs || []).length > 0 ? (
            <MatchProofs matchId={match.id} proofs={proofs || []} canUpload={canProve} currentUserId={userId} onUploaded={load} />
          ) : null}

          {/* --- Chat ----------------------------------------------------------- */}
          <MatchChat matchId={match.id} messages={messages || []} canWrite={Boolean(myTeam)} currentUserId={userId} />
        </>
      ) : (
        <TacticalCard cut={16} innerClassName="flex items-start gap-4 p-5 sm:p-6">
          <LuLock aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="font-display text-xl font-black uppercase leading-none">Salon privé</p>
            <p className="mt-2 text-sm text-white/55">
              Le chat et les captures de ce match sont réservés à ses joueurs et aux admins.
              {userId ? null : " Joueur de ce match ? Connecte-toi pour y accéder."}
            </p>
          </div>
        </TacticalCard>
      )}

      {/* --- Réglages de la partie privée, en bas : seulement pour l'équipe de l'hôte (équipe A, l'hôte en est le premier joueur). */}
      {match.status === "in_progress" && myTeam === "A" ? <MatchRulesCard bestOf={1} isHost={match.team_a[0] === userId} /> : null}
    </div>
  );
}

/** Couleur par groupe du match : les membres d'un même groupe partagent la même marque. */
const GROUP_COLORS = ["#f1d77a", "#7dd3fc", "#c4b5fd", "#86efac", "#fca5a5", "#fdba74"];

/**
 * MVP du match : le plus de votes ; à égalité, le plus de votes reçus des autres
 * joueurs (un vote pour soi compte moins) ; toujours à égalité, co-MVP.
 */
function mvpWinners(total, fromOthers) {
  const ids = Object.keys(total).filter((id) => total[id] > 0);
  if (ids.length === 0) return [];
  const best = Math.max(...ids.map((id) => total[id]));
  const tied = ids.filter((id) => total[id] === best);
  const bestOthers = Math.max(...tied.map((id) => fromOthers[id] ?? 0));
  return tied.filter((id) => (fromOthers[id] ?? 0) === bestOthers);
}

/**
 * Vote du MVP : chaque joueur du match élit un joueur de l'équipe gagnante (lui-même
 * compris), pendant 24 h après la fin. Le plus élu du mois reçoit le badge « MVP du mois ».
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

  // Seuls les joueurs de l'équipe gagnante peuvent être élus.
  const players = match.winner === "B" ? match.team_b : match.team_a;
  return (
    <TacticalCard cut={20} innerClassName="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Vote</Eyebrow>
          <h2 className="mt-2 font-display text-3xl font-black uppercase leading-none">MVP du match</h2>
        </div>
        <p className="text-xs text-white/45">
          {open
            ? isPlayer
              ? "Vote pour le meilleur joueur de l'équipe gagnante (toi compris), pendant 24 h."
              : "Les joueurs du match votent pendant 24 h."
            : "Vote terminé."}{" "}
          {total} vote
          {total > 1 ? "s" : ""}
        </p>
      </div>
      <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {players.map((id) => {
          const player = playerById.get(id);
          const count = votes[id] ?? 0;
          const mine = myVote === id;
          const canVote = open && isPlayer;
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

function TeamColumn({ team, match, ids, stakes = null, playerById, currentUserId, readyUsers = [], mvpIds = [], onReport = null }) {
  const teamTags = useTeamTags(ids);
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
          {average !== null ? <span className="font-tech text-xs uppercase tracking-[0.2em] text-white/45">Moy. {average} pts</span> : null}
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
              <Avatar src={player?.avatar_url} name={player?.username ?? "?"} size={42} ring={player ? rankGradient(rankFor(player.points), 160) : null} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2">
                  {player ? <RankEmblem rank={rankFor(player.points)} size={20} animated={false} /> : null}
                  <Link
                    href={`/cod/profile/${id}`}
                    className="truncate font-display text-xl font-bold uppercase leading-none tracking-wide hover:!text-gold"
                    style={player ? { color: rankFor(player.points).text } : undefined}
                  >
                    {player?.username ?? "Joueur inconnu"}
                  </Link>
                  <TeamTag team={teamTags.get(id)} />
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
                  {match.status === "ready_check" && READY_REQUIRED ? (
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
                  <p className={cn("font-tech text-xs font-bold tabular-nums", delta > 0 ? "text-win" : delta < 0 ? "text-loss" : "text-white/40")}>{signed(delta)}</p>
                ) : stakes?.[id] ? (
                  <p className="font-tech text-[11px] font-bold tabular-nums" title="Points en jeu : victoire / défaite">
                    <span className="text-win">+{stakes[id].win}</span>
                    <span className="text-white/30"> / </span>
                    <span className="text-loss">{stakes[id].loss > 0 ? `−${stakes[id].loss}` : "±0"}</span>
                  </p>
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

/** Vérification « Prêt ? » : chaque joueur a une minute pour accepter. */
function ReadyCheckBlock({ match, isPlayer, iAmReady, pending, onAccept, signedIn }) {
  const left = useCountdown(match.ready_deadline);
  const total = match.team_a.length + match.team_b.length;
  const accepted = (match.ready_users || []).length;

  // « Prêt ? » facultatif : seulement le compte à rebours, le match démarre tout seul.
  if (!READY_REQUIRED) {
    return (
      <TacticalCard highlight cut={20} innerClassName="p-6">
        <p className="font-display text-2xl font-black uppercase tracking-wide">
          Lancement dans <span className="font-tech tabular-nums text-gold">{Math.ceil(left)} s</span>
        </p>
        <p className="mt-1 text-sm text-white/60">Match trouvé : la partie démarre toute seule à la fin du compte à rebours. Prépare-toi et rejoins le vocal.</p>
      </TacticalCard>
    );
  }

  return (
    <TacticalCard highlight cut={20} innerClassName="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-2xl font-black uppercase tracking-wide">
          {accepted} / {total} joueurs prêts
        </p>
        <p className="mt-1 text-sm text-white/60">
          Encore <span className="font-tech font-bold tabular-nums text-white">{Math.ceil(left)} s</span> pour accepter. Sans réponse de
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
      ) : !signedIn ? (
        // Arrivé par un lien sans être connecté (navigateur de Discord, autre appareil) : connexion puis retour ici.
        <Button size="lg" onClick={() => signInWithDiscord(`/cod/match/${match.id}`)} disabled={left <= 0}>
          Se connecter pour accepter
        </Button>
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
