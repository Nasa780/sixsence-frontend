import Head from "next/head";
import { useEffect, useState } from "react";
import { QueuePanel } from "../../components/cod/QueuePanel";
import { RanksGrid } from "../../components/cod/RanksGrid";
import { GoldParticles } from "../../components/effects/GoldParticles";
import { Container } from "../../components/ui/Container";
import { Loading, StatTile } from "../../components/ui/Feedback";
import { LoginPrompt } from "../../components/ui/LoginPrompt";
import { Eyebrow, PageHeader } from "../../components/ui/Typography";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { api } from "../../lib/api";
import { rankFor } from "../../lib/ranks";

const RULES = [
  { title: "Dix joueurs, un match", text: "La file se déclenche à dix. Les premiers arrivés sont les premiers servis." },
  { title: "Tout est tiré au sort", text: "Équipes et carte : personne ne choisit, personne ne peut tricher." },
  { title: "L'hôte crée la partie", text: "Le premier joueur de l'équipe 1 ouvre la partie privée et invite les autres." },
  { title: "Le résultat se confirme à deux", text: "Un joueur déclare le vainqueur, l'équipe adverse valide. Les points bougent ensuite." },
  { title: "Engagement", text: "Lancer un match, c'est s'engager à le jouer : les abandons répétés sont sanctionnés." },
];

/** File d'attente classée : panneau temps réel, règles, rangs. Visible par tous, jouable une fois connecté. */
export default function RankedPage() {
  const { session, loading } = useSession();
  const user = useUser();
  const [status, setStatus] = useState(null);

  // Compteurs publics, rafraîchis toutes les 10 secondes.
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
        eyebrow="Classé 5v5"
        title={
          <>
            File <span className="text-gold-gradient">d&apos;attente</span>
          </>
        }
        description="Rejoins la file et reste sur cette page : tu es prévenu à la seconde où ton match est prêt."
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
              user ? <QueuePanel profileComplete={profileComplete} /> : <Loading label="Chargement du profil…" />
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

        <Container className="pb-8">
          <RanksGrid highlight={user?.profile ? rankFor(user.profile.points).name : null} />
        </Container>
      </div>
    </>
  );
}
