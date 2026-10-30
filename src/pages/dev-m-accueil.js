import { LuCalendarClock, LuCrown, LuFlame, LuSwords, LuUsers, LuZap } from "react-icons/lu";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : accueil plus vivant (podiums, records, compteurs).
const PODIUMS = [
  { title: "Classé", sub: "Saison 1 · en cours", color: "#34d399", rows: [["N0xira", "2 140 pts"], ["Sorrow", "1 980 pts"], ["Kenzo", "1 912 pts"]] },
  { title: "Division", sub: "Saison 1 · en cours", color: "#22d3ee", rows: [["[VTX] Vortex", "1 284 pts"], ["[KZN] Kaizen", "1 251 pts"], ["[NXR] Nexora", "1 198 pts"]] },
];
const RECORDS = [
  [LuSwords, "Le plus de matchs aujourd'hui", "Sorrow", "9"],
  [LuFlame, "Série de victoires record", "[VTX] Vortex", "14"],
  [LuZap, "Équipe la plus active · semaine", "[KZN] Kaizen", "21"],
];
const COUNTERS = [
  ["Connectés maintenant", "18"],
  ["Actifs sur 30 jours", "142"],
  ["Matchs joués", "3 618"],
  ["Coupes jouées", "12"],
];

export default function DevAccueil() {
  return (
    <Container className="space-y-8 pb-16 pt-28">
      <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette · accueil · en ce moment</p>
      <h2 className="font-display text-4xl font-black uppercase">
        En ce <span className="text-gold-gradient">moment</span>
      </h2>

      <div className="grid gap-4 lg:grid-cols-3">
        {PODIUMS.map((p) => (
          <div key={p.title} className="clip-tactical border border-white/10 bg-white/[0.02] p-5 [--cut:14px]" style={{ "--c": p.color }}>
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl font-black uppercase" style={{ color: p.color }}>
                {p.title}
              </p>
              <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/40">{p.sub}</p>
            </div>
            {/* Podium : 2 · 1 · 3 */}
            <div className="mt-5 grid grid-cols-3 items-end gap-2 text-center">
              {[1, 0, 2].map((i) => (
                <div key={i}>
                  {i === 0 ? <LuCrown aria-hidden className="mx-auto mb-1 h-5 w-5" style={{ color: p.color }} /> : null}
                  <p className="truncate text-sm font-semibold">{p.rows[i][0]}</p>
                  <p className="text-[11px] text-white/45">{p.rows[i][1]}</p>
                  <div
                    className="mt-2 grid place-items-center font-display text-2xl font-black text-ink"
                    style={{ height: [72, 52, 40][i], background: i === 0 ? p.color : `${p.color}${i === 1 ? "aa" : "66"}` }}
                  >
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="clip-tactical border border-[#e5484d]/50 bg-[#e5484d]/[0.06] p-5 [--cut:14px]">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-2xl font-black uppercase text-[#e5484d]">Prochaine coupe</p>
            <LuCalendarClock aria-hidden className="h-5 w-5 text-[#e5484d]" />
          </div>
          <p className="mt-4 font-display text-3xl font-black uppercase leading-none">Coupe Horus</p>
          <p className="mt-1 text-sm text-white/60">Samedi 31 oct. · 21:00 · BO3</p>
          <div className="mt-4 h-2 bg-white/10">
            <div className="h-full w-[62%] bg-[#e5484d]" />
          </div>
          <p className="mt-2 text-xs text-white/50">5 / 8 équipes inscrites · check-in dans 3 j 04 h</p>
          <span className="mt-4 inline-block clip-slant bg-[#e5484d] px-4 py-2 font-display text-sm font-bold uppercase text-ink">Inscrire mon équipe</span>
        </div>
      </div>

      {/* Records du moment */}
      <div className="grid gap-3 sm:grid-cols-3">
        {RECORDS.map(([Icon, label, who, value]) => (
          <div key={label} className="flex items-center gap-4 border-l-2 border-gold bg-white/[0.03] px-4 py-4">
            <Icon aria-hidden className="h-6 w-6 shrink-0 text-gold" />
            <div className="min-w-0 flex-1">
              <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</p>
              <p className="truncate font-semibold">{who}</p>
            </div>
            <p className="font-display text-4xl font-black text-gold">{value}</p>
          </div>
        ))}
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-2 border-y border-white/10 sm:grid-cols-4">
        {COUNTERS.map(([label, value], i) => (
          <div key={label} className={cn("px-4 py-5 text-center", i > 0 && "sm:border-l sm:border-white/10")}>
            <p className="flex items-center justify-center gap-2 font-display text-4xl font-black">
              {i === 0 ? <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-win" /> : null}
              {value}
            </p>
            <p className="mt-1 font-tech text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</p>
          </div>
        ))}
      </div>
      <p className="flex items-center gap-2 text-xs text-white/40">
        <LuUsers aria-hidden className="h-3.5 w-3.5" /> Les compteurs ne s&apos;affichent qu&apos;au-dessus d&apos;un seuil choisi dans l&apos;admin.
      </p>
    </Container>
  );
}
