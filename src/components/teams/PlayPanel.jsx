import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuBellRing, LuCheck, LuClock, LuLoaderCircle, LuSwords, LuX } from "react-icons/lu";
import useCountdown from "../../hooks/useCountdown";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/cn";
import { alertTeamEvent, askNotificationPermission, unlockAudio } from "../../lib/notify";
import { rankFor, rankGradient } from "../../lib/ranks";
import { Avatar } from "../ui/Avatar";
import { Button, ButtonLink } from "../ui/Button";
import { Chip, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";

const clock = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * Bloc « Division » de Mon équipe : le Leader choisit les joueurs du match parmi l'effectif et lance
 * la recherche (pas de « Prêt ? »). Comme le classé : 30 min de recherche au plus, « Toujours là ? »
 * 5 min avant l'arrêt (un Leader répond), alerte quand le match est trouvé ou la
 * recherche arrêtée. L'adversaire reste anonyme jusqu'au match.
 */
export function PlayPanel({ team, isLeader }) {
  const router = useRouter();
  const [play, setPlay] = useState(null);
  const [roster, setRoster] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const previous = useRef(null);

  const load = useCallback(() => api("/teams/me/play").then(setPlay).catch(() => {}), []);

  // Match créé ou terminé pour l'équipe : mis à jour aussitôt (temps réel) ; la recherche toutes les 10 s.
  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    const channel = supabase
      .channel(`team-play-${team.id}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "team_matches", filter: `team_a=eq.${team.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "team_matches", filter: `team_b=eq.${team.id}` }, load)
      .subscribe();
    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [load, team.id]);

  useEffect(() => {
    if (!play?.queued) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [play?.queued]);

  // Alertes, seulement sur un changement vu pendant la visite (pas au chargement de la page).
  useEffect(() => {
    if (!play) return;
    const before = previous.current;
    previous.current = play;
    if (!before) return;
    if (play.activeMatchId && !before.activeMatchId) {
      alertTeamEvent({ title: "Match de Division trouvé", body: "L'équipe adverse est trouvée : direction la feuille de match.", flash: "⚔️ MATCH TROUVÉ" });
      router.push(`/cod/equipes/match/${play.activeMatchId}`);
    } else if (play.queued?.warned && !before.queued?.warned) {
      alertTeamEvent({ title: "Toujours là ?", body: "Toujours aucun adversaire : confirme pour continuer la recherche.", flash: "⏳ TOUJOURS LÀ ?" });
    } else if (play.expiredAt && before.queued && !play.queued) {
      alertTeamEvent({ title: "Recherche arrêtée", body: "Personne n'a confirmé « Toujours là ? » : la recherche de l'équipe s'est arrêtée.", flash: "✖ RECHERCHE ARRÊTÉE" });
    }
  }, [play, router]);

  const stopLeft = useCountdown(play?.queued?.warned ? play.queued.expiresAt : null);

  async function act(action) {
    setPending(true);
    setError(null);
    try {
      setPlay(await action());
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  if (!play) return null;
  const size = play.rosterSize;
  // Joueurs du match : rien de coché par défaut, sauf si l'effectif compte juste le bon nombre.
  const chosen = roster ?? (team.members.length === size ? team.members.map((member) => member.id) : []);
  const toggle = (id) => setRoster(chosen.includes(id) ? chosen.filter((x) => x !== id) : chosen.length < size ? [...chosen, id] : chosen);

  if (play.activeMatchId) {
    return (
      <TacticalCard highlight cut={24} innerClassName="holo overflow-hidden p-6 sm:p-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Eyebrow>Match de Division en cours</Eyebrow>
            <p className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">Ton équipe joue un BO3</p>
            <p className="mt-2 text-sm text-white/55">Chat, code de la partie, présence en jeu et scores : tout se passe sur la feuille de match.</p>
          </div>
          <ButtonLink href={`/cod/equipes/match/${play.activeMatchId}`} size="lg">
            <LuSwords aria-hidden className="h-5 w-5" />
            Feuille de match
          </ButtonLink>
        </div>
      </TacticalCard>
    );
  }

  if (play.queued) {
    const warned = play.queued.warned;
    const warnIn = (new Date(play.queued.expiresAt).getTime() - 5 * 60_000 - now) / 1000;
    return (
      <TacticalCard highlight cut={24} innerClassName="overflow-hidden p-6 sm:p-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-win">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-win" />
              Recherche en cours
            </p>
            <p className="mt-2 font-display text-5xl font-black leading-none tabular-nums">{clock((now - new Date(play.queued.since).getTime()) / 1000)}</p>
            <p className="mt-2 text-sm text-white/55">
              {play.teamsSearching} équipe{play.teamsSearching > 1 ? "s" : ""} en recherche · adversaire anonyme jusqu&apos;au match. Garde cette page ouverte : un son et une notification
              te préviennent.
            </p>
          </div>
          {isLeader ? (
            <Button variant="danger" disabled={pending} onClick={() => act(() => api("/teams/me/queue", { method: "DELETE" }))}>
              <LuX aria-hidden className="h-5 w-5" />
              Arrêter
            </Button>
          ) : null}
        </div>

        {warned ? (
          <div role="alert" className="mt-6 flex flex-col gap-4 border border-gold/50 bg-gold/10 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <LuBellRing aria-hidden className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-gold" />
              <div>
                <p className="font-display text-2xl font-black uppercase leading-none text-gold">Toujours là ?</p>
                <p className="mt-1.5 text-sm text-white/70">
                  Aucun adversaire pour l&apos;instant. Il reste <span className="font-tech font-bold tabular-nums text-white">{clock(stopLeft)}</span> à un Leader pour
                  cliquer sur « Continuer », sinon la recherche s&apos;arrêtera.
                </p>
              </div>
            </div>
            {isLeader ? (
              <Button onClick={() => act(() => api("/teams/me/queue/stay", { method: "POST" }))} disabled={pending} className="shrink-0">
                {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
                Continuer
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 flex items-start gap-2 text-xs text-white/50">
            <LuClock aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" />
            <span>
              Sans adversaire après <span className="font-tech font-bold tabular-nums text-white/80">{clock(warnIn)}</span>, on demandera aux Leaders si l&apos;équipe est toujours là
              (5 minutes pour répondre, sinon la recherche s&apos;arrête).
            </span>
          </p>
        )}
        {error ? <Notice tone="error" className="mt-4">{error}</Notice> : null}
      </TacticalCard>
    );
  }

  return (
    <TacticalCard highlight cut={24} innerClassName="p-6 sm:p-8">
      {play.expiredAt ? (
        <Notice tone="error" className="mb-5">
          Recherche arrêtée : personne n&apos;a répondu à « Toujours là ? ». Relance-la quand l&apos;équipe est prête.
        </Notice>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Division · BO3 {size}v{size}</Eyebrow>
          <p className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">Lancer un match</p>
        </div>
        <p className="text-sm text-white/55">
          {play.teamsSearching > 0 ? `${play.teamsSearching} équipe${play.teamsSearching > 1 ? "s" : ""} en recherche` : "Aucune équipe en recherche pour l'instant"}
        </p>
      </div>
      {isLeader ? (
        <>
          <p className="mt-5 font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
            Joueurs du match · {chosen.length} / {size}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {team.members.map((member) => {
              const selected = chosen.includes(member.id);
              const rank = rankFor(member.points ?? 0);
              return (
                <li key={member.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggle(member.id)}
                    className={cn(
                      "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition",
                      selected ? "border-gold bg-gold/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                    )}
                  >
                    <Avatar src={member.avatarUrl} name={member.username} size={34} ring={rankGradient(rank, 160)} />
                    <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase leading-none" style={{ color: rank.text }}>
                      {member.username}
                    </span>
                    {selected ? <Chip>Joue</Chip> : <Chip tone="neutral">—</Chip>}
                  </button>
                </li>
              );
            })}
          </ul>
          {error ? <Notice tone="error" className="mt-4">{error}</Notice> : null}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-white/45">Maps 1 et 2 tirées au sort, map 3 choisie à 1-1 · 6 manches gagnantes par map · pas deux fois la même équipe en 2 h.</p>
            <Button
              size="lg"
              disabled={pending || chosen.length !== size}
              onClick={() => {
                unlockAudio();
                askNotificationPermission();
                act(() => api("/teams/me/queue", { method: "POST", body: { roster: chosen } }));
              }}
            >
              {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuSwords aria-hidden className="h-5 w-5" />}
              Rechercher un match
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-white/55">Un Leader lance la recherche et choisit les joueurs du match.</p>
      )}
      <p className="mt-4 text-xs text-white/40">
        <Link href="/cod/equipes" className="underline underline-offset-4 hover:text-gold">
          Classement des équipes
        </Link>
      </p>
    </TacticalCard>
  );
}
