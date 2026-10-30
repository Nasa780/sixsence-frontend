import { LuCrown, LuDoorOpen, LuGauge, LuQuote, LuTrophy } from "react-icons/lu";
import { Container } from "../components/ui/Container";
import { cn } from "../lib/cn";

// Maquette (non commitée) : fiche d'équipe enrichie (force, recrutement, trophées par type, devise des joueurs).
const ROSTER = [
  ["N0xira", "Créateur", "12 sept. 2026", "Le clutch, c'est un état d'esprit", true],
  ["Sorrow", "Leader", "14 sept. 2026", "Toujours premier sur la bombe", false],
  ["Kenzo", "Joueur", "2 oct. 2026", "Sniper du dimanche", false],
  ["Rift", "Joueur", "19 oct. 2026", null, false],
];
const FORM = ["V", "V", "V", "D", "V", "V", "D", "V", "V", "V"];

export default function DevEquipe() {
  return (
    <Container className="space-y-6 pb-16 pt-28">
      <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette · fiche d&apos;équipe</p>

      <div className="clip-tactical border border-white/10 bg-white/[0.02] p-6 [--cut:20px]">
        <div className="flex flex-wrap items-center gap-5">
          <span className="grid h-20 w-20 place-items-center border-2 border-gold font-display text-2xl font-black text-gold">VTX</span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-5xl font-black uppercase leading-none">Vortex</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 bg-win/15 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.2em] text-win ring-1 ring-win/40">
                <LuDoorOpen aria-hidden className="h-3.5 w-3.5" /> Recrutement ouvert
              </span>
              <span className="bg-white/[0.06] px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.2em] text-white/70">2e de la Division</span>
              <span className="bg-gold/15 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.2em] text-gold">2 anciens podiums</span>
            </div>
          </div>
          {/* Force de l'équipe */}
          <div className="border border-gold/40 bg-gold/[0.06] px-5 py-3 text-center">
            <p className="flex items-center justify-center gap-1.5 font-tech text-[10px] uppercase tracking-[0.22em] text-gold">
              <LuGauge aria-hidden className="h-3.5 w-3.5" /> Force de l&apos;équipe
            </p>
            <p className="mt-1 font-display text-4xl font-black">1 905</p>
            <p className="text-xs text-white/50">niveau moyen en Classé · #3 sur 41</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Forme · 10 derniers matchs</p>
            <div className="mt-2 flex gap-1.5">
              {FORM.map((r, i) => (
                <span key={i} className={cn("grid h-7 w-7 place-items-center font-display text-xs font-black", r === "V" ? "bg-win/15 text-win" : "bg-loss/15 text-loss")}>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            {[
              ["Coupe Horus", 3, "#d4af37"],
              ["Tournoi de saison", 1, "#e5484d"],
              ["Finaliste", 2, "#c0c7d0"],
            ].map(([label, n, color]) => (
              <div key={label} className="flex items-center gap-2 bg-white/[0.03] px-3 py-2">
                <LuTrophy aria-hidden className="h-5 w-5" style={{ color }} />
                <div>
                  <p className="font-display text-xl font-black leading-none">×{n}</p>
                  <p className="text-[10px] text-white/50">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Effectif avec la devise de chaque joueur */}
      <div>
        <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Effectif</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {ROSTER.map(([name, role, since, motto, owner]) => (
            <div key={name} className="clip-tactical border border-white/10 bg-white/[0.03] p-4 [--cut:12px]">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center bg-white/10 font-display font-black">{name[0]}</span>
                <div className="flex-1">
                  <p className="flex items-center gap-1.5 font-semibold">
                    {name}
                    {owner ? <LuCrown aria-hidden className="h-4 w-4 text-gold" /> : null}
                  </p>
                  <p className="text-xs text-white/45">
                    {role} · depuis le {since}
                  </p>
                </div>
              </div>
              {motto ? (
                <p className="mt-3 flex items-start gap-2 border-l-2 border-gold/50 pl-3 text-sm italic text-white/70">
                  <LuQuote aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                  {motto}
                </p>
              ) : (
                <p className="mt-3 text-xs text-white/30">Pas encore de devise</p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/45">La devise (40 caractères) est choisie par les Leaders, ou par le joueur lui-même.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-win/30 bg-win/[0.05] px-5 py-4">
        <p className="text-sm text-white/70">
          <strong className="text-white">On recrute :</strong> 1 joueur, sniper, disponible le soir.
        </p>
        <span className="clip-slant bg-win px-4 py-2 font-display text-sm font-bold uppercase text-ink">Rejoindre le Discord de l&apos;équipe</span>
      </div>
    </Container>
  );
}
