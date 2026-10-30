import { useMemo, useState } from "react";
import { LuChevronDown, LuCrosshair, LuLifeBuoy, LuLink, LuSearch, LuShield, LuTrophy, LuUser } from "react-icons/lu";
import { FaDiscord } from "react-icons/fa6";
import { Container } from "../components/ui/Container";
import { PageHeader } from "../components/ui/Typography";
import { cn } from "../lib/cn";

// Maquette (non commitée) : FAQ.
const THEMES = [
  { id: "compte", label: "Compte", icon: LuUser, color: "#d4af37" },
  { id: "classe", label: "Classé", icon: LuCrosshair, color: "#34d399" },
  { id: "division", label: "Division", icon: LuShield, color: "#22d3ee" },
  { id: "tournoi", label: "Tournois", icon: LuTrophy, color: "#e5484d" },
  { id: "discord", label: "Discord", icon: FaDiscord, color: "#8b9cff" },
  { id: "probleme", label: "Un souci ?", icon: LuLifeBuoy, color: "#d4af37" },
];
const QA = [
  ["compte", "Comment je crée mon compte ?", "Connecte-toi avec Discord : c'est ton seul accès. Ton pseudo et ton avatar viennent de Discord."],
  ["compte", "Pourquoi mon identifiant Activision est obligatoire ?", "Tes coéquipiers en ont besoin pour t'inviter dans la partie privée. Un identifiant ne sert qu'à un seul compte."],
  ["compte", "Comment recevoir l'alerte « Match trouvé » site fermé ?", "Active les notifications dans « Premiers pas » ou installe l'appli. Sur iPhone, installe-la d'abord depuis Safari."],
  ["classe", "Combien de points je gagne ?", "Entre +40 et +60 par victoire selon le niveau des adversaires (+50 à niveau égal). Pendant tes 10 premiers matchs de la saison, les victoires comptent double."],
  ["classe", "Pourquoi j'ai perdu plus de points qu'un coéquipier ?", "La défaite dépend de ton rang : -15 en Bronze jusqu'à -50 dès Maître, ajustée de ±30 % selon l'équipe adverse."],
  ["classe", "J'ai raté le « Prêt ? », que se passe-t-il ?", "Tu as 1 minute pour accepter. Sinon le match est annulé, les joueurs prêts repartent en tête de file et tu reçois un avertissement."],
  ["classe", "Combien de temps dure une recherche ?", "30 minutes. 5 minutes avant, « Toujours là ? » te demande de confirmer : tu gardes ta place."],
  ["classe", "Qui est MVP ?", "Chaque joueur vote pour un joueur de l'équipe gagnante dans les 24 h. Le plus élu du mois reçoit le badge MVP du mois."],
  ["division", "Combien de joueurs dans une équipe ?", "8 au plus. Un Leader choisit les 4 joueurs de chaque match parmi l'effectif."],
  ["division", "Je peux changer d'équipe quand je veux ?", "Oui, 24 h après avoir quitté la précédente. Les transferts sont bloqués pendant un tournoi de saison et les 7 derniers jours de la saison."],
  ["division", "Comment programmer un match ce soir ?", "Un Leader choisit un créneau au quart d'heure, jusqu'à 48 h. L'adversaire est dévoilé 5 min avant."],
  ["tournoi", "Comment marche le check-in ?", "N'importe quel joueur de l'équipe le fait entre 2 h et 15 min avant le début. Sans check-in, l'équipe est forfait."],
  ["tournoi", "Comment se qualifier pour la grande finale ?", "Par le circuit : chaque Coupe Horus rapporte des points. Les 2 dernières places se jouent au play-in contre les meilleures équipes de la Division."],
  ["discord", "Je ne reçois pas les messages du bot.", "Autorise les messages privés des membres du serveur SixSence dans les paramètres de confidentialité Discord."],
  ["probleme", "Je me suis trompé de résultat.", "Demande une correction depuis la feuille de match dans les 24 h (motif « mauvais clic ») : un arbitre corrige."],
  ["probleme", "Un joueur triche ou ne respecte pas les règles.", "Signale-le depuis la feuille de match avec une capture, ou ouvre un ticket « Signalement » sur Discord."],
];

export default function DevFaq() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(null);
  const [open, setOpen] = useState(new Set([4]));
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return QA.map((row, index) => ({ index, theme: row[0], q: row[1], a: row[2] })).filter((row) => (!theme || row.theme === theme) && (!q || `${row.q} ${row.a}`.toLowerCase().includes(q)));
  }, [query, theme]);
  const toggle = (index) => setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    return next;
  });

  return (
    <>
      <PageHeader
        eyebrow="Aide"
        title={
          <>
            Questions <span className="text-gold-gradient">fréquentes</span>
          </>
        }
        description="Tout ce qu'on nous demande le plus, en deux lignes. Pas trouvé ? Ouvre un ticket sur Discord."
      />
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          {/* Thèmes */}
          <nav aria-label="Thèmes" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="relative">
              <LuSearch aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher : points, check-in…"
                className="w-full border border-white/10 bg-white/[0.03] py-3 pl-9 pr-3 text-sm outline-none placeholder:text-white/35 focus:border-gold/60"
              />
            </div>
            <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
              {[{ id: null, label: "Tout", icon: LuSearch, color: "#d4af37" }, ...THEMES].map((t) => {
                const Icon = t.icon;
                const count = QA.filter((row) => !t.id || row[0] === t.id).length;
                const active = theme === t.id;
                return (
                  <li key={t.label} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setTheme(t.id)}
                      className={cn("flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors", active ? "bg-white/[0.06]" : "border-transparent hover:bg-white/[0.03]")}
                      style={active ? { borderColor: t.color } : undefined}
                    >
                      <Icon aria-hidden className="h-4 w-4" style={{ color: t.color }} />
                      <span className={cn("flex-1 font-display text-base font-bold uppercase tracking-wide", active ? "text-white" : "text-white/60")}>{t.label}</span>
                      <span className="font-tech text-[10px] text-white/35">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Questions */}
          <div className="min-w-0 space-y-10">
            {THEMES.filter((t) => list.some((row) => row.theme === t.id)).map((t) => (
              <section key={t.id} aria-labelledby={`faq-${t.id}`}>
                <h2 id={`faq-${t.id}`} className="flex items-center gap-3 font-display text-3xl font-black uppercase leading-none">
                  <span className="h-6 w-1.5 -skew-x-[18deg]" style={{ background: t.color }} />
                  {t.label}
                </h2>
                <ul className="mt-4 space-y-2">
                  {list
                    .filter((row) => row.theme === t.id)
                    .map((row) => {
                      const isOpen = open.has(row.index);
                      return (
                        <li key={row.index} className={cn("border transition-colors", isOpen ? "bg-white/[0.04]" : "border-white/10 bg-white/[0.02]")} style={isOpen ? { borderColor: `${t.color}66` } : undefined}>
                          <button type="button" aria-expanded={isOpen} onClick={() => toggle(row.index)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
                            <span className="flex-1 font-semibold">{row.q}</span>
                            <LuChevronDown aria-hidden className={cn("h-5 w-5 shrink-0 text-white/45 transition-transform", isOpen && "rotate-180")} style={isOpen ? { color: t.color } : undefined} />
                          </button>
                          {isOpen ? (
                            <div className="flex items-end gap-4 px-5 pb-4">
                              <p className="flex-1 text-sm leading-relaxed text-white/65">{row.a}</p>
                              <span className="inline-flex shrink-0 items-center gap-1 font-tech text-[10px] uppercase tracking-[0.18em] text-white/35">
                                <LuLink aria-hidden className="h-3 w-3" /> Copier le lien
                              </span>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))}
            {list.length === 0 ? <p className="text-sm text-white/50">Aucune réponse pour « {query} ». Ouvre un ticket sur Discord : on te répond.</p> : null}

            <div className="clip-tactical flex flex-wrap items-center gap-4 border border-gold/40 bg-gold/[0.06] p-6 [--cut:16px]">
              <FaDiscord aria-hidden className="h-8 w-8 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-black uppercase leading-none">Pas trouvé ta réponse ?</p>
                <p className="mt-1 text-sm text-white/60">Ouvre un ticket « Question » sur le Discord : l&apos;équipe SixSence te répond.</p>
              </div>
              <span className="clip-slant bg-gold px-5 py-2.5 font-display text-sm font-black uppercase tracking-[0.14em] text-ink">Ouvrir un ticket</span>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
