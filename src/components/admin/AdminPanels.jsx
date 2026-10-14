import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuExternalLink, LuGavel, LuLoaderCircle, LuLockOpen } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { ROLE_LABELS, isModerator, isPermanentBan } from "../../lib/roles";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Chip, EmptyState, Loading, Notice, StatTile } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { SearchInput } from "./Fields";
import { SanctionDialog } from "./Sanctions";

/** Petit utilitaire : appelle le backend, gère « en cours » et les erreurs. */
function useAction() {
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const run = useCallback(async (key, fn) => {
    setPending(key);
    setError(null);
    try {
      return await fn();
    } catch (caught) {
      setError(caught.message);
      return undefined;
    } finally {
      setPending(null);
    }
  }, []);
  return { pending, error, run };
}

// --- Tableau de bord -------------------------------------------------------------

export function OverviewPanel({ onNavigate, role = "admin" }) {
  const admin = role === "admin";
  const moderator = isModerator(role);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/admin/overview")
      .then(setData)
      .catch((caught) => setError(caught.message));
  }, []);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!data) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button type="button" onClick={() => onNavigate("disputes")} className="text-left">
          <StatTile label="Contestations" value={data.disputes} accent={data.disputes > 0} hint="à arbitrer" />
        </button>
        {admin ? (
          <>
            <button type="button" onClick={() => onNavigate("players")} className="text-left">
              <StatTile label="Joueurs" value={data.players} />
            </button>
            <button type="button" onClick={() => onNavigate("events")} className="text-left">
              <StatTile label="Événements à venir" value={data.upcomingEvents} />
            </button>
          </>
        ) : null}
        {moderator ? (
          <button type="button" onClick={() => onNavigate("sanctions")} className="text-left">
            <StatTile label="Exclus de la file" value={data.bannedPlayers} />
          </button>
        ) : null}
        <button type="button" onClick={() => onNavigate("arbitrages")} className="text-left">
          <StatTile label="Arbitrages" value={data.openArbitrations ?? 0} accent={(data.openArbitrations ?? 0) > 0} hint="en attente" />
        </button>
        {moderator ? (
          <button type="button" onClick={() => onNavigate("signalements")} className="text-left">
            <StatTile label="Signalements" value={data.openReports ?? 0} accent={(data.openReports ?? 0) > 0} hint="en attente" />
          </button>
        ) : null}
      </div>
      {data.season ? (
        <p className="text-sm text-white/55">
          Saison en cours : <span className="font-semibold text-white">{data.season.name}</span>, depuis le{" "}
          {new Date(data.season.starts_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.
        </p>
      ) : null}
      {admin ? <DiscordRolesSync /> : null}
    </div>
  );
}

/** Remet à jour les rôles Discord (rang, COD) de tous les joueurs classés. */
function DiscordRolesSync() {
  const [result, setResult] = useState(null);
  const { pending, error, run } = useAction();

  const sync = () =>
    run("sync", async () => {
      const { updated } = await api("/admin/discord/sync-roles", { method: "POST" });
      setResult(updated);
    });

  return (
    <TacticalCard cut={16} innerClassName="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-display text-xl font-black uppercase leading-none">Rôles Discord</p>
        <p className="mt-1 text-sm text-white/55">
          Les rôles de rang et « COD » se mettent à jour après chaque match. Ce bouton les recalcule pour tous les joueurs classés.
        </p>
        {result !== null ? <p className="mt-1 text-sm text-win">{result} joueur(s) mis à jour sur Discord.</p> : null}
        {error ? <p className="mt-1 text-sm text-loss">{error}</p> : null}
      </div>
      <Button size="sm" variant="outline" onClick={sync} disabled={pending !== null}>
        {pending === "sync" ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
        Synchroniser les rôles
      </Button>
    </TacticalCard>
  );
}

// --- Contestations ---------------------------------------------------------------

export function DisputesPanel() {
  const [matches, setMatches] = useState(null);
  const { pending, error, run } = useAction();

  const load = useCallback(() => api("/admin/disputes").then((data) => setMatches(data.matches)), []);
  useEffect(() => {
    load().catch(() => setMatches([]));
  }, [load]);

  const resolve = (matchId, winner) =>
    run(`${matchId}-${winner}`, async () => {
      if (winner === null) await api(`/admin/matches/${matchId}/cancel`, { method: "POST" });
      else await api(`/cod/matches/${matchId}/resolve`, { method: "POST", body: { winner } });
      await load();
    });

  if (matches === null) return <Loading />;
  return (
    <div className="space-y-4">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {matches.length === 0 ? (
        <EmptyState title="Aucune contestation">Tous les résultats ont été validés. Rien à arbitrer.</EmptyState>
      ) : (
        matches.map((match) => (
          <TacticalCard key={match.id} cut={18} innerClassName="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-2xl font-black uppercase leading-none">
                {match.map} <span className="text-white/40">· {match.mode}</span>
              </p>
              <p className="mt-2 text-sm text-white/55">
                Victoire déclarée : {match.reported_winner === "A" ? "équipe 1" : "équipe 2"} ·{" "}
                {new Date(match.reported_at || match.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
              <Link href={`/cod/match/${match.id}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold underline underline-offset-4">
                Voir le match, le chat et les preuves
                <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => resolve(match.id, "A")} disabled={pending !== null}>
                {pending === `${match.id}-A` ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
                Équipe 1 gagne
              </Button>
              <Button size="sm" variant="outline" onClick={() => resolve(match.id, "B")} disabled={pending !== null}>
                {pending === `${match.id}-B` ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
                Équipe 2 gagne
              </Button>
              <Button size="sm" variant="danger" onClick={() => resolve(match.id, null)} disabled={pending !== null}>
                {pending === `${match.id}-null` ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
                Annuler
              </Button>
            </div>
          </TacticalCard>
        ))
      )}
    </div>
  );
}

// --- Joueurs ---------------------------------------------------------------------

const BADGE_LABEL = { founder: "Fondateur", beta: "Bêta-testeur", partner: "Partenaire", staff: "Staff", mvp: "MVP" };

export function PlayersPanel({ currentUserId }) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState(null);
  const { pending, error, run } = useAction();

  const search = useCallback((term) => api(`/admin/players?q=${encodeURIComponent(term)}`).then((data) => setPlayers(data.players)), []);

  useEffect(() => {
    const timer = setTimeout(() => search(query).catch(() => setPlayers([])), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const update = (player, key, fn) =>
    run(`${player.id}-${key}`, async () => {
      await fn();
      await search(query);
    });

  const toggleBadge = (player, badge) => {
    const current = player.profile?.badges || [];
    const badges = current.includes(badge) ? current.filter((item) => item !== badge) : [...current, badge];
    return update(player, badge, () => api(`/admin/players/${player.id}/badges`, { method: "POST", body: { badges } }));
  };

  return (
    <div className="space-y-5">
      <SearchInput value={query} onChange={setQuery} label="Rechercher un joueur" placeholder="Rechercher un pseudo Discord…" />
      {error ? <Notice tone="error">{error}</Notice> : null}
      {players === null ? (
        <Loading />
      ) : players.length === 0 ? (
        <EmptyState title="Aucun joueur">Aucun pseudo ne correspond à la recherche.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => {
            const banned = player.profile?.banned_until && new Date(player.profile.banned_until) > new Date();
            const badges = player.profile?.badges || [];
            return (
              <li key={player.id} className="border-l-2 border-white/10 bg-white/[0.03] px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Avatar src={player.avatar_url} name={player.username} size={38} />
                  <div className="min-w-[11rem] flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <Link href={`/cod/profile/${player.id}`} className="truncate font-display text-lg font-bold uppercase tracking-wide hover:text-gold">
                        {player.username}
                      </Link>
                      {player.role && player.role !== "member" ? <Chip>{ROLE_LABELS[player.role] ?? player.role}</Chip> : null}
                      {banned ? <Chip tone="loss">{isPermanentBan(player.profile.banned_until) ? "Exclu définitivement" : "Exclu"}</Chip> : null}
                    </p>
                    <p className="text-xs text-white/45">
                      {player.profile ? `${player.profile.points} pts · ${player.profile.wins} V / ${player.profile.losses} D` : "Pas de profil COD"}
                      {player.profile?.activision_id ? ` · ${player.profile.activision_id}` : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {banned ? (
                      <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => update(player, "unban", () => api(`/admin/players/${player.id}/unban`, { method: "POST" }))}>
                        <LuLockOpen aria-hidden className="h-4 w-4" />
                        Lever l&apos;exclusion
                      </Button>
                    ) : null}
                    {player.id !== currentUserId ? (
                      <label className="flex items-center gap-2">
                        <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">Rôle</span>
                        <select
                          value={player.role ?? "member"}
                          disabled={pending !== null}
                          aria-label={`Rôle de ${player.username}`}
                          onChange={(event) => {
                            const role = event.target.value;
                            if (window.confirm(`Passer ${player.username} en « ${ROLE_LABELS[role]} » ?`)) {
                              update(player, "role", () => api(`/admin/players/${player.id}/role`, { method: "POST", body: { role } }));
                            }
                          }}
                          className="border border-white/12 bg-ink px-2 py-1.5 font-display text-sm font-bold uppercase text-white focus:border-gold focus:outline-none disabled:opacity-50"
                        >
                          {Object.entries(ROLE_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </div>
                </div>
                {player.profile ? (
                  <div className="mt-3 flex flex-wrap gap-2" aria-label={`Badges de ${player.username}`}>
                    {Object.entries(BADGE_LABEL).map(([badge, label]) => {
                      const on = badges.includes(badge);
                      return (
                        <button
                          key={badge}
                          type="button"
                          aria-pressed={on}
                          disabled={pending !== null}
                          onClick={() => toggleBadge(player, badge)}
                          className={cn(
                            "border px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-50",
                            on ? "border-gold bg-gold/15 text-gold" : "border-white/12 text-white/45 hover:border-white/30 hover:text-white",
                          )}
                        >
                          {pending === `${player.id}-${badge}` ? "…" : label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// --- Saison ----------------------------------------------------------------------

export function SeasonPanel() {
  const [overview, setOverview] = useState(null);
  const [nextName, setNextName] = useState("");
  const [result, setResult] = useState(null);
  const { pending, error, run } = useAction();

  useEffect(() => {
    api("/admin/overview")
      .then((data) => {
        setOverview(data);
        const number = Number(/(\d+)$/.exec(data.season?.name ?? "")?.[1]);
        setNextName(Number.isFinite(number) && number > 0 ? `Saison ${number + 1}` : "");
      })
      .catch(() => setOverview({ season: null }));
  }, []);

  async function close(event) {
    event.preventDefault();
    if (!window.confirm(`Clôturer « ${overview?.season?.name} » ? Les points, victoires et défaites de tous les joueurs seront remis à zéro (l'XP est conservée). Action irréversible.`)) return;
    const data = await run("close", () => api("/admin/season/close", { method: "POST", body: { nextName } }));
    if (data) setResult(data.archived);
  }

  if (!overview) return <Loading />;
  return (
    <div className="max-w-2xl space-y-5">
      <p className="text-sm leading-relaxed text-white/60">
        Clôturer la saison <strong className="text-white">{overview.season?.name ?? "en cours"}</strong> : le classement final est archivé
        (consultable sur la page Classement), le premier reçoit le badge Champion et les dix premiers le badge Top 10, puis les points,
        victoires, défaites et séries repartent de zéro. L&apos;XP et les niveaux sont conservés. Impossible tant que des matchs sont en
        cours.
      </p>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {result !== null ? <Notice tone="success">Saison clôturée : {result} joueur(s) archivé(s). Bonne nouvelle saison !</Notice> : null}
      <form onSubmit={close} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="nom-saison" className="mb-1.5 block font-tech text-[10px] uppercase tracking-[0.24em] text-white/50">
            Nom de la nouvelle saison
          </label>
          <input
            id="nom-saison"
            required
            maxLength={40}
            value={nextName}
            onChange={(event) => setNextName(event.target.value)}
            className="w-full border border-white/12 bg-ink px-3 py-2.5 text-sm text-white focus:border-gold focus:outline-none"
          />
        </div>
        <Button type="submit" variant="danger" disabled={pending !== null || !nextName.trim()}>
          {pending === "close" ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
          Clôturer la saison
        </Button>
      </form>
    </div>
  );
}

// --- Arbitrages et signalements ---------------------------------------------------

const CASE_STATUS = { open: "En attente", resolved: "Traité", rejected: "Sans suite" };

/**
 * Demandes d'arbitrage (kind = "arbitrations") ou signalements (kind = "reports") :
 * liste filtrée par statut, traitement avec une note facultative.
 */
export function CasesPanel({ kind }) {
  const [status, setStatus] = useState("open");
  const [items, setItems] = useState(null);
  const [notes, setNotes] = useState({});
  const [sanctioning, setSanctioning] = useState(null);
  const { pending, error, run } = useAction();

  const load = useCallback(
    () => api(`/admin/${kind}?status=${status}`).then((data) => setItems(data.items)),
    [kind, status],
  );
  useEffect(() => {
    setItems(null);
    load().catch(() => setItems([]));
  }, [load]);

  const close = (item, next) =>
    run(`${item.id}-${next}`, async () => {
      await api(`/admin/${kind}/${item.id}`, { method: "POST", body: { status: next, resolution: notes[item.id] || null } });
      await load();
    });

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Statut" className="flex flex-wrap gap-2">
        {Object.entries(CASE_STATUS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={status === key}
            onClick={() => setStatus(key)}
            className={cn(
              "clip-slant px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em] transition-colors",
              status === key ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:bg-white/10",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {items === null ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState title="Rien ici">{status === "open" ? "Aucune demande en attente." : "Aucun élément."}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <TacticalCard cut={16} innerClassName="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-xl font-black uppercase leading-none">{item.reason_label}</p>
                    <p className="mt-2 text-sm text-white/60">
                      {kind === "arbitrations" ? (
                        <>Demandé par {item.user_name ?? "un joueur"}</>
                      ) : (
                        <>
                          <Link href={`/cod/profile/${item.target_id}`} className="font-semibold text-white hover:text-gold">
                            {item.target_name ?? "Joueur"}
                          </Link>{" "}
                          signalé par {item.reporter_name ?? "un joueur"}
                        </>
                      )}{" "}
                      · {new Date(item.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {item.details ? <p className="mt-2 whitespace-pre-wrap text-sm text-white/80">« {item.details} »</p> : null}
                    {item.match_id ? (
                      <Link href={`/cod/match/${item.match_id}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-gold underline underline-offset-4">
                        Voir le match, le chat et les preuves
                        <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                    {item.status !== "open" ? (
                      <p className="mt-2 text-xs text-white/45">
                        {CASE_STATUS[item.status]} par {item.resolved_by_name ?? "un admin"}
                        {item.resolution ? ` — ${item.resolution}` : ""}
                      </p>
                    ) : null}
                  </div>
                  <Chip tone={item.status === "open" ? "gold" : "neutral"}>{CASE_STATUS[item.status]}</Chip>
                </div>
                {item.status === "open" ? (
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      value={notes[item.id] ?? ""}
                      onChange={(event) => setNotes((prev) => ({ ...prev, [item.id]: event.target.value }))}
                      maxLength={500}
                      placeholder="Note (facultatif) : visible par le joueur pour un arbitrage"
                      aria-label="Note de traitement"
                      className="min-w-0 flex-1 border border-white/12 bg-ink px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-gold focus:outline-none"
                    />
                    <Button size="sm" onClick={() => close(item, "resolved")} disabled={pending !== null}>
                      {pending === `${item.id}-resolved` ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
                      Traité
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => close(item, "rejected")} disabled={pending !== null}>
                      Sans suite
                    </Button>
                    {kind === "reports" && item.target_id ? (
                      <Button size="sm" variant="danger" onClick={() => setSanctioning(item)} disabled={pending !== null}>
                        <LuGavel aria-hidden className="h-4 w-4" />
                        Sanctionner
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-3">
                    <Button size="sm" variant="ghost" onClick={() => close(item, "open")} disabled={pending !== null}>
                      Rouvrir
                    </Button>
                  </div>
                )}
              </TacticalCard>
            </li>
          ))}
        </ul>
      )}
      {sanctioning ? (
        <SanctionDialog
          player={{ id: sanctioning.target_id, username: sanctioning.target_name ?? "Joueur" }}
          reportId={sanctioning.id}
          onClose={() => setSanctioning(null)}
          onDone={() => load().catch(() => {})}
        />
      ) : null}
    </div>
  );
}
