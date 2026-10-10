import LoginGate from "../../../components/site/LoginGate";
import PageShell from "../../../components/site/PageShell";
import ProfileView from "../../../components/site/ProfileView";
import { Loading } from "../../../components/site/ui";
import useSession from "../../../hooks/useSession";
import useUser from "../../../hooks/useUser";

/** Mon profil : connexion Discord requise. Les profils des autres sont publics (/cod/profile/[id]). */
export default function MyProfile() {
  const { userId, loading } = useSession();
  const user = useUser();

  return (
    <PageShell active="" title="Mon profil" width={1100}>
      {loading && <Loading />}
      {!loading && !userId && (
        <LoginGate
          title="Connecte-toi pour voir ton profil"
          text="Ton profil, tes statistiques et ton historique sont liés à ton compte Discord."
          next="/cod/profile"
        />
      )}
      {userId && <ProfileView userId={userId} isOwn ownUser={user} />}
    </PageShell>
  );
}
