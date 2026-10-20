import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuExternalLink, LuLoaderCircle } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { TeamCrest, fieldClass, labelClass } from "../teams/TeamParts";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Chip, EmptyState, Loading, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

const STATUS = { scheduled: "Prévu", running: "En cours", completed: "Terminé", cancelled: "Annulé" };
const dateFr = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Onglet admin « Tournoi » : création du tournoi de fin de saison (aperçu des qualifiés), suivi
 * (rencontres bloquées, vainqueur désigné à la main), annulation.
 */
export function TournamentPanel() {
  const [current, setCurrent] = useState(undefined);
  const [form, setForm] = useState({ name: "", startsAt: "", size: 16 });
  const [preview, setPreview] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadCurrent = useCallback(() => api("/teams/tournament").then((data) => setCurrent(data.tournament)), []);
  useEffect(() => {
    loadCurrent().catch(() => setCurrent(null));
  }, [loadCurrent]);
  useEffect(() => {
    setPreview(null);
    api(`/admin/tournaments/preview?size=${form.size}`)
      .then(setPreview)
      .catch(() => setPreview({ qualified: [], size: form.size, minMatches: 25 }));
  }, [form.size]);

  async function run(key, action, done) {
    setPending(key);
    setError(null);
    setMessage(null);
    try {
      await action();
      if (done) setMessage(done);
      await loadCurrent();
      return true;
    } catch (caught) {
      setError(caught.message);
      return false;
    } finally {
      setPending(null);
    }
  }

  const active = current && (current.status === "scheduled" || current.status === "running");
  const toDecide = active ? current.rounds.flatMap((round) => round.entries.map((entry) => ({ ...entry, roundName: round.name }))).filter((entry) => entry.id && entry.teamA && entry.teamB && (entry.status === "blocked" || entry.status === "playing")) : [];

  return (
    <div className="space-y-10">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}
      {current === undefined ? <Loading /> : null}

      {current ? (
        <TacticalCard highlight={active} cut={20} innerClassName="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-3xl font-black uppercase leading-none">{current.name}</p>
              <p className="mt-2 text-sm text-white/55">
                {current.teams.length} équipes · {current.size} places · {dateFr(current.startsAt)}
                {current.status === "scheduled" ? ` · check-in ${current.teams.filter((team) => team.checkedIn).length} / ${current.teams.length}` : ""}
              </p>
            </div>
            <Chip tone={current.status === "running" ? "win" : current.status === "cancelled" ? "loss" : current.status === "completed" ? "neutral" : "gold"}>{STATUS[current.status]}</Chip>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/cod/tournoi" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline underline-offset-4">
              Voir le tableau
              <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
            </Link>
            {active ? (
              <Button size="sm" variant="danger" disabled={pending !== null} onClick={() => setCancelling(true)}>
                Annuler le tournoi
              </Button>
            ) : null}
          </div>
          {toDecide.length > 0 ? (
            <div className="space-y-2 border-t border-white/10 pt-4">
              <p className={labelClass}>Rencontres en cours ou bloquées</p>
              {toDecide.map((entry) => (
                <div key={entry.id} className={cn("flex flex-wrap items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-2.5", entry.status === "blocked" ? "border-loss" : "border-gold/60")}>
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">{entry.roundName}</span>{" "}
                    <span className="font-display text-lg font-bold uppercase">
                      <span className="normal-case">[{entry.teamA.tag}]</span> vs <span className="normal-case">[{entry.teamB.tag}]</span>
                    </span>
                    {entry.status === "blocked" ? <span className="ml-2 text-xs text-loss">match annulé : à trancher</span> : null}
                  </span>
                  {entry.matchId ? (
                    <Link href={`/cod/equipes/match/${entry.matchId}`} className="text-xs text-white/55 underline hover:text-gold">
                      Feuille
                    </Link>
                  ) : null}
                  {["A", "B"].map((side) => (
                    <Button
                      key={side}
                      size="sm"
                      variant={side === "A" ? "primary" : "outline"}
                      disabled={pending !== null}
                      onClick={() =>
                        run(`${entry.id}-${side}`, () => api(`/admin/tournaments/${current.id}/entries/${entry.id}/winner`, { method: "POST", body: { side } }), "Vainqueur désigné, le tableau avance.")
                      }
                    >
                      <span className="normal-case">[{(side === "A" ? entry.teamA : entry.teamB).tag}]</span> gagne
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </TacticalCard>
      ) : null}

      {!active && current !== undefined ? (
        <section aria-labelledby="titre-nouveau-tournoi" className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <TacticalCard innerClassName="space-y-4 p-6">
            <h2 id="titre-nouveau-tournoi" className="font-display text-3xl font-black uppercase leading-none">
              Nouveau tournoi
            </h2>
            <div>
              <label htmlFor="t-name" className={labelClass}>
                Nom
              </label>
              <input id="t-name" className={fieldClass} maxLength={60} placeholder="Tournoi de fin de saison 1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="t-start" className={labelClass}>
                  Début (heure de Paris)
                </label>
                <input id="t-start" type="datetime-local" className={fieldClass} value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
              </div>
              <div>
                <label htmlFor="t-size" className={labelClass}>
                  Places
                </label>
                <select id="t-size" className={fieldClass} value={form.size} onChange={(event) => setForm({ ...form, size: Number(event.target.value) })}>
                  {[8, 16, 32].map((size) => (
                    <option key={size} value={size}>
                      {size} équipes
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-white/45">
              À la création, les qualifiés et leurs effectifs sont figés et prévenus. Check-in 30 min avant ; le tournoi se déroule ensuite tout seul (BO3, finale en BO5).
            </p>
            <Button
              disabled={pending !== null || !form.name.trim() || !form.startsAt || (preview?.qualified?.length ?? 0) < 2}
              onClick={() =>
                run("create", () => api("/admin/tournaments", { method: "POST", body: { name: form.name, size: form.size, startsAt: new Date(form.startsAt).toISOString() } }), "Tournoi créé : les équipes qualifiées sont prévenues.")
              }
            >
              {pending === "create" ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
              Créer le tournoi
            </Button>
          </TacticalCard>
          <TacticalCard innerClassName="p-6">
            <p className={labelClass}>
              Qualifiés si le tournoi était créé maintenant ({preview?.minMatches ?? 25} matchs minimum)
            </p>
            {preview === null ? (
              <Loading />
            ) : preview.qualified.length === 0 ? (
              <EmptyState title="Aucune équipe qualifiable">Aucune équipe n&apos;a encore joué {preview.minMatches} matchs.</EmptyState>
            ) : (
              <ul className="mt-2 space-y-1.5">
                {preview.qualified.map((team) => (
                  <li key={team.id} className="flex items-center gap-3 border-l-2 border-white/10 bg-white/[0.03] px-3 py-2">
                    <span className="w-7 font-tech text-xs text-gold">#{team.seed}</span>
                    <TeamCrest team={team} size={28} />
                    <span className="min-w-0 flex-1 truncate font-display text-base font-bold uppercase leading-none">{team.name}</span>
                    <span className="font-tech text-xs text-white/55">{team.points} pts</span>
                  </li>
                ))}
              </ul>
            )}
          </TacticalCard>
        </section>
      ) : null}

      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        title="Annuler le tournoi ?"
        confirmLabel="Annuler le tournoi"
        tone="danger"
        pending={pending !== null}
        onConfirm={async () => {
          const ok = await run("cancel", () => api(`/admin/tournaments/${current.id}`, { method: "DELETE" }), "Tournoi annulé.");
          if (ok) setCancelling(false);
        }}
      >
        Les matchs de tournoi en cours sont annulés et aucun trophée n&apos;est attribué. Action définitive.
      </ConfirmDialog>
    </div>
  );
}
