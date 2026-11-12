import { useEffect, useState, useSyncExternalStore } from "react";
import { LuArrowDown, LuArrowRight } from "react-icons/lu";
import { GTA6_RELEASE } from "../../lib/config";
import { celebrate } from "../../lib/celebrate";
import { GTA_IMAGES } from "../../lib/gtaImages";
import { GtaArt } from "../gta/GtaArt";
import { ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";

const START = new Date(GTA6_RELEASE).getTime();
/** Le jour J dure 48 h : le 19 et le 20 novembre (heure de Paris), puis l'accordéon des modes reprend la tête. */
const END = START + 2 * 86_400_000;
/** Vrai pendant les 48 h qui suivent la sortie de GTA 6. */
export const inLaunchWindow = (now) => now >= START && now < END;

const subscribe = (onChange) => {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
};

/**
 * Jour J en cours ? Calculé par le serveur à chaque régénération de la page (`fromServer`, getStaticProps), puis
 * revérifié dans le navigateur chaque minute : la page passe toute seule au jour J, puis en revient.
 */
export function useLaunchWindow(fromServer) {
  return useSyncExternalStore(subscribe, () => inLaunchWindow(Date.now()), () => fromServer);
}

const SUNSET = ["#ffd25a", "#ff8a3d", "#ff4fa3", "#d6246e", "#ffffff"];
const SEEN = "sixsence-jour-j";

/**
 * Premier écran du jour J de GTA 6 (2026-11-12), au-dessus de l'accordéon des modes pendant 48 h : l'illustration en
 * grand, « GTA VI est sorti ». À la première visite, un compte à rebours de 3 secondes finit sur « Disponible » avec
 * des paillettes coucher de soleil ; ensuite (ou si l'utilisateur réduit les animations), « Disponible » directement.
 * Téléphone : le logo officiel de l'illustration, en haut, sert de titre ; le texte est en bas.
 */
export function LaunchHero() {
  // null : pas encore décidé (rien n'est affiché, pas d'écart entre serveur et navigateur) ; 0 : « Disponible ».
  const [left, setLeft] = useState(null);
  const [party, setParty] = useState(false);

  useEffect(() => {
    let seen = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      seen ||= localStorage.getItem(SEEN) === "1";
      localStorage.setItem(SEEN, "1");
    } catch {
      // Stockage bloqué : le compte à rebours sera rejoué, sans gravité.
    }
    const timer = setTimeout(() => {
      setLeft(seen ? 0 : 3);
      setParty(!seen);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (left === null) return undefined;
    if (left === 0) {
      if (party) celebrate("victoire", SUNSET);
      return undefined;
    }
    const timer = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [left, party]);

  const out = left === 0;

  return (
    <section
      data-univers="gta"
      aria-labelledby="titre-jour-j"
      className="relative isolate flex min-h-[max(100svh,44rem)] flex-col justify-end overflow-hidden bg-[#0d0412] pb-28 pt-28 lg:justify-center lg:pb-24"
    >
      <div aria-hidden className="absolute inset-0 -z-20">
        <GtaArt mobile={GTA_IMAGES.lock.portrait} desktop={GTA_IMAGES.lock.paysage} priority className="object-cover object-[50%_30%]" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#0d0412_0%,rgba(13,4,18,0.9)_38%,rgba(13,4,18,0.2)_62%,rgba(13,4,18,0)_86%,rgba(10,10,10,0.7)_100%)] lg:bg-[linear-gradient(90deg,#0d0412_0%,rgba(13,4,18,0.85)_35%,rgba(13,4,18,0.2)_70%),linear-gradient(0deg,#0d0412_0%,transparent_35%)]"
      />
      <div aria-hidden className="launch-glow absolute -left-40 top-1/3 -z-10 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(255,79,163,0.35),transparent_65%)]" />

      <Container>
        <span className="clip-slant inline-flex items-center gap-2 bg-linear-to-r from-[#ff4fa3] to-[#ff8a3d] px-3.5 py-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.24em] text-[#130503] [--slant:7px] sm:text-[11px]">
          <span aria-hidden className="animate-pulse">●</span> Jour J · 19 novembre 2026
        </span>
        <h2 id="titre-jour-j" className="mt-5 font-display font-black uppercase leading-[0.8] lg:mt-6">
          <span className="hidden bg-linear-to-b from-[#ffd25a] via-[#ff8a3d] to-[#ff4fa3] bg-clip-text pt-2 text-[clamp(6rem,26vw,15rem)] text-transparent lg:block">
            GTA VI
          </span>
          <span className="block text-[clamp(2.6rem,11vw,4.5rem)] text-white lg:mt-3">
            <span className="lg:hidden">Le jeu est sorti</span>
            <span className="hidden lg:inline">est sorti</span>
          </span>
        </h2>

        <div className="mt-3 h-16 sm:mt-6 sm:h-28" aria-live="polite">
          {out ? (
            <p className={`${party ? "launch-flash " : ""}font-tech text-4xl font-black uppercase tracking-[0.12em] text-white [text-shadow:0_0_40px_rgba(255,79,163,0.7)] sm:text-6xl`}>
              Disponible
            </p>
          ) : left ? (
            <p className="font-tech text-6xl font-black text-white [text-shadow:0_0_40px_rgba(255,79,163,0.45)] sm:text-[5.25rem]">00:00:0{left}</p>
          ) : null}
        </div>

        <p className="max-w-lg text-[15px] leading-relaxed text-white/75 sm:text-lg">
          Vice City est ouverte. Les premières sessions SixSence arrivent : courses, braquages et soirées en équipe.
        </p>
        <div className="mt-8">
          <ButtonLink href="/gta6" size="lg" className="w-full sm:w-auto">
            Voir le programme
            <LuArrowRight aria-hidden className="h-5 w-5" />
          </ButtonLink>
        </div>
        <a href="#modes" className="mt-10 inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/50 transition-colors hover:text-white">
          <LuArrowDown aria-hidden className="h-3.5 w-3.5" /> Les modes Call of Duty juste en dessous
        </a>
      </Container>
    </section>
  );
}
