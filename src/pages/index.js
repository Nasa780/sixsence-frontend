import { CallToAction } from "../components/home/CallToAction";
import { Features } from "../components/home/Features";
import { Hero } from "../components/home/Hero";
import { HowItWorks } from "../components/home/HowItWorks";
import { LiveBoard } from "../components/home/LiveBoard";
import { Universes } from "../components/home/Universes";

/** Page d'accueil publique. Chaque section vit dans src/components/home. */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Universes />
      <HowItWorks />
      <LiveBoard />
      <Features />
      <CallToAction />
    </>
  );
}
