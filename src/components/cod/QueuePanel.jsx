import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuCrosshair, LuLoaderCircle, LuMap, LuWifi, LuWifiOff, LuX } from "react-icons/lu";
import useQueueSocket from "../../hooks/useQueueSocket";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Button, ButtonLink } from "../ui/Button";
import { Chip, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

/** Délai avant de basculer vers la page du match, le temps de lire l'annonce. */
const MATCH_REDIRECT_MS = 3500;

/**
 * Panneau de la file d'attente classée.
 *  - L'état (joueurs en file, ma place) arrive en direct par WebSocket.
 *  - "Rejoindre" et "Quitter" passent par l'API REST du backend.
 *  - Quand un match est trouvé, une annonce plein écran s'affiche puis la page
 *    du match s'ouvre toute seule.
 *
 * profileComplete : faux tant que le joueur n'a pas renseigné son identifiant Activision.
 */
export function QueuePanel({ profileComplete }) {
  const router = useRouter();
  const queue = useQueueSocket(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const elapsed = useElapsedSeconds(queue.inQueue ? queue.joinedAt : null);

  // Match trouvé : on laisse l'annonce à l'écran quelques secondes, puis direction le match.
  const foundId = queue.matchFound?.matchId;
  useEffect(() => {
    if (!foundId) return undefined;
    const timer = setTimeout(() => router.push(`/cod/match/${foundId}`), MATCH_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [foundId, router]);

  async function toggleQueue() {
    setPending(true);
    setError(null);
    try {
      const next = await api(queue.inQueue ? "/cod/queue/leave" : "/cod/queue/join", { method: "POST" });
      queue.patch({ size: next.size, needed: next.needed, inQueue: next.inQueue, joinedAt: next.joinedAt, activeMatchId: next.activeMatchId });
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  const connected = queue.status === "online";
  const slots = Array.from({ length: queue.needed }, (_, index) => index < queue.size);
  const hasActiveMatch = Boolean(queue.activeMatchId) && !queue.matchFound;
  const canJoin = connected && profileComplete && !hasActiveMatch;

  return (
    <>
      <TacticalCard highlight={queue.inQueue} cut={28} innerClassName="holo overflow-hidden p-6 sm:p-10">
        <div aria-hidden className="absolute -right-10 top-0 h-full w-32 -skew-x-[24deg] bg-linear-to-b from-gold/12 to-transparent" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Chip tone={queue.inQueue ? "gold" : "neutral"}>
              {queue.inQueue ? <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold" /> : null}
              {queue.inQueue ? "Recherche en cours" : "Hors file"}
            </Chip>
            <ConnectionStatus status={queue.status} />
          </div>

          {/* Compteur : annoncé aux lecteurs d'écran à chaque changement. */}
          <div className="mt-8" aria-live="polite" aria-atomic="true">
            <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-white/45">Joueurs en file</p>
            <p className="mt-2 font-display font-black leading-[0.8] tabular-nums">
              <span className={cn("text-8xl sm:text-9xl", queue.size > 0 ? "text-gold-gradient" : "text-white/30")}>
                {String(queue.size).padStart(2, "0")}
              </span>
              <span className="ml-2 text-4xl text-white/30 sm:text-5xl">/ {queue.needed}</span>
            </p>
          </div>

          {/* Une case par place : elles se remplissent à mesure que la file grossit. */}
          <div aria-hidden className="mt-8 flex gap-1.5">
            {slots.map((filled, index) => (
              <span
                key={index}
                className={cn(
                  "h-3 flex-1 -skew-x-[18deg] transition-all duration-500",
                  filled ? "bg-gold shadow-[0_0_12px_var(--color-gold)]" : "bg-white/10",
                )}
              />
            ))}
          </div>

          <p className="mt-6 min-h-6 text-sm text-white/60">
            {queue.inQueue ? (
              <>
                En file depuis <span className="font-tech font-bold tabular-nums text-white">{formatDuration(elapsed)}</span>. Le match se
                lance dès que {queue.needed} joueurs sont réunis.
              </>
            ) : (
              <>Dès que {queue.needed} joueurs sont en file, les équipes et la carte sont tirées au sort.</>
            )}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {queue.inQueue ? (
              <Button variant="danger" size="lg" onClick={toggleQueue} disabled={pending}>
                {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuX aria-hidden className="h-5 w-5" />}
                Quitter la file
              </Button>
            ) : (
              <Button size="lg" onClick={toggleQueue} disabled={pending || !canJoin}>
                {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuCrosshair aria-hidden className="h-5 w-5" />}
                Rejoindre la file
              </Button>
            )}
          </div>

          {/* Ce qui empêche de jouer, du plus bloquant au moins bloquant. */}
          <div className="mt-6 space-y-3">
            {error ? <Notice tone="error">{error}</Notice> : null}

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
                Connexion au serveur de jeu en cours. S&apos;il était en veille, son réveil peut prendre jusqu&apos;à une minute :
                reste sur la page, la connexion se rétablit toute seule.
              </Notice>
            ) : null}
          </div>
        </div>
      </TacticalCard>

      <MatchFoundOverlay match={queue.matchFound} />
    </>
  );
}

/** « 1 min 05 s » à partir d'un nombre de secondes. */
function formatDuration(seconds) {
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const rest = String(total % 60).padStart(2, "0");
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

/** Annonce plein écran quand le match est trouvé. */
function MatchFoundOverlay({ match }) {
  return (
    <AnimatePresence>
      {match ? (
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
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.22),transparent_60%)]" />
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
            className="relative text-center"
          >
            <p className="font-tech text-xs uppercase tracking-[0.4em] text-gold">Équipes formées</p>
            <p className="mt-4 font-display text-7xl font-black uppercase leading-[0.85] sm:text-9xl">
              Match <span className="text-gold-gradient">trouvé</span>
            </p>
            <p className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-display text-2xl font-bold uppercase tracking-[0.14em] text-white/85">
              <LuMap aria-hidden className="h-6 w-6 text-gold" />
              {match.map}
              <span aria-hidden className="text-white/25">
                /
              </span>
              {match.mode}
            </p>
            <p className="mt-8 flex items-center justify-center gap-2.5 text-sm text-white/55">
              <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin text-gold" />
              Ouverture du salon de match…
            </p>
            <div className="mt-6 flex justify-center">
              <ButtonLink href={`/cod/match/${match.matchId}`} variant="outline" size="sm">
                Y aller maintenant
              </ButtonLink>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
