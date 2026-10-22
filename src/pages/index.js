import { CallToAction } from "../components/home/CallToAction";
import { Features } from "../components/home/Features";
import { Hero } from "../components/home/Hero";
import { HomeCalendar } from "../components/home/HomeCalendar";
import { HowItWorks } from "../components/home/HowItWorks";
import { LiveBoard } from "../components/home/LiveBoard";
import { Universes } from "../components/home/Universes";

/** Bloc « Comment ça marche » (les deux jeux, MW4 et GTA 6), au-dessus d'En direct : false pour le retirer. */
const SHOW_HOW_IT_WORKS = true;

/** Page d'accueil publique. Chaque section vit dans src/components/home. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Universes />
      {SHOW_HOW_IT_WORKS ? <HowItWorks /> : null}
      <LiveBoard />
      <HomeCalendar />
      <Features />
      <CallToAction />
    </>
  );
}
