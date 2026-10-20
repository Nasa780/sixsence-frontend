import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuLoaderCircle, LuUserPlus } from "react-icons/lu";
import { TeamCrest } from "../../../../components/teams/TeamParts";
import { Avatar } from "../../../../components/ui/Avatar";
import { Button, ButtonLink } from "../../../../components/ui/Button";
import { Container } from "../../../../components/ui/Container";
import { EmptyState, Loading, Notice } from "../../../../components/ui/Feedback";
import { LoginPrompt } from "../../../../components/ui/LoginPrompt";
import { TacticalCard } from "../../../../components/ui/TacticalCard";
import { Eyebrow } from "../../../../components/ui/Typography";
import useSession from "../../../../hooks/useSession";
import { api } from "../../../../lib/api";
import { TEAM_LIMITS } from "../../../../lib/teams";

/** Arrivée par un lien d'invitation d'équipe : aperçu de l'équipe, puis « Rejoindre » (connexion Discord requise). */
export default function JoinTeamPage() {
  const router = useRouter();
  const { code } = router.query;
  const { userId, loading } = useSession();
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [joinError, setJoinError] = useState(null);

  useEffect(() => {
    if (!code) return;
    api(`/teams/join/${code}`)
      .then((data) => setTeam(data.team))
      .catch((caught) => setError(caught.message));
  }, [code]);

  async function join() {
    setPending(true);
    setJoinError(null);
    try {
      await api(`/teams/join/${code}`, { method: "POST" });
      router.push("/cod/equipe");
    } catch (caught) {
      setJoinError(caught.message);
      setPending(false);
    }
  }

  return (
    <>
      <Head>
        <title>{team ? `Rejoindre [${team.tag}] ${team.name} — SixSence` : "Invitation d'équipe — SixSence"}</title>
      </Head>
      <Container className="max-w-2xl pb-20 pt-32">
        {error ? (
          <EmptyState title="Lien invalide">{error}</EmptyState>
        ) : !team ? (
          <Loading />
        ) : (
          <TacticalCard highlight cut={28} innerClassName="space-y-6 p-6 sm:p-10">
            <Eyebrow>Invitation · Division</Eyebrow>
            <div className="flex items-center gap-5">
              <TeamCrest team={team} size={88} />
              <div className="min-w-0">
                <p className="font-tech text-xs tracking-[0.2em]" style={{ color: team.color }}>
                  [{team.tag}]
                </p>
                <h1 className="mt-1 break-words font-display text-4xl font-black uppercase leading-none sm:text-5xl">{team.name}</h1>
                <p className="mt-2 text-sm text-white/55">
                  {team.members.length} / {TEAM_LIMITS.maxMembers} joueurs · {team.points} pts{team.position ? ` · #${team.position} au classement` : ""}
                </p>
              </div>
            </div>
            <ul className="flex flex-wrap gap-2">
              {team.members.map((member) => (
                <li key={member.id} className="flex items-center gap-2 bg-white/[0.04] px-2.5 py-1.5">
                  <Avatar full src={member.avatarUrl} name={member.username} size={24} />
                  <span className="font-display text-sm font-bold uppercase">{member.username}</span>
                </li>
              ))}
            </ul>
            {joinError ? <Notice tone="error">{joinError}</Notice> : null}
            {loading ? null : userId ? (
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={join} disabled={pending || team.members.length >= TEAM_LIMITS.maxMembers}>
                  {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuUserPlus aria-hidden className="h-5 w-5" />}
                  {team.members.length >= TEAM_LIMITS.maxMembers ? "Équipe complète" : "Rejoindre l'équipe"}
                </Button>
                <ButtonLink href={`/cod/equipes/${team.id}`} variant="ghost" size="lg">
                  Voir la fiche
                </ButtonLink>
              </div>
            ) : (
              <LoginPrompt title="Connecte-toi pour rejoindre l'équipe" text="La connexion se fait avec Discord." next={`/cod/equipes/rejoindre/${code}`} />
            )}
          </TacticalCard>
        )}
      </Container>
    </>
  );
}
