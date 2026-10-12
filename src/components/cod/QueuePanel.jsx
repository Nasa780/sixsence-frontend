import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { LuBan, LuBellRing, LuCheck, LuCrosshair, LuLoaderCircle, LuMap, LuUsers, LuVolume2, LuVolumeX, LuWifi, LuWifiOff, LuX } from "react-icons/lu";
import useCountdown from "../../hooks/useCountdown";
import useQueueSocket from "../../hooks/useQueueSocket";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import {
  alertMatchFound,
  askNotificationPermission,
  duckMatchAlarm,
  isSoundMuted,
  playStartSound,
  previewMatchSound,
  setSoundMuted,
  stopFlashTitle,
  stopMatchAlarm,
  unlockAudio,
} from "../../lib/notify";
import { groupLabel } from "../../lib/ranks";
import { Button, ButtonLink } from "../ui/Button";
import { Chip, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { AppPanel } from "./AppPanel";
import { PartyPanel } from "./PartyPanel";
import { Portal } from "../ui/Portal";

const FORMAT_KEY = "sixsence:format";

/**
 * Panneau de la file d'attente classée.
 *  - Une file par format (2v2, 3v3, 4v4, 5v5) : le joueur choisit la sienne.
 *  - On joue seul ou en groupe : le chef du groupe lance la recherche pour tous,
 *    le groupe n'est jamais séparé.
 *  - L'état (files, ma place, mon groupe) arrive en direct par WebSocket ;
 *    les actions passent par l'API REST du backend.
 *  - Match trouvé : musique + notification, puis vérification « Prêt ? » d'une minute.
 *    Tous prêts : la page du match s'ouvre. Délai dépassé : les groupes complets
 *    repartent en tête de file, les absents reçoivent un avertissement.
 *
 * profileComplete : faux tant que le joueur n'a pas renseigné son identifiant Activision.
 */
export function QueuePanel({ profileComplete, userId }) {
  const router = useRouter();
  const queue = useQueueSocket(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [chosen, setChosen] = useState(null);
  const elapsed = useElapsedSeconds(queue.inQueue ? queue.joinedAt : null);
  const banLeft = useCountdown(queue.bannedUntil);
  // Durée maximale de recherche : « Toujours là ? » 5 min avant l'arrêt (backend : COD_QUEUE_MAX_MINUTES).
  const stopLeft = useCountdown(queue.inQueue && queue.stillThere ? queue.expiresAt : null);
  // Sur téléphone, le serveur garde la place 30 min après la fermeture de l'appli (COD_MOBILE_GRACE_MINUTES).
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => setIsMobile(/Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent)), []);

  // Format retenu par le joueur (mémorisé d'une visite à l'autre).
  useEffect(() => {
    try {
      setChosen(window.localStorage.getItem(FORMAT_KEY));
    } catch {
      // Stockage indisponible : format par défaut.
    }
  }, []);

  // Match trouvé : alarme sonore et notification (une seule fois par match).
  const alerted = useRef(null);
  useEffect(() => {
    if (queue.readyCheck && alerted.current !== queue.readyCheck.matchId) {
      alerted.current = queue.readyCheck.matchId;
      alertMatchFound(queue.readyCheck);
    }
    if (!queue.readyCheck) stopMatchAlarm();
  }, [queue.readyCheck]);

  // L'alarme ne doit jamais survivre à la page.
  useEffect(() => () => stopMatchAlarm(), []);

  // Tous prêts : son de départ, puis direction le salon de match.
  useEffect(() => {
    if (!queue.started) return undefined;
    stopMatchAlarm();
    stopFlashTitle();
    playStartSound();
    const timer = setTimeout(() => router.push(`/cod/match/${queue.started}`), 1200);
    return () => clearTimeout(timer);
  }, [queue.started, router]);

  const party = queue.party;
  const isLeader = !party || party.leaderId === userId;
  // Format affiché : celui de ma file, sinon celui du groupe, sinon mon choix (5v5 par défaut).
  const selectedId =
    (queue.inQueue && queue.format) ||
    party?.format ||
    (queue.queues.some((item) => item.format === chosen) ? chosen : null) ||
    queue.queues.find((item) => item.format === "5v5")?.format ||
    queue.queues[0]?.format ||
    null;
  const selected = queue.queues.find((item) => item.format === selectedId) ?? null;

  /** Applique l'état renvoyé par l'API (même forme que le message « ready » du WebSocket). */
  function applyState(next) {
    queue.patch({
      queues: next.queues ?? queue.queues,
      inQueue: next.inQueue,
      format: next.format ?? null,
      groupSize: next.groupSize ?? 1,
      joinedAt: next.joinedAt,
      expiresAt: next.expiresAt ?? null,
      stillThere: Boolean(next.stillThere),
      activeMatchId: next.activeMatchId,
      bannedUntil: next.bannedUntil ?? null,
      party: next.party ?? null,
      aborted: null,
      notice: null,
    });
  }

  async function run(action) {
    setPending(true);
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  function toggleQueue() {
    if (!queue.inQueue) {
      askNotificationPermission();
      unlockAudio();
    }
    return run(async () => {
      const next = queue.inQueue
        ? await api("/cod/queue/leave", { method: "POST" })
        : await api("/cod/queue/join", { method: "POST", body: { format: selectedId } });
      applyState(next);
    });
  }

  /** « Rester en file » : confirme la présence, la place dans la file est conservée. */
  function stayInQueue() {
    return run(async () => applyState(await api("/cod/queue/stay", { method: "POST" })));
  }

  function chooseFormat(format) {
    if (format === selectedId) return;
    if (party) {
      run(async () => {
        const { party: updated } = await api("/cod/party/format", { method: "POST", body: { format } });
        queue.patch({ party: updated });
      });
      return;
    }
    setChosen(format);
    try {
      window.localStorage.setItem(FORMAT_KEY, format);
    } catch {
      // Sans importance.
    }
  }

  const connected = queue.status === "online";
  const size = selected?.size ?? 0;
  const needed = selected?.needed ?? 2;
  const slots = Array.from({ length: needed }, (_, index) => index < size);
  const banned = banLeft > 0;
  const hasActiveMatch = Boolean(queue.activeMatchId) && !queue.readyCheck && !queue.started;
  const groupSize = party ? party.members.length : 1;
  const tooBig = selected ? groupSize > selected.teamSize : false;
  const canJoin = connected && profileComplete && !hasActiveMatch && !banned && Boolean(selected) && isLeader && !tooBig;
  const canSwitch = !queue.inQueue && isLeader && !pending;

  return (
    <>
      <TacticalCard highlight={queue.inQueue} cut={28} innerClassName="holo overflow-hidden p-6 sm:p-10">
        <div aria-hidden className="absolute -right-10 top-0 h-full w-32 -skew-x-[24deg] bg-linear-to-b from-gold/12 to-transparent" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Chip tone={banned ? "loss" : queue.inQueue ? "gold" : "neutral"}>
              {queue.inQueue ? <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold" /> : null}
              {banned ? "Exclu temporairement" : queue.inQueue ? `Recherche ${queue.format ?? ""} en cours` : "Hors file"}
            </Chip>
            <ConnectionStatus status={queue.status} />
          </div>

          {/* Choix de la file : 2v2 à 5v5, avec le nombre de joueurs en attente. */}
          {queue.queues.length > 0 ? (
            <div role="tablist" aria-label="File classée" className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {queue.queues.map((item) => {
                const active = item.format === selectedId;
                const fits = groupSize <= item.teamSize;
                return (
                  <button
                    key={item.format}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    disabled={!active && (!canSwitch || !fits)}
                    onClick={() => chooseFormat(item.format)}
                    title={!fits ? `Ton groupe compte ${groupSize} joueurs : trop pour du ${item.format}.` : undefined}
                    className={cn(
                      "clip-slant flex items-baseline justify-between gap-3 px-5 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                      active ? "bg-gold text-ink" : "bg-white/[0.05] text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <span className="font-display text-2xl font-black uppercase leading-none">{item.label}</span>
                    <span className={cn("font-tech text-xs font-bold tabular-nums", active ? "text-ink/70" : "text-white/45")}>
                      {item.size}/{item.needed}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* Compteur de la file choisie : annoncé aux lecteurs d'écran à chaque changement. */}
          <div className="mt-8" aria-live="polite" aria-atomic="true">
            <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-white/45">Joueurs en file {selected ? `· ${selected.label}` : ""}</p>
            <p className="mt-2 font-display font-black leading-[0.8] tabular-nums">
              <span className={cn("text-8xl sm:text-9xl", size > 0 ? "text-gold-gradient" : "text-white/30")}>{String(size).padStart(2, "0")}</span>
              <span className="ml-2 text-4xl text-white/30 sm:text-5xl">/ {needed}</span>
            </p>
          </div>

          {/* Une case par place : elles se remplissent à mesure que la file grossit. */}
          <div aria-hidden className="mt-8 flex gap-1.5">
            {slots.map((filled, index) => (
              <span
                key={index}
                className={cn("h-3 flex-1 -skew-x-[18deg] transition-all duration-500", filled ? "bg-gold shadow-[0_0_12px_var(--color-gold)]" : "bg-white/10")}
              />
            ))}
          </div>

          <p className="mt-6 min-h-6 text-sm text-white/60">
            {queue.inQueue ? (
              <>
                En file {queue.groupSize > 1 ? `avec ton groupe (${groupLabel(queue.groupSize).toLowerCase()}) ` : ""}depuis{" "}
                <span className="font-tech font-bold tabular-nums text-white">{formatDuration(elapsed)}</span>.{" "}
                {isMobile
                  ? "Tu peux verrouiller ton téléphone ou changer d'appli : tu gardes ta place 30 min et une notification te prévient dès que ton match est trouvé."
                  : "Garde cette page ouverte (dans un autre onglet si tu veux) : un son et une notification te préviennent dès que ton match est trouvé."}
              </>
            ) : party && !isLeader ? (
              <>Tu es dans le groupe de {party.members.find((member) => member.isLeader)?.username ?? "ton chef"} : c&apos;est lui qui lance la recherche.</>
            ) : (
              <>
                Dès que {needed} joueurs sont en file, les équipes et la carte sont tirées au sort ; un groupe joue toujours dans la même équipe.
                Tu auras alors une minute pour accepter.
              </>
            )}
          </p>

          {queue.inQueue && queue.stillThere ? (
            <div role="alert" className="mt-6 flex flex-col gap-4 border border-gold/50 bg-gold/10 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <LuBellRing aria-hidden className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-gold" />
                <div>
                  <p className="font-display text-2xl font-black uppercase leading-none text-gold">Toujours là ?</p>
                  <p className="mt-1.5 text-sm text-white/70">
                    Aucun match pour l&apos;instant : {queue.groupSize > 1 ? "la recherche du groupe" : "ta recherche"} s&apos;arrête dans{" "}
                    <span className="font-tech font-bold tabular-nums text-white">{formatDuration(stopLeft)}</span>. Tu gardes ta place si tu restes.
                  </p>
                </div>
              </div>
              <Button onClick={stayInQueue} disabled={pending} className="shrink-0">
                {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
                Rester en file
              </Button>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {queue.inQueue ? (
              <Button variant="danger" size="lg" onClick={toggleQueue} disabled={pending}>
                {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuX aria-hidden className="h-5 w-5" />}
                {queue.groupSize > 1 ? "Annuler la recherche du groupe" : "Quitter la file"}
              </Button>
            ) : (
              <Button size="lg" onClick={toggleQueue} disabled={pending || !canJoin}>
                {pending ? (
                  <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" />
                ) : party ? (
                  <LuUsers aria-hidden className="h-5 w-5" />
                ) : (
                  <LuCrosshair aria-hidden className="h-5 w-5" />
                )}
                {party ? `Lancer la recherche · ${groupLabel(groupSize)}` : "Rejoindre la file"}
              </Button>
            )}
            <SoundControls />
          </div>

          <p className="mt-4 text-xs text-white/45">
            Barème : <span className="text-white/70">seul</span>, une défaite coûte 25 % de points en moins ;{" "}
            <span className="text-white/70">en groupe de 3 ou plus</span>, une victoire rapporte 26 points au lieu de 30.
          </p>

          {/* Ce qui empêche de jouer, du plus bloquant au moins bloquant. */}
          <div className="mt-6 space-y-3">
            {error ? <Notice tone="error">{error}</Notice> : null}
            {queue.notice ? <Notice>{queue.notice.message}</Notice> : null}

            {queue.aborted?.reason === "requeued" ? (
              <Notice tone="success">Un joueur n&apos;a pas accepté le match : {queue.groupSize > 1 ? "ton groupe est remis" : "tu es remis"} en tête de file.</Notice>
            ) : null}
            {queue.aborted?.reason === "released" ? (
              <Notice>Un membre de ton groupe n&apos;a pas accepté le match : la recherche du groupe est annulée. Relancez-la quand vous êtes prêts.</Notice>
            ) : null}
            {queue.aborted?.reason === "missed" ? (
              <Notice tone="error">
                Tu n&apos;as pas accepté le match à temps : avertissement enregistré.
                {queue.aborted.bannedUntil ? " Plusieurs avertissements en 24 h entraînent une exclusion temporaire de la file." : " Au prochain oubli dans les 24 h, tu seras exclu 15 minutes."}
              </Notice>
            ) : null}

            {banned ? (
              <Notice tone="error">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <LuBan aria-hidden className="h-4 w-4" />
                  Exclu de la file encore <span className="font-tech tabular-nums">{formatDuration(banLeft)}</span>
                </span>{" "}
                après des matchs non acceptés.{" "}
                <Link href="/reglement" className="underline underline-offset-4">
                  Voir le règlement
                </Link>
              </Notice>
            ) : null}

            {tooBig ? <Notice tone="error">Ton groupe compte {groupSize} joueurs : trop pour du {selected?.label}. Choisis une autre file.</Notice> : null}

            {hasActiveMatch ? (
              <Notice>
                Tu as un match en cours : termine-le avant de relancer une recherche.{" "}
                <Link href={`/cod/match/${queue.activeMatchId}`} className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
                  Ouvrir le match
                </Link>
              </Notice>
            ) : null}

            {!profileComplete ? (
              <Notice>
                Renseigne ton identifiant Activision pour que tes coéquipiers puissent t&apos;inviter.{" "}
                <Link href="/cod/profile" className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
                  Compléter mon profil
                </Link>
              </Notice>
            ) : null}

            {queue.status === "reconnecting" ? (
              <Notice>
                Connexion au serveur de jeu en cours. S&apos;il était en veille, son réveil peut prendre jusqu&apos;à une minute : reste sur la
                page, la connexion se rétablit toute seule.
              </Notice>
            ) : null}
          </div>
        </div>
      </TacticalCard>

      <PartyPanel
        party={party}
        userId={userId}
        format={selected}
        locked={queue.inQueue || hasActiveMatch}
        onChange={(updated) => queue.patch({ party: updated })}
      />

      <AppPanel />

      <Portal>
        <ReadyCheckOverlay check={queue.readyCheck} started={queue.started} userId={userId} />
      </Portal>
    </>
  );
}

/** « 1 min 05 s » à partir d'un nombre de secondes. */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  return minutes > 0 ? `${minutes} min ${rest} s` : `${total} s`;
}

/** Secondes écoulées depuis une date, rafraîchies chaque seconde. */
function useElapsedSeconds(since) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!since) return undefined;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [since]);
  return since ? Math.max(0, (now - new Date(since).getTime()) / 1000) : 0;
}

/** Couper / réactiver le son, et l'essayer (débloque aussi le son du navigateur). */
function SoundControls() {
  const [muted, setMuted] = useState(false);
  useEffect(() => setMuted(isSoundMuted()), []);

  function toggle() {
    setSoundMuted(!muted);
    setMuted(!muted);
  }

  function test() {
    previewMatchSound();
  }

  return (
    <div className="flex items-center gap-1 sm:ml-auto">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={!muted}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5",
          muted ? "text-white/45" : "text-white/75 hover:text-gold",
        )}
      >
        {muted ? <LuVolumeX aria-hidden className="h-4 w-4" /> : <LuVolume2 aria-hidden className="h-4 w-4" />}
        {muted ? "Son coupé" : "Son activé"}
      </button>
      <button type="button" onClick={test} className="px-3 py-2 text-sm text-white/55 underline-offset-4 transition-colors hover:text-gold hover:underline">
        Tester le son
      </button>
    </div>
  );
}

function ConnectionStatus({ status }) {
  const open = status === "online";
  const label = open ? "Temps réel connecté" : status === "reconnecting" ? "Reconnexion…" : "Connexion…";
  const Icon = open ? LuWifi : LuWifiOff;
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-xs", open ? "text-win" : "text-white/45")}>
      <Icon aria-hidden className="h-4 w-4" />
      {label}
    </span>
  );
}

/** Écran plein « Match trouvé » : une minute pour accepter. */
function ReadyCheckOverlay({ check, started, userId }) {
  const [accepting, setAccepting] = useState(false);
  const [acceptedByMe, setAcceptedByMe] = useState(false);
  const [error, setError] = useState(null);
  const left = useCountdown(check?.deadline);

  useEffect(() => {
    setAcceptedByMe(false);
    setError(null);
  }, [check?.matchId]);

  const mine = acceptedByMe || Boolean(check?.readyUsers?.includes(userId));
  const visible = Boolean(check) || Boolean(started);

  async function accept() {
    setAccepting(true);
    setError(null);
    try {
      await api(`/cod/matches/${check.matchId}/ready`, { method: "POST" });
      setAcceptedByMe(true);
      duckMatchAlarm();
      stopFlashTitle();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setAccepting(false);
    }
  }

  const total = check?.total ?? 0;
  const accepted = Math.max(check?.accepted ?? 0, mine ? 1 : 0);
  const progress = check?.deadline ? Math.min(100, (left / 60) * 100) : 0;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-label="Match trouvé"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-ink/95 px-4 backdrop-blur-md"
        >
          <div aria-hidden className="absolute inset-0 bg-grid mask-fade" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-gold)_22%,transparent),transparent_60%)]" />
          <motion.div
            aria-hidden
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-gold to-transparent"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl text-center"
          >
            {started ? (
              <>
                <p className="font-tech text-xs uppercase tracking-[0.4em] text-gold">Tout le monde est prêt</p>
                <p className="mt-4 font-display text-7xl font-black uppercase leading-[0.85] sm:text-9xl">
                  C&apos;est <span className="text-gold-gradient">parti</span>
                </p>
                <p className="mt-8 flex items-center justify-center gap-2.5 text-sm text-white/55">
                  <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin text-gold" />
                  Ouverture du salon de match…
                </p>
              </>
            ) : check ? (
              <>
                <p className="font-tech text-xs uppercase tracking-[0.4em] text-gold">Équipes formées{check.format ? ` · ${check.format}` : ""}</p>
                <p className="mt-4 font-display text-7xl font-black uppercase leading-[0.85] sm:text-9xl">
                  Match <span className="text-gold-gradient">trouvé</span>
                </p>
                <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-display text-2xl font-bold uppercase tracking-[0.14em] text-white/85">
                  <LuMap aria-hidden className="h-6 w-6 text-gold" />
                  {check.map}
                  <span aria-hidden className="text-white/25">/</span>
                  {check.mode}
                </p>

                {/* Compte à rebours */}
                <div className="mx-auto mt-8 max-w-md">
                  <p className="font-display text-6xl font-black tabular-nums leading-none" aria-live="polite">
                    {Math.ceil(left)}
                    <span className="ml-1 text-2xl text-white/40">s</span>
                  </p>
                  <div aria-hidden className="mt-3 h-1.5 w-full bg-white/10">
                    <div className={cn("h-full transition-[width] duration-300", left < 15 ? "bg-loss" : "bg-gold-sheen")} style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {/* Joueurs prêts */}
                <div aria-hidden className="mx-auto mt-6 flex max-w-md justify-center gap-1.5">
                  {Array.from({ length: total }, (_, index) => (
                    <span
                      key={index}
                      className={cn(
                        "h-3 flex-1 -skew-x-[18deg] transition-all duration-300",
                        index < accepted ? "bg-win shadow-[0_0_10px_var(--color-win)]" : "bg-white/12",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm text-white/60">
                  {accepted} / {total} joueur{total > 1 ? "s" : ""} prêt{accepted > 1 ? "s" : ""}
                </p>

                <div className="mt-8 flex justify-center">
                  {mine ? (
                    <p className="inline-flex items-center gap-2.5 font-display text-2xl font-bold uppercase tracking-[0.12em] text-win">
                      <LuCheck aria-hidden className="h-6 w-6" />
                      Prêt — en attente des autres
                    </p>
                  ) : (
                    <Button size="lg" onClick={accept} disabled={accepting || left <= 0}>
                      {accepting ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuCheck aria-hidden className="h-5 w-5" />}
                      Accepter le match
                    </Button>
                  )}
                </div>
                {error ? <p className="mt-4 text-sm text-loss">{error}</p> : null}
                <p className="mt-6 text-xs text-white/40">
                  Sans réponse dans la minute, tu es retiré de la file et un avertissement est enregistré.{" "}
                  <ButtonLink href="/reglement" variant="ghost" size="sm" className="align-baseline">
                    Règlement
                  </ButtonLink>
                </p>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
