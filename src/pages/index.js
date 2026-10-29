import { CallToAction } from "../components/home/CallToAction";
import { Features } from "../components/home/Features";
import { Hero } from "../components/home/Hero";
import { HomeCalendar } from "../components/home/HomeCalendar";
import { HowItWorks } from "../components/home/HowItWorks";
import { LiveBoard } from "../components/home/LiveBoard";
import { RightNow } from "../components/home/RightNow";
import { Universes } from "../components/home/Universes";

/** Bloc « Comment ça marche » (les deux jeux, MW4 et GTA 6), au-dessus d'En direct : false pour le retirer. */
const SHOW_HOW_IT_WORKS = true;

/** Page d'accueil publique. Chaque section vit dans src/components/home. */
/** Bloc « Qui mène la danse » (En ce moment) retiré de l'accueil le 2026-10-29, gardé de côté : true pour le remettre. */
const SHOW_RIGHT_NOW = false;

export default function HomePage() {
  return (
    <>
      <Hero />
      <Universes />
      {SHOW_HOW_IT_WORKS ? <HowItWorks /> : null}
      <LiveBoard />
      {SHOW_RIGHT_NOW ? <RightNow /> : null}
      <HomeCalendar />
      <Features />
      <CallToAction />
    </>
  );
}
