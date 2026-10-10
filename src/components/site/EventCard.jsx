import Link from "next/link";
import { formatDate } from "./ui";

/** Statut d'affichage d'un événement GTA 6 (complet, terminé, annulé…). */
export function eventStatus(event) {
  if (event.status === "cancelled") return { text: "Annulé", color: "#64748b" };
  if (new Date(event.starts_at) <= new Date()) return { text: "Terminé", color: "#94a3b8" };
  if (event.max_slots && event.registered_count >= event.max_slots) return { text: "Complet", color: "#f87171" };
  return { text: "Inscriptions ouvertes", color: "#4ade80" };
}

/** Carte d'un événement dans la liste. */
export default function EventCard({ event }) {
  const status = eventStatus(event);
  return (
    <Link
      href={`/gta6/events/${event.id}`}
      className="no-underline rounded-[10px] overflow-hidden bg-[rgba(10,22,40,0.6)] border border-solid border-[rgba(26,107,220,0.15)] flex flex-col hover:border-[rgba(255,160,64,0.45)] transition-colors"
    >
      <div
        className="h-[140px] bg-cover bg-center relative"
        style={{ backgroundImage: `url('${event.cover_url || "/images/grand-theft-auto-vi-3840x2160-22311.jpg"}')` }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,15,0.1),rgba(6,7,15,0.85))]" />
        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[1.5px] font-bold font-[Rajdhani] py-1 px-2 bg-[rgba(6,7,15,0.75)] text-[#ffa040] border border-solid border-[rgba(255,160,64,0.4)]">
          {event.category}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <b className="text-lg text-[#e8f0fa] font-[Rajdhani] leading-6">{event.title}</b>
        <div className="text-xs text-[#a0b0c8] font-[Inter]">
          📅 {formatDate(event.starts_at)}
          {event.location && <> · 📍 {event.location}</>}
        </div>
        <div className="flex items-center justify-between text-xs font-[Inter] pt-1">
          <span style={{ color: status.color }}>{status.text}</span>
          <span className="text-[#5b7fa8]">
            {event.registered_count}
            {event.max_slots ? ` / ${event.max_slots}` : ""} inscrit(s)
          </span>
        </div>
      </div>
    </Link>
  );
}
