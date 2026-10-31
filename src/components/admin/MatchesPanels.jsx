import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuBan, LuExternalLink, LuShieldAlert } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Chip, EmptyState, Loading, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { SearchInput } from "./Fields";

const STATUS = {
  ready_check: ["Vérification", "gold"],
  in_progress: ["En cours", "gold"],
  awaiting_confirmation: ["À confirmer", "gold"],
  forfeit_claimed: ["Forfait demandé", "loss"],
  disputed: ["Contesté", "loss"],
  completed: ["Terminé", "win"],
  cancelled: ["Annulé", "neutral"],
};
const when = (iso) => (iso ? new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const team = (ids, names) => ids.map((id) => names[id] ?? "?").join(", ");
/** Matchs encore ouverts, que l'équipe peut annuler depuis la liste. */
const OPEN = ["ready_check", "in_progress", "awaiting_confirmation", "forfeit_claimed", "disputed"];
const signed = (value) => (value > 0 ? `+${value}` : `${value}`);
/** Délai de correction du staff et des arbitres (correctionPolicy.ts du serveur) ; l'admin corrige sans limite. */
const STAFF_CORRECTION_HOURS = 48;

/**
 * Match terminé encore corrigeable par ce membre de l'équipe : admin toujours ; staff et arbitres pendant 48 h après la
 * validation, et jamais un match qu'ils ont joué (mêmes règles que le serveur).
 */
function correctable(match, role, userId) {
  if (match.status !== "completed") return false;
  if (role === "admin") return true;
  const players = [...(match.team_a ?? []), ...(match.team_b ?? []), ...(match.roster_a ?? []), ...(match.roster_b ?? [])];
  if (userId && players.includes(userId)) return false;
  return Boolean(match.completed_at) && Date.now() - new Date(match.completed_at).getTime() <= STAFF_CORRECTION_HOURS * 3_600_000;
}

/** Lien vers la page du match : « correction possible » seulement si elle l'est encore pour ce membre. */
function OpenLink({ href, match, role, userId, openLabel }) {
  const canCorrect = correctable(match, role, userId);
  return (
    <span className="inline-flex flex-col items-start gap-0.5 lg:items-end">
      <Link href={href} className="inline-flex items-center gap-1.5 text-sm text-gold underline underline-offset-4">
        {canCorrect ? "Ouvrir (correction possible)" : match.status === "completed" ? "Ouvrir le match" : openLabel}
        <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
      </Link>
      {match.status === "completed" && !canCorrect ? <span className="text-[11px] text-white/40">Correction fermée (plus de {STAFF_CORRECTION_HOURS} h ou match joué)</span> : null}
    </span>
  );
}

/**
 * « Matchs » : les derniers matchs, ou ceux d'un joueur (recherche par pseudo), pour retrouver
 * un match à corriger. Lien vers la page du match (bloc « Corriger le résultat »). Les matchs encore
 * ouverts (tous les modes) s'annulent directement depuis la liste, avec confirmation.
 */
export function MatchesPanel({ role, userId }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      api(`/admin/matches?q=${encodeURIComponent(query)}`)
        .then((data) => {
          if (!alive) return;
          // Classé et Division mélangés, du plus récent au plus ancien.
          const all = [...(data.matches ?? []).map((match) => ({ ...match, kind: "classe" })), ...(data.teamMatches ?? [])];
          all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setMatches(all);
          setError(null);
        })
        .catch((caught) => alive && (setError(caught.message), setMatches([])));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query, reload]);

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un joueur (pseudo), une équipe (nom ou tag)…" label="Rechercher un joueur" />
      {error ? <Notice tone="error">{error}</Notice> : null}
      {matches === null ? (
        <Loading />
      ) : matches.length === 0 ? (
        <EmptyState title="Aucun match">{query ? "Aucun match pour ce joueur." : "Aucun match pour l'instant."}</EmptyState>
      ) : (
        matches.map((match) => {
          const [label, tone] = STATUS[match.status] ?? [match.status, "neutral"];
          if (match.kind === "division") return <DivisionMatchRow key={`d-${match.id}`} match={match} label={label} tone={tone} onCancelled={refresh} role={role} userId={userId} />;
          return (
            <TacticalCard key={match.id} cut={18} innerClassName="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <ModeChip kind="classe" />
                  <Chip tone={tone}>{label}</Chip>
                  {match.correction_action ? <Chip tone="gold">Corrigé</Chip> : null}
                  {match.openRequests > 0 ? (
                    <Chip tone="loss">
                      {match.openRequests} demande{match.openRequests > 1 ? "s" : ""} en attente
                    </Chip>
                  ) : null}
                  <p className="font-display text-xl font-black uppercase leading-none">
                    {match.map} <span className="text-white/40">· {match.format ?? `${match.team_size}v${match.team_size}`}</span>
                  </p>
                </div>
                <p className="text-sm text-white/60">
                  <span className={cn(match.winner === "A" && "font-semibold text-win")}>{team(match.team_a, match.names)}</span>
                  <span className="text-white/30"> vs </span>
                  <span className={cn(match.winner === "B" && "font-semibold text-win")}>{team(match.team_b, match.names)}</span>
                </p>
                <p className="text-xs text-white/40">{when(match.completed_at ?? match.created_at)}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-4">
                {OPEN.includes(match.status) ? <CancelMatch kind="classe" match={match} onDone={refresh} /> : null}
                <OpenLink href={`/cod/match/${match.id}`} match={match} role={role} userId={userId} openLabel="Ouvrir le match" />
              </div>
            </TacticalCard>
          );
        })
      )}
    </div>
  );
}

/** Étiquette du mode, dans sa couleur : Classé (vert) ou Division (cyan). */
function ModeChip({ kind }) {
  return (
    <span data-univers={kind === "division" ? "division" : "classe"}>
      <Chip>{kind === "division" ? "Division" : "Classé"}</Chip>
    </span>
  );
}

/** Ligne d'un match de Division : équipes (tag), score en maps, forfait, tournoi. */
function DivisionMatchRow({ match, label, tone, onCancelled, role, userId }) {
  return (
    <TacticalCard cut={18} innerClassName="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <ModeChip kind="division" />
          <Chip tone={tone}>{label}</Chip>
          {match.forfeit ? <Chip tone="neutral">Forfait</Chip> : null}
          {match.tournament_id ? <Chip tone="gold">Tournoi</Chip> : null}
          {match.corrected_at ? <Chip tone="gold">Corrigé</Chip> : null}
          <p className="font-display text-xl font-black uppercase leading-none">
            BO{match.best_of ?? 3} <span className="text-white/40">· {match.mapsA} – {match.mapsB}</span>
          </p>
        </div>
        <p className="text-sm text-white/60">
          <span className={cn(match.winner === "A" && "font-semibold text-win")}>
            <span className="normal-case">[{match.teamA?.tag}]</span> {match.teamA?.name ?? "Équipe"}
          </span>
          <span className="text-white/30"> vs </span>
          <span className={cn(match.winner === "B" && "font-semibold text-win")}>
            <span className="normal-case">[{match.teamB?.tag}]</span> {match.teamB?.name ?? "Équipe"}
          </span>
        </p>
        <p className="text-xs text-white/40">{when(match.completed_at ?? match.created_at)}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-4">
        {OPEN.includes(match.status) ? <CancelMatch kind="division" match={match} onDone={onCancelled} /> : null}
        <OpenLink href={`/cod/equipes/match/${match.id}`} match={match} role={role} userId={userId} openLabel="Ouvrir la feuille de match" />
      </div>
    </TacticalCard>
  );
}

/**
 * Annuler un match ouvert : classé (aucun point ne bouge), Division (match annulé, sans points) ou
 * match de coupe (la rencontre est bloquée : vainqueur à désigner dans l'onglet Tournoi).
 */
function CancelMatch({ kind, match, onDone }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const tournament = kind === "division" && Boolean(match.tournament_id);

  async function cancel() {
    setPending(true);
    setError(null);
    try {
      if (kind === "classe") await api(`/admin/matches/${match.id}/cancel`, { method: "POST" });
      else await api(`/teams/matches/${match.id}/resolve`, { method: "POST", body: { scores: null } });
      setOpen(false);
      onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button size="sm" variant="danger" onClick={() => setOpen(true)}>
        <LuBan aria-hidden className="h-4 w-4" />
        Annuler
      </Button>
      <ConfirmDialog open={open} onClose={() => setOpen(false)} title="Annuler ce match ?" confirmLabel="Annuler le match" tone="danger" pending={pending} onConfirm={cancel}>
        {tournament
          ? "Match de coupe : la rencontre sera bloquée, désigne ensuite qui passe dans l'onglet Tournoi."
          : "Le match est annulé pour tous les joueurs, aucun point ne bouge. Les joueurs sont prévenus."}
        {error ? <span className="mt-3 block text-loss">{error}</span> : null}
      </ConfirmDialog>
    </>
  );
}

/** « Corrections » (admin) : historique des corrections de matchs terminés. */
export function CorrectionsPanel() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/admin/corrections")
      .then((data) => setItems(data.items))
      .catch((caught) => (setError(caught.message), setItems([])));
  }, []);

  if (items === null) return <Loading />;
  return (
    <div className="space-y-4">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {items.length === 0 ? (
        <EmptyState title="Aucune correction">Aucun match terminé n&apos;a été corrigé.</EmptyState>
      ) : (
        items.map((item) => {
          const ids = item.match ? [...item.match.team_a, ...item.match.team_b] : Object.keys(item.points_before ?? {});
          return (
            <TacticalCard key={item.id} cut={18} innerClassName="space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <LuShieldAlert aria-hidden className="h-5 w-5 text-gold" />
                <Chip tone={item.action === "cancel" ? "loss" : "gold"}>{item.action === "cancel" ? "Match annulé" : "Vainqueur inversé"}</Chip>
                <p className="font-display text-xl font-black uppercase leading-none">
                  {item.match?.map ?? "Match"}{" "}
                  <span className="text-white/40">· {item.match?.format ?? (item.match ? `${item.match.team_size}v${item.match.team_size}` : "")}</span>
                </p>
              </div>
              <p className="text-sm text-white/60">
                Par <span className="font-semibold text-white">{item.names[item.staff_id] ?? "?"}</span> le {when(item.created_at)} ·{" "}
                {item.action === "cancel"
                  ? `équipe ${item.previous_winner === "A" ? "1" : "2"} n'est plus gagnante`
                  : `équipe ${item.previous_winner === "A" ? "1" : "2"} → équipe ${item.new_winner === "A" ? "1" : "2"}`}
              </p>
              <p className="border-l-2 border-gold/50 pl-3 text-sm text-white/80">{item.reason}</p>
              <ul className="grid grid-cols-1 gap-1 font-tech text-xs text-white/60 sm:grid-cols-2">
                {ids.map((id) => (
                  <li key={id}>
                    {item.names[id] ?? "?"} : {signed(item.points_before?.[id] ?? 0)}
                    {item.action === "swap" ? ` → ${signed(item.points_after?.[id] ?? 0)}` : " → annulé"}
                  </li>
                ))}
              </ul>
              <Link href={`/cod/match/${item.match_id}`} className="inline-flex items-center gap-1.5 text-sm text-gold underline underline-offset-4">
                Voir le match
                <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
              </Link>
            </TacticalCard>
          );
        })
      )}
    </div>
  );
}
