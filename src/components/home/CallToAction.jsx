import { FaDiscord } from "react-icons/fa6";
import { LuArrowRight } from "react-icons/lu";
import useSession from "../../hooks/useSession";
import { signInWithDiscord } from "../../lib/auth";
import { DISCORD_INVITE_URL } from "../../lib/config";
import { Reveal } from "../effects/Reveal";
import { Button, ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { TacticalCard } from "../ui/TacticalCard";

/** Bandeau final : dernier appel à la connexion (ou à la file, si déjà connecté). */
export function CallToAction() {
  const { session } = useSession();

  return (
    <section className="pb-8">
      <Container>
        <Reveal>
          <TacticalCard highlight cut={32} innerClassName="holo overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-20">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18),transparent_65%)]" />
            <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
            <div className="relative">
              <h2 className="font-display text-5xl font-black uppercase leading-[0.9] sm:text-7xl">
                Prêt à faire tes <span className="text-gold-gradient">preuves</span> ?
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
                La file est ouverte. Connecte-toi, renseigne ton identifiant Activision et lance ton premier match classé.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                {session ? (
                  <ButtonLink href="/cod/ranked" size="lg">
                    Rejoindre la file
                    <LuArrowRight aria-hidden className="h-5 w-5" />
                  </ButtonLink>
                ) : (
                  <Button size="lg" onClick={() => signInWithDiscord("/cod/ranked")}>
                    <FaDiscord aria-hidden className="h-5 w-5" />
                    Se connecter avec Discord
                  </Button>
                )}
                {DISCORD_INVITE_URL ? (
                  <ButtonLink href={DISCORD_INVITE_URL} external variant="outline" size="lg">
                    <FaDiscord aria-hidden className="h-5 w-5" />
                    Rejoindre le serveur
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </TacticalCard>
        </Reveal>
      </Container>
    </section>
  );
}
