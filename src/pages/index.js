import { CallToAction } from "../components/home/CallToAction";
import { Features } from "../components/home/Features";
import { Hero } from "../components/home/Hero";
import { HomeCalendar } from "../components/home/HomeCalendar";
import { HowItWorks } from "../components/home/HowItWorks";
import { LiveBoard } from "../components/home/LiveBoard";
import { Universes } from "../components/home/Universes";

/** Bloc « Comment ça marche » (textes mis à jour le 2026-10-22, sous En direct et le calendrier) : false pour le retirer. */
const SHOW_HOW_IT_WORKS = true;

/** Page d'accueil publique. Chaque section vit dans src/components/home. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Universes />
      <LiveBoard />
      <HomeCalendar />
      {SHOW_HOW_IT_WORKS ? <HowItWorks /> : null}
      <Features />
      <CallToAction />
    </>
  );
}
