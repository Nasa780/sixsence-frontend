import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuCheck, LuFlag, LuImage, LuLock, LuMedal, LuShare2 } from "react-icons/lu";
import useSeasons, { seasonBadge } from "../../hooks/useSeasons";
import useSession from "../../hooks/useSession";
import { api } from "../../lib/api";
import { cardInfo } from "../../lib/cards";
import { cn } from "../../lib/cn";
import { REPORT_REASONS, monthlyMvpBadge } from "../../lib/moderation";
import { levelFor, rankFor, rankGradient } from "../../lib/ranks";
import { isPermanentBan } from "../../lib/roles";
import { supabase } from "../../lib/supabase";
import useTeamTags from "../../hooks/useTeamTags";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { SlantTab, TeamCrest } from "../teams/TeamParts";
import { Avatar } from "../ui/Avatar";
import { Chip, EmptyState, Loading, Notice, StatTile } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { ReasonDialog } from "../ui/ReasonDialog";
import { Eyebrow } from "../ui/Typography";
import { ActivisionForm } from "./ActivisionForm";
import { CardBackdrop } from "./CallingCard";
import { CardPicker } from "./CardPicker";
import { PerformancePanel } from "./PerformancePanel";
import { PlayerMedals } from "./PlayerMedals";
import { Reliability } from "./Reliability";
import { TwitchForm, TwitchPanel } from "./TwitchPanel";
import { RankBadge } from "./RankBadge";
import { RankCard } from "./RankCard";
import { SeasonRecap } from "./SeasonRecap";

const PLATFORM_LABEL = { pc: "PC", playstation: "PlayStation", xbox: "Xbox" };
const signed = (value) => (value > 0 ? `+${value}` : value === 0 ? "±0" : `${value}`);
const winRate = (wins, losses) => (wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null);

/** Distinctions : de vrais objectifs calculés, plus les badges attribués par l'équipe. */
const STAFF_BADGES = {
  founder: { label: "Fondateur", description: "Membre fondateur de SixSence." },
  beta: { label: "Bêta-testeur", description: "A testé la plateforme avant son lancement." },
  partner: { label: "Partenaire", description: "Partenaire officiel de SixSence." },
  staff: { label: "Staff", description: "Membre de l'équipe SixSence." },
  mvp: { label: "MVP", description: "Distingué par l'équipe pour ses performances." },
};

function badgesFor(profile, seasons) {
  const played = profile.wins + profile.losses;
  const staff = (profile.badges || [])
    .filter((key) => STAFF_BADGES[key])
    .map((key) => ({ key, ...STAFF_BADGES[key], unlocked: true }));
  const seasonal = (profile.badges || [])
    .map((key) => ({ key, badge: seasonBadge(key, seasons) ?? monthlyMvpBadge(key) }))
    .filter(({ badge }) => badge)
    .map(({ key, badge }) => ({ key, ...badge, unlocked: true }));
  return [
    ...seasonal,
    ...staff,
    { key: "first-blood", label: "Premier sang", description: "Gagner un match classé.", unlocked: profile.wins >= 1 },
    { key: "domination", label: "Domination", description: "Gagner 10 matchs.", unlocked: profile.wins >= 10 },
    { key: "unstoppable", label: "Indestructible", description: "5 victoires d'affilée.", unlocked: profile.best_streak >= 5 },
    { key: "diamond", label: "Diamant", description: "Atteindre 1 200 points.", unlocked: profile.peak_points >= 1200 },
    { key: "veteran", label: "Vétéran", description: "Jouer 50 matchs.", unlocked: played >= 50 },
    { key: "champion", label: "Champion", description: "Atteindre 2 100 points.", unlocked: profile.peak_points >= 2100 },
    { key: "legende", label: "Légende", description: "Atteindre 3 000 points.", unlocked: profile.peak_points >= 3000 },
  ];
}

/**
 * Profil COD : identité et rang, statistiques, progression, historique, distinctions.
 * Public ; seul le propriétaire voit le formulaire de ses identifiants.
 */
export function ProfileView({ userId, editable = false, ownUser = null }) {
  const [historyTab, setHistoryTab] = useState("classe");
  const team = useTeamTags([userId]).get(userId);
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const { seasons, active: activeSeason, label: seasonLabel } = useSeasons();
  const { userId: viewerId } = useSession();
  const [reporting, setReporting] = useState(false);
  const [shared, setShared] = useState(false);
  const router = useRouter();
  // Cartes de visite (son propre profil) : fenêtre de choix, point doré s'il y a des nouveautés.
  const [picking, setPicking] = useState(false);
  const [newCards, setNewCards] = useState(0);

  useEffect(() => {
    if (!editable) return;
    api("/cod/cards")
      .then((result) => setNewCards(result.newCount))
      .catch(() => {});
    // Lien d'une notification « Nouvelle carte » : la fenêtre s'ouvre directement.
    if (router.query.cartes) setPicking(true);
  }, [editable, router.query.cartes]);

  const closePicker = useCallback(() => {
    setPicking(false);
    setNewCards(0);
  }, []);

  /** Copie le lien public du profil : collé sur Discord, il affiche la carte du joueur. */
  async function shareProfile() {
    // Marqueur qui change avec la carte et les points : Discord met en cache l'aperçu d'un lien,
    // un nouveau lien l'oblige à afficher la carte et les chiffres à jour.
    const stamp = data?.profile ? `?v=${data.profile.calling_card ?? "sixsence"}-${data.profile.points}` : "";
    const url = `${window.location.origin}/cod/profile/${userId}${stamp}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: "Mon profil SixSence", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {
      window.prompt("Copie ce lien :", url);
    }
  }

  const load = useCallback(async () => {
    const [{ data: player }, { data: profile }, { data: history }] = await Promise.all([
      supabase.from("users").select("id, username, avatar_url, created_at").eq("id", userId).maybeSingle(),
      supabase.from("cod_profiles").select("*").eq("user_id", userId).maybeSingle(),
      // 100 derniers matchs : la courbe de la saison ; l'historique affiche les 20 premiers.
      supabase.rpc("cod_matches_for", { p_user: userId, p_limit: 100 }),
    ]);
    if (!player || !profile) {
      setNotFound(true);
      return;
    }
    let position = null;
    let total = null;
    if (profile.wins + profile.losses > 0) {
      const [above, everyone] = await Promise.all([
        supabase.from("cod_leaderboard").select("user_id", { count: "exact", head: true }).gt("points", profile.points),
        supabase.from("cod_leaderboard").select("user_id", { count: "exact", head: true }),
      ]);
      position = (above.count ?? 0) + 1;
      total = everyone.count ?? null;
    }
    setData({ player, profile, history: history || [], position, total });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound) return <EmptyState title="Joueur introuvable">Ce profil n&apos;existe pas.</EmptyState>;
  if (!data) return <Loading label="Chargement du profil…" />;

  const { player, profile, history, position, total } = data;
  const played = profile.wins + profile.losses;
  const rate = winRate(profile.wins, profile.losses);
  const badges = badgesFor(profile, seasons);
  const bannedUntil = profile.banned_until && new Date(profile.banned_until) > new Date() ? new Date(profile.banned_until) : null;

  return (
    <div className="space-y-12">
      {editable && bannedUntil ? (
        <Notice tone="error">
          {isPermanentBan(profile.banned_until) ? (
            <>Tu es exclu définitivement de la file classée par l&apos;équipe SixSence : le motif t&apos;a été envoyé sur Discord.</>
          ) : (
            <>
              Tu es exclu de la file classée jusqu&apos;à{" "}
              {bannedUntil.getTime() - Date.now() < 20 * 3600 * 1000
                ? bannedUntil.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                : bannedUntil.toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}{" "}
              après des matchs non acceptés ou une sanction de l&apos;équipe.
            </>
          )}{" "}
          <Link href="/reglement" className="underline underline-offset-4">
            Voir le règlement
          </Link>
        </Notice>
      ) : null}

      {editable && !profile.activision_id ? (
        <Notice>Ton profil est incomplet : ajoute ton identifiant Activision ci-dessous pour pouvoir rejoindre la file classée.</Notice>
      ) : null}

      {/* --- Identité et rang --------------------------------------------- */}
      {/* Cartes de saison : sans les lignes dorées « holo » par-dessus l'image. */}
      <TacticalCard highlight cut={28} innerClassName={cn(!cardInfo(profile.calling_card).art.season && "holo", "overflow-hidden p-6 sm:p-10")}>
        <CardBackdrop cardKey={profile.calling_card} />
        <div aria-hidden className="absolute -right-10 top-0 h-full w-40 -skew-x-[24deg] bg-linear-to-b from-gold/14 to-transparent" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <Avatar src={player.avatar_url} name={player.username} size={96} className="[--cut:18px]" ring={rankGradient(rankFor(profile.points), 160)} />
            <div className="min-w-0">
              <div className="flex min-w-0 items-baseline gap-3">
                <h2 className="truncate font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{player.username}</h2>
                {/* Équipe : seulement son tag, à côté du pseudo, dans la couleur de l'équipe (lien vers sa fiche). */}
                {team ? (
                  <Link
                    href={`/cod/equipes/${team.id}`}
                    title={team.name}
                    className="shrink-0 font-tech text-xl font-bold normal-case tracking-[0.12em] transition-opacity hover:opacity-80 sm:text-2xl"
                    style={{ color: team.color, textShadow: `0 0 12px ${team.color}66` }}
                  >
                    [{team.tag}]
                  </Link>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-white/55">
                {profile.activision_id ?? "Identifiant Activision non renseigné"}
                {profile.platform ? ` · ${PLATFORM_LABEL[profile.platform] ?? profile.platform}` : ""}
              </p>
              <RankBadge points={profile.points} showProgress className="mt-4" />
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                <button
                  type="button"
                  onClick={shareProfile}
                  className="inline-flex items-center gap-1.5 text-xs text-gold/80 transition-colors hover:text-gold"
                >
                  {shared ? <LuCheck aria-hidden className="h-3.5 w-3.5" /> : <LuShare2 aria-hidden className="h-3.5 w-3.5" />}
                  {shared ? "Lien copié : colle-le sur Discord" : editable ? "Partager mon profil" : "Partager ce profil"}
                </button>
                {editable ? (
                  <button
                    type="button"
                    onClick={() => setPicking(true)}
                    className="relative inline-flex items-center gap-1.5 text-xs text-gold/80 transition-colors hover:text-gold"
                  >
                    {newCards > 0 ? (
                      <span aria-hidden className="absolute -left-2.5 top-0.5 h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_6px_var(--color-gold)]" />
                    ) : null}
                    <LuImage aria-hidden className="h-3.5 w-3.5" />
                    Changer de carte
                    {newCards > 0 ? <span className="sr-only"> ({newCards} nouvelle{newCards > 1 ? "s" : ""})</span> : null}
                  </button>
                ) : null}
                {viewerId && viewerId !== userId ? (
                  <button
                    type="button"
                    onClick={() => setReporting(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-loss"
                  >
                    <LuFlag aria-hidden className="h-3.5 w-3.5" />
                    Signaler ce joueur
                  </button>
                ) : null}
              </div>
              {editable ? (
                <CardPicker
                  open={picking}
                  onClose={closePicker}
                  player={player}
                  points={profile.points}
                  onEquipped={(key) => setData((prev) => ({ ...prev, profile: { ...prev.profile, calling_card: key } }))}
                />
              ) : null}
              <ReasonDialog
                open={reporting}
                onClose={() => setReporting(false)}
                title={`Signaler ${player.username}`}
                intro="Ton signalement reste confidentiel : seule l'équipe SixSence le voit."
                reasons={REPORT_REASONS}
                submitLabel="Envoyer le signalement"
                onSubmit={({ reason, details }) => api("/cod/reports", { method: "POST", body: { targetId: userId, reason, details } })}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-8 lg:text-right">
            <div>
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-white/45">Points</p>
              <p className="mt-1 font-display text-7xl font-black leading-[0.8] tabular-nums text-gold-gradient sm:text-8xl">{profile.points}</p>
            </div>
            <div>
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-white/45">Classement</p>
              <p className="mt-1 font-display text-4xl font-black leading-[0.9] tabular-nums sm:text-5xl">{position ? `#${position}` : "—"}</p>
            </div>
            <div>
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-white/45">Niveau</p>
              <p className="mt-1 font-display text-4xl font-black leading-[0.9] tabular-nums sm:text-5xl">{levelFor(profile.xp)}</p>
            </div>
          </div>
        </div>
      </TacticalCard>

      {/* --- Rang : carte vitrine et frise jusqu'à Légende ------------------ */}
      <section aria-label="Rang">
        <RankCard points={profile.points} peak={profile.peak_points} position={position} total={total} seasonLabel={seasonLabel} />
      </section>

      {/* --- Statistiques -------------------------------------------------- */}
      <section aria-labelledby="titre-stats">
        <Eyebrow>Statistiques</Eyebrow>
        <h2 id="titre-stats" className="sr-only">
          Statistiques
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile label="Matchs" value={played} />
          <StatTile label="Victoires" value={profile.wins} accent />
          <StatTile label="Défaites" value={profile.losses} />
          <StatTile label="Taux de victoire" value={rate === null ? "—" : `${rate}%`} />
          <StatTile label="Série en cours" value={profile.win_streak} hint={`Record : ${profile.best_streak}`} />
          <StatTile label="Expérience" value={profile.xp} hint={`Pic : ${profile.peak_points} pts`} />
        </div>
      </section>

      {/* --- Performance : courbe, chiffres clés, forme ------------------- */}
      <section aria-label="Performance">
        <PerformancePanel history={history} userId={player.id} points={profile.points} seasonId={activeSeason?.id ?? null} seasonLabel={seasonLabel} />
      </section>

      <SeasonRecap playerId={player.id} seasons={seasons} badges={profile.badges} />

      <Reliability playerId={player.id} />

      <PlayerMedals playerId={player.id} />

      <TwitchPanel channel={profile.twitch} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_22rem]">
        {/* --- Historique -------------------------------------------------- */}
        <section aria-labelledby="titre-historique">
          <Eyebrow>Historique</Eyebrow>
          <h2 id="titre-historique" className="mt-3 font-display text-4xl font-black uppercase leading-none">
            Derniers matchs
          </h2>
          {MATCH_TEAM_ENABLED ? (
            <div role="tablist" aria-label="Type de matchs" className="mt-5 flex gap-2">
              <SlantTab active={historyTab === "classe"} onClick={() => setHistoryTab("classe")}>
                Classé
              </SlantTab>
              <SlantTab active={historyTab === "division"} onClick={() => setHistoryTab("division")}>
                Division
              </SlantTab>
              <SlantTab active={historyTab === "tournoi"} onClick={() => setHistoryTab("tournoi")}>
                Tournoi
              </SlantTab>
            </div>
          ) : null}
          {historyTab === "division" || historyTab === "tournoi" ? (
            <DivisionHistory key={historyTab} playerId={player.id} tournament={historyTab === "tournoi"} />
          ) : (
          <div className="mt-6">
            {history.length === 0 ? (
              <EmptyState title="Aucun match pour l'instant">
                {editable ? (
                  <>
                    Ton historique apparaîtra ici après ton premier match classé.{" "}
                    <Link href="/cod/ranked" className="text-gold underline underline-offset-4">
                      Rejoindre la file
                    </Link>
                  </>
                ) : (
                  "Ce joueur n'a pas encore joué de match classé."
                )}
              </EmptyState>
            ) : (
              <ul className="space-y-2">
                {history.slice(0, 20).map((match) => (
                  <HistoryRow key={match.id} match={match} playerId={player.id} />
                ))}
              </ul>
            )}
          </div>
          )}
        </section>

        <div className="space-y-12">
          {/* --- Distinctions ---------------------------------------------- */}
          <section aria-labelledby="titre-badges">
            <Eyebrow>Badges</Eyebrow>
            <h2 id="titre-badges" className="mt-3 font-display text-4xl font-black uppercase leading-none">
              Distinctions
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {badges.map((badge) => (
                <li
                  key={badge.key}
                  className={cn("flex items-center gap-3 border-l-2 px-3.5 py-3", badge.unlocked ? "border-gold bg-gold/8" : "border-white/10 bg-white/[0.02]")}
                >
                  {badge.unlocked ? (
                    <LuMedal aria-hidden className="h-6 w-6 shrink-0 text-gold" />
                  ) : (
                    <LuLock aria-hidden className="h-6 w-6 shrink-0 text-white/25" />
                  )}
                  <div className="min-w-0">
                    <p className={cn("font-display text-lg font-bold uppercase leading-none tracking-wide", !badge.unlocked && "text-white/45")}>
                      {badge.label}
                      <span className="sr-only">{badge.unlocked ? " (obtenu)" : " (à débloquer)"}</span>
                    </p>
                    <p className="mt-1 text-xs leading-snug text-white/45">{badge.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* --- Édition (uniquement sur son propre profil) ---------------- */}
          {editable && ownUser ? (
            <section aria-labelledby="titre-compte">
              <Eyebrow>Compte de jeu</Eyebrow>
              <h2 id="titre-compte" className="mt-3 font-display text-4xl font-black uppercase leading-none">
                Mes identifiants
              </h2>
              <div className="mt-6">
                <ActivisionForm user={ownUser} onSaved={load} />
              </div>
              <div className="mt-8 border-t border-white/10 pt-6">
                <TwitchForm user={{ ...ownUser, profile: { ...ownUser.profile, twitch: profile.twitch } }} onSaved={load} />
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Matchs de Division joués par le joueur (joueur du match) : équipe, adversaire, maps, points de l'équipe, XP. */
/** Matchs d'équipe du joueur : Division (hors coupes) ou Tournoi (coupes Horus, Anubis et tournoi de saison). */
function DivisionHistory({ playerId, tournament = false }) {
  const [matches, setMatches] = useState(null);
  useEffect(() => {
    let alive = true;
    setMatches(null);
    api(`/teams/players/${playerId}/matches`)
      .then((data) => alive && setMatches(data.matches.filter((match) => Boolean(match.tournament) === tournament)))
      .catch(() => alive && setMatches([]));
    return () => {
      alive = false;
    };
  }, [playerId]);

  if (matches === null) return <p className="mt-6 text-sm text-white/45">Chargement…</p>;
  if (matches.length === 0) return (
      <div className="mt-6">
        {tournament ? (
          <EmptyState title="Aucun match de tournoi">Les matchs des coupes Horus et Anubis et du tournoi de saison apparaîtront ici.</EmptyState>
        ) : (
          <EmptyState title="Aucun match de Division">Les matchs joués avec une équipe apparaîtront ici.</EmptyState>
        )}
      </div>
    );
  return (
    <ul className="mt-6 space-y-2">
      {matches.map((match) => {
        const done = match.status === "completed";
        const tone = done ? (match.won ? "win" : "loss") : "gold";
        return (
          <li key={match.id}>
            <Link
              href={`/cod/equipes/match/${match.id}`}
              className={cn(
                "flex items-center gap-4 border-l-2 bg-white/[0.03] px-4 py-3.5 transition-colors hover:bg-white/[0.07]",
                tone === "win" ? "border-win" : tone === "loss" ? "border-loss" : "border-gold",
              )}
            >
              <Chip tone={tone} className="w-28 shrink-0 justify-center">
                {done ? (match.won ? "Victoire" : "Défaite") : "En cours"}
              </Chip>
              <TeamCrest team={match.opponent} size={30} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl font-bold uppercase leading-none tracking-wide">
                  <span className="text-white/45">vs</span> {match.opponent?.name ?? "Équipe"}
                </p>
                <p className="mt-1 truncate text-xs text-white/45">
                  Avec <span className="normal-case">[{match.team?.tag}]</span> · {done ? `${match.mapsFor} – ${match.mapsAgainst}` : "BO3"}
                  {match.forfeit ? " · par forfait" : ""}
                  {" · "}{new Date(match.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
              </div>
              {done ? (
                <p className="shrink-0 text-right font-tech text-xs font-bold tabular-nums">
                  {typeof match.teamPoints === "number" ? (
                    <span className={cn("block text-base", match.teamPoints > 0 ? "text-win" : "text-loss")}>
                      {signed(match.teamPoints)}
                      <span className="sr-only"> points d&apos;équipe</span>
                    </span>
                  ) : null}
                  <span className="text-white/45">+{match.xp} XP</span>
                </p>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Une ligne de l'historique : résultat, carte, mode, variation de points, date. */
function HistoryRow({ match, playerId }) {
  const team = match.team_a.includes(playerId) ? "A" : "B";
  const delta = match.points_changes?.[playerId];

  let label = "En cours";
  let tone = "gold";
  if (match.status === "completed") {
    const won = match.winner === team;
    label = won ? "Victoire" : "Défaite";
    tone = won ? "win" : "loss";
  } else if (match.status === "cancelled") {
    label = "Annulé";
    tone = "neutral";
  } else if (match.status === "disputed") {
    label = "Contesté";
    tone = "loss";
  } else if (match.status === "awaiting_confirmation") {
    label = "À confirmer";
  }

  return (
    <li>
      <Link
        href={`/cod/match/${match.id}`}
        className={cn(
          "flex items-center gap-4 border-l-2 bg-white/[0.03] px-4 py-3.5 transition-colors hover:bg-white/[0.07]",
          tone === "win" ? "border-win" : tone === "loss" ? "border-loss" : tone === "gold" ? "border-gold" : "border-white/15",
        )}
      >
        <Chip tone={tone} className="w-28 shrink-0 justify-center">
          {label}
        </Chip>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-xl font-bold uppercase leading-none tracking-wide">{match.map}</p>
          <p className="mt-1 truncate text-xs text-white/45">
            {match.mode} · {match.team_size}v{match.team_size} ·{" "}
            {new Date(match.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </p>
        </div>
        {typeof delta === "number" ? (
          <p className={cn("shrink-0 font-tech text-base font-bold tabular-nums", delta > 0 ? "text-win" : delta < 0 ? "text-loss" : "text-white/40")}>
            {signed(delta)}
            <span className="sr-only"> points</span>
          </p>
        ) : null}
      </Link>
    </li>
  );
}
