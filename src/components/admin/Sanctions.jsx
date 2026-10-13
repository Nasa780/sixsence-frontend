import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuChevronDown, LuGavel, LuLoaderCircle, LuUndo2, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { isPermanentBan } from "../../lib/roles";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Chip, EmptyState, Loading, Notice } from "../ui/Feedback";
import { Portal } from "../ui/Portal";
import { SearchInput } from "./Fields";

/** Types de sanction proposés au staff (mêmes codes que le backend). */
const TYPES = [
  { key: "warning", label: "Avertissement", hint: "Inscrit dans l'historique du joueur." },
  { key: "temp_ban", label: "Exclusion temporaire", hint: "Plus d'accès à la file classée pendant la durée choisie." },
  { key: "perm_ban", label: "Exclusion définitive", hint: "Plus d'accès au classé, jusqu'à levée par l'équipe." },
  { key: "points", label: "Retrait de points", hint: "Les points retirés sont rendus si la sanction est levée." },
];

const DURATIONS = [
  { minutes: 60, label: "1 h" },
  { minutes: 1440, label: "24 h" },
  { minutes: 10080, label: "7 jours" },
  { minutes: 43200, label: "30 jours" },
];

const INPUT = "w-full border border-white/12 bg-ink px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-gold focus:outline-none";
const dateTime = (value) => new Date(value).toLocaleString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Fenêtre « Sanctionner » : type, durée ou points, motif. Le joueur est prévenu en
 * message privé Discord ; si reportId est fourni, le signalement est clos.
 */
export function SanctionDialog({ player, reportId = null, onClose, onDone }) {
  const [type, setType] = useState("warning");
  const [minutes, setMinutes] = useState(1440);
  const [customHours, setCustomHours] = useState("");
  const [points, setPoints] = useState(50);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(event) {
    event.preventDefault();
    if (!reason.trim()) {
      setError("Indique un motif : il est envoyé au joueur.");
      return;
    }
    const duration = minutes === "custom" ? Math.round(Number(customHours) * 60) : minutes;
    if (type === "temp_ban" && !(duration >= 1)) {
      setError("Indique une durée en heures.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await api(`/admin/players/${player.id}/sanctions`, {
        method: "POST",
        body: { type, reason: reason.trim(), minutes: type === "temp_ban" ? duration : undefined, points: type === "points" ? Number(points) : undefined, reportId },
      });
      onDone?.();
      onClose();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/85 px-4 pb-6 backdrop-blur-sm sm:items-center sm:pb-0"
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-sanction"
          onSubmit={submit}
          className="max-h-[90dvh] w-full max-w-lg overflow-y-auto border border-gold/30 bg-ink-800 p-6 shadow-2xl shadow-black/60"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Sanction</p>
              <h2 id="titre-sanction" className="mt-1 font-display text-3xl font-black uppercase leading-none">
                {player.username}
              </h2>
            </div>
            <button type="button" onClick={onClose} className="p-1 text-white/50 hover:text-white" aria-label="Fermer">
              <LuX aria-hidden className="h-5 w-5" />
            </button>
          </div>

          <fieldset className="mt-5">
            <legend className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Type</legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TYPES.map((item) => (
                <label
                  key={item.key}
                  className={cn(
                    "cursor-pointer border px-3 py-2.5 transition-colors",
                    type === item.key ? "border-gold bg-gold/10" : "border-white/12 hover:border-white/30",
                  )}
                >
                  <input type="radio" name="type" value={item.key} checked={type === item.key} onChange={() => setType(item.key)} className="sr-only" />
                  <span className={cn("block font-display text-base font-bold uppercase", type === item.key ? "text-gold" : "text-white")}>{item.label}</span>
                  <span className="mt-0.5 block text-xs text-white/45">{item.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {type === "temp_ban" ? (
            <fieldset className="mt-4">
              <legend className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Durée</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...DURATIONS, { minutes: "custom", label: "Autre" }].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    aria-pressed={minutes === item.minutes}
                    onClick={() => setMinutes(item.minutes)}
                    className={cn(
                      "clip-slant px-3.5 py-1.5 font-display text-sm font-bold uppercase transition-colors",
                      minutes === item.minutes ? "bg-gold text-ink" : "bg-white/[0.06] text-white/70 hover:bg-white/10",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {minutes === "custom" ? (
                <label className="mt-2 flex items-center gap-2 text-sm text-white/60">
                  <input type="number" min="1" max="8760" step="1" value={customHours} onChange={(event) => setCustomHours(event.target.value)} className={cn(INPUT, "w-28")} />
                  heures
                </label>
              ) : null}
            </fieldset>
          ) : null}

          {type === "points" ? (
            <label className="mt-4 block">
              <span className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Points à retirer</span>
              <input type="number" min="1" max="5000" step="1" value={points} onChange={(event) => setPoints(event.target.value)} className={cn(INPUT, "mt-2 w-32")} />
            </label>
          ) : null}

          <label className="mt-4 block">
            <span className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Motif (envoyé au joueur)</span>
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError(null);
              }}
              maxLength={500}
              rows={3}
              placeholder="Ex. : propos insultants dans le chat du match"
              className={cn(INPUT, "mt-2 resize-none")}
            />
          </label>

          {error ? <p className="mt-3 text-sm text-loss">{error}</p> : null}
          {reportId ? <p className="mt-3 text-xs text-white/45">Le signalement sera marqué « Traité ».</p> : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" variant="danger" disabled={pending}>
              {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuGavel aria-hidden className="h-4 w-4" />}
              Appliquer la sanction
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </Portal>
  );
}

/** Historique des sanctions d'un joueur, avec levée. */
export function SanctionHistory({ player, refreshKey = 0, onChange }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(null);

  const load = useCallback(
    () =>
      api(`/admin/players/${player.id}/sanctions`)
        .then((data) => setItems(data.sanctions))
        .catch((caught) => setError(caught.message)),
    [player.id],
  );
  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function lift(item) {
    const reason = window.prompt(`Lever « ${item.label} » ? Motif (facultatif, envoyé au joueur) :`, "");
    if (reason === null) return;
    setPending(item.id);
    setError(null);
    try {
      await api(`/admin/sanctions/${item.id}/lift`, { method: "POST", body: { reason } });
      await load();
      onChange?.();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!items) return <Loading label="Chargement des sanctions…" />;
  if (items.length === 0) return <p className="text-sm text-white/45">Aucune sanction pour ce joueur.</p>;

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className={cn("border-l-2 px-3 py-2.5", item.active ? "border-loss bg-loss/[0.06]" : "border-white/10 bg-white/[0.02]")}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-display text-base font-bold uppercase">
                {item.label}
                {item.lifted_at ? <Chip tone="neutral">Levée</Chip> : item.active ? <Chip tone="loss">En vigueur</Chip> : <Chip tone="neutral">Terminée</Chip>}
              </p>
              <p className="mt-1 text-sm text-white/75">{item.reason}</p>
              <p className="mt-1 text-xs text-white/40">
                {dateTime(item.created_at)} par {item.created_by_name ?? "l'équipe"}
                {item.type === "temp_ban" && item.ends_at ? ` · fin ${dateTime(item.ends_at)}` : ""}
                {item.type === "perm_ban" && isPermanentBan(item.ends_at) ? " · sans fin" : ""}
              </p>
              {item.lifted_at ? (
                <p className="mt-1 text-xs text-white/40">
                  Levée le {dateTime(item.lifted_at)} par {item.lifted_by_name ?? "l'équipe"}
                  {item.lift_reason ? ` — ${item.lift_reason}` : ""}
                </p>
              ) : null}
            </div>
            {!item.lifted_at && item.active ? (
              <Button size="sm" variant="ghost" onClick={() => lift(item)} disabled={pending !== null}>
                {pending === item.id ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuUndo2 aria-hidden className="h-4 w-4" />}
                Lever
              </Button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Onglet « Sanctions » : rechercher un joueur, voir son historique, le sanctionner. */
export function SanctionsPanel() {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState(null);
  const [open, setOpen] = useState(null);
  const [sanctioning, setSanctioning] = useState(null);
  const [refresh, setRefresh] = useState(0);

  const search = useCallback((term) => api(`/admin/players?q=${encodeURIComponent(term)}`).then((data) => setPlayers(data.players)), []);
  useEffect(() => {
    const timer = setTimeout(() => search(query).catch(() => setPlayers([])), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const changed = () => {
    setRefresh((value) => value + 1);
    search(query).catch(() => {});
  };

  return (
    <div className="space-y-5">
      <SearchInput value={query} onChange={setQuery} label="Rechercher un joueur" placeholder="Rechercher un pseudo Discord…" />
      {players === null ? (
        <Loading />
      ) : players.length === 0 ? (
        <EmptyState title="Aucun joueur">Aucun pseudo ne correspond à la recherche.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {players.map((player) => {
            const until = player.profile?.banned_until;
            const banned = until && new Date(until) > new Date();
            const expanded = open === player.id;
            return (
              <li key={player.id} className="border-l-2 border-white/10 bg-white/[0.03]">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <Avatar src={player.avatar_url} name={player.username} size={36} />
                  <div className="min-w-[11rem] flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <Link href={`/cod/profile/${player.id}`} className="truncate font-display text-lg font-bold uppercase tracking-wide hover:text-gold">
                        {player.username}
                      </Link>
                      {banned ? <Chip tone="loss">{isPermanentBan(until) ? "Exclu définitivement" : "Exclu"}</Chip> : null}
                    </p>
                    <p className="text-xs text-white/45">{player.profile ? `${player.profile.points} pts · ${player.profile.wins} V / ${player.profile.losses} D` : "Pas de profil COD"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {player.profile ? (
                      <Button size="sm" variant="danger" onClick={() => setSanctioning(player)}>
                        <LuGavel aria-hidden className="h-4 w-4" />
                        Sanctionner
                      </Button>
                    ) : null}
                    <Button size="sm" variant="ghost" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : player.id)}>
                      Historique
                      <LuChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                    </Button>
                  </div>
                </div>
                {expanded ? (
                  <div className="border-t border-white/10 px-4 py-3">
                    <SanctionHistory player={player} refreshKey={refresh} onChange={changed} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      {sanctioning ? <SanctionDialog player={sanctioning} onClose={() => setSanctioning(null)} onDone={changed} /> : null}
    </div>
  );
}
