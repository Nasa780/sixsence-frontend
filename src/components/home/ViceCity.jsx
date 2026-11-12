import { GTA_IMAGES } from "../../lib/gtaImages";
import { GtaArt } from "../gta/GtaArt";
import { LuArrowRight } from "react-icons/lu";
import { Reveal } from "../effects/Reveal";
import { Ticker } from "../effects/Ticker";
import { releaseDay, useGta6Countdown } from "../gta/Gta6Countdown";
import { ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";

/** Jours, heures, minutes : les secondes défileraient trop dans un si grand format. */
const SHOWN = 3;

/**
 * Écran GTA 6 de l'accueil (2026-11-11, accueil « affiche ») : l'illustration du jeu en grand, « Vice City » en
 * dégradé coucher de soleil et le compte à rebours de la sortie en gros chiffres. Une fois le jeu sorti : « Vice City
 * est ouverte », sans compteur. Couleurs coucher de soleil via data-univers="gta" (boutons, liserés).
 */
export function ViceCity() {
  const parts = useGta6Countdown();
  const out = parts === null;
  const cells = (parts || [{ label: "jours" }, { label: "heures" }, { label: "min" }]).slice(0, SHOWN);

  return (
    <section data-univers="gta" aria-labelledby="titre-vice-city" className="relative isolate overflow-hidden bg-[#0d0412]">
      {/* Illustration : en haut sur téléphone, sur toute la hauteur à droite sur ordinateur */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-20 h-[27rem] sm:h-[34rem] lg:inset-y-0 lg:h-auto">
        <GtaArt mobile={GTA_IMAGES.rooftop.carre} desktop={GTA_IMAGES.rooftop.paysage} className="object-cover object-[50%_0%] lg:object-[right_top]" />
        {/* Téléphone et tablette : l'image se fond vers le bas, sous le titre */}
        <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.3)_0%,rgba(13,4,18,0)_22%,rgba(13,4,18,0.8)_68%,#0d0412_100%)] lg:hidden" />
      </div>
      {/* Ordinateur : texte à gauche sur un fond qui s'assombrit */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-[linear-gradient(90deg,#0b0410_0%,rgba(20,6,26,0.94)_30%,rgba(40,8,40,0.35)_58%,rgba(0,0,0,0)_75%),linear-gradient(0deg,#0a0a0a_0%,rgba(10,10,10,0)_30%)] lg:block"
      />

      <Container className="pb-24 pt-[19.5rem] sm:pb-28 sm:pt-[25rem] lg:flex lg:min-h-[56rem] lg:items-center lg:py-28">
        <Reveal className="max-w-2xl">
          <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-[#ffb36b] sm:text-xs sm:tracking-[0.34em]">
            <span className="sm:hidden">GTA VI</span>
            <span className="hidden sm:inline">Grand Theft Auto VI</span> · {out ? "disponible" : `sortie le ${releaseDay}`}
          </p>
          <h2
            id="titre-vice-city"
            className="mt-4 bg-linear-to-b from-[#ffd25a] via-[#ff8a3d] to-[#ff4fa3] bg-clip-text pt-2 font-display text-[clamp(6.5rem,29vw,14.5rem)] font-black uppercase leading-[0.78] text-transparent lg:mt-6"
          >
            Vice <br className="lg:hidden" />
            City
          </h2>
          <p className="mt-4 font-display text-xl font-semibold uppercase tracking-[0.04em] text-white/85 sm:mt-6 sm:text-3xl">
            {out ? "est ouverte" : "ouvre ses portes dans"}
          </p>

          {out ? null : (
            <div role="timer" aria-label="Compte à rebours de la sortie de GTA 6" className="mt-3 flex items-end gap-3 sm:mt-5 sm:gap-6">
              {cells.map((cell, index) => (
                <div key={cell.label} className="flex items-end gap-3 sm:gap-6">
                  {index > 0 ? (
                    <span aria-hidden className="pb-6 font-tech text-3xl text-white/25 sm:pb-8 sm:text-6xl">
                      :
                    </span>
                  ) : null}
                  <div className="flex flex-col gap-2">
                    <span className="font-tech text-5xl font-black leading-none text-white [text-shadow:0_0_40px_rgba(255,79,163,0.45)] sm:text-[5.25rem]">
                      <Ticker value={cell.value ?? null} />
                    </span>
                    <span className="font-tech text-[9px] uppercase tracking-[0.3em] text-white/50 sm:text-[11px]">{cell.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/70 sm:mt-8 sm:text-lg">
            Sessions, courses et braquages en équipe, organisés par la communauté dès la sortie du jeu.
          </p>
          <div className="mt-7 sm:mt-8">
            <ButtonLink href="/gta6" size="lg" className="w-full sm:w-auto">
              Voir le programme GTA 6
              <LuArrowRight aria-hidden className="h-5 w-5" />
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
