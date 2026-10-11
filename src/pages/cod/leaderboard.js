import Head from "next/head";
import { LeaderboardView } from "../../components/cod/LeaderboardView";
import { RanksGrid } from "../../components/cod/RanksGrid";
import { ButtonLink } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { PageHeader } from "../../components/ui/Typography";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { rankFor } from "../../lib/ranks";

/** Classement COD complet, en direct. Public. */
export default function LeaderboardPage() {
  const { userId } = useSession();
  const user = useUser();

  return (
    <>
      <Head>
        <title>Classement COD — SixSence</title>
      </Head>
      <PageHeader

        image="/images/mw4.webp"
        eyebrow="Saison 1"
        title={
          <>
            Classement <span className="text-gold-gradient">COD</span>
          </>
        }
        description="Les meilleurs joueurs du classé Call of Duty, mis à jour en direct après chaque match confirmé."
        actions={<ButtonLink href="/cod/ranked">Rejoindre la file</ButtonLink>}
      />
      <Container className="space-y-20 py-12">
        <LeaderboardView limit={200} currentUserId={userId} />
        <RanksGrid highlight={user?.profile ? rankFor(user.profile.points).name : null} />
      </Container>
    </>
  );
}
