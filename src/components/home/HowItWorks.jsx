import { FaDiscord } from "react-icons/fa6";
import { LuSwords, LuTrophy } from "react-icons/lu";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/Typography";

const STEPS = [
  {
    icon: FaDiscord,
    title: "Connecte ton Discord",
    text: "Pas de mot de passe ni de formulaire : ton compte Discord sert d'identité sur toute la plateforme.",
  },
  {
    icon: LuSwords,
    title: "Choisis ton mode",
    text: "Le Classé en solo du 2v2 au 5v5, la Division avec ton équipe en BO3, et les coupes Horus et Anubis.",
  },
  {
    icon: LuTrophy,
    title: "Grimpe et gagne",
    text: "Monte de Bronze à Légende, hisse ton équipe en tête de la Division, décroche trophées et médailles, et ta place au Hall of Fame.",
  },
];

/** Le parcours d'un joueur, en trois étapes numérotées. */
export function HowItWorks() {
  return (
    <section className="relative border-y border-white/10 bg-ink-800 py-20 sm:py-28">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
      <Container className="relative">
        <Reveal>
          <SectionHeading eyebrow="Comment ça marche" title="Trois étapes, zéro friction" center />
        </Reveal>

        <ol className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, position) => (
            <Reveal key={step.title} delay={position * 0.12}>
              <li className="relative h-full list-none border-t border-gold/40 pt-7">
                <span aria-hidden className="absolute -top-px left-0 h-px w-16 bg-gold shadow-[0_0_12px_var(--color-gold)]" />
                <div className="flex items-start justify-between">
                  <step.icon aria-hidden className="h-9 w-9 text-gold" />
                  <span aria-hidden className="font-display text-7xl font-black leading-[0.7] text-outline">
                    0{position + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-3xl font-bold uppercase leading-none tracking-wide">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
