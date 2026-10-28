import Link from "next/link";
import { LuCalendarDays, LuDices, LuListOrdered, LuSwords, LuTrophy, LuUsers } from "react-icons/lu";
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
  if (cup.capacity && cup.registered >= cup.capacity) return { label: "Complet", tone: "text-loss", dot: "bg-loss" };
  return { label: "Inscriptions ouvertes", tone: "text-win", dot: "bg-win" };
}

/** Format en pastilles : 4v4, élimination, BO, places. */
function formatChips(cup) {
  const players = cup.teamSize ?? null;
  return [
    players ? [LuUsers, `${players}v${players}`] : null,
    [LuSwords, cup.bracket === "double" ? "Double" : "Simple"],
    [LuDices, `BO${cup.bestOf} · finale BO${cup.finalBestOf}`],
    [LuListOrdered, cup.kind === "anubis" ? `${cup.registered}/${cup.capacity} joueurs` : `${cup.registered}/${cup.capacity ?? cup.size}`],
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

/** En-tête de la fiche d'une coupe : bannière, affiche, statut, nom, date, infos et récompenses. */
export function CupHero({ tournament, now }) {
  const cup = {
    ...tournament,
    registered: tournament.kind === "anubis" ? tournament.registered ?? 0 : tournament.teams?.length ?? 0,
    capacity: tournament.kind === "anubis" ? tournament.capacity ?? null : tournament.size,
  };
  const status = cupStatus(cup, now);
  const rewards = rewardLines(cup);
  const xp = tournament.rewards?.xp;
  const fill = cup.capacity ? Math.min(100, Math.round((cup.registered / cup.capacity) * 100)) : null;

  return (
    <section className="relative overflow-hidden border border-white/10">
      <div aria-hidden className="absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-2xl" style={{ backgroundImage: `url('${tournament.posterUrl}')` }} />
      <div aria-hidden className="absolute inset-0 bg-linear-to-r from-ink via-ink/85 to-ink/60" />
      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[auto_1fr_17rem] lg:items-center">
        <Poster cup={tournament} className="w-32 border border-white/15 shadow-2xl shadow-black/60 sm:w-44" />
        <div className="min-w-0">
          <p className={cn("flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.22em]", status.tone)}>
            <span aria-hidden className={cn("h-2 w-2 rounded-full", status.dot)} />
            {status.label}
            <span className="text-white/35">· {KIND_LABEL[tournament.kind] ?? "Coupe"}</span>
          </p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-[0.95] sm:text-5xl">{tournament.name}</h2>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/70">
            <LuCalendarDays aria-hidden className="h-4 w-4 text-white/45" />
            {new Date(tournament.startsAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {formatChips(cup).map(([Icon, label]) => (
              <span key={label} className="inline-flex items-center gap-1 border border-white/15 bg-ink/60 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.12em] text-white/70">
                <Icon aria-hidden className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
          {fill !== null && tournament.status === "scheduled" ? (
            <div className="mt-4 flex max-w-sm items-center gap-3 text-xs text-white/55">
              <span className="font-semibold text-white/80">
                {cup.registered}/{cup.capacity} {tournament.kind === "anubis" ? "joueurs" : "places"}
              </span>
              <span className="h-1.5 flex-1 bg-white/10">
                <span className="block h-full bg-gold" style={{ width: `${fill}%` }} />
              </span>
              {tournament.minTeams ? <span>min. {tournament.minTeams}</span> : null}
            </div>
          ) : null}
        </div>
        <div className="border border-white/10 bg-ink/70 p-4">
          <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Récompenses</p>
          <ul className="mt-3 space-y-2">
            {rewards.map((line, index) =>
              line ? (
                <li key={`${line}-${index}`} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2">
                    <LuTrophy aria-hidden className="h-4 w-4" style={{ color: MEDALS[index] }} />
                    <span className="text-white/45">{index + 1}{index ? "e" : "er"}</span>
                    <span className="font-display font-black">{line}</span>
                  </span>
                </li>
              ) : null,
            )}
          </ul>
          {xp ? <p className="mt-3 text-xs text-white/45">+{xp.win} XP par match gagné, +{xp.loss} XP par match perdu.</p> : null}
        </div>
      </div>
    </section>
  );
}
