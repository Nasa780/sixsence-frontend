import Link from "next/link";
import { LuCalendarDays, LuCrown, LuDices, LuLayoutGrid, LuListOrdered, LuSwords, LuTrophy, LuUser, LuUsers } from "react-icons/lu";
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

const TAB_ITEMS = [
  { id: null, label: "Toutes les coupes", short: "Toutes", sub: "Calendrier et résultats", icon: LuLayoutGrid },
  { id: "horus", label: "Coupe Horus", short: "Horus", sub: "En équipe · trophées", icon: LuUsers, art: "/images/trophees/horus-or.png" },
  { id: "anubis", label: "Coupe Anubis", short: "Anubis", sub: "En solo · médailles", icon: LuUser, art: "/images/trophees/anubis-or.png" },
  { id: "saison", label: "Fin de saison", short: "Saison", sub: "Les meilleures du circuit", icon: LuCrown },
];

/** Prochaine échéance d'un onglet d'après la liste des coupes : en cours, date de la prochaine, ou nombre à venir. */
function tabNext(id, cups) {
  if (!cups) return null;
  const upcoming = cups.upcoming ?? [];
  if (!id) return upcoming.length ? `${upcoming.length} à venir` : "Rien de prévu";
  const next = upcoming.filter((cup) => cup.kind === id).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))[0];
  if (!next) return "Pas encore prévue";
  if (next.status === "running") return "En cours";
  const date = new Date(next.startsAt);
  return `${date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · ${date.getHours()} h${date.getMinutes() ? String(date.getMinutes()).padStart(2, "0") : ""}`;
}

/**
 * Onglets des tournois : cartes de compétition sur ordinateur (visuel, type de coupe, prochaine date), barre HUD
 * soulignée sur téléphone. `active` : null (toutes), horus, anubis ou saison ; `extra` : onglet ponctuel (play-in).
 */
export function CupTabs({ active, cups, onChange, extra = null }) {
  return (
    <div role="tablist" aria-label="Tournois">
      <div className="hidden grid-cols-4 gap-3 md:grid">
        {TAB_ITEMS.map((item) => {
          const on = active === item.id;
          const Icon = item.icon;
          const next = tabNext(item.id, cups);
          return (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(item.id)}
              className={cn(
                "clip-tactical group relative flex h-24 items-center gap-3 overflow-hidden px-4 text-left transition [--cut:14px]",
                on ? "bg-linear-to-br from-gold/30 via-gold/10 to-black" : "bg-white/[0.04] hover:bg-white/[0.07]",
              )}
            >
              {on ? <span className="absolute inset-x-0 top-0 h-0.5 bg-gold shadow-[0_0_12px_var(--color-gold)]" /> : null}
              {item.art ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.art} alt="" className={cn("h-16 w-16 shrink-0 object-contain transition", on ? "drop-shadow-[0_0_14px_rgba(229,72,77,0.5)]" : "opacity-60 grayscale-[40%] group-hover:opacity-90")} />
              ) : (
                <span className={cn("grid h-16 w-16 shrink-0 place-items-center", on ? "text-gold-light" : "text-white/35")}>
                  <Icon aria-hidden className="h-8 w-8" />
                </span>
              )}
              <span className="min-w-0">
                <span className={cn("block truncate font-display text-lg font-black uppercase leading-none", on ? "text-white" : "text-white/70")}>{item.label}</span>
                <span className="mt-1 block truncate text-[11px] text-white/45">{item.sub}</span>
                {next ? (
                  <span className={cn("mt-1.5 inline-flex items-center gap-1 font-tech text-[9px] uppercase tracking-[0.2em]", on ? "text-gold-light" : "text-white/35")}>
                    <LuCalendarDays aria-hidden className="h-3 w-3" />
                    {next}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex overflow-x-auto border-b border-white/10 md:hidden">
        {TAB_ITEMS.map((item) => {
          const on = active === item.id;
          const Icon = item.icon;
          return (
            <button key={item.label} type="button" role="tab" aria-selected={on} onClick={() => onChange(item.id)} className="relative flex flex-1 shrink-0 items-center justify-center gap-1.5 px-3 py-3.5">
              <Icon aria-hidden className={cn("h-4 w-4", on ? "text-gold-light" : "text-white/35")} />
              <span className={cn("font-display text-sm font-bold uppercase tracking-[0.12em]", on ? "text-white" : "text-white/50")}>{item.short}</span>
              {on ? <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold shadow-[0_0_12px_var(--color-gold)]" /> : null}
            </button>
          );
        })}
      </div>
      {extra ? <p className="mt-3 font-tech text-[10px] uppercase tracking-[0.24em] text-gold">{extra}</p> : null}
    </div>
  );
}
