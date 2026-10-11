import Link from "next/link";
import { LuArrowRight, LuClock, LuMapPin, LuUsers } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { Chip } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { dayMonth, formatTime, getEventState } from "./eventStatus";

/** Carte d'un événement GTA 6 : date, titre, lieu, jauge de places. */
export function EventCard({ event, registered = false }) {
  const state = getEventState(event);
  const { day, month } = dayMonth(event.starts_at);
  const fill = event.max_slots ? Math.min(100, Math.round((event.registered_count / event.max_slots) * 100)) : null;

  return (
    <Link href={`/gta6/events/${event.id}`} className="block h-full" aria-label={`${event.title}, voir le détail`}>
      <TacticalCard
        interactive
        highlight={registered}
        className={cn("h-full", (state.started || state.cancelled) && "opacity-60")}
        innerClassName="flex h-full flex-col p-6"
      >
        <div className="flex items-start gap-5">
          {/* Pastille calendrier */}
          <div className="shrink-0 border border-gold/40 bg-gold/8 px-3.5 py-2.5 text-center">
            <p className="font-display text-4xl font-black leading-none text-gold">{day}</p>
            <p className="mt-1 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">{month}</p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <Chip tone="neutral">{event.category}</Chip>
              {state.cancelled ? <Chip tone="loss">Annulé</Chip> : null}
              {!state.cancelled && state.started ? <Chip tone="neutral">Terminé</Chip> : null}
              {!state.cancelled && !state.started && state.full ? <Chip tone="loss">Complet</Chip> : null}
              {registered && !state.cancelled ? <Chip tone="win">Inscrit</Chip> : null}
            </div>
            <h3 className="mt-3 font-display text-3xl font-black uppercase leading-[0.95]">{event.title}</h3>
          </div>
        </div>

        {event.description ? <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-white/55">{event.description}</p> : null}

        <dl className="mt-5 space-y-2 text-sm text-white/70">
          <div className="flex items-center gap-2.5">
            <LuClock aria-hidden className="h-4 w-4 shrink-0 text-gold" />
            <dt className="sr-only">Heure</dt>
            <dd>{formatTime(event.starts_at)} (heure de Paris)</dd>
          </div>
          {event.location ? (
            <div className="flex items-center gap-2.5">
              <LuMapPin aria-hidden className="h-4 w-4 shrink-0 text-gold" />
              <dt className="sr-only">Lieu</dt>
              <dd className="truncate">{event.location}</dd>
            </div>
          ) : null}
          <div className="flex items-center gap-2.5">
            <LuUsers aria-hidden className="h-4 w-4 shrink-0 text-gold" />
            <dt className="sr-only">Inscrits</dt>
            <dd>
              {event.registered_count} inscrit{event.registered_count > 1 ? "s" : ""}
              {event.max_slots ? ` sur ${event.max_slots} places` : " · places illimitées"}
            </dd>
          </div>
        </dl>

        {/* Jauge de remplissage, poussée en bas de carte. */}
        <div className="mt-auto pt-6">
          {fill !== null ? (
            <div aria-hidden className="h-1 w-full bg-white/10">
              <div className={cn("h-full", state.full ? "bg-loss" : "bg-gold-sheen")} style={{ width: `${fill}%` }} />
            </div>
          ) : null}
          <p className="mt-4 inline-flex items-center gap-2 font-display text-base font-bold uppercase tracking-[0.14em] text-gold">
            Voir le détail
            <LuArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover/card:translate-x-1.5" />
          </p>
        </div>
      </TacticalCard>
    </Link>
  );
}
