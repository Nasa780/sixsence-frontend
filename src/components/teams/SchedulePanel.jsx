import { useEffect, useMemo, useState } from "react";
import { LuCalendarClock, LuClock, LuEyeOff, LuLoaderCircle, LuUserRound, LuX } from "react-icons/lu";
import useCountdown from "../../hooks/useCountdown";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";
import { TeamCrest } from "./TeamParts";

/**
 * Match programmé (sous la recherche de Division) : un Leader choisit un créneau au quart d'heure (de 20 min à 48 h)
 * avec les joueurs choisis au-dessus. Adversaire masqué, dévoilé 5 min avant : l'équipe entre alors dans la file
 * en tête (deux équipes du même créneau s'affrontent, sinon la recherche continue 30 min).
 */
const STEP = 15 * 60_000;
const MIN_AHEAD = 20 * 60_000;
const MAX_AHEAD = 48 * 3600_000;

const hour = (date) => date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const dayKey = (date) => date.toLocaleDateString("sv-SE");
const dayLabel = (date) => {
  const diff = Math.round((new Date(dayKey(date)) - new Date(dayKey(new Date()))) / 86_400_000);
  return diff === 0 ? "Aujourd'hui" : diff === 1 ? "Demain" : date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric" });
};
const slotName = (iso) => `${dayLabel(new Date(iso)).toLowerCase()} ${hour(new Date(iso))}`;
const hm = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h} h ${String(m).padStart(2, "0")} min` : m ? `${m} min ${String(s % 60).padStart(2, "0")} s` : `${s % 60} s`;
};

export function SchedulePanel({ team, isLeader, play, chosen, pending, onSchedule, onCancel }) {
  const scheduled = play.scheduled;
  const busy = Boolean(play.activeMatchId || play.queued);
  if (scheduled) return <ScheduledCard team={team} isLeader={isLeader} scheduled={scheduled} pending={pending} onCancel={onCancel} />;
  if (!isLeader || busy) return null;
  return <SlotPicker size={play.rosterSize} chosen={chosen} pending={pending} blocked={Boolean(play.blockedUntil)} onSchedule={onSchedule} />;
}

/** Choix du créneau : jours (48 h), heures, quarts d'heure ; badge quand des équipes attendent déjà à cette heure. */
function SlotPicker({ size, chosen, pending, blocked, onSchedule }) {
  const [taken, setTaken] = useState({});
  const [day, setDay] = useState(null);
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      api("/teams/schedule/slots")
        .then((data) => alive && setTaken(data.slots ?? {}))
        .catch(() => {});
    load();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 60_000);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  // Créneaux possibles, regroupés par jour puis par heure.
  const days = useMemo(() => {
    const first = Math.ceil((Date.now() + MIN_AHEAD) / STEP) * STEP;
    const map = new Map();
    for (let t = first; t <= Date.now() + MAX_AHEAD; t += STEP) {
      const date = new Date(t);
      const key = dayKey(date);
      if (!map.has(key)) map.set(key, { key, label: dayLabel(date), hours: new Map() });
      const hours = map.get(key).hours;
      const h = date.getHours();
      if (!hours.has(h)) hours.set(h, []);
      hours.get(h).push(date.toISOString());
    }
    return [...map.values()].map((d) => ({ ...d, hours: [...d.hours.entries()] }));
  }, []);
  const current = days.find((d) => d.key === day) ?? days[0];
  const ready = chosen.length === size;

  return (
    <TacticalCard cut={20} innerClassName="space-y-5 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Eyebrow>Match programmé</Eyebrow>
          <p className="mt-2 font-display text-3xl font-black uppercase leading-none">Jouer plus tard</p>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            Choisis l&apos;heure : l&apos;adversaire reste masqué jusqu&apos;à 5 min avant. Une équipe a déjà choisi le même créneau ? Vous vous affrontez. Sinon, la
            recherche continue 30 min.
          </p>
        </div>
        <LuCalendarClock aria-hidden className="h-8 w-8 text-gold" />
      </div>

      <div role="tablist" aria-label="Jour" className="flex flex-wrap gap-2">
        {days.map((d) => (
          <button
            key={d.key}
            type="button"
            role="tab"
            aria-selected={current?.key === d.key}
            onClick={() => setDay(d.key)}
            className={cn("clip-slant px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em]", current?.key === d.key ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:text-white")}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="max-h-80 space-y-1.5 overflow-y-auto pr-1">
        {current?.hours.map(([h, slots]) => (
          <div key={h} className="flex items-center gap-2">
            <span className="w-10 shrink-0 font-tech text-xs text-white/40">{String(h).padStart(2, "0")} h</span>
            <div className="grid flex-1 grid-cols-4 gap-1.5">
              {slots.map((iso) => {
                const count = taken[iso] ?? 0;
                const selected = slot === iso;
                return (
                  <button
                    key={iso}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSlot(iso)}
                    className={cn("relative py-2 font-tech text-sm font-bold tabular-nums transition-colors", selected ? "bg-gold text-ink" : count ? "bg-gold/15 text-gold hover:bg-gold/25" : "bg-white/[0.05] text-white/70 hover:bg-white/10")}
                  >
                    {hour(new Date(iso))}
                    {count ? (
                      <span className={cn("absolute -right-1 -top-1.5 px-1 text-[9px] leading-tight", selected ? "bg-ink text-gold" : "bg-gold text-ink")}>
                        {count} équipe{count > 1 ? "s" : ""}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/45">Créneau surligné : une équipe attend déjà un adversaire à cette heure (anonyme).</p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-sm text-white/60">{ready ? `Avec les ${size} joueurs choisis au-dessus.` : `Choisis d'abord ${size} joueur${size > 1 ? "s" : ""} au-dessus.`}</p>
        <Button disabled={pending || !slot || !ready || blocked} onClick={() => onSchedule(slot)}>
          {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuCalendarClock aria-hidden className="h-5 w-5" />}
          {slot ? `Programmer · ${slotName(slot)}` : "Choisis un créneau"}
        </Button>
      </div>
    </TacticalCard>
  );
}

/** Match programmé de l'équipe : créneau, adversaire masqué, compte à rebours jusqu'à son dévoilement. */
function ScheduledCard({ team, isLeader, scheduled, pending, onCancel }) {
  const left = useCountdown(scheduled.revealAt);
  const byId = new Map(team.members.map((m) => [m.id, m]));
  return (
    <TacticalCard highlight cut={20} innerClassName="relative overflow-hidden p-5 sm:p-7">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30 mask-fade" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <Eyebrow>Match programmé · BO3</Eyebrow>
          {isLeader ? (
            <button type="button" disabled={pending} onClick={onCancel} className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-loss">
              <LuX aria-hidden className="h-3.5 w-3.5" /> Annuler
            </button>
          ) : null}
        </div>
        <p className="mt-2 font-display text-5xl font-black uppercase leading-none first-letter:uppercase">{slotName(scheduled.slot)}</p>

        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex flex-col items-center text-center">
            <TeamCrest team={team} size={64} />
            <p className="mt-2 font-semibold">{team.name}</p>
          </div>
          <p className="font-display text-3xl font-black text-white/30">VS</p>
          <div className="flex flex-col items-center text-center">
            <span className="grid h-16 w-16 place-items-center border-2 border-dashed border-white/25 bg-white/[0.03]">
              <LuEyeOff aria-hidden className="h-6 w-6 text-white/40" />
            </span>
            <p className="mt-2 font-semibold text-white/50">Adversaire masqué</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 bg-gold/10 px-3 py-3 text-sm">
          <LuClock aria-hidden className="h-4 w-4 text-gold" />
          {left > 0 ? (
            <>
              Dévoilé dans <strong className="font-display text-lg text-gold tabular-nums">{hm(left)}</strong> · 5 min avant le match
            </>
          ) : (
            "Recherche de l'adversaire…"
          )}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {scheduled.roster.map((id) => (
            <span key={id} className="inline-flex items-center gap-1.5 bg-white/[0.05] px-2.5 py-1.5 text-xs text-white/70">
              <LuUserRound aria-hidden className="h-3.5 w-3.5 text-gold/80" />
              {byId.get(id)?.username ?? "Joueur"}
            </span>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-white/45">Rappel push et Discord 30 min avant. Garde la page ouverte au moment du match.</p>
      </div>
    </TacticalCard>
  );
}

