import { motion } from "framer-motion";
import Link from "next/link";
import { LuCalendarPlus, LuChevronLeft, LuChevronRight, LuDownload } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { API_URL } from "../../lib/config";
import { Button, ButtonLink } from "../ui/Button";
import { EmptyState } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

/** Couleurs par type : coupes rouge, GTA 6 coucher de soleil, saison cyan, rendez-vous vert. */
export const KINDS = {
  coupe: { label: "Trophées", color: "#e5484d" },
  gta: { label: "GTA 6", color: "#f59e0b" },
  saison: { label: "Saison", color: "#22d3ee" },
  rdv: { label: "Rendez-vous", color: "#34d399" },
};
const DAY = 86400000;
const tz = { timeZone: "Europe/Paris" };
export const parisDay = (date) => new Date(date).toLocaleDateString("sv-SE", tz);
const time = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { ...tz, hour: "2-digit", minute: "2-digit" });

/** Lundi (00:00, heure locale) de la semaine d'une date. */
export function mondayOf(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function countdown(target, now) {
  const s = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d} j ${h} h` : h > 0 ? `${h} h ${String(m).padStart(2, "0")}` : `${m} min`;
}

/**
 * Calendrier : prochain rendez-vous en tête, semaine (7 colonnes sur ordinateur, liste par jour sur
 * mobile), « plus tard » (le reste de la période), légende, abonnement et fichier .ics.
 */
export function CalendarView({ events, weekStart, now, onWeek }) {
  const days = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * DAY));
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY);
  const next = events.find((e) => e.kind !== "rdv" && new Date(e.startsAt).getTime() > now);
  const byDay = (day) => events.filter((e) => parisDay(e.startsAt) === parisDay(day));
  const later = events.filter((e) => e.kind !== "rdv" && new Date(e.startsAt) >= weekEnd);
  const today = parisDay(now);
  const range = `${days[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – ${days[6].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}`;
  const icsUrl = `${API_URL}/calendar.ics`;

  return (
    <div className="space-y-10">
      {next ? <NextEvent event={next} now={now} /> : null}

      <section aria-labelledby="titre-semaine">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="titre-semaine" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
            Semaine <span className="text-gold-gradient">du {range}</span>
          </h2>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" aria-label="Semaine précédente" onClick={() => onWeek(-1)}>
              <LuChevronLeft aria-hidden className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onWeek(0)}>
              Aujourd&apos;hui
            </Button>
            <Button size="sm" variant="outline" aria-label="Semaine suivante" onClick={() => onWeek(1)}>
              <LuChevronRight aria-hidden className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ol className="mt-6 grid gap-3 lg:grid-cols-7">
          {days.map((day, index) => {
            const list = byDay(day);
            const isToday = parisDay(day) === today;
            return (
              <motion.li
                key={day.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={cn("min-h-28 border-t-2 bg-white/[0.02] p-2.5", isToday ? "border-gold bg-gold/[0.05]" : "border-white/10", list.length === 0 && "hidden lg:block")}
              >
                <p className={cn("font-tech text-[10px] uppercase tracking-[0.22em]", isToday ? "text-gold" : "text-white/45")}>
                  {day.toLocaleDateString("fr-FR", { weekday: "short" })} <span className="text-base font-bold">{day.getDate()}</span>
                  {isToday ? <span className="ml-2 text-[9px]">aujourd&apos;hui</span> : null}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {list.map((event) => (
                    <li key={event.id}>
                      <EventChip event={event} />
                    </li>
                  ))}
                </ul>
              </motion.li>
            );
          })}
        </ol>
        {days.every((day) => byDay(day).length === 0) ? <p className="mt-4 text-sm text-white/45 lg:hidden">Rien de prévu cette semaine.</p> : null}
      </section>

      {later.length ? (
        <section aria-labelledby="titre-plus-tard">
          <h2 id="titre-plus-tard" className="font-display text-2xl font-black uppercase leading-none">
            Plus tard
          </h2>
          <ul className="mt-4 space-y-2">
            {later.slice(0, 8).map((event) => (
              <li key={event.id}>
                <Link href={event.href} className="flex items-center gap-4 border-l-2 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.07]" style={{ borderColor: KINDS[event.kind].color }}>
                  <span className="w-16 shrink-0 font-tech text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: KINDS[event.kind].color }}>
                    {KINDS[event.kind].label}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg font-bold uppercase leading-none">{event.title}</span>
                    {event.subtitle ? <span className="mt-1 block truncate text-xs text-white/45">{event.subtitle}</span> : null}
                  </span>
                  <span className="shrink-0 text-right text-xs text-white/50">
                    {new Date(event.startsAt).toLocaleDateString("fr-FR", { ...tz, weekday: "short", day: "numeric", month: "short" })}
                    {event.kind === "saison" ? null : <span className="block font-tech text-white/35">{time(event.startsAt)}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {events.length === 0 ? <EmptyState title="Rien de prévu pour l'instant">Les trophées et les événements GTA 6 apparaîtront ici dès leur annonce.</EmptyState> : null}

      {/* Pas de légende : chaque rendez-vous porte la couleur de son type (coupes, GTA 6, saison, rendez-vous). */}
      <div className="flex flex-col gap-4 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-end">
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={icsUrl.replace(/^https?:/, "webcal:")} size="sm">
            <LuCalendarPlus aria-hidden className="h-4 w-4" />
            S&apos;abonner (mise à jour auto)
          </ButtonLink>
          <ButtonLink href={icsUrl} size="sm" variant="outline">
            <LuDownload aria-hidden className="h-4 w-4" />
            Fichier .ics
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

function EventChip({ event }) {
  const kind = KINDS[event.kind];
  return (
    <Link href={event.href} className="group block border-l-2 bg-black/30 px-2 py-1.5 transition-colors hover:bg-white/[0.06]" style={{ borderColor: kind.color }}>
      <span className="block font-tech text-[10px] font-bold tabular-nums" style={{ color: kind.color }}>
        {time(event.startsAt)}
      </span>
      <span className="block text-xs font-semibold leading-snug text-white/85 group-hover:text-white">{event.title}</span>
      {event.cup?.capacity && event.cup.registered !== null ? (
        <span className="mt-0.5 block text-[10px] text-white/40">
          {event.cup.registered} / {event.cup.capacity} {event.cup.type === "anubis" ? "inscrits" : "équipes"}
        </span>
      ) : null}
    </Link>
  );
}

function NextEvent({ event, now }) {
  const kind = KINDS[event.kind];
  const date = new Date(event.startsAt);
  const registration = event.cup && event.cup.status === "scheduled";
  return (
    <TacticalCard highlight cut={24} innerClassName="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse at 0% 50%, ${kind.color}26, transparent 60%)` }} />
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center border" style={{ borderColor: `${kind.color}88` }}>
          <span className="font-tech text-[10px] uppercase tracking-[0.24em]" style={{ color: kind.color }}>
            {date.toLocaleDateString("fr-FR", { ...tz, weekday: "short" })}
          </span>
          <span className="font-display text-5xl font-black leading-none">{date.toLocaleDateString("fr-FR", { ...tz, day: "numeric" })}</span>
          <span className="font-tech text-[10px] uppercase text-white/45">{date.toLocaleDateString("fr-FR", { ...tz, month: "short" })}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-tech text-[10px] uppercase tracking-[0.26em]" style={{ color: kind.color }}>
            Prochain rendez-vous · dans {countdown(event.startsAt, now)}
          </p>
          <p className="mt-2 font-display text-4xl font-black uppercase leading-[0.9] sm:text-5xl">{event.title}</p>
          <p className="mt-2 text-sm text-white/60">
            {time(event.startsAt)}
            {event.subtitle ? ` · ${event.subtitle}` : ""}
            {event.cup ? ` · check-in ${time(event.cup.checkInAt)}` : ""}
            {event.cup?.registered !== null && event.cup?.registered !== undefined ? ` · ${event.cup.registered} / ${event.cup.capacity} inscrits` : ""}
          </p>
        </div>
        <ButtonLink href={event.href} size="lg" variant={registration ? "primary" : "outline"}>
          {registration ? "S'inscrire" : "Voir"}
        </ButtonLink>
      </div>
    </TacticalCard>
  );
}
