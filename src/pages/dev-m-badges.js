import { Container } from "../components/ui/Container";

// Maquette (non commitée) : badges en direct des cartes de la page MW4, sans zéros.
const Badge = ({ text, live = true, color }) => (
  <span className="inline-flex items-center gap-2 border bg-ink/70 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.2em]" style={{ borderColor: `${color}66`, color }}>
    <span aria-hidden className={live ? "h-1.5 w-1.5 animate-pulse" : "h-1.5 w-1.5 opacity-60"} style={{ background: color }} />
    {text}
  </span>
);
const ROWS = [
  ["Classé", "#34d399", "0 en file · 0 en jeu", [["Rien en cours", "File ouverte · 2v2 à 5v5", false], ["Des joueurs en file", "5 en file", true], ["Des matchs", "5 en file · 2 en jeu", true]]],
  ["Division", "#22d3ee", "0 équipe en recherche", [["Rien en cours", "6 équipes actives", false], ["Une équipe cherche", "1 équipe en recherche", true], ["Un match", "1 match en cours", true]]],
  ["Tournoi", "#e5484d", "Aucun tournoi prévu", [["Coupe à venir", "Coupe Horus · dim. 1 nov.", false], ["Check-in", "Check-in ouvert", true], ["En cours", "Coupe Horus en cours", true]]],
];

export default function DevBadges() {
  return (
    <Container className="space-y-10 pb-20 pt-28">
      <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Maquette 2 · badges des cartes MW4</p>
      <div className="overflow-hidden border border-white/10">
        <div className="grid grid-cols-[8rem_1fr_2fr] bg-white/[0.04] px-5 py-2 font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">
          <span>Carte</span>
          <span>Aujourd&apos;hui</span>
          <span>Proposé</span>
        </div>
        {ROWS.map(([card, color, before, after]) => (
          <div key={card} className="grid grid-cols-[8rem_1fr_2fr] items-center gap-4 border-t border-white/5 px-5 py-4">
            <span className="font-display text-xl font-black uppercase" style={{ color }}>
              {card}
            </span>
            <span className="opacity-60">
              <Badge text={before} color="#d4af37" />
            </span>
            <span className="flex flex-col gap-2">
              {after.map(([when, text, live]) => (
                <span key={when} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-xs text-white/45">{when}</span>
                  <Badge text={text} live={live} color={color} />
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/45">
        Plus jamais de zéro : au calme, une info utile sans point clignotant ; dès qu&apos;il se passe quelque chose, le point pulse. Badges aux couleurs du mode. Sans coupe prévue, le
        badge du Tournoi disparaît.
      </p>
    </Container>
  );
}
