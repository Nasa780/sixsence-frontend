import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuExternalLink, LuSearch } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { TEAM_LIMITS } from "../../lib/teams";
import { TeamCrest, fieldClass } from "../teams/TeamParts";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Chip, EmptyState, Loading, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

const STATUS = { open: "En attente", resolved: "Traités", rejected: "Sans suite" };
const dateFr = (iso) => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "numeric", hour: "2-digit", minute: "2-digit" });

/**
 * Onglet admin « Équipes » (staff et admins) : signalements d'équipes, liste des équipes,
 * retrait du logo, de la bannière ou de la description, renommage, dissolution.
 */
export function TeamsPanel() {
  const [status, setStatus] = useState("open");
  const [reports, setReports] = useState(null);
  const [teams, setTeams] = useState(null);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [renaming, setRenaming] = useState(null);
  const [disbanding, setDisbanding] = useState(null);

  const loadReports = useCallback(() => api(`/admin/team-reports?status=${status}`).then((data) => setReports(data.items)), [status]);
  const loadTeams = useCallback(() => api(`/admin/teams?q=${encodeURIComponent(query.trim())}`).then((data) => setTeams(data.teams)), [query]);

  useEffect(() => {
    setReports(null);
    loadReports().catch(() => setReports([]));
  }, [loadReports]);
  useEffect(() => {
    const timer = setTimeout(() => loadTeams().catch(() => setTeams([])), 250);
    return () => clearTimeout(timer);
  }, [loadTeams]);

  async function run(key, action, done) {
    setPending(key);
    setError(null);
    setMessage(null);
    try {
      await action();
      if (done) setMessage(done);
      await Promise.all([loadReports(), loadTeams()]);
      return true;
    } catch (caught) {
      setError(caught.message);
      return false;
    } finally {
      setPending(null);
    }
  }

  const moderate = (team, body, done) => run(`${team.id}-${Object.keys(body)[0]}`, () => api(`/admin/teams/${team.id}`, { method: "PATCH", body }), done);

  return (
    <div className="space-y-12">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}

      <section aria-labelledby="titre-signalements-equipes" className="space-y-5">
        <h2 id="titre-signalements-equipes" className="font-display text-3xl font-black uppercase leading-none">
          Signalements d&apos;équipes
        </h2>
        <div role="tablist" aria-label="Statut" className="flex flex-wrap gap-2">
          {Object.entries(STATUS).map(([key, label]) => (
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
        {reports === null ? (
          <Loading />
        ) : reports.length === 0 ? (
          <EmptyState title="Rien ici">{status === "open" ? "Aucun signalement d'équipe en attente." : "Aucun élément."}</EmptyState>
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report.id}>
                <TacticalCard cut={16} innerClassName="p-5">
                  <div className="flex flex-wrap items-start gap-4">
                    {report.team ? <TeamCrest team={report.team} size={52} /> : null}
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl font-black uppercase leading-none">{report.reasonLabel}</p>
                      <p className="mt-2 text-sm text-white/60">
                        {report.team ? (
                          <Link href={`/cod/equipes/${report.team.id}`} className="font-semibold text-white hover:text-gold">
                            [{report.team.tag}] {report.team.name}
                          </Link>
                        ) : (
                          "Équipe inconnue"
                        )}
                        {report.team?.disbanded ? " (dissoute)" : ""} · signalé par {report.reporter} · {dateFr(report.createdAt)}
                      </p>
                      {report.details ? <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/75">{report.details}</p> : null}
                    </div>
                  </div>
                  {report.status === "open" ? (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                      {report.team && !report.team.disbanded && report.reason === "logo" && report.team.logoUrl ? (
                        <Button size="sm" variant="danger" disabled={pending !== null} onClick={() => moderate(report.team, { clearLogo: true }, "Logo retiré, signalement traité.")}>
                          Retirer le logo
                        </Button>
                      ) : null}
                      {report.team && !report.team.disbanded && report.reason === "banner" && report.team.bannerUrl ? (
                        <Button size="sm" variant="danger" disabled={pending !== null} onClick={() => moderate(report.team, { clearBanner: true }, "Bannière retirée, signalement traité.")}>
                          Retirer la bannière
                        </Button>
                      ) : null}
                      {report.team && !report.team.disbanded && report.reason === "description" && report.team.description ? (
                        <Button size="sm" variant="danger" disabled={pending !== null} onClick={() => moderate(report.team, { clearDescription: true }, "Description retirée, signalement traité.")}>
                          Retirer la description
                        </Button>
                      ) : null}
                      {report.team && !report.team.disbanded && report.reason === "name" ? (
                        <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => setRenaming({ team: report.team, name: report.team.name, tag: report.team.tag })}>
                          Renommer
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending !== null}
                        onClick={() => run(`${report.id}-resolved`, () => api(`/admin/team-reports/${report.id}`, { method: "POST", body: { status: "resolved" } }))}
                      >
                        Traité
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending !== null}
                        onClick={() => run(`${report.id}-rejected`, () => api(`/admin/team-reports/${report.id}`, { method: "POST", body: { status: "rejected" } }))}
                      >
                        Sans suite
                      </Button>
                    </div>
                  ) : null}
                </TacticalCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titre-liste-equipes" className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="titre-liste-equipes" className="font-display text-3xl font-black uppercase leading-none">
            Équipes{teams ? ` · ${teams.length}` : ""}
          </h2>
          <div className="relative sm:w-72">
            <LuSearch aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input className={cn(fieldClass, "pl-10")} placeholder="Nom ou tag…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Rechercher une équipe" />
          </div>
        </div>
        {teams === null ? (
          <Loading />
        ) : teams.length === 0 ? (
          <EmptyState title="Aucune équipe">{query ? "Aucune équipe ne correspond." : "Aucune équipe pour l'instant."}</EmptyState>
        ) : (
          <ul className="space-y-2">
            {teams.map((team) => (
              <li key={team.id} className={cn("flex flex-wrap items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-3 sm:px-4", team.openReports > 0 ? "border-loss" : "border-white/10")}>
                <TeamCrest team={team} size={42} />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-display text-xl font-bold uppercase leading-none">{team.name}</span>
                    <span className="font-tech text-xs tracking-[0.2em]" style={{ color: team.color }}>
                      [{team.tag}]
                    </span>
                    {team.openReports > 0 ? (
                      <Chip tone="loss">
                        {team.openReports} signalement{team.openReports > 1 ? "s" : ""}
                      </Chip>
                    ) : null}
                  </p>
                  <p className="mt-1.5 text-xs text-white/50">
                    #{team.position} · {team.points} pts · {team.size} / {TEAM_LIMITS.maxMembers} joueurs · couronne : {team.crown}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/cod/equipes/${team.id}`} className="inline-flex items-center gap-1 px-2 text-xs text-white/55 hover:text-gold" aria-label={`Voir la fiche de ${team.name}`}>
                    <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
                    Fiche
                  </Link>
                  <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => setRenaming({ team, name: team.name, tag: team.tag })}>
                    Renommer
                  </Button>
                  {team.logoUrl ? (
                    <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => moderate(team, { clearLogo: true }, `Logo de ${team.name} retiré.`)}>
                      Retirer logo
                    </Button>
                  ) : null}
                  {team.bannerUrl ? (
                    <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => moderate(team, { clearBanner: true }, `Bannière de ${team.name} retirée.`)}>
                      Retirer bannière
                    </Button>
                  ) : null}
                  <Button size="sm" variant="danger" disabled={pending !== null} onClick={() => setDisbanding(team)}>
                    Dissoudre
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title={`Renommer ${renaming?.team.name ?? ""}`}
        confirmLabel="Renommer"
        pending={pending !== null}
        onConfirm={async () => {
          const ok = await moderate(renaming.team, { name: renaming.name, tag: renaming.tag }, "Équipe renommée, Leaders prévenus.");
          if (ok) setRenaming(null);
        }}
      >
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <input className={fieldClass} value={renaming?.name ?? ""} maxLength={24} onChange={(event) => setRenaming({ ...renaming, name: event.target.value })} aria-label="Nouveau nom" />
          <input
            className={cn(fieldClass, "font-tech uppercase tracking-[0.2em]")}
            value={renaming?.tag ?? ""}
            onChange={(event) => setRenaming({ ...renaming, tag: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) })}
            aria-label="Nouveau tag"
          />
        </div>
        <p className="mt-3">Les Leaders de l&apos;équipe sont prévenus et ses signalements en attente classés « traités ».</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={Boolean(disbanding)}
        onClose={() => setDisbanding(null)}
        title={`Dissoudre ${disbanding?.name ?? ""} ?`}
        confirmLabel="Dissoudre"
        tone="danger"
        pending={pending !== null}
        onConfirm={async () => {
          const ok = await run(`${disbanding.id}-disband`, () => api(`/admin/teams/${disbanding.id}`, { method: "DELETE" }), `${disbanding.name} a été dissoute.`);
          if (ok) setDisbanding(null);
        }}
      >
        Tous les joueurs sont libérés (sans délai) et prévenus ; l&apos;équipe disparaît du classement. Action définitive.
      </ConfirmDialog>
    </div>
  );
}
