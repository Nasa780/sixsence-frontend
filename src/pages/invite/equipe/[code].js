import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuLoaderCircle, LuShield, LuUserPlus } from "react-icons/lu";
import { TeamCrest } from "../../../components/teams/TeamParts";
import { Button, ButtonLink } from "../../../components/ui/Button";
import { InviteLanding } from "../../../components/ui/InviteLanding";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";
import { fetchInvitePreview } from "../../../lib/invites";
import { SITE_URL } from "../../../lib/config";
import { TEAM_LIMITS } from "../../../lib/teams";

/** Arrivée par un lien d'invitation d'équipe (/invite/equipe/CODE) : aperçu de l'équipe, puis « Rejoindre l'équipe ». */
export default function TeamInvitePage({ code, initialTeam }) {
  const router = useRouter();
  const { userId, loading } = useSession();
  const [team, setTeam] = useState(initialTeam);
  const [invalid, setInvalid] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api(`/teams/join/${encodeURIComponent(code)}`)
      .then((data) => setTeam(data.team))
      .catch((caught) => setInvalid(caught.message || "Ce lien ne marche plus. Demande un nouveau lien au Leader de l'équipe."));
  }, [code]);

  async function join() {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/join/${encodeURIComponent(code)}`, { method: "POST" });
      router.push("/cod/equipe");
    } catch (caught) {
      setError(caught.message);
      setPending(false);
    }
  }

  const full = team ? team.members.length >= TEAM_LIMITS.maxMembers : false;

  return (
    <InviteLanding
      meta={{
        title: team ? `Rejoins [${team.tag}] ${team.name}` : "Invitation d'équipe",
        description: team
          ? `Invitation à rejoindre [${team.tag}] ${team.name} en Division : ${team.members.length} / ${TEAM_LIMITS.maxMembers} joueurs, ${team.points} pts.`
          : "Invitation à rejoindre une équipe de Division sur SixSence.",
        // Aperçu du lien sur Discord : la carte de l'équipe, bandeau « Invitation ».
        image: team?.id ? `${SITE_URL}/api/og/team?id=${team.id}&invite=1&v=i1-${team.points}-${team.members.length}` : undefined,
      }}
      hero={{
        eyebrow: "Division MW4",
        title: (
          <>
            Rejoins l&apos;<span className="text-gold-gradient">équipe</span>
          </>
        ),
        description: "Tes mates t'attendent : un clic et tu fais partie de l'effectif.",
      }}
      invalid={invalid}
      ready={Boolean(team)}
      card={
        team
          ? {
              label: "Invitation · Division",
              icon: LuShield,
              visual: <TeamCrest team={team} size={88} />,
              overline: <span style={{ color: team.color }}>[{team.tag}]</span>,
              name: team.name,
              line: `${team.members.length} / ${TEAM_LIMITS.maxMembers} joueurs · ${team.points} pts${team.position ? ` · #${team.position} au classement` : ""}`,
              members: team.members,
            }
          : null
      }
      error={error}
      signedIn={Boolean(userId)}
      sessionLoading={loading}
      loginTitle="Connecte-toi pour rejoindre l'équipe"
      loginText="La connexion se fait avec Discord."
      next={`/invite/equipe/${code}`}
      actions={
        <>
          <Button size="lg" onClick={join} disabled={pending || full}>
            {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuUserPlus aria-hidden className="h-5 w-5" />}
            {full ? "Équipe complète" : "Rejoindre l'équipe"}
          </Button>
          {team ? (
            <ButtonLink href={`/cod/equipes/${team.id}`} variant="ghost" size="lg">
              Voir la fiche
            </ButtonLink>
          ) : null}
        </>
      }
    />
  );
}

export async function getServerSideProps({ params }) {
  const code = String(params.code ?? "");
  const preview = await fetchInvitePreview(`/teams/join/${encodeURIComponent(code)}`);
  return { props: { code, initialTeam: preview?.team ?? null } };
}
