import { LuCalendarDays, LuMedal, LuRadio, LuShieldCheck, LuSwords, LuTrendingUp } from "react-icons/lu";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { TacticalCard } from "../ui/TacticalCard";
import { SectionHeading } from "../ui/Typography";

const FEATURES = [
  { icon: LuRadio, title: "File en temps réel", text: "Le compteur de joueurs bouge sous tes yeux. Pas besoin de recharger la page." },
  { icon: LuSwords, title: "Matchmaking automatique", text: "Équipes et carte sont tirées au sort dès que la file est pleine." },
  { icon: LuShieldCheck, title: "Résultats vérifiés", text: "Un résultat ne compte qu'une fois confirmé par l'équipe adverse." },
  { icon: LuTrendingUp, title: "Classement dynamique", text: "Neuf rangs, de Bronze à Légende : +50 points par victoire, et des défaites qui coûtent plus cher en montant." },
  { icon: LuMedal, title: "Profil complet", text: "Statistiques, historique des matchs, courbe de progression et trophées." },
  { icon: LuCalendarDays, title: "Événements GTA 6", text: "Planning, places limitées et suivi des inscrits pour chaque session.", univers: "gta" },
];

/** Grille des fonctionnalités clés. */
export function Features() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Fonctionnalités"
            title="Pensé pour la compétition"
            description="Tout ce qu'il faut pour organiser des matchs sérieux, sans tableur ni salon vocal saturé."
          />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, position) => (
            <Reveal key={feature.title} delay={(position % 3) * 0.08} className="h-full">
              <TacticalCard interactive className="h-full" innerClassName="p-6" univers={feature.univers}>
                <feature.icon aria-hidden className="h-7 w-7 text-gold" />
                <h3 className="mt-5 font-display text-2xl font-bold uppercase leading-none tracking-wide">{feature.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/60">{feature.text}</p>
              </TacticalCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
