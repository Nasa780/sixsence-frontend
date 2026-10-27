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
const VIA = { circuit: "Circuit", playin: "Play-in", division: "Division" };
const dateFr = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Onglet admin « Tournoi » : Coupe Horus et Coupe Anubis (coupes automatiques, rendez-vous, coupe ponctuelle), play-in
 * puis tournoi de fin de saison (aperçu des qualifiés, création), suivi (rencontres bloquées, vainqueur désigné à la
 * main), annulation.
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

  return (
    <div className="space-y-10">
      <CupPanel kind="horus" />
      <CupPanel kind="anubis" />
      <PlayInPanel />
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
          <Link href={current.kind === "horus" ? "/cod/tournoi" : current.kind === "anubis" ? "/cod/tournoi?coupe=anubis" : current.kind === "playin" ? "/cod/tournoi?coupe=playin" : "/cod/tournoi?coupe=saison"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline underline-offset-4">
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
const NAME_IDEAS = {
  horus: ["Coupe Horus du dimanche", "Coupe Horus · Œil d'or", "Coupe Horus · Nuit des Pharaons", "Coupe Horus · Sable et Sang", "Coupe Horus · Le Faucon"],
  anubis: ["Coupe Anubis du samedi", "Coupe Anubis · Le Jugement", "Coupe Anubis · Pesée des âmes", "Coupe Anubis · Gardien des tombes", "Coupe Anubis · Le Chacal"],
};
const CUP_TEXT = {
  horus: {
    eyebrow: "Coupes d'équipe à inscription libre",
    title: "Coupe Horus",
    rewards: "Récompenses : or +150, argent +100, bronze +75, +50 aux autres équipes présentes ; rôle Discord « Vainqueur — Coupe Horus » jusqu'à la coupe suivante.",
  },
  anubis: {
    eyebrow: "Inscription solo, équipes tirées au sort",
    title: "Coupe Anubis",
    rewards:
      "Les joueurs s'inscrivent seuls ; au début, les présents sont répartis au hasard (capitaine : le mieux classé, joueurs en trop remplaçants). Médailles or, argent, bronze sur le profil, rôle Discord « Vainqueur — Coupe Anubis » jusqu'à la coupe suivante. Pas de points.",
  },
};

/**
 * Coupe Horus ou Anubis (admin) : interrupteur des coupes automatiques (commun), rendez-vous récurrents (jour,
 * heure, format, taille des équipes pour l'Anubis), coupe ponctuelle, suivi de la coupe en cours.
 */
function CupPanel({ kind }) {
  const anubis = kind === "anubis";
  const [state, setState] = useState(null);
  const [current, setCurrent] = useState(undefined);
  const [form, setForm] = useState({ name: NAME_IDEAS[kind][0], mode: "recurrent", weekday: anubis ? 6 : 0, time: "20:00", startsAt: "", size: 8, bestOf: anubis ? 1 : 3, finalBestOf: 3, bracket: "single", teamSize: 4 });
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    const [admin, cup] = await Promise.all([api("/admin/cups"), api(`/teams/tournament?kind=${kind}`)]);
    setState(admin);
    setCurrent(cup.tournament);
  }, [kind]);
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

  const body = { kind, name: form.name, size: form.size, bestOf: form.bestOf, finalBestOf: form.finalBestOf, bracket: form.bracket, ...(anubis ? { teamSize: form.teamSize } : {}) };
  const schedules = state ? state.schedules.filter((schedule) => (schedule.kind ?? "horus") === kind) : [];
  const submit = () =>
    form.mode === "recurrent"
      ? run("create", () => api("/admin/cups/schedules", { method: "POST", body: { ...body, weekday: form.weekday, time: form.time } }), "Rendez-vous créé.")
      : run("create", () => api("/admin/cups", { method: "POST", body: { ...body, startsAt: new Date(form.startsAt).toISOString() } }), "Coupe créée : les inscriptions sont ouvertes.");

  if (!state) return error ? <Notice tone="error">{error}</Notice> : <Loading />;
  return (
    <section aria-labelledby={`titre-coupe-${kind}`} className={cn("space-y-6", anubis && "border-t border-white/10 pt-8")}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className={labelClass}>{CUP_TEXT[kind].eyebrow}</p>
          <h2 id={`titre-coupe-${kind}`} className="font-display text-3xl font-black uppercase leading-none">
            {CUP_TEXT[kind].title}
          </h2>
        </div>
        {anubis ? null : <Button variant={state.auto ? "primary" : "outline"} disabled={pending !== null} onClick={() => run("auto", () => api("/admin/cups/auto", { method: "POST", body: { on: !state.auto } }), state.auto ? "Coupes automatiques désactivées." : "Coupes automatiques activées.")}>
          {state.auto ? "Trophées automatiques : activés" : "Trophées automatiques : désactivés"}
        </Button>}
      </div>
      <p className="text-sm text-white/55">
        {anubis
          ? "Rendez-vous ouverts automatiquement si l'interrupteur des trophées automatiques (au-dessus) est activé. "
          : "Quand les trophées automatiques sont activés (Horus et Anubis), chaque rendez-vous actif ouvre sa prochaine coupe aux inscriptions (dès la précédente terminée). "}
        {CUP_TEXT[kind].rewards}
      </p>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {message ? <Notice tone="success">{message}</Notice> : null}

      {current ? <ActiveTournamentCard current={current} pending={pending} run={run} onCancel={() => setCancelling(true)} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <TacticalCard innerClassName="space-y-3 p-6">
          <p className={labelClass}>Rendez-vous</p>
          {schedules.length === 0 ? <p className="text-sm text-white/50">Aucun rendez-vous pour l&apos;instant.</p> : null}
          {schedules.map((schedule) => (
            <div key={schedule.id} className={cn("space-y-2 border-l-2 bg-white/[0.03] px-3 py-3", schedule.active ? "border-gold" : "border-white/10 opacity-60")}>
              <p className="font-display text-lg font-bold uppercase leading-none">{schedule.name}</p>
              <p className="text-xs text-white/55">
                {WEEKDAYS[schedule.weekday]} {schedule.time} · {schedule.size} équipes{anubis ? ` de ${schedule.teamSize}` : ""} · {schedule.bracket === "double" ? "double élimination" : "élimination directe"} · BO{schedule.bestOf}, finale BO{schedule.finalBestOf}
                {schedule.active && state.auto ? ` · prochaine : ${dateFr(schedule.next)}` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={pending !== null} onClick={() => run(`a-${schedule.id}`, () => api(`/admin/cups/schedules/${schedule.id}`, { method: "PATCH", body: { active: !schedule.active } }))}>
                  {schedule.active ? "Mettre en pause" : "Réactiver"}
                </Button>
                <Button size="sm" variant="ghost" disabled={pending !== null} onClick={() => run(`d-${schedule.id}`, () => api(`/admin/cups/schedules/${schedule.id}`, { method: "DELETE" }), "Rendez-vous supprimé.")}>
                  Supprimer
                </Button>
              </div>
            </div>
          ))}
        </TacticalCard>

        <TacticalCard innerClassName="space-y-4 p-6">
          <p className={labelClass}>Nouvelle coupe</p>
          <div className="flex gap-2">
            {[["recurrent", "Chaque semaine"], ["once", "Une seule fois"]].map(([mode, label]) => (
              <Button key={mode} size="sm" variant={form.mode === mode ? "primary" : "outline"} onClick={() => setForm({ ...form, mode })}>
                {label}
              </Button>
            ))}
          </div>
          <div>
            <label htmlFor={`c-name-${kind}`} className={labelClass}>
              Nom
            </label>
            <input id={`c-name-${kind}`} className={fieldClass} maxLength={60} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {NAME_IDEAS[kind].map((idea) => (
                <button key={idea} type="button" onClick={() => setForm({ ...form, name: idea })} className="border border-white/10 px-2 py-1 text-xs text-white/60 hover:border-gold hover:text-gold">
                  {idea}
                </button>
              ))}
            </div>
          </div>
          {form.mode === "recurrent" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`c-day-${kind}`} className={labelClass}>
                  Jour
                </label>
                <select id={`c-day-${kind}`} className={fieldClass} value={form.weekday} onChange={(event) => setForm({ ...form, weekday: Number(event.target.value) })}>
                  {WEEKDAYS.map((day, index) => (
                    <option key={day} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`c-time-${kind}`} className={labelClass}>
                  Heure (Paris)
                </label>
                <input id={`c-time-${kind}`} type="time" className={fieldClass} value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor={`c-start-${kind}`} className={labelClass}>
                Début (heure de Paris)
              </label>
              <input id={`c-start-${kind}`} type="datetime-local" className={fieldClass} value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
            </div>
          )}
          <div className={cn("grid gap-4", anubis ? "sm:grid-cols-4" : "sm:grid-cols-3")}>
            {anubis ? (
              <div>
                <label htmlFor={`c-team-${kind}`} className={labelClass}>
                  Joueurs / équipe
                </label>
                <select id={`c-team-${kind}`} className={fieldClass} value={form.teamSize} onChange={(event) => setForm({ ...form, teamSize: Number(event.target.value) })}>
                  {(state.testTeamSize ? [1, 2, 3, 4] : [2, 3, 4]).map((size) => (
                    <option key={size} value={size}>
                      {size}v{size}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div>
              <label htmlFor={`c-size-${kind}`} className={labelClass}>
                Équipes max
              </label>
              <select id={`c-size-${kind}`} className={fieldClass} value={form.size} onChange={(event) => setForm({ ...form, size: Number(event.target.value) })}>
                {[4, 8, 16].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`c-bo-${kind}`} className={labelClass}>
                Matchs
              </label>
              <select id={`c-bo-${kind}`} className={fieldClass} value={form.bestOf} onChange={(event) => setForm({ ...form, bestOf: Number(event.target.value), finalBestOf: 3 })}>
                <option value={1}>BO1</option>
                <option value={3}>BO3</option>
              </select>
            </div>
            <div>
              <label htmlFor={`c-final-${kind}`} className={labelClass}>
                Finale
              </label>
              <select id={`c-final-${kind}`} className={fieldClass} value={form.finalBestOf} onChange={(event) => setForm({ ...form, finalBestOf: Number(event.target.value) })}>
                <option value={3}>BO3</option>
                {form.bestOf === 3 ? <option value={5}>BO5</option> : null}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[["single", "Élimination directe"], ["double", "Double élimination"]].map(([bracket, label]) => (
              <Button key={bracket} size="sm" variant={form.bracket === bracket ? "primary" : "outline"} onClick={() => setForm({ ...form, bracket })}>
                {label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-white/45">
            {form.bracket === "double"
              ? "Double élimination : une 2e défaite élimine ; grande finale en un seul match, bronze au perdant de la finale des perdants."
              : "Élimination directe avec petite finale (bronze)."}{" "}
            {anubis
              ? `Jusqu'à ${form.size * (form.teamSize + 1)} inscrits (un remplaçant par équipe). Moins de 4 équipes complètes au check-in : coupe annulée.`
              : "Tableau tiré au sort. Moins de 4 équipes présentes au check-in : coupe annulée."}
          </p>
          <Button disabled={pending !== null || form.name.trim().length < 3 || (form.mode === "once" && !form.startsAt)} onClick={submit}>
            {pending === "create" ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : null}
            {form.mode === "recurrent" ? "Créer le rendez-vous" : "Créer la coupe"}
          </Button>
        </TacticalCard>
      </div>

      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        title="Annuler la coupe ?"
        confirmLabel="Annuler la coupe"
        tone="danger"
        pending={pending !== null}
        onConfirm={async () => {
          const ok = await run("cancel", () => api(`/admin/tournaments/${current.id}`, { method: "DELETE" }), "Coupe annulée.");
          if (ok) setCancelling(false);
        }}
      >
        Les matchs en cours sont annulés et aucune récompense n&apos;est attribuée. Action définitive.
      </ConfirmDialog>
    </section>
  );
}
