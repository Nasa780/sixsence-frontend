import Link from "next/link";
import { useEffect, useState } from "react";
import { LuExternalLink, LuShieldAlert } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
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
const signed = (value) => (value > 0 ? `+${value}` : `${value}`);

/**
 * « Matchs » : les derniers matchs, ou ceux d'un joueur (recherche par pseudo), pour retrouver
 * un match à corriger. Lien vers la page du match (bloc « Corriger le résultat »).
 */
export function MatchesPanel() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState(null);

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
  }, [query]);

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
          if (match.kind === "division") return <DivisionMatchRow key={`d-${match.id}`} match={match} label={label} tone={tone} />;
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
              <Link href={`/cod/match/${match.id}`} className="inline-flex shrink-0 items-center gap-1.5 text-sm text-gold underline underline-offset-4">
                {match.status === "completed" ? "Ouvrir (correction possible)" : "Ouvrir le match"}
                <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
              </Link>
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
function DivisionMatchRow({ match, label, tone }) {
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
      <Link href={`/cod/equipes/match/${match.id}`} className="inline-flex shrink-0 items-center gap-1.5 text-sm text-gold underline underline-offset-4">
        {match.status === "completed" ? "Ouvrir (correction possible)" : "Ouvrir la feuille de match"}
        <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
      </Link>
    </TacticalCard>
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
