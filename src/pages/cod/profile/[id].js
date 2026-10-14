import Head from "next/head";
import { useRouter } from "next/router";
import { ProfileView } from "../../../components/cod/ProfileView";
import { Container } from "../../../components/ui/Container";
import { EmptyState } from "../../../components/ui/Feedback";
import { Eyebrow } from "../../../components/ui/Typography";
import useSession from "../../../hooks/useSession";
import useUser from "../../../hooks/useUser";
import { SITE_URL } from "../../../lib/config";
import { supabaseRest } from "../../../lib/og";
import { rankFor } from "../../../lib/ranks";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Les balises de partage (titre, description, carte du joueur) sont calculées côté
 * serveur : Discord et les réseaux sociaux lisent la page sans exécuter son JavaScript.
 * Le reste du profil se charge ensuite dans le navigateur, comme avant.
 */
export async function getServerSideProps({ params, res }) {
  const id = typeof params?.id === "string" ? params.id : "";
  if (!UUID.test(id)) return { props: { meta: null } };
  try {
    const [users, profiles] = await Promise.all([
      supabaseRest(`users?id=eq.${id}&select=username`),
      supabaseRest(`cod_profiles?user_id=eq.${id}&select=points,wins,losses,calling_card`),
    ]);
    const user = users[0];
    const profile = profiles[0];
    if (!user || !profile) return { props: { meta: null } };
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return {
      props: {
        meta: { username: user.username, points: profile.points, wins: profile.wins, losses: profile.losses, card: profile.calling_card ?? "sixsence" },
      },
    };
  } catch {
    return { props: { meta: null } };
  }
}

/** Profil public d'un joueur : /cod/profile/<identifiant>. */
export default function PlayerProfilePage({ meta }) {
  const { query, isReady } = useRouter();
  const { userId } = useSession();
  const user = useUser();
  const id = typeof query.id === "string" ? query.id : "";
  const isOwn = Boolean(userId) && id === userId;

  const played = meta ? meta.wins + meta.losses : 0;
  const title = meta ? `${meta.username} · ${rankFor(meta.points).name} — ${meta.points} pts` : "Profil joueur";
  const description = meta
    ? played > 0
      ? `Classé MW4 sur SixSence : ${meta.wins} victoire${meta.wins > 1 ? "s" : ""}, ${meta.losses} défaite${meta.losses > 1 ? "s" : ""} (${Math.round((meta.wins / played) * 100)} % de victoires).`
      : "Joueur du classé MW4 sur SixSence. Viens l'affronter !"
    : "Profil d'un joueur du classé MW4 sur SixSence.";
  // Le paramètre v change avec les résultats et la carte de visite : Discord recharge l'image à chaque évolution.
  const image = meta ? `${SITE_URL}/api/og/player?id=${id}&v=r9-${meta.points}-${meta.wins}-${meta.losses}-${meta.card}` : null;

  return (
    <>
      <Head>
        <title>{`${title} | SixSence`}</title>
        <meta key="description" name="description" content={description} />
        <meta key="og:title" property="og:title" content={title} />
        <meta key="og:description" property="og:description" content={description} />
        {image ? <meta key="og:image" property="og:image" content={image} /> : null}
        {image ? <meta key="og:image:alt" property="og:image:alt" content={`Carte de joueur de ${meta.username}`} /> : null}
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
