import Link from "next/link";
import { LuArrowLeft, LuArrowRight, LuCalendarDays, LuClock, LuDices, LuGamepad2, LuListOrdered, LuMap, LuRepeat, LuSwords, LuTicket, LuTrophy, LuUsers, LuZap } from "react-icons/lu";
import { roundsToWin } from "../../lib/matchRules";
import { cn } from "../../lib/cn";
import { TeamCrest } from "../teams/TeamParts";

/**
 * Coupes façon Sked : cartes de la liste (affiche, statut, date, format, places, récompenses) et en-tête de la fiche
 * d'une coupe (bannière floutée de l'affiche, affiche, infos, encadré Récompenses). Affiche : `posterUrl` du backend
 * (envoyée par l'admin, sinon générée par /api/og/affiche).
 */

const KIND_LABEL = { horus: "Coupe Horus", anubis: "Coupe Anubis", saison: "Fin de saison", playin: "Play-in" };
const MEDALS = ["#d4af37", "#c0c7d0", "#c97b4b"];

export const cupHref = (cup) => `/cod/tournoi?id=${cup.id}`;

const dateShort = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const time = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (date.toDateString() === today.toDateString()) return `Aujourd'hui · ${time}`;
  return `${date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · ${time}`;
};

/** Statut affiché d'une coupe : libellé et couleur. */
export function cupStatus(cup, now = Date.now()) {
  if (cup.status === "completed") return { label: "Terminée", tone: "text-white/45", dot: "bg-white/30" };
  if (cup.status === "cancelled") return { label: "Annulée", tone: "text-loss", dot: "bg-loss" };
  if (cup.status === "running") return { label: "En cours", tone: "text-loss", dot: "bg-loss animate-pulse" };
  if (now >= new Date(cup.checkInOpensAt).getTime()) return { label: "Check-in ouvert", tone: "text-gold", dot: "bg-gold animate-pulse" };
  if (cup.kind === "saison") return { label: "Équipes qualifiées", tone: "text-win", dot: "bg-win" };
  if (cup.capacity && cup.registered >= cup.capacity) {
    // Places prises : il reste peut-être des places de remplaçant.
    if (cup.reserveSlots && cup.registered < cup.capacity + cup.reserveSlots) return { label: "Places de remplaçant", tone: "text-gold", dot: "bg-gold" };
    return { label: "Complet", tone: "text-loss", dot: "bg-loss" };
  }
  return { label: "Inscriptions ouvertes", tone: "text-win", dot: "bg-win" };
}

/** Inscrits sur les places, et remplaçants (inscrits au-delà des places). */
const placesTaken = (cup) => Math.min(cup.registered ?? 0, cup.capacity ?? cup.size);
const reservesTaken = (cup) => Math.max(0, (cup.registered ?? 0) - (cup.capacity ?? cup.size));

/** Format en pastilles : 4v4, élimination, BO, places. */
function formatChips(cup) {
  const players = cup.teamSize ?? null;
  return [
    players ? [LuUsers, `${players}v${players}`] : null,
    [LuSwords, cup.bracket === "double" ? "Double" : "Simple"],
    [LuDices, `BO${cup.bestOf} · finale BO${cup.finalBestOf}`],
    [LuListOrdered, `${placesTaken(cup)}/${cup.capacity ?? cup.size}${cup.kind === "anubis" ? " joueurs" : ""}${reservesTaken(cup) ? ` + ${reservesTaken(cup)} rempl.` : ""}`],
  ].filter(Boolean);
}

/** Récompenses en trois lignes (or, argent, bronze). */
function rewardLines(cup) {
  if (cup.kind === "horus") return ["+150 pts", "+100 pts", "+75 pts"];
  if (cup.kind === "anubis") return ["Médaille d'or", "Médaille d'argent", "Médaille de bronze"];
  return ["Trophée", "Trophée", null];
}

/** Affiche entière : en 3:4 dans la fiche, sur toute la hauteur de la carte (sans rognage) dans la liste. */
function Poster({ cup, className, fill = false }) {
  return <img src={cup.posterUrl} alt={`Affiche : ${cup.name}`} loading="lazy" className={cn("shrink-0 bg-ink object-contain", fill ? "self-stretch" : "aspect-[3/4]", className)} />;
}

/** Carte d'une coupe dans la liste. */
export function CupCard({ cup, now }) {
  const status = cupStatus(cup, now);
  const finished = cup.status === "completed";
  return (
    <Link href={cupHref(cup)} className="group flex overflow-hidden border border-white/10 bg-white/[0.02] transition-colors hover:border-gold/50 hover:bg-white/[0.04]">
      <Poster fill cup={cup} className="w-28 border-r border-white/10 sm:w-32" />
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <p className={cn("flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.2em]", status.tone)}>
          <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
          {status.label}
          <span className="text-white/35">· {KIND_LABEL[cup.kind] ?? "Coupe"}</span>
        </p>
        <p className="mt-1.5 truncate font-display text-2xl font-black uppercase leading-none group-hover:text-gold">{cup.name}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-white/65">
          <LuCalendarDays aria-hidden className="h-4 w-4 shrink-0 text-white/40" />
          {dateShort(finished ? cup.completedAt ?? cup.startsAt : cup.startsAt)}
        </p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div className="flex flex-wrap gap-1.5">
            {formatChips(cup).map(([Icon, label]) => (
              <span key={label} className="inline-flex items-center gap-1 border border-white/10 bg-white/[0.04] px-2 py-1 font-tech text-[10px] uppercase tracking-[0.12em] text-white/60">
                <Icon aria-hidden className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
          {finished && cup.winner ? (
            <span className="flex min-w-0 items-center gap-2 text-sm">
              <LuTrophy aria-hidden className="h-4 w-4 shrink-0" style={{ color: MEDALS[0] }} />
              <TeamCrest team={cup.winner} size={22} />
              <span className="truncate font-display font-bold uppercase">{cup.winner.name}</span>
            </span>
          ) : (
            <span className="flex flex-col items-end gap-0.5 text-right">
              {rewardLines(cup)
                .filter(Boolean)
                .map((line, index) => (
                  <span key={`${line}-${index}`} className={cn("inline-flex items-center gap-1 font-display font-black", index === 0 ? "text-base" : "text-xs text-white/60")}>
                    <LuTrophy aria-hidden className="h-3.5 w-3.5" style={{ color: MEDALS[index] }} />
                    {line}
                  </span>
                ))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Liste des coupes : prochaines (et tournoi de saison), puis terminées. */
export function CupList({ cups, now }) {
  return (
    <div className="space-y-12">
      <section aria-labelledby="titre-prochaines">
        <h2 id="titre-prochaines" className="flex items-center gap-3 font-display text-3xl font-black uppercase leading-none sm:text-4xl">
          <span aria-hidden className="h-8 w-1 bg-gold" />
          Prochaines coupes
          <span className="font-tech text-sm text-white/35">{cups.upcoming.length}</span>
        </h2>
        {cups.upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">Aucune coupe prévue pour l&apos;instant : la prochaine est annoncée sur Discord dès l&apos;ouverture des inscriptions.</p>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {cups.upcoming.map((cup) => (
              <CupCard key={cup.id} cup={cup} now={now} />
            ))}
          </div>
        )}
      </section>
      {cups.past.length ? (
        <section aria-labelledby="titre-passees">
          <h2 id="titre-passees" className="flex items-center gap-3 font-display text-3xl font-black uppercase leading-none text-white/80 sm:text-4xl">
            <span aria-hidden className="h-8 w-1 bg-white/25" />
            Coupes passées
          </h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {cups.past.map((cup) => (
              <CupCard key={cup.id} cup={cup} now={now} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

/** Phases jouées, entre parenthèses après la date (comme Sked). */
const phases = (t) => (t.bracket === "double" ? "gagnants + perdants + grande finale" : t.kind === "horus" ? "tableau + petite finale" : "tableau + finale");
const MEDAL_ART = { horus: "horus", anubis: "anubis" };
// Jours des rendez-vous récurrents (0 = dimanche, comme cup_schedules.weekday et getUTCDay).
const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

/** Format en une ligne : manches par map selon le BO (8 en BO1, 6 en BO3 / BO5). */
function formatLine(t) {
  const players = t.teamSize ?? t.playersPerTeam ?? null;
  const bo = (n) => `BO${n} (${roundsToWin(n)} manches)`;
  const losers = t.losersBestOf && t.losersBestOf !== t.bestOf ? `perdants ${bo(t.losersBestOf)}` : null;
  const final = t.finalBestOf !== t.bestOf ? `finale ${bo(t.finalBestOf)}` : null;
  return [players ? `${players}v${players}` : null, bo(t.bestOf), losers, final].filter(Boolean).join(" · ");
}

/**
 * En-tête de la fiche d'une coupe, façon Sked à l'identité SixSence : bannière (affiche floutée), affiche, statut
 * (« En direct » qui pulse), nom, jeu et mode, date et phases, encadré Récompenses avec le bouton d'action du moment
 * (`action` : { label, icon, onClick | href }), puis la ligne du format (élimination, BO et manches, maps, tirage,
 * places, inscription, check-in, règles).
 */
export function CupHero({ tournament, now, action = null, onRules = null }) {
  const cup = {
    ...tournament,
    registered: tournament.kind === "anubis" ? tournament.registered ?? 0 : tournament.teams?.length ?? 0,
    capacity: tournament.kind === "anubis" ? tournament.capacity ?? null : tournament.size,
    reserveSlots: tournament.reserveSlots ?? 0,
  };
  const live = tournament.status === "running";
  const status = live ? { label: "En direct", tone: "text-loss", dot: "bg-loss" } : cupStatus(cup, now);
  const fill = cup.capacity ? Math.min(100, Math.round((placesTaken(cup) / cup.capacity) * 100)) : null;
  const r = tournament.rewards;
  const art = MEDAL_ART[tournament.kind];
  const places = [
    ["1er", "or", r ? `+${r.division.winner} pts` : rewardLines(cup)[0], r ? `+${r.circuit.winner} circuit` : null],
    ["2e", "argent", r ? `+${r.division.finalist} pts` : rewardLines(cup)[1], r ? `+${r.circuit.finalist} circuit` : null],
    ["3e", "bronze", r ? `+${r.division.third} pts` : rewardLines(cup)[2], r ? `+${r.circuit.third} circuit` : null],
  ].filter(([, , line]) => line);
  const ActionIcon = action?.icon ?? LuArrowRight;
  const button = action ? (
    action.href ? (
      <Link href={action.href} className="clip-slant flex w-full items-center justify-center gap-2 bg-gold py-3 font-display text-sm font-black uppercase tracking-[0.14em] text-ink transition-transform hover:-translate-y-0.5 [--slant:12px]">
        <ActionIcon aria-hidden className="h-4 w-4" />
        {action.label}
      </Link>
    ) : (
      <button type="button" onClick={action.onClick} className="clip-slant flex w-full items-center justify-center gap-2 bg-gold py-3 font-display text-sm font-black uppercase tracking-[0.14em] text-ink transition-transform hover:-translate-y-0.5 [--slant:12px]">
        <ActionIcon aria-hidden className="h-4 w-4" />
        {action.label}
      </button>
    )
  ) : null;

  const strip = [
    [LuSwords, tournament.bracket === "double" ? "Double élimination" : "Élimination directe", live ? `lancée ${dateShort(tournament.startsAt).toLowerCase()}` : null],
    [LuUsers, formatLine(tournament), null],
    [LuMap, "Maps tirées au sort", null],
    [LuDices, tournament.kind === "saison" || tournament.kind === "playin" ? "Têtes de série au classement" : "Tirage au sort", null],
    tournament.status === "scheduled" ? [LuClock, "Check-in 2 h → 15 min avant", null] : null,
    tournament.schedule ? [LuRepeat, `Tous les ${WEEKDAYS[tournament.schedule.weekday]}s · ${tournament.schedule.time.replace(":", " h ")}`, `édition #${tournament.schedule.edition}`] : null,
    [LuTicket, "Inscription gratuite", null],
  ].filter(Boolean);

  return (
    <section className="relative overflow-hidden border border-white/10">
      <div aria-hidden className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-2xl" style={{ backgroundImage: `url('${tournament.posterUrl}')` }} />
      <div aria-hidden className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/55" />
      <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
      <div aria-hidden className="absolute -right-16 top-0 h-full w-48 -skew-x-[22deg] bg-linear-to-b from-gold/15 to-transparent" />

      <div className="relative p-5 sm:p-7">
        <Link href="/cod/tournoi" className="inline-flex items-center gap-1.5 font-tech text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white">
          <LuArrowLeft aria-hidden className="h-3.5 w-3.5" />
          Toutes les coupes
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[auto_1fr_19rem] lg:items-end">
          <Poster cup={tournament} className="w-28 border border-white/15 shadow-2xl shadow-black/60 sm:w-40" />
          <div className="min-w-0">
            <p className={cn("flex items-center gap-2 font-tech text-[11px] font-bold uppercase tracking-[0.22em]", status.tone)}>
              <span aria-hidden className="relative flex h-2 w-2">
                {live ? <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-loss opacity-70" /> : null}
                <span className={cn("relative inline-flex h-2 w-2 rounded-full", status.dot)} />
              </span>
              {status.label}
              <span className="font-normal text-white/35">· {KIND_LABEL[tournament.kind] ?? "Coupe"}</span>
            </p>
            <h2 className="mt-2 font-display text-4xl font-black uppercase leading-[0.92] sm:text-6xl">{tournament.name}</h2>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/70">
              <span className="flex items-start gap-1.5">
                <LuGamepad2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />
                <span>
                  Modern Warfare 4 · <span className="font-semibold text-white">Recherche &amp; Destruction Hardcore</span>
                </span>
              </span>
              <span className="flex items-start gap-1.5">
                <LuCalendarDays aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-white/45" />
                <span>
                  {new Date(tournament.startsAt).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}{" "}
                  <span className="text-white/45">({phases(tournament)})</span>
                </span>
              </span>
            </p>
          </div>

          <div className="clip-tactical bg-ink/80 p-4 backdrop-blur [--cut:14px]" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)" }}>
            <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Récompenses</p>
            <ul className="mt-3 space-y-2">
              {places.map(([rank, metal, line, extra], index) => (
                <li key={rank} className="flex items-center gap-2.5 text-sm">
                  {art ? (
                    <img src={`/images/trophees/${art}-${metal}.png`} alt="" className="h-7 w-7 shrink-0 object-contain" />
                  ) : (
                    <LuTrophy aria-hidden className="h-5 w-5 shrink-0" style={{ color: MEDALS[index] }} />
                  )}
                  <span className="w-6 text-white/45">{rank}</span>
                  <span className="flex-1 font-display font-black">{line}</span>
                  {extra ? <span className="border border-white/10 px-1.5 py-0.5 font-tech text-[9px] uppercase tracking-[0.12em] text-white/55">{extra}</span> : null}
                </li>
              ))}
            </ul>
            {r?.xp ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-white/50">
                <LuZap aria-hidden className="h-3.5 w-3.5 text-gold" />+{r.xp.win} XP par match gagné, +{r.xp.loss} perdu
              </p>
            ) : tournament.kind === "anubis" ? (
              <p className="mt-3 text-xs text-white/50">Sur le profil de chaque joueur du podium.</p>
            ) : null}
            {button ? <div className="mt-4">{button}</div> : null}
          </div>
        </div>
      </div>

      {/* Ligne du format */}
      <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-white/10 bg-ink/70 px-5 py-3.5 text-xs text-white/65 sm:px-7">
        {strip.map(([Icon, label, extra]) => (
          <span key={label} className="flex items-center gap-1.5">
            <Icon aria-hidden className="h-3.5 w-3.5 text-gold" />
            <span className="font-semibold text-white/85">{label}</span>
            {extra ? <span className="text-white/45">· {extra}</span> : null}
          </span>
        ))}
        {fill !== null ? (
          <span className="flex items-center gap-2">
            <LuListOrdered aria-hidden className="h-3.5 w-3.5 text-gold" />
            <span className="font-semibold text-white/85">
              {placesTaken(cup)}/{cup.capacity} {tournament.kind === "anubis" ? "joueurs" : "places"}
            </span>
            <span className="h-1.5 w-20 bg-white/10">
              <span className="block h-full bg-gold" style={{ width: `${fill}%` }} />
            </span>
            {reservesTaken(cup) ? <span className="text-white/45">+ {reservesTaken(cup)} rempl.</span> : null}
            {tournament.minTeams ? <span className="text-white/45">min. {tournament.minTeams}</span> : null}
          </span>
        ) : null}
        {onRules ? (
          <button type="button" onClick={onRules} className="ml-auto font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
            Lire les règles du tournoi
          </button>
        ) : null}
      </div>
    </section>
  );
}
