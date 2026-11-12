import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight, LuChevronRight } from "react-icons/lu";
import useLive from "../../hooks/useLive";
import useSeasons from "../../hooks/useSeasons";
import useSession from "../../hooks/useSession";
import { signInWithDiscord } from "../../lib/auth";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { useGta6Countdown } from "../gta/Gta6Countdown";
import { Button, ButtonLink } from "../ui/Button";
import { LiveBand, day, num, plural } from "./LiveBand";

/**
 * Style du logo : "or" (choisi le 2026-11-11 : or métallique, puis la couleur du mode survolé) ou "blanc" (blanc avec
 * un halo de la couleur du mode), gardé de côté.
 */
const LOGO_STYLE = "or";
/** Logo dessiné (blanc sur fond transparent), recoloré par masque CSS. */
const LOGO = "/images/accueil/logo-sixsence.png";
const MASK = { WebkitMask: `url(${LOGO}) center / contain no-repeat`, mask: `url(${LOGO}) center / contain no-repeat` };

const GOLD = { key: "or", color: "#d4af37", grad: "linear-gradient(100deg,#9c7c1c,#d4af37 30%,#f8ecc0 50%,#d4af37 70%,#9c7c1c)" };

/** Image du téléphone quand aucun mode n'est mis en avant (l'or). */
const GOLD_IMAGE = "/images/accueil/mw4-park.webp";

/**
 * Les modes, dans leur couleur. `text` : couleur lisible du nom sur fond sombre ; `position` : cadrage de l'image ;
 * `tall` : image verticale (affiches MW4, 2026-11-12), plein écran sur téléphone ; sinon (16:9) seulement le haut.
 */
const MODES = [
  { key: "classe", label: "Classé", color: "#34d399", text: "#34d399", grad: "linear-gradient(100deg,#047857,#34d399 30%,#d1fae5 50%,#34d399 70%,#047857)", image: "/images/accueil/mw4-valeria.webp", tall: true, href: "/cod/ranked", cta: "Jouer en Classé" },
  ...(MATCH_TEAM_ENABLED
    ? [
        { key: "division", label: "Division", color: "#22d3ee", text: "#22d3ee", grad: "linear-gradient(100deg,#0e7490,#22d3ee 30%,#cffafe 50%,#22d3ee 70%,#0e7490)", image: "/images/accueil/mw4-price.webp", tall: true, href: "/cod/division", cta: "Jouer en Division" },
        { key: "tournoi", label: "Tournoi", color: "#e5484d", text: "#f87171", grad: "linear-gradient(100deg,#991b1b,#e5484d 30%,#fecaca 50%,#e5484d 70%,#991b1b)", image: "/images/accueil/mw4-ghost.webp", tall: true, href: "/cod/tournoi", cta: "Voir les tournois" },
      ]
    : []),
  { key: "gta", label: "GTA 6", color: "#ff6a3d", text: "#ff9a5c", grad: "linear-gradient(100deg,#d6246e,#ff6a3d 30%,#ffd29a 50%,#ff6a3d 70%,#d6246e)", image: "/images/gta/lock-portrait.webp", tall: true, href: "/gta6", cta: "Voir GTA 6" },
];

const CUP_PHASE = { checkin: "Check-in ouvert", drawn: "Tirage effectué", running: "En cours" };

/** Infos du moment de chaque mode (GET /live, comme la bande En direct) : un chiffre en grand et une ligne dessous. */
function infosOf(live, gta) {
  const classe = live?.classe;
  const division = live?.division;
  const cup = live?.cup;
  const leader = live?.leaders?.division;
  const days = gta ? Math.ceil((gta[0].value * 86_400 + gta[1].value * 3_600 + gta[2].value * 60) / 86_400) : null;
  return {
    classe: classe?.inProgress
      ? { big: `${plural(classe.inProgress, "match")} en cours`, small: classe.inQueue ? `${classe.inQueue} en file` : "Recherche et Destruction" }
      : { big: classe?.inQueue ? `${classe.inQueue} en file` : "File ouverte", small: "S&D Hardcore · en solo" },
    division: division?.match
      ? { big: "Match en cours", small: `[${division.match.teamA?.tag ?? "?"}] contre [${division.match.teamB?.tag ?? "?"}]` }
      : division?.searching
        ? { big: `${plural(division.searching, "équipe")} en recherche`, small: "4v4 · défis directs" }
        : leader
          ? { big: `[${leader.tag}] en tête`, small: `${num(leader.points)} pts · 4v4` }
          : { big: "4v4", small: "Ton équipe, toute la saison" },
    tournoi: cup
      ? cup.phase === "registration"
        ? { big: day(cup.startsAt), small: `${cup.name} · ${cup.registered}/${cup.capacity} inscrits` }
        : { big: CUP_PHASE[cup.phase] ?? cup.name, small: cup.name }
      : { big: "Chaque semaine", small: "Coupe Horus et Coupe Anubis" },
    gta: gta === null
      ? { big: "Disponible", small: live?.gta?.title ?? "Vice City est ouverte" }
      : { big: days ? `J-${days}` : "GTA 6", small: live?.gta?.title ?? "Sortie le 19 novembre" },
  };
}

/** Le logo, en or puis dans la couleur du mode (fondu entre des calques), tranché à l'arrivée puis traversé d'un reflet. */
function Logo({ current }) {
  const layers = [GOLD, ...MODES];
  const color = current?.color ?? GOLD.color;
  return (
    <div
      role="img"
      aria-label="SixSence"
      className="relative aspect-[1899/306] w-[min(1000px,88vw)] transition-[filter] duration-500"
      style={{ filter: LOGO_STYLE === "blanc" ? `drop-shadow(0 0 18px ${color}) drop-shadow(0 0 50px ${color}80)` : "drop-shadow(0 10px 30px rgba(0,0,0,0.6))" }}
    >
      {LOGO_STYLE === "blanc" ? (
        <span className="hero-logo-cut absolute inset-0 bg-white" style={MASK} />
      ) : (
        layers.map((layer) => (
          <span
            key={layer.key}
            className="hero-logo-cut absolute inset-0 transition-opacity duration-500"
            style={{ ...MASK, backgroundImage: layer.grad, opacity: (current?.key ?? "or") === layer.key ? 1 : 0 }}
          />
        ))
      )}
      <span className="hero-logo-sheen absolute inset-0" style={MASK} />
    </div>
  );
}

/**
 * Premier écran de l'accueil (2026-11-11, « accordéon des modes ») : les modes en bandes plein écran (Classé, Division,
 * Tournoi, GTA 6) ; au survol, la bande s'élargit, reprend ses couleurs et affiche son info du moment, et le logo,
 * l'étiquette et le bouton prennent la couleur du mode. Lignes d'énergie entre les bandes, bande En direct en bas.
 * Sur téléphone (pas de survol) : le mode mis en avant change tout seul et les modes sont listés sous le logo.
 */
export function Hero() {
  const { session, loading } = useSession();
  const { label: season } = useSeasons();
  const live = useLive();
  const gta = useGta6Countdown();
  const [hover, setHover] = useState(null);
  const [wide, setWide] = useState(null);
  const [tick, setTick] = useState(0);

  // Ordinateur ou téléphone (le survol n'existe que sur ordinateur), lu après l'affichage.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  // Téléphone : l'or, puis chaque mode tour à tour (rien ne bouge si l'utilisateur réduit les animations).
  useEffect(() => {
    if (wide !== false || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = setInterval(() => setTick((n) => n + 1), 3200);
    return () => clearInterval(timer);
  }, [wide]);

  const cycle = [null, ...MODES];
  const current = wide === false ? cycle[tick % cycle.length] : MODES.find((mode) => mode.key === hover) ?? null;
  const infos = infosOf(live, gta);
  const target = current ?? { href: "/cod", cta: "Jouer maintenant" };

  return (
    <section aria-labelledby="titre-accueil" className="relative isolate flex min-h-[max(100svh,44rem)] flex-col items-center justify-center overflow-hidden bg-black pb-24 pt-32 lg:pb-24 lg:pt-24">
      <h1 id="titre-accueil" className="sr-only">
        SixSence, compétition Call of Duty et événements GTA 6
      </h1>

      {/* --- Ordinateur : les bandes des modes ------------------------------- */}
      <div className="absolute inset-0 -z-10 hidden lg:flex">
        {MODES.map((mode, index) => {
          const on = hover === mode.key;
          return (
            <Link
              key={mode.key}
              href={mode.href}
              onMouseEnter={() => setHover(mode.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(mode.key)}
              onBlur={() => setHover(null)}
              className={cn("relative flex-1 overflow-hidden outline-none transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]", on && "grow-[3]")}
              style={{ animation: `hero-panel-up 1s cubic-bezier(0.22,1,0.36,1) ${index * 0.12}s both` }}
            >
              <span className="sr-only">{mode.label}</span>
              <Image
                src={mode.image}
                alt=""
                fill
                priority
                sizes="1280px"
                className={cn("object-cover transition-[filter] duration-700", on ? "" : "brightness-[0.45] grayscale-[0.6]")}
                style={{ objectPosition: mode.position ?? "center 25%" }}
              />
              <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/40" />
              {index > 0 ? <span aria-hidden className="hero-energy absolute inset-y-0 left-0 z-10 w-0.5" style={{ animationDelay: `${-index * 0.85}s` }} /> : null}

              {/* Nom du mode (bande fermée), puis son info du moment (bande ouverte) */}
              <span
                aria-hidden
                className={cn("absolute bottom-36 left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-2xl font-black uppercase tracking-[0.2em] transition-opacity duration-300 [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]", on && "opacity-0")}
                style={{ color: mode.text }}
              >
                {mode.label}
              </span>
              <span className={cn("absolute bottom-24 left-[8%] right-[8%] transition-all delay-200 duration-500", on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
                <span className="block font-display text-5xl font-black uppercase leading-[0.9]">{infos[mode.key].big}</span>
                <span className="mt-2.5 flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.24em] text-white/75">
                  <span aria-hidden className="h-2 w-2 animate-pulse rounded-full" style={{ background: mode.color, boxShadow: `0 0 10px ${mode.color}` }} />
                  {infos[mode.key].small}
                </span>
              </span>
              <span aria-hidden className={cn("absolute inset-x-0 bottom-[3.25rem] h-1 origin-center transition-transform duration-500", on ? "scale-x-100" : "scale-x-[0.3]")} style={{ background: mode.color }} />
            </Link>
          );
        })}
      </div>

      {/* --- Téléphone : l'image du mode mis en avant (ou celle de l'or), en fondu ---------------
          Images verticales : plein écran ; images en 16:9 : le haut de l'écran seulement, pour ne pas être zoomées ×4. */}
      <div aria-hidden className="absolute inset-0 -z-10 lg:hidden">
        {[{ key: "or", image: GOLD_IMAGE, tall: true }, ...MODES].map((mode) => (
          <div
            key={mode.key}
            className={cn("absolute inset-x-0 top-0 transition-opacity duration-1000", mode.tall ? "h-full" : "h-[62%]", (current?.key ?? "or") === mode.key ? "opacity-75" : "opacity-0")}
          >
            <Image src={mode.image} alt="" fill sizes="100vw" className="object-cover" style={{ objectPosition: mode.tall ? "center 20%" : mode.position ?? "center" }} />
            {mode.tall ? null : <span className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent to-black" />}
          </div>
        ))}
        <span className="absolute inset-0 bg-linear-to-b from-black/65 via-black/35 to-black/85" />
      </div>

      {/* --- Logo, étiquette, boutons ---------------------------------------- */}
      <div className="pointer-events-none relative flex w-full flex-col items-center px-4 text-center">
        <span
          className="hero-in clip-slant mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 font-tech text-[9px] font-bold uppercase tracking-[0.22em] text-[#130503] transition-colors duration-500 [--slant:7px] sm:mb-8 sm:text-[11px]"
          style={{ animationDelay: "0.5s", background: current?.color ?? "var(--color-ember)" }}
        >
          <span aria-hidden>●</span>
          {current ? current.label : `${season} · MW4 + GTA VI`}
        </span>
        <Logo current={current} />
        <div className="hero-in pointer-events-auto mt-9 flex w-full max-w-md gap-3 sm:mt-11 sm:w-auto sm:max-w-none" style={{ animationDelay: "1.4s" }}>
          {/* Jouer demande la connexion (tant que la session n'est pas lue, le bouton connecte puis mène au mode) ; GTA 6 et
              les tournois se consultent sans compte. */}
          {(!loading && session) || current?.key === "gta" || current?.key === "tournoi" ? (
            <ButtonLink href={target.href} size="lg" className="flex-1 sm:flex-none">
              {target.cta}
              <LuArrowRight aria-hidden className="h-5 w-5" />
            </ButtonLink>
          ) : (
            <Button size="lg" onClick={() => signInWithDiscord(target.href)} className="flex-1 sm:flex-none">
              <FaDiscord aria-hidden className="h-5 w-5" />
              {target.cta}
            </Button>
          )}
        </div>

        {/* Téléphone : les modes en liste, avec leur info du moment */}
        <nav aria-label="Modes" className="hero-in pointer-events-auto mt-9 grid w-full max-w-md gap-2 lg:hidden" style={{ animationDelay: "1.7s" }}>
          {MODES.map((mode) => (
            <Link
              key={mode.key}
              href={mode.href}
              className={cn("flex items-center gap-3 border bg-black/55 px-4 py-3 text-left backdrop-blur-sm transition-colors duration-500", current?.key === mode.key ? "border-white/30" : "border-white/10")}
              style={current?.key === mode.key ? { borderColor: mode.color } : undefined}
            >
              <span aria-hidden className="h-8 w-1 shrink-0" style={{ background: mode.color }} />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-black uppercase leading-none" style={{ color: mode.text }}>
                  {mode.label}
                </span>
                <span className="mt-1 block truncate font-tech text-[9px] uppercase tracking-[0.2em] text-white/55">{infos[mode.key].small}</span>
              </span>
              <span className="shrink-0 font-display text-base font-black uppercase">{infos[mode.key].big}</span>
              <LuChevronRight aria-hidden className="h-4 w-4 shrink-0 text-white/40" />
            </Link>
          ))}
        </nav>
      </div>

      <LiveBand floating />
    </section>
  );
}
