import Head from "next/head";
import { useRouter } from "next/router";
import { ProfileView } from "../../../components/cod/ProfileView";
import { Container } from "../../../components/ui/Container";
import { EmptyState } from "../../../components/ui/Feedback";
import { Eyebrow } from "../../../components/ui/Typography";
import useSession from "../../../hooks/useSession";
import useUser from "../../../hooks/useUser";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Profil public d'un joueur : /cod/profile/<identifiant>. */
export default function PlayerProfilePage() {
  const { query, isReady } = useRouter();
  const { userId } = useSession();
  const user = useUser();
  const id = typeof query.id === "string" ? query.id : "";
  const isOwn = Boolean(userId) && id === userId;

  return (
    <>
      <Head>
        <title>Profil joueur — SixSence</title>
      </Head>
      <div className="relative isolate overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-96 bg-grid mask-fade opacity-70" />
        <Container className="pt-28 pb-12 sm:pt-32">
          <Eyebrow className="mb-6">Profil joueur</Eyebrow>
          {isReady && !UUID.test(id) ? <EmptyState title="Joueur introuvable">Ce profil n&apos;existe pas.</EmptyState> : null}
          {isReady && UUID.test(id) ? <ProfileView key={id} userId={id} editable={isOwn} ownUser={isOwn ? user : null} /> : null}
        </Container>
      </div>
    </>
  );
}
