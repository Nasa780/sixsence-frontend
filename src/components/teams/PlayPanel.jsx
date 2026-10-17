import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuLoaderCircle, LuSwords, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { rankFor, rankGradient } from "../../lib/ranks";
import { Avatar } from "../ui/Avatar";
import { Button, ButtonLink } from "../ui/Button";
import { Chip, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";

const elapsed = (since, now) => {
  const seconds = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

/**
 * Bloc « Match team » de Mon équipe : le Leader choisit ses titulaires et lance la recherche
 * (pas de « Prêt ? ») ; dès qu'une autre équipe est trouvée, la feuille de match s'ouvre.
 */
export function PlayPanel({ team, isLeader }) {
  const [play, setPlay] = useState(null);
  const [roster, setRoster] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(() => api("/teams/me/play").then(setPlay).catch(() => {}), []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!play?.queued) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [play?.queued]);

  // Titulaires proposés par défaut : ceux de l'effectif (jusqu'au nombre demandé).
  useEffect(() => {
    if (!play || roster.length > 0) return;
    setRoster(team.members.filter((member) => member.starter).slice(0, play.rosterSize).map((member) => member.id));
  }, [play, team.members, roster.length]);

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
  const toggle = (id) => setRoster((current) => (current.includes(id) ? current.filter((x) => x !== id) : current.length < size ? [...current, id] : current));

  if (play.activeMatchId) {
    return (
      <TacticalCard highlight cut={24} innerClassName="holo overflow-hidden p-6 sm:p-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Eyebrow>Match team en cours</Eyebrow>
            <p className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">Ton équipe joue un BO3</p>
            <p className="mt-2 text-sm text-white/55">Déclare les scores et choisis la map 3 depuis la feuille de match.</p>
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
    return (
      <TacticalCard highlight cut={24} innerClassName="overflow-hidden p-6 sm:p-8">
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em] text-win">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-win" />
              Recherche en cours
            </p>
            <p className="mt-2 font-display text-5xl font-black leading-none tabular-nums">{elapsed(play.queued.since, now)}</p>
            <p className="mt-2 text-sm text-white/55">
              {play.teamsSearching} équipe{play.teamsSearching > 1 ? "s" : ""} en recherche · le match démarre dès qu&apos;une autre équipe est prête.
            </p>
          </div>
          {isLeader ? (
            <Button variant="danger" disabled={pending} onClick={() => act(() => api("/teams/me/queue", { method: "DELETE" }))}>
              <LuX aria-hidden className="h-5 w-5" />
              Arrêter
            </Button>
          ) : null}
        </div>
        {error ? <Notice tone="error" className="mt-4">{error}</Notice> : null}
      </TacticalCard>
    );
  }

  return (
    <TacticalCard highlight cut={24} innerClassName="p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Match team · BO3 {size}v{size}</Eyebrow>
          <p className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">Lancer un match</p>
        </div>
        <p className="text-sm text-white/55">
          {play.teamsSearching > 0 ? `${play.teamsSearching} équipe${play.teamsSearching > 1 ? "s" : ""} en recherche` : "Aucune équipe en recherche pour l'instant"}
        </p>
      </div>
      {isLeader ? (
        <>
          <p className="mt-5 font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
            Titulaires du match · {roster.length} / {size}
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {team.members.map((member) => {
              const selected = roster.includes(member.id);
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
                    {selected ? <Chip>Titulaire</Chip> : <Chip tone="neutral">—</Chip>}
                  </button>
                </li>
              );
            })}
          </ul>
          {error ? <Notice tone="error" className="mt-4">{error}</Notice> : null}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-white/45">Maps 1 et 2 tirées au sort, map 3 choisie à 1-1 · 6 manches gagnantes par map.</p>
            <Button size="lg" disabled={pending || roster.length !== size} onClick={() => act(() => api("/teams/me/queue", { method: "POST", body: { roster } }))}>
              {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuSwords aria-hidden className="h-5 w-5" />}
              Rechercher un match
            </Button>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-white/55">Un Leader lance la recherche et choisit les titulaires du match.</p>
      )}
      <p className="mt-4 text-xs text-white/40">
        <Link href="/cod/equipes" className="underline underline-offset-4 hover:text-gold">
          Classement des équipes
        </Link>
      </p>
    </TacticalCard>
  );
}
