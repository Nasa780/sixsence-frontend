import { CallToAction } from "../components/home/CallToAction";
import { ClipSpotlight } from "../components/home/ClipSpotlight";
import { Casting } from "../components/home/Casting";
import { DiscordLive } from "../components/home/DiscordLive";
import { Features } from "../components/home/Features";
import { Hero } from "../components/home/Hero";
import { HomeCalendar } from "../components/home/HomeCalendar";
import { HowItWorks } from "../components/home/HowItWorks";
import { LaunchHero, inLaunchWindow, useLaunchWindow } from "../components/home/LaunchHero";
import { LiveBoard } from "../components/home/LiveBoard";
import { RightNow } from "../components/home/RightNow";
import { SectionMarks } from "../components/home/SectionMarks";
import { ViceCity } from "../components/home/ViceCity";
import { TwitchLive } from "../components/cod/TwitchLive";

/** Bloc « Comment ça marche » (les deux jeux, MW4 et GTA 6) retiré de l'accueil le 2026-11-11, gardé de côté : true pour le remettre. */
const SHOW_HOW_IT_WORKS = false;
/** Bloc « Pensé pour la compétition » (fonctionnalités) retiré de l'accueil le 2026-11-11, gardé de côté : true pour le remettre. */
const SHOW_FEATURES = false;
/** Bloc « Qui mène la danse » (En ce moment) retiré de l'accueil le 2026-10-29, gardé de côté : true pour le remettre. */
const SHOW_RIGHT_NOW = false;

/** Repères à droite (ordinateur) : un par groupe de sections, dans l'ordre de la page (2026-11-12). */
const MARKS = [
  { id: "modes", label: "Modes" },
  { id: "gta6", label: "GTA 6" },
  { id: "direct", label: "En direct" },
  { id: "clips", label: "Clips" },
  { id: "calendrier", label: "Calendrier" },
  { id: "communaute", label: "Discord" },
  { id: "role", label: "Ton rôle" },
];

/**
 * Page d'accueil publique (2026-11-11) : premier écran en accordéon des modes avec la bande En direct en bas (Hero),
 * Vice City (GTA 6 ; le jour J, écran LaunchHero en tête à la place), puis En direct, Twitch, le clip, le calendrier,
 * le Discord, « Choisis ton rôle » (les modes) et l'appel final tout en bas. Repères de sections à droite sur ordinateur.
 * Chaque section vit dans src/components/home ; l'ancien « Choisis ton terrain » (Universes) reste dans le dossier.
 */
export default function HomePage({ launch: launchFromServer = false }) {
  const launch = useLaunchWindow(launchFromServer);
  return (
    <>
      <SectionMarks marks={MARKS} />
      {/* Jour J de GTA 6 (19 et 20 novembre) : son écran en tête, puis les modes ; Vice City, qui ferait doublon, est masquée. */}
      {launch ? (
        <div id="gta6">
          <LaunchHero />
        </div>
      ) : null}
      <div id="modes">
        <Hero />
      </div>
      {launch ? null : (
        <div id="gta6">
          <ViceCity />
        </div>
      )}
      {SHOW_HOW_IT_WORKS ? <HowItWorks /> : null}
      <div id="direct">
        <LiveBoard />
        <TwitchLive />
      </div>
      <div id="clips">
        <ClipSpotlight />
      </div>
      {SHOW_RIGHT_NOW ? <RightNow /> : null}
      <div id="calendrier">
        <HomeCalendar />
      </div>
      {SHOW_FEATURES ? <Features /> : null}
      {/* Le serveur Discord et ses membres en ligne (2026-11-12) */}
      <div id="communaute">
        <DiscordLive />
      </div>
      {/* « Choisis ton rôle » en bas depuis le 2026-11-12 (le premier écran présente déjà les modes). */}
      <div id="role">
        <Casting />
        {/* « Prêt à faire tes preuves ? » tout en bas depuis le 2026-11-12 */}
        <CallToAction />
      </div>
    </>
  );
}

/** Page régénérée toutes les 5 minutes : le jour J de GTA 6 est déjà dans la page envoyée, sans attendre le navigateur. */
export function getStaticProps() {
  return { props: { launch: inLaunchWindow(Date.now()) }, revalidate: 300 };
}
