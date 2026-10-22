import { useCallback, useEffect, useState } from "react";
import { api } from "../../lib/api";
import { CalendarView, mondayOf } from "../calendar/CalendarView";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/Typography";

const DAY = 86400000;

/**
 * Accueil : le calendrier (coupes, événements GTA 6, temps forts de la saison), sous le bloc « En direct », sans fond ;
 * masqué tant qu'aucun vrai rendez-vous n'est prévu (le top de la semaine seul ne suffit pas). Données GET /calendar ; rien n'est affiché en cas d'erreur.
 */
export function HomeCalendar() {
  const [weekStart, setWeekStart] = useState(null);
  const [events, setEvents] = useState(null);
  // Affiché seulement s'il y a un vrai rendez-vous (coupe, événement GTA 6, saison) dans les 6 semaines à venir.
  const [visible, setVisible] = useState(false);
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
      const list = (await api(`/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)).events;
      setEvents(list);
      if (list.some((event) => event.kind !== "rdv")) setVisible(true);
    } catch {
      setEvents([]);
    }
  }, []);
  useEffect(() => {
    if (weekStart) load(weekStart);
  }, [weekStart, load]);

  const onWeek = (step) => setWeekStart((current) => (step === 0 ? mondayOf(Date.now()) : new Date(current.getTime() + step * 7 * DAY)));

  if (!visible) return null;
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Calendrier" title="Les prochains rendez-vous" center />
        </Reveal>
        <div className="mt-14">{events && weekStart ? <CalendarView events={events} weekStart={weekStart} now={now} onWeek={onWeek} /> : null}</div>
      </Container>
    </section>
  );
}
