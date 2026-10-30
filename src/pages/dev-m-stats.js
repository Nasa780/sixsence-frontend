import { useState } from "react";
import { LuArrowDownRight, LuArrowUpRight, LuFlame, LuSwords, LuTrophy } from "react-icons/lu";
import { RankEmblem } from "../components/cod/RankEmblem";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";
import { rankFor } from "../lib/ranks";

// Maquette (non commitée) : statistiques du profil joueur.
const FORM = ["V", "V", "D", "V", "V", "V", "D", "V", "V", "V"];
const STATS = [
  ["Points", "1 842", 7],
  ["Matchs joués", "214", 12],
  ["Victoires", "68 %", 4],
  ["MVP", "31", 2],
  ["Meilleure série", "11", 3],
  ["XP", "148 300", 9],
];
const HISTORY = [
  ["27 oct.", "21:42", "Classé · 4v4", true, [[8, 3]], "+52", "Lotus"],
  ["27 oct.", "20:58", "Division · BO3", true, [[6, 4], [3, 6], [6, 2]], "+24", "Mumbai · Coal · Sentry"],
  ["26 oct.", "23:10", "Classé · 5v5", false, [[6, 8]], "-28", "Rooftops"],
  ["26 oct.", "22:31", "Coupe Horus · demi", true, [[6, 1], [6, 5]], "", "Nautical · Lithium"],
];
const OPPONENTS = [
  ["Vortex", 9, 7, 2],
  ["Kaizen", 6, 2, 4],
  ["Nexora", 5, 4, 1],
  ["Ronin", 4, 1, 3],
];
const TABS = ["Vue d'ensemble", "Séries", "Adversaires", "Face à face", "Activité"];
const ACTIVITY = [3, 5, 2, 0, 6, 8, 4, 7, 9, 5, 3, 6, 10, 7];

export default function DevStats() {
  const [tab, setTab] = useState(0);
  const rank = rankFor(1842);
  return (
    <Container className="space-y-6 pb-16 pt-28">
      <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette · profil joueur · statistiques</p>

      {/* Forme récente */}
      <div className="clip-tactical border border-white/10 bg-white/[0.02] p-5 [--cut:16px] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <RankEmblem rank={rank} size={56} />
            <div>
              <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Forme récente · 10 derniers matchs</p>
              <div className="mt-2 flex gap-1.5">
                {FORM.map((r, i) => (
                  <span
                    key={i}
                    className={cn(
                      "grid h-8 w-8 place-items-center font-display text-sm font-black",
                      r === "V" ? "bg-win/15 text-win ring-1 ring-win/40" : "bg-loss/15 text-loss ring-1 ring-loss/40",
                      i === FORM.length - 1 && "ring-2",
                    )}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-6">
            <Ratio label="Ratio 30 jours" value="80 %" trend="+12" up />
            <Ratio label="Ratio global" value="68 %" />
            <div>
              <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Série en cours</p>
              <p className="mt-1 flex items-center gap-1.5 font-display text-3xl font-black text-gold">
                <LuFlame aria-hidden className="h-6 w-6" /> 3
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chiffres avec leur rang */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATS.map(([label, value, pos]) => (
          <div key={label} className="border border-white/10 bg-white/[0.03] p-4">
            <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</p>
            <p className="mt-2 font-display text-3xl font-black leading-none">{value}</p>
            <p className={cn("mt-2 inline-block px-1.5 py-0.5 font-tech text-[11px] font-bold", pos <= 3 ? "bg-gold text-ink" : "bg-white/10 text-white/70")}>#{pos} du site</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 overflow-x-auto border-b border-white/10">
        {TABS.map((label, i) => (
          <button key={label} type="button" onClick={() => setTab(i)} className={cn("shrink-0 px-4 py-3 font-display text-sm font-bold uppercase tracking-[0.12em]", tab === i ? "border-b-2 border-gold text-gold" : "text-white/50 hover:text-white")}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Historique avec le score de chaque map */}
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Historique</p>
          <div className="mt-3 space-y-2">
            {HISTORY.map(([day, time, label, won, maps, pts, mapNames]) => (
              <div key={day + time} className={cn("flex items-center gap-4 border-l-2 bg-white/[0.03] px-4 py-3", won ? "border-win" : "border-loss")}>
                <div className="w-14 shrink-0 text-center">
                  <p className="font-tech text-[10px] uppercase text-white/45">{day}</p>
                  <p className="text-xs text-white/60">{time}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-bold uppercase tracking-[0.08em]">{label}</p>
                  <p className="truncate text-xs text-white/45">{mapNames}</p>
                </div>
                <div className="flex gap-1">
                  {maps.map(([a, b], i) => (
                    <span key={i} className={cn("px-2 py-1 font-tech text-xs font-bold tabular-nums", a > b ? "bg-win/15 text-win" : "bg-loss/15 text-loss")}>
                      {a}-{b}
                    </span>
                  ))}
                </div>
                <span className={cn("w-12 text-right font-display text-lg font-black", won ? "text-win" : "text-loss")}>{pts || (won ? "V" : "D")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Adversaires */}
          <div>
            <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Adversaires les plus joués</p>
            <div className="mt-3 space-y-2">
              {OPPONENTS.map(([name, n, w, l]) => (
                <div key={name} className="bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">{name}</span>
                    <span className="text-white/50">
                      {n} matchs · <span className="text-win">{w} V</span> · <span className="text-loss">{l} D</span>
                    </span>
                  </div>
                  <div className="mt-2 flex h-1.5 overflow-hidden bg-loss/40">
                    <div className="bg-win" style={{ width: `${(w / n) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activité */}
          <div>
            <div className="flex items-center justify-between">
              <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Activité · 14 jours</p>
              <div className="flex gap-1 text-[10px]">
                {["7 j", "14 j", "1 mois", "3 mois"].map((p) => (
                  <span key={p} className={cn("px-2 py-1 font-tech uppercase", p === "14 j" ? "bg-gold text-ink" : "bg-white/5 text-white/50")}>
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 flex h-28 items-end gap-1.5 border-b border-white/10">
              {ACTIVITY.map((v, i) => (
                <div key={i} className="flex-1 bg-linear-to-t from-gold/30 to-gold" style={{ height: `${(v / 10) * 100}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Face à face */}
      <div className="clip-tactical border border-gold/30 bg-gold/[0.04] p-5 [--cut:16px]">
        <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Face à face · toi contre Vortex</p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
          <div>
            <p className="font-display text-5xl font-black text-gold">7</p>
            <p className="text-xs text-white/50">victoires</p>
          </div>
          <LuSwords aria-hidden className="h-8 w-8 text-white/30" />
          <div>
            <p className="font-display text-5xl font-black text-white/60">2</p>
            <p className="text-xs text-white/50">défaites</p>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-white/45">Dernier duel le 27 oct. · map préférée contre lui : Lotus (4-0)</p>
      </div>

      {/* Équipes et trophées (point 7) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Équipes</p>
          <div className="mt-3 space-y-2">
            {[
              ["VTX", "Vortex", "Leader", "depuis le 12 sept. 2026", true],
              ["KZN", "Kaizen", "Joueur", "juin → sept. 2026", false],
              ["RNN", "Ronin", "Joueur", "mars → juin 2026", false],
            ].map(([tag, name, role, when, now]) => (
              <div key={tag} className={cn("flex items-center gap-3 px-4 py-3", now ? "border border-gold/40 bg-gold/[0.06]" : "bg-white/[0.03] opacity-70")}>
                <span className="grid h-10 w-10 place-items-center border border-white/20 font-display text-xs font-black">{tag}</span>
                <div className="flex-1">
                  <p className="font-semibold">{name}</p>
                  <p className="text-xs text-white/45">
                    {role} · {when}
                  </p>
                </div>
                {now ? <span className="bg-gold px-2 py-0.5 font-tech text-[10px] uppercase text-ink">Actuelle</span> : <span className="font-tech text-[10px] uppercase text-white/40">Ancienne</span>}
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Trophées</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              ["Coupe Horus", 3, "#d4af37"],
              ["Coupe Anubis", 2, "#9b7bff"],
              ["MVP du mois", 4, "#34d399"],
            ].map(([label, n, color]) => (
              <div key={label} className="border border-white/10 bg-white/[0.03] p-4 text-center">
                <LuTrophy aria-hidden className="mx-auto h-7 w-7" style={{ color }} />
                <p className="mt-2 font-display text-3xl font-black">×{n}</p>
                <p className="text-[11px] text-white/50">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/45">2 podiums de saison · 1 titre de champion</p>
        </div>
      </div>
    </Container>
  );
}

function Ratio({ label, value, trend, up }) {
  return (
    <div>
      <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 font-display text-3xl font-black">
        {value}
        {trend ? (
          <span className={cn("flex items-center text-xs", up ? "text-win" : "text-loss")}>
            {up ? <LuArrowUpRight aria-hidden className="h-4 w-4" /> : <LuArrowDownRight aria-hidden className="h-4 w-4" />}
            {trend}
          </span>
        ) : null}
      </p>
    </div>
  );
}
