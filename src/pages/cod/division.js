import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import { LuPlus, LuShield } from "react-icons/lu";
import { GoldParticles } from "../../components/effects/GoldParticles";
import { PlayPanel } from "../../components/teams/PlayPanel";
import { ButtonLink } from "../../components/ui/Button";
import { Container } from "../../components/ui/Container";
import { Loading, Notice, StatTile } from "../../components/ui/Feedback";
import { LoginPrompt } from "../../components/ui/LoginPrompt";
import { TacticalCard } from "../../components/ui/TacticalCard";
import { Eyebrow, PageHeader } from "../../components/ui/Typography";
import useSession from "../../hooks/useSession";
import { api } from "../../lib/api";

const RULES = [
  { title: "Le Leader lance", text: "Un Leader choisit les 4 joueurs du match dans l'effectif et lance la recherche. Pas de « Prêt ? » : le match démarre dès qu'une autre équipe est trouvée." },
  { title: "Adversaire anonyme", text: "Tu ne sais pas contre qui tu joues avant le match, et deux équipes ne peuvent pas se retrouver avant 2 heures." },
  { title: "30 minutes de recherche", text: "5 minutes avant la fin, « Toujours là ? » : un Leader ou un joueur inscrit clique sur « Continuer », sinon la recherche s'arrête." },
  { title: "BO3 · 3 maps au hasard", text: "Les 3 maps sont tirées au sort dès le départ, 6 manches gagnantes par map ; la 3e n'est jouée qu'à 1-1." },
  { title: "L'hôte donne le code", text: "L'équipe hôte, tirée au sort, crée la partie privée et donne son code sous 10 minutes. Les deux équipes confirment leur présence en jeu sous 15 minutes, sinon forfait." },
  { title: "Un seul résultat", text: "À la fin de la série, un joueur déclare le score de chaque map ; l'équipe adverse confirme une fois. En cas de litige, un arbitre tranche." },
];

/** File de la Division : recherche d'un match pour son équipe (comme la file classée), règles, compteurs. */
export default function DivisionQueuePage() {
  const { session, loading } = useSession();
  const [status, setStatus] = useState(null);
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  // Compteurs publics, rafraîchis toutes les 10 secondes.
  useEffect(() => {
    let active = true;
    const load = () =>
      api("/teams/status")
        .then((data) => active && setStatus(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, 10_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const loadTeam = useCallback(() => {
    api("/teams/me")
      .then((data) => {
        setState(data);
        setError(null);
      })
      .catch((caught) => setError(caught.message));
  }, []);

  useEffect(() => {
    if (session) loadTeam();
  }, [session, loadTeam]);

  const team = state?.team ?? null;
  const isLeader = Boolean(state?.me && (state.me.crown || state.me.role === "leader"));
  const size = status?.rosterSize ?? 4;

  return (
    <>
      <Head>
        <title>File Division — SixSence</title>
      </Head>

      <PageHeader
        image="/images/mw4.webp"
        eyebrow={`Division · BO3 ${size}v${size} · R&D Hardcore`}
        title={
          <>
            File <span className="text-gold-gradient">Division</span>
          </>
        }
        description="Lance la recherche avec ton équipe : dès qu'un adversaire est trouvé, la feuille de match s'ouvre, avec un son et une notification."
        actions={
          <div className="grid grid-cols-3 gap-3">
            <StatTile label="En recherche" value={status ? status.teamsSearching : "—"} accent />
            <StatTile label="En cours" value={status ? status.matchesInProgress : "—"} />
            <StatTile label="Équipes" value={status ? status.activeTeams : "—"} />
          </div>
        }
      />

      <div className="relative isolate">
        <GoldParticles id="particules-division" density={60} className="-z-10 mask-fade" />

        <Container className="grid grid-cols-1 gap-10 py-12 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            {loading ? (
              <Loading />
            ) : !session ? (
              <LoginPrompt title="Connecte-toi pour jouer en Division" text="La file Division est réservée aux joueurs connectés avec Discord et membres d'une équipe." next="/cod/division" />
            ) : error ? (
              <Notice tone="error">{error}</Notice>
            ) : !state ? (
              <Loading label="Chargement de ton équipe…" />
            ) : team ? (
              <PlayPanel team={team} isLeader={isLeader} />
            ) : (
              <NoTeamCard />
            )}
          </div>

          <aside aria-labelledby="titre-regles-division">
            <Eyebrow>Règles</Eyebrow>
            <h2 id="titre-regles-division" className="mt-3 font-display text-4xl font-black uppercase leading-none">
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
      </div>
    </>
  );
}

function NoTeamCard() {
  return (
    <TacticalCard highlight cut={24} innerClassName="p-6 sm:p-8">
      <LuShield aria-hidden className="h-9 w-9 text-gold" />
      <p className="mt-4 font-display text-3xl font-black uppercase leading-none sm:text-4xl">Il te faut une équipe</p>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/60">
        La Division se joue en équipe. Crée la tienne, ou rejoins-en une : accepte une invitation ou envoie une candidature depuis le classement des équipes.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink href="/cod/equipes/creer" size="lg">
          <LuPlus aria-hidden className="h-5 w-5" />
          Créer une équipe
        </ButtonLink>
        <ButtonLink href="/cod/equipe" size="lg" variant="outline">
          Mes invitations
        </ButtonLink>
        <ButtonLink href="/cod/equipes" size="lg" variant="ghost">
          Classement des équipes
        </ButtonLink>
      </div>
    </TacticalCard>
  );
}
