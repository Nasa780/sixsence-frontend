import { useEffect, useState } from "react";
import EventCard from "../../../components/site/EventCard";
import PageShell from "../../../components/site/PageShell";
import { Loading, PageTitle } from "../../../components/site/ui";
import { api } from "../../../lib/api";

const TABS = [
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Passés" },
];

/** Planning des événements GTA 6. */
export default function GtaEvents() {
  const [scope, setScope] = useState("upcoming");
  const [events, setEvents] = useState(null);

  useEffect(() => {
    setEvents(null);
    api(`/gta/events?scope=${scope}`)
      .then((data) => setEvents(data.events))
      .catch(() => setEvents([]));
  }, [scope]);

  return (
    <PageShell active="gta6" title="Événements GTA 6">
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Planning des événements"
          subtitle="Toutes les sessions GTA 6 de la communauté. L'inscription se fait avec ton compte Discord."
        />

        <div className="flex gap-1 border-b border-solid border-[rgba(26,107,220,0.18)] font-[Inter] text-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setScope(tab.key)}
              className={`cursor-pointer bg-transparent [border:none] py-2 px-4 -mb-px ${
                scope === tab.key ? "text-[#1a6bdc] border-b-2 border-solid border-[#1a6bdc]" : "text-[#94a3b8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {events === null && <Loading />}
        {events?.length === 0 && (
          <div className="py-10 text-center text-sm text-[#5b7fa8] font-[Inter]">
            {scope === "upcoming" ? "Aucun événement prévu pour l'instant." : "Aucun événement passé."}
          </div>
        )}
        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
          {events?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
