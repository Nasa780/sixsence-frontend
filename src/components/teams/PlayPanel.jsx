import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { LuBellRing, LuCheck, LuClock, LuLoaderCircle, LuPlus, LuSwords, LuUserRound, LuX } from "react-icons/lu";
import useCountdown from "../../hooks/useCountdown";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { cn } from "../../lib/cn";
import { alertTeamEvent, askNotificationPermission, unlockAudio } from "../../lib/notify";
import { rankFor, rankGradient } from "../../lib/ranks";
import { Avatar } from "../ui/Avatar";
import { Button, ButtonLink } from "../ui/Button";
import { Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";
import { TeamCrest } from "./TeamParts";

const clock = (seconds) => {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * Recherche d'un match de Division (page /cod/division) : le Leader compose l'équipe du match dans
 * l'effectif et lance la recherche (pas de « Prêt ? »). Comme le classé : 30 min au plus, « Toujours
 * là ? » 5 min avant l'arrêt (Leader ou joueur inscrit), alertes quand le match est trouvé ou la recherche
 * arrêtée. Affichage en face à face : ton équipe, le radar, l'adversaire anonyme jusqu'au match.
 */
export function PlayPanel({ team, isLeader }) {
  const router = useRouter();
  const [play, setPlay] = useState(null);
  const [roster, setRoster] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [match, setMatch] = useState(null);
  const [revealed, setRevealed] = useState(false);
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

  // Match en cours : l'adversaire est enfin connu (feuille de match).
  useEffect(() => {
    if (!play?.activeMatchId) {
      setMatch(null);
      return undefined;
    }
    let alive = true;
    api(`/teams/matches/${play.activeMatchId}`)
      .then((data) => alive && setMatch(data))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [play?.activeMatchId]);

  // Alertes, seulement sur un changement vu pendant la visite (pas au chargement de la page).
  useEffect(() => {
    if (!play) return undefined;
    const before = previous.current;
    previous.current = play;
    if (!before) return undefined;
    if (play.activeMatchId && !before.activeMatchId) {
      alertTeamEvent({ title: "Match de Division trouvé", body: "L'équipe adverse est trouvée : direction la feuille de match.", flash: "⚔️ MATCH TROUVÉ" });
      // L'adversaire se dévoile quelques secondes, puis la feuille de match s'ouvre.
      setRevealed(true);
      const timer = setTimeout(() => router.push(`/cod/equipes/match/${play.activeMatchId}`), 3500);
      return () => clearTimeout(timer);
    }
    if (play.queued?.warned && !before.queued?.warned) {
      alertTeamEvent({ title: "Toujours là ?", body: "Toujours aucun adversaire : confirme pour continuer la recherche.", flash: "⏳ TOUJOURS LÀ ?" });
    } else if (play.expiredAt && before.queued && !play.queued) {
      alertTeamEvent({ title: "Recherche arrêtée", body: "Personne n'a confirmé « Toujours là ? » : la recherche de l'équipe s'est arrêtée.", flash: "✖ RECHERCHE ARRÊTÉE" });
    }
    return undefined;
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
  // Joueurs du match : rien de choisi par défaut, sauf si l'effectif compte juste le bon nombre.
  const chosen = roster ?? (team.members.length === size ? team.members.map((member) => member.id) : []);
  const toggle = (id) => setRoster(chosen.includes(id) ? chosen.filter((x) => x !== id) : chosen.length < size ? [...chosen, id] : chosen);

  return (
    <DivisionLobby
      team={team}
      isLeader={isLeader}
      play={play}
      match={match}
      revealed={revealed}
      chosen={chosen}
      onToggle={toggle}
      now={now}
      stopLeft={stopLeft}
      pending={pending}
      error={error}
      onSearch={() => {
        unlockAudio();
        askNotificationPermission();
        act(() => api("/teams/me/queue", { method: "POST", body: { roster: chosen } }));
      }}
      onStop={() => act(() => api("/teams/me/queue", { method: "DELETE" }))}
      onStay={() => act(() => api("/teams/me/queue/stay", { method: "POST" }))}
    />
  );
}

/** Affichage du lobby (sans appel réseau) : composition, recherche, adversaire trouvé, match en cours. */
export function DivisionLobby({ team, isLeader, play, match, revealed, chosen, onToggle, now, stopLeft, pending, error, onSearch, onStop, onStay }) {
  const size = play.rosterSize;
  const byId = new Map(team.members.map((member) => [member.id, member]));
  const active = Boolean(play.activeMatchId);
  const searching = !active && Boolean(play.queued);
  const lineup = (searching ? play.queued.roster : active && match ? myRoster(match, team.id) : chosen).map((id) => byId.get(id) ?? { id, username: "Joueur" });
  const opponent = active && match ? (match.teamA?.id === team.id ? match.teamB : match.teamA) : null;
  const phase = active ? (revealed ? "found" : "live") : searching ? "searching" : "idle";
  const warnIn = searching ? (new Date(play.queued.expiresAt).getTime() - 5 * 60_000 - now) / 1000 : 0;

  return (
    <TacticalCard highlight cut={26} innerClassName="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-40 mask-fade" />
      {phase === "searching" ? <div aria-hidden className="absolute inset-x-0 top-0 h-px animate-scan bg-gold/60" /> : null}

      {/* Bandeau d'état */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
        <p className={cn("inline-flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.3em]", phase === "idle" ? "text-white/55" : "text-gold")}>
          {phase !== "idle" ? <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold" /> : null}
          {phase === "idle"
            ? `Division · BO3 ${size}v${size}`
            : phase === "searching"
              ? "Recherche en cours"
              : phase === "found"
                ? "Adversaire trouvé"
                : "Match en cours"}
        </p>
        {/* Équipes en recherche : badge lumineux qui pulse dès qu'une équipe attend, discret (gris, immobile) sinon. */}
        <p
          className={cn(
            "inline-flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.2em] transition-colors",
            play.teamsSearching > 0
              ? "clip-slant border border-gold/70 bg-gold/[0.12] px-3 py-1 text-gold shadow-[0_0_18px_color-mix(in_srgb,var(--color-gold)_35%,transparent)] [--slant:8px]"
              : "text-white/45",
          )}
        >
          {play.teamsSearching > 0 ? (
            <span aria-hidden className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
          ) : null}
          <span className={cn(play.teamsSearching > 0 && "font-bold text-white")}>{play.teamsSearching}</span>
          équipe{play.teamsSearching > 1 ? "s" : ""} en recherche
        </p>
      </div>

      {/* Face à face */}
      <div className="relative grid grid-cols-1 items-center gap-6 px-5 py-7 sm:px-7 md:grid-cols-[minmax(0,1fr)_9rem_minmax(0,1fr)]">
        <TeamColumn team={team} label={team.points != null ? `${team.points} pts` : null} players={lineup} size={size} editable={phase === "idle" && isLeader} onRemove={onToggle} />

        <div className="flex flex-col items-center justify-center gap-3 py-2">
          {phase === "searching" ? (
            <>
              <span className="font-display text-5xl font-black leading-none text-gold">VS</span>
              <span aria-hidden className="flex h-5 items-end gap-0.5">
                {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                  <span key={bar} className="lobby-eq block w-1 bg-gold/70" style={{ animationDelay: `${bar * 0.11}s` }} />
                ))}
              </span>
              <p className="font-display text-4xl font-black leading-none tabular-nums">{clock((now - new Date(play.queued.since).getTime()) / 1000)}</p>
            </>
          ) : (
            <span className={cn("font-display text-6xl font-black leading-none", phase === "idle" ? "text-white/20" : "text-gold-gradient")}>VS</span>
          )}
        </div>

        <OpponentColumn opponent={opponent} phase={phase} size={size} />
      </div>

      {/* Actions et messages */}
      <div className="relative space-y-4 border-t border-white/10 px-5 pb-9 pt-5 sm:px-7">
        {play.blockedUntil && phase === "idle" ? (
          <Notice tone="error">
            Trop de forfaits ces derniers jours : l&apos;équipe ne peut pas lancer de recherche avant le{" "}
            {new Date(play.blockedUntil).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" })}.
          </Notice>
        ) : null}
        {play.expiredAt && phase === "idle" ? <Notice tone="error">Recherche arrêtée : personne n&apos;a répondu à « Toujours là ? ». Relance-la quand l&apos;équipe est prête.</Notice> : null}

        {phase === "searching" && play.queued.warned ? (
          <div role="alert" className="flex flex-col gap-4 border border-gold/50 bg-gold/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <LuBellRing aria-hidden className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-gold" />
              <div>
                <p className="font-display text-2xl font-black uppercase leading-none text-gold">Toujours là ?</p>
                <p className="mt-1.5 text-sm text-white/70">
                  Il reste <span className="font-tech font-bold tabular-nums text-white">{clock(stopLeft)}</span> à un Leader ou un joueur inscrit pour cliquer sur « Continuer ».
                </p>
              </div>
            </div>
            {play.queued.canStay ? (
              <Button onClick={onStay} disabled={pending} className="shrink-0">
                {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
                Continuer
              </Button>
            ) : null}
          </div>
        ) : null}

        {phase === "idle" && isLeader ? <RosterPicker members={team.members} chosen={chosen} size={size} onToggle={onToggle} /> : null}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="flex max-w-md items-start gap-2 text-xs leading-relaxed text-white/50">
            <LuClock aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/80" />
            {phase === "searching" && !play.queued.warned ? (
              <span>
                Sans adversaire après <span className="font-tech font-bold tabular-nums text-white/80">{clock(warnIn)}</span>, on demandera si l&apos;équipe est toujours là. Garde
                la page ouverte : un son et une notification te préviennent.
              </span>
            ) : phase === "idle" ? (
              <span>3 maps tirées au sort (la 3e seulement à 1-1) · 6 manches gagnantes par map · pas deux fois la même équipe en 2 h.</span>
            ) : phase === "found" ? (
              <span>Ouverture de la feuille de match…</span>
            ) : phase === "live" ? (
              <span>Code de la partie et résultat : tout se passe sur la feuille de match.</span>
            ) : (
              <span>Garde la page ouverte : un son et une notification te préviennent.</span>
            )}
          </p>
          {phase === "idle" ? (
            isLeader ? (
              <Button size="lg" disabled={pending || chosen.length !== size || Boolean(play.blockedUntil)} onClick={onSearch}>
                {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuSwords aria-hidden className="h-5 w-5" />}
                {chosen.length === size ? "Lancer la recherche" : `Choisis ${size - chosen.length} joueur${size - chosen.length > 1 ? "s" : ""}`}
              </Button>
            ) : (
              <p className="font-display text-lg font-bold uppercase tracking-wide text-white/60">En attente d&apos;un Leader</p>
            )
          ) : phase === "searching" ? (
            isLeader ? (
              <Button variant="danger" disabled={pending} onClick={onStop}>
                <LuX aria-hidden className="h-5 w-5" />
                Arrêter
              </Button>
            ) : null
          ) : (
            <ButtonLink href={`/cod/equipes/match/${play.activeMatchId}`} size="lg">
              <LuSwords aria-hidden className="h-5 w-5" />
              Feuille de match
            </ButtonLink>
          )}
        </div>
        {error ? <Notice tone="error">{error}</Notice> : null}
      </div>
    </TacticalCard>
  );
}

function myRoster(match, teamId) {
  return match.teamA?.id === teamId ? match.rosterA : match.rosterB;
}

/** Colonne de ton équipe : blason, nom, emplacements des joueurs du match. */
function TeamColumn({ team, label, players, size, editable, onRemove }) {
  const slots = Array.from({ length: size }, (_, index) => players[index] ?? null);
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        <TeamCrest team={team} size={52} />
        <div className="min-w-0">
          <p className="truncate font-display text-2xl font-black uppercase leading-none sm:text-3xl">{team.name}</p>
          <p className="mt-1 font-tech text-xs uppercase tracking-[0.2em] text-gold">
            <span className="normal-case">[{team.tag}]</span>{label ? ` · ${label}` : ""}
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {slots.map((player, index) => (
          <li key={player?.id ?? `vide-${index}`}>
            {player ? (
              <PlayerSlot player={player} onRemove={editable ? () => onRemove(player.id) : null} />
            ) : (
              <div className="flex h-11 items-center gap-3 border border-dashed border-white/15 px-3 text-sm text-white/35">
                <LuPlus aria-hidden className="h-4 w-4" />
                Joueur {index + 1}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayerSlot({ player, onRemove }) {
  const rank = rankFor(player.points ?? 0);
  return (
    <div className="flex h-11 items-center gap-3 border-l-2 border-gold bg-gold/[0.07] px-3">
      <Avatar src={player.avatarUrl} name={player.username} size={28} ring={rankGradient(rank, 160)} />
      <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase leading-none" style={{ color: rank.text }}>
        {player.username}
      </span>
      {onRemove ? (
        <button type="button" onClick={onRemove} className="p-1 text-white/40 transition-colors hover:text-loss" aria-label={`Retirer ${player.username}`}>
          <LuX aria-hidden className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

/**
 * Colonne adverse, façon transmission radio. Recherche : « Canal 06 », « Recherche de contact… » qui
 * s'écrit, barres de signal dans chaque emplacement. Révélation : « Contact établi », le nom adverse
 * s'écrit lettre par lettre.
 */
function OpponentColumn({ opponent, phase, size }) {
  const known = Boolean(opponent);
  const searching = phase === "searching";
  const reveal = phase === "found";

  const title = searching ? (
    "Canal 06"
  ) : reveal && known ? (
    <span className="lobby-type lobby-type-once" style={{ "--chars": `${opponent.name.length}ch`, "--steps": opponent.name.length }}>
      {opponent.name}
    </span>
  ) : known ? (
    opponent.name
  ) : (
    "Adversaire"
  );
  const subtitle = searching ? (
    <span className="lobby-type" style={{ "--chars": "22ch", "--steps": 22 }}>
      Recherche de contact…
    </span>
  ) : reveal && known ? (
    <span className="lobby-flash text-gold">Contact établi · <span className="normal-case">[{opponent.tag}]</span></span>
  ) : known ? (
    <span className="normal-case">[{opponent.tag}]</span>
  ) : (
    "Anonyme jusqu'au match"
  );

  return (
    <div className="relative min-w-0 md:text-right">
      <div className="flex items-center gap-3 md:flex-row-reverse">
        {known ? (
          <TeamCrest team={opponent} size={52} />
        ) : (
          <span className={cn("grid h-[52px] w-[52px] shrink-0 place-items-center border border-dashed font-display text-2xl font-black", searching ? "animate-pulse border-gold/60 text-gold" : "border-white/20 text-white/30")}>
            ?
          </span>
        )}
        <div className="min-w-0">
          <p className={cn("truncate font-display text-2xl font-black uppercase leading-none sm:text-3xl", !known && (searching ? "text-gold/80" : "text-white/35"))}>{title}</p>
          <p className="mt-1 font-tech text-xs uppercase tracking-[0.2em] text-white/40">{subtitle}</p>
        </div>
      </div>
      <ul className="mt-4 space-y-1.5">
        {Array.from({ length: size }, (_, index) => (
          <li key={index}>
            <div className={cn("flex h-11 items-center gap-3 border px-3 md:flex-row-reverse", known ? "border-white/15 bg-white/[0.04]" : "border-dashed border-white/10")}>
              {searching ? (
                <span aria-hidden className="flex h-6 items-end gap-0.5">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <span key={bar} className="lobby-eq block w-1 bg-gold/70" style={{ animationDelay: `${(index * 5 + bar) * 0.09}s` }} />
                  ))}
                </span>
              ) : (
                <LuUserRound aria-hidden className={cn("h-4 w-4", known ? "text-white/60" : "text-white/20")} />
              )}
              <span className={cn("font-tech text-xs uppercase tracking-[0.3em]", known ? "text-white/60" : "text-white/20")}>{known ? "Prêt" : "???"}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Choix des joueurs du match dans l'effectif (Leader, avant la recherche). */
function RosterPicker({ members, chosen, size, onToggle }) {
  return (
    <div>
      <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
        Effectif · choisis {size} joueur{size > 1 ? "s" : ""} ({chosen.length} / {size})
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {members.map((member) => {
          const selected = chosen.includes(member.id);
          const rank = rankFor(member.points ?? 0);
          return (
            <li key={member.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onToggle(member.id)}
                disabled={!selected && chosen.length >= size}
                className={cn(
                  "clip-slant flex items-center gap-2 px-3 py-2 transition",
                  selected ? "bg-gold text-ink" : "bg-white/[0.06] text-white/80 hover:bg-white/[0.12] disabled:opacity-35",
                )}
              >
                <Avatar src={member.avatarUrl} name={member.username} size={22} ring={selected ? null : rankGradient(rank, 160)} />
                <span className="font-display text-sm font-bold uppercase tracking-wide">{member.username}</span>
                {selected ? <LuCheck aria-hidden className="h-3.5 w-3.5" /> : null}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-white/40">
        Gère l&apos;effectif depuis{" "}
        <Link href="/cod/equipe" className="underline underline-offset-4 hover:text-gold">
          Mon équipe
        </Link>
        .
      </p>
    </div>
  );
}
