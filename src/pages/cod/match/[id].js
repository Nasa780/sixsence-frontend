import Head from "next/head";
import { useRouter } from "next/router";
import { MatchView } from "../../../components/cod/MatchView";
import { Container } from "../../../components/ui/Container";
import { Eyebrow } from "../../../components/ui/Typography";

/** Salon de match COD : /cod/match/<identifiant du match>. */
export default function MatchPage() {
  const { query, isReady } = useRouter();
  const matchId = typeof query.id === "string" ? query.id : null;

  return (
    <>
      <Head>
        <title>Match classé — SixSence</title>
      </Head>
      <div className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-96 bg-grid mask-fade opacity-70" />
        <Container className="pt-28 pb-12 sm:pt-32">
          <Eyebrow className="mb-6">Salon de match</Eyebrow>
          {isReady && matchId ? <MatchView matchId={matchId} /> : null}
        </Container>
      </div>
    </>
  );
}
