import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LuExternalLink, LuImagePlus, LuLoaderCircle, LuRotateCcw } from "react-icons/lu";
import { api } from "../../lib/api";
import { generatedPoster, uploadCupPoster } from "../../lib/cups";
import { cn } from "../../lib/cn";
import { TeamCrest, fieldClass, labelClass } from "../teams/TeamParts";
import { OrganisationMessages } from "../tournament/TournamentViews";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Chip, EmptyState, Loading, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

const STATUS = { scheduled: "Prévu", running: "En cours", completed: "Terminé", cancelled: "Annulé" };
const VIA = { circuit: "Circuit", playin: "Play-in", division: "Division" };
const dateFr = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Tournoi de fin de saison (sous-onglet Fin de saison) : aperçu des qualifiés, création, suivi (rencontres bloquées,
 * vainqueur désigné à la main), annulation.
 */
function SeasonTab() {
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

  return (
    <div className="space-y-10">
      <h2 className="border-t border-white/10 pt-8 font-display text-3xl font-black uppercase leading-none">Tournoi de fin de saison</h2>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}
      {current === undefined ? <Loading /> : null}

      {current ? <ActiveTournamentCard current={current} pending={pending} run={run} onCancel={() => setCancelling(true)} /> : null}

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
              À la création, les qualifiés et leurs effectifs sont figés et prévenus. Check-in de 2 h à 15 min avant, tirage dévoilé 15 min avant ; le tournoi se déroule ensuite tout seul (BO3, finale en BO5).
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
                    {team.via ? <span className="font-tech text-[9px] uppercase text-white/45">{VIA[team.via]}</span> : null}
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

/** Tournoi prévu, en cours ou terminé : statut, lien vers le tableau, rencontres à trancher, annulation. */
function ActiveTournamentCard({ current, pending, run, onCancel }) {
  const active = current.status === "scheduled" || current.status === "running";
  const entries = current.rounds.flatMap((round) => round.entries.map((entry) => ({ ...entry, roundName: round.name })));
  if (current.thirdPlace) entries.push({ ...current.thirdPlace.entry, roundName: current.thirdPlace.name });
  const toDecide = active ? entries.filter((entry) => entry.id && entry.teamA && entry.teamB && (entry.status === "blocked" || entry.status === "playing")) : [];
  return (
      <TacticalCard highlight={active} cut={20} innerClassName="space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-3xl font-black uppercase leading-none">{current.name}</p>
            <p className="mt-2 text-sm text-white/55">
              {current.kind === "anubis"
                ? `${current.registered} joueurs · équipes de ${current.teamSize} · ${current.size} équipes max · ${dateFr(current.startsAt)}${current.status === "scheduled" ? ` · check-in ${current.checkedInCount} / ${current.registered}` : ` · ${current.squads.length} équipes formées`}`
                : `${current.teams.length} équipes · ${current.size} places · ${dateFr(current.startsAt)}${current.status === "scheduled" ? ` · check-in ${current.teams.filter((team) => team.checkedIn).length} / ${current.teams.length}` : ""}`}
            </p>
          </div>
          <Chip tone={current.status === "running" ? "win" : current.status === "cancelled" ? "loss" : current.status === "completed" ? "neutral" : "gold"}>{STATUS[current.status]}</Chip>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/cod/tournoi?id=${current.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline underline-offset-4">
            Voir le tableau
            <LuExternalLink aria-hidden className="h-3.5 w-3.5" />
          </Link>
          {active ? (
            <Button size="sm" variant="danger" disabled={pending !== null} onClick={onCancel}>
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
  );
}

/**
 * Play-in (admin) : à créer avant la grande finale. 7e et 8e du circuit contre les 2 meilleures équipes de la Division
 * (BO3, check-in comme le tournoi de saison) ; les 2 vainqueurs prennent les dernières places de la grande finale.
 */
function PlayInPanel() {
  const [overview, setOverview] = useState(undefined);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ startsAt: "", size: 8 });
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    const [admin, tournament] = await Promise.all([api(`/admin/playin?size=${form.size}`), api("/teams/tournament?kind=playin")]);
    setOverview(admin.playIn);
    setCurrent(tournament.tournament);
  }, [form.size]);
  useEffect(() => {
    load().catch(() => setOverview(null));
  }, [load]);

  async function run(key, action, done) {
    setPending(key);
    setError(null);
    setMessage(null);
    try {
      await action();
      if (done) setMessage(done);
      await load();
      return true;
    } catch (caught) {
      setError(caught.message);
      return false;
    } finally {
      setPending(null);
    }
  }

  const exists = overview && !overview.projected;
  return (
    <section aria-labelledby="titre-playin-admin" className="space-y-4 border-t border-white/10 pt-8">
      <div>
        <p className={labelClass}>Seconde chance, avant la grande finale</p>
        <h2 id="titre-playin-admin" className="font-display text-3xl font-black uppercase leading-none">
          Play-in
        </h2>
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}
      {overview === undefined ? <Loading /> : null}
      {exists && current ? <ActiveTournamentCard current={current} pending={pending} run={run} onCancel={() => setCancelling(true)} /> : null}
      {overview === null ? (
        <EmptyState title="Pas de play-in possible pour l'instant">
          Il faut {form.size} équipes au circuit (Coupes Horus terminées cette saison) et 2 équipes de Division (25 matchs) pas encore qualifiées. Sans play-in, la grande finale prend
          directement les 2 meilleures de la Division.
        </EmptyState>
      ) : null}
      {overview && overview.projected ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <TacticalCard innerClassName="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="p-start" className={labelClass}>
                  Début (heure de Paris)
                </label>
                <input id="p-start" type="datetime-local" className={fieldClass} value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
              </div>
              <div>
                <label htmlFor="p-size" className={labelClass}>
                  Places de la grande finale
                </label>
                <select id="p-size" className={fieldClass} value={form.size} onChange={(event) => setForm({ ...form, size: Number(event.target.value) })}>
                  {[8, 16, 32].map((size) => (
                    <option key={size} value={size}>
                      {size} équipes
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-white/45">À créer la veille de la grande finale : équipes et effectifs figés et prévenus, check-in de 2 h à 15 min avant, 2 rencontres BO3.</p>
            <Button
              disabled={pending !== null || !form.startsAt}
              onClick={() => run("create", () => api("/admin/playin", { method: "POST", body: { size: form.size, startsAt: new Date(form.startsAt).toISOString() } }), "Play-in créé : les 4 équipes sont prévenues.")}
            >
              {pending === "create" ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
              Créer le play-in
            </Button>
          </TacticalCard>
          <TacticalCard innerClassName="space-y-2 p-6">
            <p className={labelClass}>Affiches si le play-in était créé maintenant</p>
            {overview.pairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-3 border-l-2 border-white/10 bg-white/[0.03] px-3 py-2.5">
                <span className="font-tech text-[10px] uppercase text-white/45">#{index + 1}</span>
                <TeamCrest team={pair.a} size={26} />
                <span className="min-w-0 flex-1 truncate font-display text-base font-bold uppercase">{pair.a?.name}</span>
                <span className="font-display text-sm text-white/35">VS</span>
                <span className="min-w-0 flex-1 truncate text-right font-display text-base font-bold uppercase">{pair.b?.name}</span>
                <TeamCrest team={pair.b} size={26} />
              </div>
            ))}
          </TacticalCard>
        </div>
      ) : null}
      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        title="Annuler le play-in ?"
        confirmLabel="Annuler le play-in"
        tone="danger"
        pending={pending !== null}
        onConfirm={async () => {
          const ok = await run("cancel", () => api(`/admin/tournaments/${current.id}`, { method: "DELETE" }), "Play-in annulé.");
          if (ok) setCancelling(false);
        }}
      >
        Les matchs en cours sont annulés. Sans play-in joué, la grande finale prend directement les 2 meilleures de la Division.
      </ConfirmDialog>
    </section>
  );
}

const WEEKDAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

/**
 * Affiche d'une coupe ou d'un rendez-vous : aperçu, envoi d'une image (compressée en WebP), retour à l'affiche générée.
 * onChange(url | null) enregistre le choix.
 */
function PosterField({ poster, custom, onChange, disabled = false }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function pick(file) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await onChange(await uploadCupPoster(file));
    } catch (caught) {
      setError(caught.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[15rem] space-y-2">
      <img src={poster} alt="Affiche" className="aspect-[3/4] w-full border border-white/10 bg-ink object-contain" />
      <label className={cn("flex cursor-pointer items-center justify-center gap-2 border border-white/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/75 hover:border-gold hover:text-gold", (busy || disabled) && "pointer-events-none opacity-50")}>
        {busy ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuImagePlus aria-hidden className="h-4 w-4" />}
        {custom ? "Changer l'affiche" : "Envoyer une affiche"}
        <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => pick(event.target.files?.[0])} />
      </label>
      {custom ? (
        <button type="button" disabled={busy || disabled} onClick={() => onChange(null)} className="flex w-full items-center justify-center gap-1.5 py-1 text-xs text-white/50 hover:text-gold disabled:opacity-50">
          <LuRotateCcw aria-hidden className="h-3.5 w-3.5" />
          Revenir à l&apos;affiche générée
        </button>
      ) : null}
      {error ? <p className="text-xs text-loss">{error}</p> : null}
    </div>
  );
}

/** Heure locale du navigateur pour un champ datetime-local : « 2026-11-01T20:30 ». */
const toLocalInput = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const KIND_NAME = { horus: "Coupe Horus", anubis: "Coupe Anubis" };
const CUP_STATUS = {
  scheduled: ["Prévue", "gold"],
  running: ["En cours", "win"],
  completed: ["Terminée", "neutral"],
  cancelled: ["Annulée", "loss"],
};

/**
 * Formulaire d'une coupe (date et heure) ou d'un rendez-vous (jour et heure chaque semaine), en création ou en
 * modification : type (Horus / Anubis), nom, date, format, affiche. `lockFormat` : check-in ouvert, seuls le nom et
 * l'affiche changent. onSubmit(body) envoie au backend.
 */
function CupForm({ mode, initial = null, lockFormat = false, testTeamSize = false, onSubmit, onCancel }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState(() => ({
    kind: initial?.kind ?? "horus",
    name: initial?.name ?? "",
    startsAt: toLocalInput(initial?.startsAt),
    weekday: initial?.weekday ?? 0,
    time: initial?.time ?? "20:00",
    size: initial?.size ?? 8,
    bestOf: initial?.bestOf ?? 3,
    finalBestOf: initial?.finalBestOf ?? 3,
    bracket: initial?.bracket ?? "single",
    losersBestOf: initial?.losersBestOf ?? null,
    teamSize: initial?.teamSize ?? 4,
    posterUrl: initial?.posterUrl ?? null,
  }));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const anubis = form.kind === "anubis";
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const body = { kind: form.kind, name: form.name.trim(), size: form.size, bestOf: form.bestOf, finalBestOf: form.finalBestOf, bracket: form.bracket, losersBestOf: form.bracket === "double" ? form.losersBestOf : null, posterUrl: form.posterUrl, teamSize: form.teamSize };
      await onSubmit(mode === "schedule" ? { ...body, weekday: form.weekday, time: form.time } : { ...body, startsAt: new Date(form.startsAt).toISOString() });
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  const ready = form.name.trim().length >= 3 && (mode === "schedule" || form.startsAt);
  return (
    <form onSubmit={submit} className="space-y-4 border border-gold/30 bg-gold/[0.03] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-xl font-black uppercase leading-none">
          {editing ? (mode === "schedule" ? "Modifier le rendez-vous" : "Modifier la coupe") : mode === "schedule" ? "Nouveau rendez-vous" : "Nouvelle coupe"}
        </p>
        {editing ? (
          <Chip>{KIND_NAME[form.kind]}</Chip>
        ) : (
          <div className="flex gap-2">
            {["horus", "anubis"].map((kind) => (
              <Button key={kind} type="button" size="sm" variant={form.kind === kind ? "primary" : "outline"} onClick={() => set({ kind, bestOf: kind === "anubis" ? 1 : 3, finalBestOf: 3 })}>
                {KIND_NAME[kind]}
              </Button>
            ))}
          </div>
        )}
      </div>
      {lockFormat ? <Notice>Le check-in est ouvert : seuls le nom et l&apos;affiche se modifient encore.</Notice> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 space-y-4">
          <div>
            <label htmlFor={`f-name-${mode}`} className={labelClass}>
              Nom
            </label>
            <input id={`f-name-${mode}`} className={fieldClass} maxLength={60} placeholder={anubis ? "Coupe Anubis · Le Jugement" : "Coupe Horus · Le Faucon"} value={form.name} onChange={(event) => set({ name: event.target.value })} />
          </div>
          {mode === "schedule" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-day" className={labelClass}>
                  Jour
                </label>
                <select id="f-day" className={fieldClass} value={form.weekday} onChange={(event) => set({ weekday: Number(event.target.value) })}>
                  {WEEKDAYS.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="f-time" className={labelClass}>
                  Heure (Paris)
                </label>
                <input id="f-time" type="time" className={fieldClass} value={form.time} onChange={(event) => set({ time: event.target.value })} />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="f-start" className={labelClass}>
                Début (heure de Paris)
              </label>
              <input id="f-start" type="datetime-local" disabled={lockFormat} className={cn(fieldClass, "disabled:opacity-50")} value={form.startsAt} onChange={(event) => set({ startsAt: event.target.value })} />
            </div>
          )}
          <fieldset disabled={lockFormat} className={cn("min-w-0 space-y-4", lockFormat && "opacity-50")}>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label htmlFor={`f-team-${mode}`} className={labelClass}>
                  Joueurs / équipe
                </label>
                <select id={`f-team-${mode}`} className={fieldClass} value={form.teamSize} onChange={(event) => set({ teamSize: Number(event.target.value) })}>
                  {(testTeamSize ? [1, 2, 3, 4, 5] : [2, 3, 4, 5]).map((size) => (
                    <option key={size} value={size}>
                      {size}v{size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`f-size-${mode}`} className={labelClass}>
                  Équipes max
                </label>
                <select id={`f-size-${mode}`} className={fieldClass} value={form.size} onChange={(event) => set({ size: Number(event.target.value) })}>
                  {[4, 8, 16].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`f-bo-${mode}`} className={labelClass}>
                  Matchs
                </label>
                <select id={`f-bo-${mode}`} className={fieldClass} value={form.bestOf} onChange={(event) => set({ bestOf: Number(event.target.value), finalBestOf: 3 })}>
                  <option value={1}>BO1</option>
                  <option value={3}>BO3</option>
                </select>
              </div>
              <div>
                <label htmlFor={`f-final-${mode}`} className={labelClass}>
                  Finale
                </label>
                <select id={`f-final-${mode}`} className={fieldClass} value={form.finalBestOf} onChange={(event) => set({ finalBestOf: Number(event.target.value) })}>
                  <option value={3}>BO3</option>
                  {form.bestOf === 3 ? <option value={5}>BO5</option> : null}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["single", "Élimination directe"],
                ["double", "Double élimination"],
              ].map(([bracket, label]) => (
                <Button key={bracket} type="button" size="sm" variant={form.bracket === bracket ? "primary" : "outline"} onClick={() => set({ bracket })}>
                  {label}
                </Button>
              ))}
            </div>
            {form.bracket === "double" ? (
              <div>
                <label htmlFor={`f-losers-${mode}`} className={labelClass}>
                  Tableau des perdants
                </label>
                <select
                  id={`f-losers-${mode}`}
                  className={fieldClass}
                  value={form.losersBestOf ?? ""}
                  onChange={(event) => set({ losersBestOf: event.target.value ? Number(event.target.value) : null })}
                >
                  <option value="">Comme les autres matchs (BO{form.bestOf})</option>
                  <option value={1}>BO1</option>
                  <option value={3}>BO3</option>
                </select>
              </div>
            ) : null}
          </fieldset>
        </div>
        <div>
          <p className={labelClass}>Affiche</p>
          <div className="mt-2">
            <PosterField
              poster={form.posterUrl ?? generatedPoster({ kind: form.kind, name: form.name, size: form.size, bestOf: form.bestOf, bracket: form.bracket, teamSize: form.teamSize })}
              custom={Boolean(form.posterUrl)}
              onChange={(url) => set({ posterUrl: url })}
            />
          </div>
        </div>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || !ready}>
          {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
          {editing ? "Enregistrer" : mode === "schedule" ? "Créer le rendez-vous" : "Créer la coupe"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

/**
 * Coupe en direct (onglet Coupes, dès l'ouverture du check-in) : étape, chiffres clés, check-in de chaque équipe ou
 * joueur, puis rencontres en cours et bloquées avec leur score, la feuille de match et « … gagne » pour trancher.
 * Relu toutes les 20 s (onglet visible).
 */
function LiveCupPanel({ cup, onChanged }) {
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const load = useCallback(() => api(`/teams/tournaments/${cup.id}`).then(setData), [cup.id]);
  useEffect(() => {
    load().catch((caught) => setError(caught.message));
    const timer = setInterval(() => document.visibilityState === "visible" && load().catch(() => {}), 20_000);
    return () => clearInterval(timer);
  }, [load]);

  async function decide(entry, side) {
    setPending(`${entry.id}-${side}`);
    setError(null);
    setMessage(null);
    try {
      await api(`/admin/tournaments/${cup.id}/entries/${entry.id}/winner`, { method: "POST", body: { side } });
      setMessage(`Victoire de [${(side === "A" ? entry.teamA : entry.teamB).tag}] : le tableau avance.`);
      await load();
      onChanged?.();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }

  if (!data) return error ? <Notice tone="error">{error}</Notice> : <Loading />;
  const anubis = data.kind === "anubis";
  const entries = (data.rounds ?? []).flatMap((round) => round.entries.map((entry) => ({ ...entry, roundName: round.name })));
  if (data.thirdPlace) entries.push({ ...data.thirdPlace.entry, roundName: data.thirdPlace.name });
  const real = entries.filter((entry) => entry.teamA && entry.teamB);
  const blocked = real.filter((entry) => entry.status === "blocked");
  const playing = real.filter((entry) => entry.status === "playing");
  const finished = real.filter((entry) => entry.status === "done").length;
  const people = anubis ? data.players ?? [] : data.teams ?? [];
  const checked = anubis ? data.checkedInCount ?? 0 : people.filter((item) => item.checkedIn).length;
  const started = data.status === "running" && Date.now() >= new Date(data.startsAt).getTime();
  const phase = data.status === "scheduled" ? "Check-in en cours" : started ? "Coupe en cours" : `Tirage effectué · début à ${new Date(data.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  const stats =
    data.status === "scheduled"
      ? [["Check-in", `${checked}/${people.length}`], [anubis ? "Joueurs inscrits" : "Équipes inscrites", people.length], ["Minimum", `${data.minTeams ?? 4} équipes`]]
      : [["Matchs en cours", playing.length], ["À trancher", blocked.length], ["Terminés", finished]];

  const matchRow = (entry) => (
    <li key={entry.id} className={cn("flex flex-wrap items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-2.5", entry.status === "blocked" ? "border-loss" : "border-gold/60")}>
      <span className="w-28 shrink-0 font-tech text-[10px] uppercase tracking-[0.18em] text-white/45">{entry.roundName}</span>
      <span className="min-w-0 flex-1 font-display text-lg font-bold uppercase leading-none">
        {entry.teamA.name} <span className="text-white/35">vs</span> {entry.teamB.name}
      </span>
      {entry.score ? <span className="font-tech text-sm tabular-nums text-white/80">{entry.score[0]} - {entry.score[1]}</span> : null}
      {entry.status === "blocked" ? <Chip tone="loss">Match annulé : à trancher</Chip> : <Chip tone="win">En cours</Chip>}
      {entry.matchId ? (
        <Link href={`/cod/equipes/match/${entry.matchId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-gold underline underline-offset-4">
          Feuille
          <LuExternalLink aria-hidden className="h-3 w-3" />
        </Link>
      ) : null}
      <span className="flex gap-1.5">
        {["A", "B"].map((side) => (
          <Button key={side} size="sm" variant={entry.status === "blocked" ? "primary" : "outline"} disabled={pending !== null} onClick={() => decide(entry, side)}>
            {pending === `${entry.id}-${side}` ? <LuLoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" /> : null}
            <span className="normal-case">[{(side === "A" ? entry.teamA : entry.teamB).tag}]</span> gagne
          </Button>
        ))}
      </span>
    </li>
  );

  return (
    <div className="space-y-4 border border-loss/40 bg-loss/[0.04] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 font-display text-xl font-black uppercase leading-none">
          <span aria-hidden className="h-2.5 w-2.5 animate-pulse rounded-full bg-loss" />
          En direct · {phase}
        </p>
        <Link href={`/cod/tournoi?id=${cup.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-gold underline underline-offset-4">
          Tableau public
          <LuExternalLink aria-hidden className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stats.map(([label, value]) => (
          <div key={label} className="border border-white/10 bg-ink/60 px-3 py-2">
            <p className="font-tech text-[10px] uppercase tracking-[0.18em] text-white/45">{label}</p>
            <p className="mt-1 font-display text-2xl font-black leading-none">{value}</p>
          </div>
        ))}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}

      {data.status === "scheduled" ? (
        <div>
          <p className={labelClass}>Check-in {anubis ? "des joueurs" : "des équipes"}</p>
          {people.length === 0 ? <p className="mt-2 text-sm text-white/50">Aucun inscrit.</p> : null}
          <ul className="mt-2 flex flex-wrap gap-2">
            {people.map((item) => (
              <li key={item.id} className={cn("flex items-center gap-2 border px-2.5 py-1.5 text-sm", item.checkedIn ? "border-win/50 bg-win/10 text-white" : "border-white/10 text-white/50")}>
                {anubis ? null : <TeamCrest team={item} size={20} />}
                <span className="font-semibold">{anubis ? item.username : item.name}</span>
                <span className={cn("font-tech text-[10px] uppercase tracking-[0.15em]", item.checkedIn ? "text-win" : "text-white/35")}>{item.checkedIn ? "Prête" : "En attente"}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {blocked.length ? (
        <div className="space-y-2">
          <p className={labelClass}>À trancher ({blocked.length})</p>
          <ul className="space-y-2">{blocked.map(matchRow)}</ul>
        </div>
      ) : null}
      {playing.length ? (
        <div className="space-y-2">
          <p className={labelClass}>Matchs en cours ({playing.length})</p>
          <ul className="space-y-2">{playing.map(matchRow)}</ul>
        </div>
      ) : null}
      {started && !blocked.length && !playing.length ? <p className="text-sm text-white/55">Aucun match en cours : le tour suivant se lance dès que les équipes sont prêtes.</p> : null}
    </div>
  );
}

/** Miniature d'affiche d'une ligne de liste. */
function PosterThumb({ src }) {
  return <img src={src} alt="" loading="lazy" className="h-16 w-12 shrink-0 border border-white/10 bg-ink object-contain" />;
}

/**
 * Onglet « Coupes » : toutes les Coupes Horus et Anubis (à venir et en cours, puis terminées) avec affiche, statut,
 * places et check-ins ; actions par coupe (voir, modifier, gérer le tableau, annuler) ; « Nouvelle coupe ».
 */
/** Messages de l'organisation d'une coupe : publiés et retirés d'ici, affichés sur la fiche seulement s'il y en a. */
function CupMessages({ cupId }) {
  const [tournament, setTournament] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    api(`/teams/tournaments/${cupId}`).then(setTournament, (caught) => setError(caught.message));
  }, [cupId]);
  if (error) return <Notice tone="error">{error}</Notice>;
  return tournament ? <OrganisationMessages tournament={tournament} isAdmin api={api} /> : <Loading />;
}

function CupsTab() {
  const [state, setState] = useState(null);
  const [editing, setEditing] = useState(null);
  const [messaging, setMessaging] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const load = useCallback(() => api("/admin/cups").then(setState), []);
  useEffect(() => {
    load().catch((caught) => setError(caught.message));
  }, [load]);

  async function run(key, action, done) {
    setPending(key);
    setError(null);
    setMessage(null);
    try {
      await action();
      if (done) setMessage(done);
      await load();
      return true;
    } catch (caught) {
      setError(caught.message);
      return false;
    } finally {
      setPending(null);
    }
  }

  if (!state) return error ? <Notice tone="error">{error}</Notice> : <Loading />;
  const open = state.cups.filter((cup) => cup.status === "scheduled" || cup.status === "running");
  const done = state.cups.filter((cup) => cup.status === "completed" || cup.status === "cancelled");
  const now = Date.now();

  const row = (cup) => {
    const [label, tone] = CUP_STATUS[cup.status] ?? ["?", "neutral"];
    const checkInOpen = cup.status === "scheduled" && now >= new Date(cup.checkInOpensAt).getTime();
    return (
      <li key={cup.id} className="space-y-3">
        <div className="flex flex-wrap items-center gap-4 border-l-2 border-white/10 bg-white/[0.03] px-3 py-3">
          <PosterThumb src={cup.poster} />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="truncate font-display text-lg font-black uppercase leading-none">{cup.name}</span>
              <Chip tone={tone}>{label}</Chip>
              {checkInOpen ? <Chip tone="gold">Check-in ouvert</Chip> : null}
            </p>
            <p className="mt-1 text-xs text-white/55">
              {KIND_NAME[cup.kind]} · {dateFr(cup.startsAt)} · {cup.teamSize ? `${cup.teamSize}v${cup.teamSize}, ` : ""}BO{cup.bestOf}, finale BO{cup.finalBestOf} · {cup.bracket === "double" ? "double élimination" : "élimination directe"}
              {cup.scheduleId ? " · rendez-vous" : ""}
            </p>
            <p className="mt-1 text-xs text-white/70">
              {cup.registered}/{cup.capacity} {cup.kind === "anubis" ? "joueurs" : "équipes"}
              {cup.status === "scheduled" && checkInOpen ? ` · check-in ${cup.checkedIn}/${cup.registered}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/cod/tournoi?id=${cup.id}`} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-gold underline underline-offset-4">
              Voir
              <LuExternalLink aria-hidden className="h-3 w-3" />
            </Link>
            {cup.status === "scheduled" ? (
              <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => setEditing(editing === cup.id ? null : cup.id)}>
                Modifier
              </Button>
            ) : null}
            {cup.status === "scheduled" || cup.status === "running" ? (
              <Button size="sm" variant="outline" onClick={() => setMessaging(messaging === cup.id ? null : cup.id)}>
                Messages
              </Button>
            ) : null}
            {cup.status === "scheduled" || cup.status === "running" ? (
              <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => setCancelling(cup)}>
                Annuler
              </Button>
            ) : null}
          </div>
        </div>
        {editing === cup.id ? (
          <CupForm
            mode="cup"
            initial={cup}
            lockFormat={checkInOpen}
            testTeamSize={state.testTeamSize}
            onCancel={() => setEditing(null)}
            onSubmit={async (body) => {
              setState(await api(`/admin/cups/${cup.id}`, { method: "PATCH", body }));
              setEditing(null);
              setMessage("Coupe modifiée.");
            }}
          />
        ) : null}
        {messaging === cup.id ? <CupMessages cupId={cup.id} /> : null}
        {cup.status === "running" || checkInOpen ? <LiveCupPanel cup={cup} onChanged={load} /> : null}
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">Toutes les Coupes Horus et Anubis. Une coupe se modifie jusqu&apos;au check-in (2 h avant), son nom et son affiche jusqu&apos;au début.</p>
        {editing === "new" ? null : <Button onClick={() => setEditing("new")}>Nouvelle coupe</Button>}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}
      {editing === "new" ? (
        <CupForm
          mode="cup"
          testTeamSize={state.testTeamSize}
          onCancel={() => setEditing(null)}
          onSubmit={async (body) => {
            setState(await api("/admin/cups", { method: "POST", body }));
            setEditing(null);
            setMessage("Coupe créée : les inscriptions sont ouvertes.");
          }}
        />
      ) : null}

      <section aria-labelledby="titre-coupes-ouvertes" className="space-y-3">
        <p id="titre-coupes-ouvertes" className={labelClass}>
          À venir et en cours ({open.length})
        </p>
        {open.length === 0 ? <p className="text-sm text-white/50">Aucune coupe prévue.</p> : <ul className="space-y-2">{open.map(row)}</ul>}
      </section>
      {done.length ? (
        <section aria-labelledby="titre-coupes-finies" className="space-y-3">
          <p id="titre-coupes-finies" className={labelClass}>
            Terminées et annulées
          </p>
          <ul className="space-y-2 opacity-80">{done.map(row)}</ul>
        </section>
      ) : null}

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        title={`Annuler « ${cancelling?.name ?? ""} » ?`}
        confirmLabel="Annuler la coupe"
        tone="danger"
        pending={pending !== null}
        onConfirm={async () => {
          const ok = await run("cancel", () => api(`/admin/tournaments/${cancelling.id}`, { method: "DELETE" }), "Coupe annulée.");
          if (ok) setCancelling(null);
        }}
      >
        Les inscrits sont prévenus, les matchs en cours sont annulés et aucune récompense n&apos;est attribuée. Action définitive.
      </ConfirmDialog>
    </div>
  );
}

/**
 * Onglet « Rendez-vous » : coupes automatiques (interrupteur commun Horus et Anubis) et rendez-vous de chaque semaine,
 * modifiables (jour, heure, nom, format, affiche reprise par les prochaines coupes), en pause ou supprimés.
 */
function SchedulesTab() {
  const [state, setState] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const load = useCallback(() => api("/admin/cups").then(setState), []);
  useEffect(() => {
    load().catch((caught) => setError(caught.message));
  }, [load]);

  async function run(key, action, done) {
    setPending(key);
    setError(null);
    setMessage(null);
    try {
      setState(await action());
      if (done) setMessage(done);
      return true;
    } catch (caught) {
      setError(caught.message);
      return false;
    } finally {
      setPending(null);
    }
  }

  if (!state) return error ? <Notice tone="error">{error}</Notice> : <Loading />;
  return (
    <div className="space-y-6">
      <TacticalCard innerClassName="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="max-w-xl">
          <p className="font-display text-xl font-black uppercase leading-none">Coupes automatiques</p>
          <p className="mt-1.5 text-sm text-white/60">
            Activées : chaque rendez-vous actif ouvre sa coupe tout seul, chaque semaine, dès la précédente terminée.
          </p>
        </div>
        <Button
          variant={state.auto ? "primary" : "outline"}
          disabled={pending !== null}
          onClick={() => run("auto", () => api("/admin/cups/auto", { method: "POST", body: { on: !state.auto } }), state.auto ? "Coupes automatiques désactivées." : "Coupes automatiques activées.")}
        >
          {state.auto ? "Activées" : "Désactivées"}
        </Button>
      </TacticalCard>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/60">Récompenses : Coupe Horus 1er +150, 2e +100, 3e +75, autres présentes +50 (points de Division) ; Coupe Anubis médailles sur le profil.</p>
        {editing === "new" ? null : <Button onClick={() => setEditing("new")}>Nouveau rendez-vous</Button>}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}
      {editing === "new" ? (
        <CupForm
          mode="schedule"
          testTeamSize={state.testTeamSize}
          onCancel={() => setEditing(null)}
          onSubmit={async (body) => {
            setState(await api("/admin/cups/schedules", { method: "POST", body }));
            setEditing(null);
            setMessage("Rendez-vous créé.");
          }}
        />
      ) : null}

      {state.schedules.length === 0 ? <p className="text-sm text-white/50">Aucun rendez-vous pour l&apos;instant.</p> : null}
      <ul className="space-y-2">
        {state.schedules.map((schedule) => (
          <li key={schedule.id} className="space-y-3">
            <div className={cn("flex flex-wrap items-center gap-4 border-l-2 bg-white/[0.03] px-3 py-3", schedule.active ? "border-gold" : "border-white/10 opacity-60")}>
              <PosterThumb src={schedule.poster} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-display text-lg font-black uppercase leading-none">{schedule.name}</span>
                  <Chip tone={schedule.active ? "win" : "neutral"}>{schedule.active ? "Actif" : "En pause"}</Chip>
                </p>
                <p className="mt-1 text-xs text-white/55">
                  {KIND_NAME[schedule.kind ?? "horus"]} · chaque {WEEKDAYS[schedule.weekday].toLowerCase()} à {schedule.time} · {schedule.size} équipes
                  {schedule.teamSize ? ` en ${schedule.teamSize}v${schedule.teamSize}` : ""} · BO{schedule.bestOf}, finale BO{schedule.finalBestOf} · {schedule.bracket === "double" ? "double élimination" : "élimination directe"}
                </p>
                {schedule.active && state.auto ? <p className="mt-1 text-xs text-white/70">Prochaine coupe : {dateFr(schedule.next)}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => setEditing(editing === schedule.id ? null : schedule.id)}>
                  Modifier
                </Button>
                <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => run(`a-${schedule.id}`, () => api(`/admin/cups/schedules/${schedule.id}`, { method: "PATCH", body: { active: !schedule.active } }))}>
                  {schedule.active ? "Mettre en pause" : "Réactiver"}
                </Button>
                <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => setDeleting(schedule)}>
                  Supprimer
                </Button>
              </div>
            </div>
            {editing === schedule.id ? (
              <CupForm
                mode="schedule"
                initial={schedule}
                testTeamSize={state.testTeamSize}
                onCancel={() => setEditing(null)}
                onSubmit={async (body) => {
                  setState(await api(`/admin/cups/schedules/${schedule.id}`, { method: "PATCH", body }));
                  setEditing(null);
                  setMessage("Rendez-vous modifié : ses prochaines coupes reprennent ces réglages.");
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Supprimer « ${deleting?.name ?? ""} » ?`}
        confirmLabel="Supprimer"
        tone="danger"
        pending={pending !== null}
        onConfirm={async () => {
          const ok = await run("delete", () => api(`/admin/cups/schedules/${deleting.id}`, { method: "DELETE" }), "Rendez-vous supprimé.");
          if (ok) setDeleting(null);
        }}
      >
        Plus aucune coupe ne s&apos;ouvrira pour ce rendez-vous. Une coupe déjà ouverte continue normalement.
      </ConfirmDialog>
    </div>
  );
}

const SUBTABS = [
  ["coupes", "Coupes"],
  ["rendez-vous", "Rendez-vous"],
  ["saison", "Fin de saison"],
];

/** Onglet admin « Tournoi » : sous-onglets Coupes, Rendez-vous et Fin de saison (play-in compris). */
export function TournamentPanel() {
  const [tab, setTab] = useState("coupes");
  return (
    <div className="space-y-8">
      <div role="tablist" aria-label="Tournois" className="flex gap-1 overflow-x-auto border-b border-white/10">
        {SUBTABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-4 py-3 font-display text-sm font-black uppercase tracking-[0.14em] transition-colors",
              tab === id ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "coupes" ? <CupsTab /> : null}
      {tab === "rendez-vous" ? <SchedulesTab /> : null}
      {tab === "saison" ? (
        <div className="space-y-10">
          <PlayInPanel />
          <SeasonTab />
        </div>
      ) : null}
    </div>
  );
}
