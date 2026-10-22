import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { CalendarView, mondayOf } from "../calendar/CalendarView";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/Typography";

const DAY = 86400000;

/**
 * Accueil : le calendrier (coupes, événements GTA 6, temps forts de la saison), dans le même bandeau sombre
 * quadrillé que le bloc « En direct » juste au-dessus. Données GET /calendar ; rien n'est affiché en cas d'erreur.
 */
export function HomeCalendar() {
  const [weekStart, setWeekStart] = useState(null);
  const [events, setEvents] = useState(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setWeekStart(mondayOf(Date.now()));
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const load = useCallback(async (start) => {
    try {
      const from = new Date(start.getTime()).toISOString();
      const to = new Date(start.getTime() + 42 * DAY).toISOString();
      setEvents((await api(`/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)).events);
    } catch {
      setEvents([]);
    }
  }, []);
  useEffect(() => {
    if (weekStart) load(weekStart);
  }, [weekStart, load]);

  const onWeek = (step) => setWeekStart((current) => (step === 0 ? mondayOf(Date.now()) : new Date(current.getTime() + step * 7 * DAY)));

  return (
    <section className="relative border-b border-white/10 bg-ink-800 pb-20 pt-4 sm:pb-28 sm:pt-8">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow="Calendrier" title="Les prochains rendez-vous" center />
        </Reveal>
        <div className="mt-14">{events && weekStart ? <CalendarView events={events} weekStart={weekStart} now={now} onWeek={onWeek} /> : null}</div>
      </Container>
    </section>
  );
}
