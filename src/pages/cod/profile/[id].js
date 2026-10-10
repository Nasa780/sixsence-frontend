import { useRouter } from "next/router";
import PageShell from "../../../components/site/PageShell";
import ProfileView from "../../../components/site/ProfileView";
import useSession from "../../../hooks/useSession";
import useUser from "../../../hooks/useUser";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Profil public d'un joueur : /cod/profile/<identifiant>. */
export default function PlayerProfile() {
  const { query, isReady } = useRouter();
  const { userId } = useSession();
  const user = useUser();
  const id = typeof query.id === "string" ? query.id : "";

  return (
    <PageShell active="leaderboard" title="Profil joueur" width={1100}>
      {isReady && !UUID.test(id) && <div className="py-20 text-center text-[#a0b0c8] font-[Inter]">Joueur introuvable.</div>}
      {isReady && UUID.test(id) && <ProfileView key={id} userId={id} isOwn={id === userId} ownUser={id === userId ? user : null} />}
    </PageShell>
  );
}
