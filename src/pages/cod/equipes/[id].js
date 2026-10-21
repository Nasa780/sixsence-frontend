import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuFlag, LuSettings, LuUserPlus } from "react-icons/lu";
import { TeamHero, useTeamInsights } from "../../../components/teams/TeamOverview";
import { MemberRow, RosterHeading } from "../../../components/teams/TeamParts";
import { TeamMatchHistory } from "../../../components/teams/TeamMatchHistory";
import { TeamStats } from "../../../components/teams/TeamStats";
import { CodModeNav } from "../../../components/cod/CodModeNav";
import { Button, ButtonLink } from "../../../components/ui/Button";
import { Container } from "../../../components/ui/Container";
import { EmptyState, Loading, Notice } from "../../../components/ui/Feedback";
import { ReasonDialog } from "../../../components/ui/ReasonDialog";
import { TacticalCard } from "../../../components/ui/TacticalCard";
import { Eyebrow } from "../../../components/ui/Typography";
import useSession from "../../../hooks/useSession";
import { api } from "../../../lib/api";
import { signInWithDiscord } from "../../../lib/auth";
import { REPORT_REASONS, SOCIALS, TEAM_LIMITS } from "../../../lib/teams";

const dateFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

/** Fiche publique d'une équipe : bannière, chiffres, effectif. */
export default function TeamPage() {
  const router = useRouter();
  const { id } = router.query;
  const { userId } = useSession();
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);
  const [mine, setMine] = useState(null);
  const [message, setMessage] = useState(null);
  const [pending, setPending] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [history, setHistory] = useState(null);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setTeam(await api(`/teams/${id}`));
    } catch (caught) {
      setError(caught.message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id) return;
    api(`/teams/${id}/matches`)
      .then((data) => setHistory(data.matches))
      .catch(() => setHistory([]));
  }, [id]);

  useEffect(() => {
    if (!userId) return setMine(null);
    api("/teams/me")
      .then(setMine)
      .catch(() => setMine(null));
  }, [userId]);

  async function apply() {
    if (!userId) return signInWithDiscord(router.asPath);
    setPending(true);
    setMessage(null);
    try {
      const result = await api(`/teams/${id}/requests`, { method: "POST" });
      if (result.teamId) return router.push("/cod/equipe");
      setMessage({ tone: "success", text: "Candidature envoyée : un Leader de l'équipe va te répondre." });
    } catch (caught) {
      setMessage({ tone: "error", text: caught.message });
    } finally {
      setPending(false);
    }
  }

  if (error) {
    return (
      <Container className="pb-16 pt-32">
        <EmptyState title="Équipe introuvable">{error}</EmptyState>
      </Container>
    );
  }
  if (!team) return <Loading />;

  const isMember = team.members.some((member) => member.id === userId);
  const requested = mine?.requests?.some((request) => request.team.id === team.id);
  const socials = SOCIALS.filter((social) => team.socials?.[social.key]);

  return (
    <>
      <Head>
        <title>{`[${team.tag}] ${team.name} — SixSence`}</title>
        <meta name="description" content={team.description || `Équipe ${team.name} de la Division de SixSence.`} />
      </Head>

      {/* Même bannière que Mon équipe ; à la place de « Lancer un match », Gérer mon équipe ou Candidater. */}
      <Container className="space-y-8 pt-28 sm:pt-36">
        <PublicHero
          team={team}
          as="h1"
          subline={team.disbanded ? "Équipe dissoute" : `Fondée le ${dateFr(team.createdAt)}`}
          actions={
            team.disbanded ? null : isMember ? (
              <ButtonLink href="/cod/equipe" size="lg">
                <LuSettings aria-hidden className="h-5 w-5" />
                Gérer mon équipe
              </ButtonLink>
            ) : !mine?.team ? (
              <Button size="lg" onClick={apply} disabled={pending || requested || team.members.length >= TEAM_LIMITS.maxMembers}>
                <LuUserPlus aria-hidden className="h-5 w-5" />
                {requested ? "Candidature envoyée" : team.members.length >= TEAM_LIMITS.maxMembers ? "Équipe complète" : "Candidater"}
              </Button>
            ) : (
              <span />
            )
          }
        />
        <CodModeNav />
      </Container>

      <Container className="space-y-10 py-12">
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

        {/* À propos d'abord, puis l'effectif. */}
        <TacticalCard innerClassName="p-6">
          <Eyebrow>À propos</Eyebrow>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/65">{team.description || "Cette équipe n'a pas encore de description."}</p>
          {socials.length > 0 ? (
            <ul className="mt-5 flex flex-wrap gap-2">
              {socials.map((social) => (
                <li key={social.key}>
                  <a
                    href={team.socials[social.key]}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="clip-slant inline-block bg-white/[0.06] px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-white/75 hover:bg-gold hover:text-ink"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </TacticalCard>

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <section aria-label="Effectif">
            <RosterHeading title="Effectif" count={team.members.length} max={TEAM_LIMITS.maxMembers} gold />
            <ul className="mt-3 space-y-2">
              {team.members.map((member) => (
                <MemberRow key={member.id} member={member} isMe={member.id === userId} />
              ))}
            </ul>
          </section>

          <aside className="space-y-6">
            <TacticalCard innerClassName="p-6">
              <Eyebrow>Derniers matchs</Eyebrow>
              <TeamMatchHistory history={history} />
            </TacticalCard>
            {userId && !isMember ? (
              <button type="button" onClick={() => setReporting(true)} className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-loss">
                <LuFlag aria-hidden className="h-3.5 w-3.5" />
                Signaler cette équipe
              </button>
            ) : null}
            <p>
              <Link href="/cod/equipes" className="group/l inline-flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold transition-colors hover:text-gold-light">
                Classement des équipes
                <span aria-hidden className="h-px w-5 bg-gold/50 transition-all duration-300 group-hover/l:w-10 group-hover/l:bg-gold" />
              </Link>
            </p>
          </aside>
        </div>

        <TeamStats teamId={team.id} points={team.points} position={team.position} />
      </Container>

      <ReasonDialog
        open={reporting}
        onClose={() => setReporting(false)}
        title="Signaler l'équipe"
        intro="Nom, logo, bannière ou description inapproprié : l'équipe SixSence examinera ton signalement."
        reasons={REPORT_REASONS}
        submitLabel="Signaler"
        onSubmit={({ reason, details }) => api(`/teams/${team.id}/report`, { method: "POST", body: { reason, details } })}
      />
    </>
  );
}

/** Bannière de la fiche publique : forme et série lues depuis les matchs de l'équipe (sans l'état « jouer » du visiteur). */
function PublicHero({ team, ...props }) {
  const insights = useTeamInsights(team, { withPlay: false });
  return <TeamHero team={team} insights={insights} {...props} />;
}
