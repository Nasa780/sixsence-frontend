import Head from "next/head";
import { EventCard } from "../../../components/gta/EventCard";
import { Container } from "../../../components/ui/Container";
import { EmptyState, Loading } from "../../../components/ui/Feedback";
import { Eyebrow, PageHeader } from "../../../components/ui/Typography";
import useGtaEvents from "../../../hooks/useGtaEvents";

/** Planning complet : événements à venir, puis événements passés. Public. */
export default function EventsPage() {
  const { events, mine } = useGtaEvents("all");

  const now = Date.now();
  const upcoming = (events || []).filter((event) => new Date(event.starts_at).getTime() > now);
  // Les plus récents d'abord, limités aux douze derniers.
  const past = (events || [])
    .filter((event) => new Date(event.starts_at).getTime() <= now)
    .reverse()
    .slice(0, 12);

  return (
    <>
      <Head>
        <title>Événements GTA 6 — SixSence</title>
      </Head>
      <PageHeader
        image="/images/grand-theft-auto-vi-3840x2160-22311.jpg"
        eyebrow="GTA 6"
        title={
          <>
            Le <span className="text-gold-gradient">planning</span>
          </>
        }
        description="Toutes les sessions de la communauté. Les horaires sont donnés à l'heure de Paris."
      />

      <Container className="space-y-16 py-12">
        {events === null ? (
          <Loading />
        ) : (
          <>
            <section aria-labelledby="titre-a-venir">
              <Eyebrow>À venir</Eyebrow>
              <h2 id="titre-a-venir" className="mt-3 font-display text-4xl font-black uppercase leading-none">
                {upcoming.length} événement{upcoming.length > 1 ? "s" : ""} programmé{upcoming.length > 1 ? "s" : ""}
              </h2>
              <div className="mt-8">
                {upcoming.length === 0 ? (
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

            {past.length > 0 ? (
              <section aria-labelledby="titre-passes">
                <Eyebrow>Archives</Eyebrow>
                <h2 id="titre-passes" className="mt-3 font-display text-4xl font-black uppercase leading-none">
                  Événements passés
                </h2>
                <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {past.map((event) => (
                    <EventCard key={event.id} event={event} registered={mine.has(event.id)} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </Container>
    </>
  );
}
