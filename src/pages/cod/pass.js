import Head from "next/head";
import { useEffect, useState } from "react";
import { SeasonPass } from "../../components/cod/SeasonPass";
import { Container } from "../../components/ui/Container";
import { EmptyState, Loading, Notice } from "../../components/ui/Feedback";
import { PageHeader } from "../../components/ui/Typography";
import useSession from "../../hooks/useSession";
import { api } from "../../lib/api";

/** Pass de saison gratuit : public, le visiteur connecté voit sa progression (GET /cod/pass). */
export default function SeasonPassPage() {
  const session = useSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    api("/cod/pass").then(
      (result) => alive && setData(result),
      (caught) => alive && setError(caught.message),
    );
    return () => {
      alive = false;
    };
  }, [session]);

  return (
    <>
      <Head>
        <title>Pass de saison — SixSence</title>
        <meta name="description" content="Le pass de saison gratuit de SixSence : joue, gagne de l'XP et débloque des cartes de visite et des badges exclusifs." />
      </Head>
      <PageHeader
        eyebrow={data?.season?.name ?? "Saison"}
        title={
          <>
            Pass de <span className="text-gold-gradient">saison</span>
          </>
        }
        description="Gratuit pour tous. Joue, gagne de l'XP et débloque des cartes de visite et des badges exclusifs."
      />
      <Container className="py-12">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {!data && !error ? <Loading /> : null}
        {data && !data.active ? <EmptyState title="Pas de pass pour cette saison">Le prochain arrive bientôt.</EmptyState> : null}
        {data?.active ? <SeasonPass data={data} /> : null}
      </Container>
    </>
  );
}
