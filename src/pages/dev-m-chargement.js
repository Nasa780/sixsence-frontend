import { LuCheck, LuShieldCheck } from "react-icons/lu";
import { Container } from "../components/ui/Container";

// Maquette (non commitée) : écrans de chargement stylisés (plein écran et dans une page) avec astuces.
const TIPS = [
  "Active les messages privés Discord pour ne jamais rater un check-in.",
  "Le Mode hôte transforme les réglages de la partie en liste à cocher.",
  "Un défi officiel par semaine : choisis bien ton adversaire.",
  "Le Classé se joue en solo : ta place, tu la gagnes seul.",
];

export default function DevChargement() {
  return (
    <Container className="space-y-10 pb-16 pt-28">
      <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette · chargements</p>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        {/* Plein écran (première ouverture, changement de page lourd) */}
        <div className="relative grid h-[520px] place-items-center overflow-hidden border border-white/10 bg-ink">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.16),transparent_55%)]" />
          <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative flex flex-col items-center">
            <div className="relative grid h-36 w-36 place-items-center">
              <svg aria-hidden viewBox="0 0 144 144" className="absolute inset-0 animate-[spin_6s_linear_infinite]">
                <circle cx="72" cy="72" r="66" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="2" />
                <circle cx="72" cy="72" r="66" fill="none" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" strokeDasharray="90 325" />
              </svg>
              <svg aria-hidden viewBox="0 0 144 144" className="absolute inset-3 animate-[spin_9s_linear_infinite_reverse]">
                <polygon points="72,6 132,40 132,104 72,138 12,104 12,40" fill="none" stroke="rgba(212,175,55,0.35)" strokeWidth="1.5" />
              </svg>
              <img src="/images/logo.png" alt="" className="relative h-16 w-16 object-contain drop-shadow-[0_0_24px_rgba(212,175,55,0.6)]" />
            </div>
            <p className="mt-6 font-display text-2xl font-black uppercase tracking-[0.3em] text-gold-gradient">SixSence</p>
            <div className="mt-5 w-64">
              <div className="flex justify-between font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
                <span>Chargement</span>
                <span className="text-gold">72 %</span>
              </div>
              <div className="mt-2 h-1 bg-white/10">
                <div className="relative h-full w-[72%] bg-linear-to-r from-gold-dark via-gold to-gold-light">
                  <span aria-hidden className="absolute -right-1 -top-1 h-3 w-3 rotate-45 bg-gold-light shadow-[0_0_12px_#d4af37]" />
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-xs text-center text-sm text-white/60">
              <span className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Astuce · </span>
              {TIPS[0]}
            </p>
          </div>
          <p className="absolute bottom-4 flex items-center gap-1.5 font-tech text-[10px] uppercase tracking-[0.24em] text-white/30">
            <LuShieldCheck aria-hidden className="h-3.5 w-3.5" /> Compétition COD &amp; GTA
          </p>
        </div>

        <div className="space-y-6">
          {/* Dans une page : remplace « Chargement… » */}
          <div>
            <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-white/45">Dans une page (classement, profil…)</p>
            <div className="mt-3 flex items-center gap-4 border border-white/10 bg-white/[0.02] px-5 py-6">
              <div className="relative grid h-12 w-12 shrink-0 place-items-center">
                <svg aria-hidden viewBox="0 0 48 48" className="absolute inset-0 animate-spin">
                  <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="2" />
                  <circle cx="24" cy="24" r="21" fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="30 102" />
                </svg>
                <img src="/images/logo.png" alt="" className="h-6 w-6 object-contain" />
              </div>
              <div>
                <p className="font-display text-lg font-black uppercase">Chargement du classement</p>
                <p className="text-xs text-white/50">{TIPS[2]}</p>
              </div>
            </div>
          </div>

          {/* Squelette : la forme de la page avant les données */}
          <div>
            <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-white/45">Squelette (listes, tableaux)</p>
            <div className="mt-3 space-y-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] px-4 py-3">
                  <span className="h-6 w-6 animate-pulse bg-gold/15" />
                  <span className="h-8 w-8 animate-pulse bg-white/10" />
                  <span className="h-3 flex-1 animate-pulse bg-white/10" style={{ maxWidth: `${70 - i * 12}%` }} />
                  <span className="h-4 w-14 animate-pulse bg-gold/15" />
                </div>
              ))}
            </div>
          </div>

          {/* Fin du chargement */}
          <div className="flex items-center gap-3 border-l-2 border-win bg-win/[0.06] px-4 py-3 text-sm">
            <LuCheck aria-hidden className="h-4 w-4 text-win" /> Prêt : la page apparaît en fondu, sans saut.
          </div>
        </div>
      </div>
    </Container>
  );
}
