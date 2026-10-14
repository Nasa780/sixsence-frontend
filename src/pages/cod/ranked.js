import Head from "next/head";
import { useEffect, useState } from "react";
import { QueuePanel } from "../../components/cod/QueuePanel";
import { RankRoad } from "../../components/cod/RankRoad";
import { RanksGrid } from "../../components/cod/RanksGrid";
import { GoldParticles } from "../../components/effects/GoldParticles";
import { Container } from "../../components/ui/Container";
import { Loading, StatTile } from "../../components/ui/Feedback";
import { LoginPrompt } from "../../components/ui/LoginPrompt";
import { TacticalCard } from "../../components/ui/TacticalCard";
import { Eyebrow, PageHeader } from "../../components/ui/Typography";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { api } from "../../lib/api";
import { rankFor } from "../../lib/ranks";

const RULES = [
  { title: "Choisis ta file", text: "En 2v2, 3v3, 4v4 ou 5v5, rejoins la file seul ou en groupe. Le match se lance dès que les deux équipes sont complètes : les premiers arrivés jouent en premier." },
  { title: "Joue avec tes amis", text: "Crée un groupe et envoie le lien à tes amis : vous serez toujours dans la même équipe. Si tu joues seul, une défaite te coûte 25 % de points en moins." },
  { title: "Une minute pour accepter", text: "Quand ton match est trouvé, un effet sonore et une notification te préviennent : tu as alors 60 secondes pour cliquer sur « Accepter »." },
  { title: "30 minutes de recherche", text: "Après 25 min de recherche, tu as 5 min pour cliquer sur « Rester en file » avant d'être retiré de la file (recherche limitée à 30 min)." },
  { title: "Recherche & Destruction Hardcore", text: "Toutes les files se jouent en R&D Hardcore, en partie privée." },
  { title: "Équipes et carte au hasard", text: "Les joueurs sont répartis au hasard entre les deux équipes, et la carte est tirée au sort. Si tu joues en groupe, vous restez ensemble." },
  { title: "L'hôte crée la partie", text: "Le premier joueur de l'équipe 1 crée la partie privée en R&D Hardcore et invite les autres." },
  { title: "Le résultat se confirme à deux", text: "Une fois ton match déclaré, tes points s'actualisent dès la confirmation adverse. Sans réponse sous 15 minutes, le résultat est validé par défaut. En cas de litige ou de contestation, un arbitre tranche." },
  { title: "Engagement", text: "Un match non accepté dans les 60 secondes donne un avertissement. Sur 24 heures, chaque nouvel oubli t'exclut de la file : 15 minutes au 2e, 1 heure au 3e, et 24 heures au-delà." },
];

/** File d'attente classée : panneau temps réel, règles, rangs. Visible par tous, jouable une fois connecté. */
export default function RankedPage() {
  const { session, loading } = useSession();
  const user = useUser();
  const [status, setStatus] = useState(null);

  // Compteurs publics, rafraîchis toutes les 10 secondes.
  useEffect(() => {
    let active = true;
    const load = () =>
      api("/cod/status")
        .then((data) => active && setStatus(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, 10_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const profileComplete = Boolean(user?.profile?.activision_id);

  return (
    <>
      <Head>
        <title>File classée COD — SixSence</title>
      </Head>

      <PageHeader


        image="/images/mw4.webp"
        eyebrow="Classé 2v2 → 5v5 · R&D Hardcore"
        title={
          <>
            File <span className="text-gold-gradient">d&apos;attente</span>
          </>
        }
        description="Rejoins la file : dès que ton match est prêt, tu es prévenu par un son sur cette page ou par une notification sur ton téléphone."
        actions={
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="En ligne" value={status ? status.playersOnline : "—"} />
            <StatTile label="En file" value={status ? status.playersInQueue : "—"} accent />
            <StatTile label="En cours" value={status ? status.matchesInProgress : "—"} />
          </div>
        }
      />

      <div className="relative isolate">
        <GoldParticles id="particules-file" density={60} className="-z-10 mask-fade" />

        <Container className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            {loading ? (
              <Loading />
            ) : session ? (
              // La session est connue : on attend le profil pour savoir si l'identifiant Activision est renseigné.
              user ? <QueuePanel profileComplete={profileComplete} userId={user.id} /> : <Loading label="Chargement du profil…" />
            ) : (
              <LoginPrompt next="/cod/ranked" />
            )}
          </div>

          <aside aria-labelledby="titre-regles">
            <Eyebrow>Règles</Eyebrow>
            <h2 id="titre-regles" className="mt-3 font-display text-4xl font-black uppercase leading-none">
              Comment ça se passe
            </h2>
            <ol className="mt-6 space-y-5">
              {RULES.map((rule, index) => (
                <li key={rule.title} className="flex gap-4">
                  <span aria-hidden className="font-display text-4xl font-black leading-[0.8] text-outline">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase leading-none tracking-wide">{rule.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/55">{rule.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </Container>

        {user?.profile ? (
          <Container className="pb-10">
            <TacticalCard cut={22} innerClassName="p-5 sm:p-7">
              <p className="mb-4 font-display text-2xl font-black uppercase leading-none">Road to Légende</p>
              <RankRoad points={user.profile.points} />
            </TacticalCard>
          </Container>
        ) : null}

        <Container className="pb-8">
          <RanksGrid highlight={user?.profile ? rankFor(user.profile.points).name : null} />
        </Container>
      </div>
    </>
  );
}
