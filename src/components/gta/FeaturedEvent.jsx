import Image from "next/image";
import Link from "next/link";
import { LuArrowRight, LuClock, LuMapPin, LuUsers } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { Chip } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { dayMonth, formatDateTime, getEventState } from "./eventStatus";

/**
 * Événement phare de la page GTA 6 : le prochain événement, en grand (image, date, jauge, appel à réserver).
 * La réservation se fait sur la fiche de l'événement.
 */
export function FeaturedEvent({ event, registered = false }) {
  const state = getEventState(event);
  const { day, month } = dayMonth(event.starts_at);
  const fill = event.max_slots ? Math.min(100, Math.round((event.registered_count / event.max_slots) * 100)) : null;
  const cta = registered ? "Voir ma réservation" : state.open ? "Réserver ma place" : "Voir le détail";

  return (
    <Link href={`/gta6/events/${event.id}`} className="block" aria-label={`${event.title} : ${cta}`}>
      <TacticalCard interactive highlight cut={30} innerClassName="holo flex flex-col lg:flex-row">
        {/* Visuel avec la pastille calendrier */}
        <div className="relative min-h-60 lg:w-[46%] lg:shrink-0">
          <Image src="/images/gta/braquage-paysage.webp" alt="" fill sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink-800 via-ink-800/10 to-transparent lg:bg-linear-to-r lg:from-transparent lg:via-ink-800/10 lg:to-ink-800" />
          <div className="absolute left-5 top-5 border border-gold/50 bg-ink/80 px-4 py-3 text-center backdrop-blur-sm">
            <p className="font-display text-5xl font-black leading-none text-gold">{day}</p>
            <p className="mt-1 font-tech text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">{month}</p>
          </div>
        </div>

        {/* Infos */}
        <div className="relative flex flex-1 flex-col gap-5 p-6 sm:p-10">
          <div className="flex flex-wrap gap-2">
            <Chip>Événement phare</Chip>
            <Chip tone="neutral">{event.category}</Chip>
            {registered ? <Chip tone="win">Inscrit</Chip> : null}
            {!registered && state.full ? <Chip tone="loss">Complet</Chip> : null}
          </div>
          <h3 className="font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">{event.title}</h3>
          {event.description ? <p className="line-clamp-3 max-w-xl text-base leading-relaxed text-white/65">{event.description}</p> : null}

          <dl className="space-y-2 text-sm text-white/75">
            <div className="flex items-center gap-2.5">
              <LuClock aria-hidden className="h-4 w-4 shrink-0 text-gold" />
              <dt className="sr-only">Date</dt>
              <dd className="first-letter:uppercase">{formatDateTime(event.starts_at)} (heure de Paris)</dd>
            </div>
            {event.location ? (
              <div className="flex items-center gap-2.5">
                <LuMapPin aria-hidden className="h-4 w-4 shrink-0 text-gold" />
                <dt className="sr-only">Lieu</dt>
                <dd>{event.location}</dd>
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

          {fill !== null ? (
            <div aria-hidden className="h-1.5 w-full max-w-md bg-white/10">
              <div className={cn("h-full", state.full ? "bg-loss" : "bg-gold-sheen")} style={{ width: `${fill}%` }} />
            </div>
          ) : null}

          <span className="clip-slant mt-2 inline-flex items-center gap-2.5 self-start bg-gold-sheen px-7 py-3.5 font-display text-lg font-bold uppercase tracking-[0.14em] text-ink transition group-hover/card:brightness-110">
            {cta}
            <LuArrowRight aria-hidden className="h-5 w-5 transition-transform duration-300 group-hover/card:translate-x-1" />
          </span>
        </div>
      </TacticalCard>
    </Link>
  );
}
