import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { FaDiscord } from "react-icons/fa6";
import { GoldParticles } from "../components/effects/GoldParticles";
import { Button } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Notice } from "../components/ui/Feedback";
import { LogoMark } from "../components/ui/Logo";
import { TacticalCard } from "../components/ui/TacticalCard";
import { Eyebrow } from "../components/ui/Typography";
import useSession from "../hooks/useSession";
import { signInWithDiscord } from "../lib/auth";

/** Page de connexion Discord. ?next=/chemin : page où revenir ensuite. */
export default function LoginPage() {
  const router = useRouter();
  const { session } = useSession();
  const rawNext = typeof router.query.next === "string" ? router.query.next : "/cod";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/cod";

  // Déjà connecté : direction la page demandée.
  useEffect(() => {
    if (session) router.replace(next);
  }, [session, next, router]);

  return (
    <section className="relative isolate flex min-h-[90svh] items-center overflow-hidden pt-28 pb-16">
      <Head>
        <title>Connexion — SixSence</title>
      </Head>
      <div aria-hidden className="absolute inset-0 -z-20 bg-grid mask-fade" />
      <GoldParticles id="particules-connexion" density={70} className="-z-10" />

      <Container className="flex justify-center">
        <TacticalCard highlight cut={28} className="w-full max-w-lg" innerClassName="holo overflow-hidden p-8 text-center sm:p-12">
          <div className="relative">
            <LogoMark className="mx-auto h-14 w-14 text-gold glow-gold" />
            <Eyebrow className="mt-6">Accès joueur</Eyebrow>
            <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9]">
              Entre dans <span className="text-gold-gradient">l&apos;arène</span>
            </h1>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Un seul compte pour toute la plateforme : ton Discord. Pas de mot de passe, pas de formulaire.
            </p>
            {router.query.error ? (
              <Notice tone="error" className="mt-6 text-left">
                La connexion avec Discord n&apos;a pas abouti. Réessaie.
              </Notice>
            ) : null}
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={() => signInWithDiscord(next)}>
                <FaDiscord aria-hidden className="h-5 w-5" />
                Se connecter avec Discord
              </Button>
            </div>
          </div>
        </TacticalCard>
      </Container>
    </section>
  );
}
