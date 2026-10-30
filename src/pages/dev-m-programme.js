import { useState } from "react";
import { LuCalendarClock, LuClock, LuEyeOff, LuUser, LuX, LuZap } from "react-icons/lu";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : recherche de Division programmée à une heure.
const SLOTS = [
  ["Ce soir", ["20:30", "21:00", "21:30", "22:00", "22:30"]],
  ["Demain", ["20:30", "21:00", "21:30", "22:00"]],
];

export default function DevProgramme() {
  const [mode, setMode] = useState("later");
  const [slot, setSlot] = useState("Ce soir 21:00");
  return (
    <div data-univers="division">
      <Container className="space-y-8 pb-16 pt-28">
        <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette · Division · match programmé</p>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lancer une recherche */}
          <div className="clip-tactical border border-gold/40 bg-white/[0.02] p-6 [--cut:18px]">
            <p className="font-display text-2xl font-black uppercase">Trouver un adversaire</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                ["now", LuZap, "Maintenant", "Recherche immédiate, 30 min max."],
                ["later", LuCalendarClock, "Programmer", "Choisis l'heure : on cherche pour toi."],
              ].map(([id, Icon, label, hint]) => (
                <button key={id} type="button" onClick={() => setMode(id)} className={cn("border p-3 text-left transition", mode === id ? "border-gold bg-gold/10" : "border-white/10")}>
                  <span className="flex items-center gap-2 font-display text-lg font-bold uppercase">
                    <Icon aria-hidden className="h-5 w-5 text-gold" />
                    {label}
                  </span>
                  <span className="mt-1 block text-xs text-white/50">{hint}</span>
                </button>
              ))}
            </div>
            {mode === "later" ? (
              <div className="mt-5 space-y-4">
                {SLOTS.map(([day, hours]) => (
                  <div key={day}>
                    <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">{day}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {hours.map((h) => {
                        const id = `${day} ${h}`;
                        const busy = id === "Ce soir 21:00" || id === "Ce soir 21:30";
                        return (
                          <button key={id} type="button" onClick={() => setSlot(id)} className={cn("relative px-4 py-2 font-tech text-sm font-bold", slot === id ? "bg-gold text-ink" : "bg-white/[0.05] text-white/70 hover:bg-white/10")}>
                            {h}
                            {busy ? <span className={cn("absolute -right-1 -top-1 px-1 text-[9px]", slot === id ? "bg-ink text-gold" : "bg-gold text-ink")}>1 équipe</span> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-white/45">« 1 équipe » : une équipe attend déjà un adversaire à cette heure (anonyme). Elle sera ton adversaire.</p>
              </div>
            ) : null}
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
              <p className="text-sm text-white/60">4 joueurs choisis · Vortex</p>
              <span className="clip-slant bg-gold px-5 py-2.5 font-display text-sm font-bold uppercase text-ink">{mode === "later" ? `Programmer · ${slot}` : "Lancer la recherche"}</span>
            </div>
          </div>

          {/* Match programmé */}
          <div className="clip-tactical relative overflow-hidden border border-white/10 bg-white/[0.02] p-6 [--cut:18px]">
            <div aria-hidden className="absolute inset-0 bg-[url('/images/maps/lotus.webp')] bg-cover bg-center opacity-[0.08]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Match programmé · BO3</p>
                <span className="flex items-center gap-1 text-xs text-white/50">
                  <LuX aria-hidden className="h-3.5 w-3.5" /> Annuler
                </span>
              </div>
              <p className="mt-2 font-display text-5xl font-black uppercase leading-none">Ce soir 21:00</p>
              <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="text-center">
                  <span className="mx-auto grid h-16 w-16 place-items-center border-2 border-gold font-display text-lg font-black text-gold">VTX</span>
                  <p className="mt-2 font-semibold">Vortex</p>
                </div>
                <p className="font-display text-2xl font-black text-white/30">VS</p>
                <div className="text-center">
                  <span className="mx-auto grid h-16 w-16 place-items-center border-2 border-dashed border-white/25 bg-white/[0.03]">
                    <LuEyeOff aria-hidden className="h-6 w-6 text-white/40" />
                  </span>
                  <p className="mt-2 font-semibold text-white/50">Adversaire masqué</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 bg-gold/10 py-3 text-sm">
                <LuClock aria-hidden className="h-4 w-4 text-gold" />
                Dévoilé dans <strong className="font-display text-lg text-gold tabular-nums">2 h 41 min</strong> · 5 min avant le match
              </div>
              <div className="mt-4 flex justify-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="grid h-9 w-9 place-items-center bg-white/[0.05]">
                    <LuUser aria-hidden className="h-4 w-4 text-white/30" />
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-white/45">Rappels push et Discord 30 min et 5 min avant. Sans adversaire à 21:00, la recherche continue 30 min.</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
