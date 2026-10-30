import { useEffect, useState } from "react";
import { CalendarView, mondayOf } from "../components/calendar/CalendarView";
import { Container } from "../components/ui/Container";
import { PageHeader } from "../components/ui/Typography";

const at = (days, hour, minute = 0) => {
  const d = mondayOf(Date.now());
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const EVENTS = [
  { id: "top", kind: "rdv", title: "Top de la semaine", subtitle: "Meilleurs joueurs annoncés sur Discord", startsAt: at(0, 10), href: "#" },
  { id: "gta", kind: "gta", title: "Course nocturne", subtitle: "GTA 6 · Vinewood", startsAt: at(2, 20), href: "#" },
  { id: "anubis", kind: "coupe", title: "Coupe Anubis · Le Jugement", subtitle: "Coupe Anubis · solo, équipes de 4 · BO1, finale BO3", startsAt: at(5, 21), href: "#", cup: { type: "anubis", status: "scheduled", registered: 19, capacity: 40, checkInAt: at(5, 20, 30) } },
  { id: "horus", kind: "coupe", title: "Coupe Horus du dimanche", subtitle: "Coupe Horus · équipes · BO3, finale BO5", startsAt: at(6, 20), href: "#", cup: { type: "horus", status: "scheduled", registered: 5, capacity: 8, checkInAt: at(6, 19, 30) } },
  { id: "horus2", kind: "coupe", title: "Coupe Horus du dimanche", subtitle: "Coupe Horus · équipes · inscriptions à l’ouverture", startsAt: at(13, 20), href: "#", cup: { type: "horus", status: "planned", registered: null, capacity: 8, checkInAt: at(13, 19, 30) } },
  { id: "verrou", kind: "saison", title: "Transferts verrouillés", subtitle: "Plus d’arrivée ni de départ jusqu’à la fin de saison", startsAt: at(23, 0), href: "#" },
  { id: "fin", kind: "saison", title: "Fin de la Saison 1", subtitle: "Classements archivés, récompenses de saison", startsAt: at(30, 0), href: "#" },
];

export default function DevCalendrier() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return (
    <>
      <PageHeader
        eyebrow="SixSence · Calendrier"
        title={
          <>
            Calen<span className="text-gold-gradient">drier</span>
          </>
        }
        description="Coupes, événements GTA 6 et temps forts de la saison. Abonne-toi pour les retrouver dans ton agenda."
      />
      <Container className="py-12">
        <CalendarView events={EVENTS} weekStart={mondayOf(Date.now())} now={Date.now()} onWeek={() => {}} />
      </Container>
    </>
  );
}
