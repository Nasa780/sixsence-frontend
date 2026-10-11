import Head from "next/head";
import { ProfileView } from "../../../components/cod/ProfileView";
import { Container } from "../../../components/ui/Container";
import { Loading } from "../../../components/ui/Feedback";
import { LoginPrompt } from "../../../components/ui/LoginPrompt";
import { PageHeader } from "../../../components/ui/Typography";
import useSession from "../../../hooks/useSession";
import useUser from "../../../hooks/useUser";

/** Mon profil : connexion Discord requise. Les profils des autres sont publics (/cod/profile/[id]). */
export default function MyProfilePage() {
  const { userId, loading } = useSession();
  const user = useUser();

  return (
    <>
      <Head>
        <title>Mon profil — SixSence</title>
      </Head>
      <PageHeader
        eyebrow="Profil COD"
        title={
          <>
            Mon <span className="text-gold-gradient">profil</span>
          </>
        }
        description="Ton rang, tes statistiques, ton historique et tes identifiants de jeu."
      />
      <Container className="py-12">
        {loading ? (
          <Loading />
        ) : userId ? (
          <ProfileView userId={userId} editable ownUser={user} />
        ) : (
          <LoginPrompt
            title="Connecte-toi pour voir ton profil"
            text="Ton profil, tes statistiques et ton historique sont liés à ton compte Discord."
            next="/cod/profile"
          />
        )}
      </Container>
    </>
  );
}
