import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { CalendarView, mondayOf } from "../components/calendar/CalendarView";
import { Container } from "../components/ui/Container";
import { Loading, Notice } from "../components/ui/Feedback";
import { PageHeader } from "../components/ui/Typography";
import { api } from "../lib/api";

const DAY = 86400000;

/** Calendrier public : coupes, événements GTA 6, saison et rendez-vous (GET /calendar du backend). */
export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(null);
  const [events, setEvents] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setWeekStart(mondayOf(Date.now()));
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // La semaine affichée et les 5 suivantes (« plus tard »).
  const load = useCallback(async (start) => {
    try {
      const from = new Date(start.getTime()).toISOString();
      const to = new Date(start.getTime() + 42 * DAY).toISOString();
      setEvents((await api(`/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)).events);
      setError(null);
    } catch (caught) {
      setError(caught.message);
    }
  }, []);
  useEffect(() => {
    if (weekStart) load(weekStart);
  }, [weekStart, load]);

  const onWeek = (step) => setWeekStart((current) => (step === 0 ? mondayOf(Date.now()) : new Date(current.getTime() + step * 7 * DAY)));

  return (
    <>
      <Head>
        <title>Calendrier — SixSence</title>
        <meta name="description" content="Calendrier SixSence : trophées Horus et Anubis, événements GTA 6, fin de saison. Abonne-toi depuis ton agenda." />
      </Head>
      <PageHeader
        eyebrow="SixSence · Calendrier"
        title={
          <>
            Calen<span className="text-gold-gradient">drier</span>
          </>
        }
        description="Trophées, événements GTA 6 et temps forts de la saison. Abonne-toi pour les retrouver dans ton agenda."
      />
      <Container className="py-12">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {events === null && !error ? <Loading /> : null}
        {events && weekStart ? <CalendarView events={events} weekStart={weekStart} now={now} onWeek={onWeek} /> : null}
      </Container>
    </>
  );
}
