import Link from "next/link";
import { useEffect, useState } from "react";
import EventCard from "../../components/site/EventCard";
import PageShell from "../../components/site/PageShell";
import { Loading, SectionTitle } from "../../components/site/ui";
import { api } from "../../lib/api";

/** Hub GTA 6 : présentation et prochains événements. */
export default function GtaHub() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    api("/gta/events?scope=upcoming")
      .then((data) => setEvents(data.events))
      .catch(() => setEvents([]));
  }, []);

  return (
    <PageShell active="gta6" title="GTA 6">
      <div className="flex flex-col gap-8">
        <section className="relative overflow-hidden border border-solid border-[rgba(255,160,64,0.3)] min-h-[260px] flex items-end">
          <div className="absolute inset-0 bg-[url('/images/grand-theft-auto-vi-3840x2160-22311.jpg')] bg-cover bg-center opacity-60" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,15,0.95),rgba(6,7,15,0.35))]" />
          <div className="relative p-8 max-sm:p-5">
            <div className="text-[11px] text-[#ffa040] font-[Rajdhani] tracking-[2px] uppercase font-bold">Communauté SixSence</div>
            <h1 className="m-0 pt-1 text-[44px] max-sm:text-[30px] leading-[1.05] font-bold font-[Rajdhani] text-white tracking-[2px] uppercase">
              Événements GTA 6
            </h1>
            <p className="m-0 pt-2 text-sm text-[#a0b0c8] font-[Inter] max-w-[560px]">
              Sessions, courses, braquages en équipe : consulte le planning et réserve ta place avec ton compte Discord.
            </p>
            <Link
              href="/gta6/events"
              className="inline-block mt-5 no-underline py-3 px-5 rounded-[10px] [background:linear-gradient(90deg,_#ffa040,_#e07a10)] text-[#080c14] font-[Rajdhani] font-bold"
            >
              Voir le planning complet
            </Link>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <SectionTitle
            right={
              <Link href="/gta6/events" className="text-xs text-[#4a90d9] font-[Inter] no-underline normal-case tracking-normal">
                Tout voir →
              </Link>
            }
          >
            Prochains événements
          </SectionTitle>
          {events === null && <Loading />}
          {events?.length === 0 && (
            <div className="py-10 text-center text-sm text-[#5b7fa8] font-[Inter]">
              Aucun événement prévu pour l'instant. Reviens bientôt !
            </div>
          )}
          <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
            {events?.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
