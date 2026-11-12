import { CallToAction } from "../components/home/CallToAction";
import { Casting } from "../components/home/Casting";
import { Features } from "../components/home/Features";
import { Hero } from "../components/home/Hero";
import { HomeCalendar } from "../components/home/HomeCalendar";
import { HowItWorks } from "../components/home/HowItWorks";
import { LiveBoard } from "../components/home/LiveBoard";
import { RightNow } from "../components/home/RightNow";
import { ViceCity } from "../components/home/ViceCity";
import { TwitchLive } from "../components/cod/TwitchLive";

/** Bloc « Comment ça marche » (les deux jeux, MW4 et GTA 6) retiré de l'accueil le 2026-11-11, gardé de côté : true pour le remettre. */
const SHOW_HOW_IT_WORKS = false;
/** Bloc « Pensé pour la compétition » (fonctionnalités) retiré de l'accueil le 2026-11-11, gardé de côté : true pour le remettre. */
const SHOW_FEATURES = false;
/** Bloc « Qui mène la danse » (En ce moment) retiré de l'accueil le 2026-10-29, gardé de côté : true pour le remettre. */
const SHOW_RIGHT_NOW = false;

/**
 * Page d'accueil publique (2026-11-11) : premier écran en accordéon des modes avec la bande En direct en bas (Hero),
 * Vice City (GTA 6), puis En direct, Twitch, le calendrier, l'appel final et « Choisis ton rôle » (les modes) tout en bas. Chaque section vit
 * dans src/components/home ; l'ancien « Choisis ton terrain » (Universes) reste dans le dossier.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ViceCity />
      {SHOW_HOW_IT_WORKS ? <HowItWorks /> : null}
      <LiveBoard />
      <TwitchLive />
      {SHOW_RIGHT_NOW ? <RightNow /> : null}
      <HomeCalendar />
      {SHOW_FEATURES ? <Features /> : null}
      {/* « Choisis ton rôle » en bas depuis le 2026-11-12 (le premier écran présente déjà les modes). */}
      <Casting />
      {/* « Prêt à faire tes preuves ? » tout en bas depuis le 2026-11-12 */}
      <CallToAction />
    </>
  );
}
