import Head from "next/head";
import { MessagesView } from "../components/messages/MessagesView";
import { Container } from "../components/ui/Container";
import { Loading } from "../components/ui/Feedback";
import { LoginPrompt } from "../components/ui/LoginPrompt";
import { PageHeader } from "../components/ui/Typography";
import useSession from "../hooks/useSession";

/** Messagerie entre joueurs : connexion Discord requise. ?avec=<joueur> ouvre la conversation avec ce joueur. */
export default function MessagesPage() {
  const { userId, loading } = useSession();

  return (
    <>
      <Head>
        <title>Messages — SixSence</title>
        <meta name="robots" content="noindex" />
      </Head>
      <PageHeader
        eyebrow="Communauté"
        title={
          <>
            Mes <span className="text-gold-gradient">messages</span>
          </>
        }
        description="Écris aux autres joueurs : recrutement, organisation d'un match, une question après une partie."
      />
      <Container className="py-8">
        {loading ? (
          <Loading />
        ) : userId ? (
          <MessagesView me={userId} />
        ) : (
          <LoginPrompt title="Connecte-toi pour voir tes messages" text="La messagerie est réservée aux joueurs connectés avec Discord." next="/messages" />
        )}
      </Container>
    </>
  );
}
