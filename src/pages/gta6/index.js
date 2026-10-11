import Head from "next/head";
import { LuCalendarDays, LuTicket, LuUsers } from "react-icons/lu";
import { Reveal } from "../../components/effects/Reveal";
import { EventCard } from "../../components/gta/EventCard";
import { ButtonLink } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { EmptyState, Loading } from "../../components/ui/Feedback";
import { PageHeader, SectionHeading } from "../../components/ui/Typography";
import useGtaEvents from "../../hooks/useGtaEvents";

const PILLARS = [
  { icon: LuCalendarDays, title: "Un planning clair", text: "Toutes les sessions à venir au même endroit, avec date, heure et lieu de rendez-vous." },
  { icon: LuTicket, title: "Inscription en un clic", text: "Réserve ta place, ou libère-la si tu as un empêchement : quelqu'un d'autre en profitera." },
  { icon: LuUsers, title: "Des places comptées", text: "Chaque événement affiche sa jauge et la liste des inscrits, à jour en permanence." },
];

/** Hub GTA 6 : présentation et prochains événements. Public. */
export default function GtaHubPage() {
  const { events, mine } = useGtaEvents("upcoming");
  const upcoming = (events || []).filter((event) => event.status !== "cancelled").slice(0, 3);

  return (
    <>
      <Head>
        <title>GTA 6 — SixSence</title>
      </Head>
      <PageHeader
        image="/images/grand-theft-auto-vi-3840x2160-22311.jpg"
        eyebrow="GTA 6"
        title={
          <>
            Les rues sont à <span className="text-gold-gradient">nous</span>
          </>
        }
        description="Sessions organisées, rassemblements, tournois : la communauté se retrouve ici. Consulte le planning et réserve ta place."
        actions={
          <ButtonLink href="/gta6/events" size="lg">
            <LuCalendarDays aria-hidden className="h-5 w-5" />
            Tout le planning
          </ButtonLink>
        }
      />

      <Container className="space-y-20 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.08}>
              <div className="border-t border-gold/40 pt-6">
                <pillar.icon aria-hidden className="h-8 w-8 text-gold" />
                <h2 className="mt-5 font-display text-3xl font-bold uppercase leading-none tracking-wide">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <section aria-labelledby="titre-prochains">
          <SectionHeading eyebrow="À venir" title={<span id="titre-prochains">Prochains événements</span>} />
          <div className="mt-10">
            {events === null ? (
              <Loading />
            ) : upcoming.length === 0 ? (
              <EmptyState title="Rien de prévu pour l'instant">
                Aucun événement n&apos;est programmé. Les prochaines dates seront annoncées ici et sur Discord.
              </EmptyState>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} registered={mine.has(event.id)} />
                ))}
              </div>
            )}
          </div>
        </section>
      </Container>
    </>
  );
}
