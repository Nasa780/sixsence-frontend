/**
 * État d'un événement du point de vue des inscriptions :
 *   cancelled, started (inscriptions closes), full, remaining (null = illimité), open.
 */
export function getEventState(event, now = Date.now()) {
  const cancelled = event.status === "cancelled";
  const started = new Date(event.starts_at).getTime() <= now;
  const remaining = event.max_slots === null || event.max_slots === undefined ? null : Math.max(0, event.max_slots - event.registered_count);
  const full = remaining === 0;
  return { cancelled, started, full, remaining, open: !cancelled && !started && !full };
}

/** Jour et mois courts pour la pastille calendrier (« 12 », « JUIN »). */
export function dayMonth(value) {
  const date = new Date(value);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
  };
}

export const formatTime = (value) => new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
