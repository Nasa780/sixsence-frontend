import Head from "next/head";
import { ButtonLink } from "../components/ui/Button";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Typography";

/** Page 404. */
export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden pt-28 pb-16">
      <Head>
        <title>Page introuvable — SixSence</title>
      </Head>
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-fade" />
      <Container className="text-center">
        <p aria-hidden className="font-display text-[10rem] font-black leading-[0.8] text-outline sm:text-[16rem]">
          404
        </p>
        <Eyebrow className="mt-8">Hors zone</Eyebrow>
        <h1 className="mt-3 font-display text-5xl font-black uppercase leading-[0.9] sm:text-6xl">Cette page n&apos;existe pas</h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/60">Le lien est peut-être erroné, ou la page a été déplacée.</p>
        <div className="mt-9 flex justify-center">
          <ButtonLink href="/" size="lg">
            Retour à l&apos;accueil
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
