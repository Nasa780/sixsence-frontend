import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuCheck, LuFlag, LuSettings, LuShare2, LuUserPlus } from "react-icons/lu";
import { TeamHero, useTeamInsights } from "../../../components/teams/TeamOverview";
import { MemberRow, RosterHeading } from "../../../components/teams/TeamParts";
import { TeamTrophyCase } from "../../../components/teams/TeamTrophyCase";
import { RecruitingBanner, TeamStrength } from "../../../components/teams/TeamExtras";
import { TeamMatchHistory } from "../../../components/teams/TeamMatchHistory";
import { TeamStats } from "../../../components/teams/TeamStats";
import { ChallengeButton } from "../../../components/teams/Challenges";
import { leagueOf } from "../../../lib/leagues";
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
import { SITE_URL } from "../../../lib/config";
import { supabaseRest } from "../../../lib/og";

const dateFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Balises de partage calculées côté serveur (Discord lit la page sans son JavaScript) : titre de l'équipe
 * et carte d'équipe /api/og/team. Le reste de la fiche se charge ensuite dans le navigateur.
 */
export async function getServerSideProps({ params, res }) {
  const id = typeof params?.id === "string" ? params.id : "";
  if (!UUID.test(id)) return { props: { meta: null } };
  try {
    const teams = await supabaseRest(`teams?id=eq.${id}&select=name,tag,points,wins,losses,trophies,disbanded_at,cup_tournament`);
    const team = teams[0];
    if (!team || team.cup_tournament) return { props: { meta: null } };
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
    return { props: { meta: { id, name: team.name, tag: team.tag, points: team.points, wins: team.wins, losses: team.losses, trophies: (team.trophies ?? []).length } } };
  } catch {
    return { props: { meta: null } };
  }
}

/** Fiche publique d'une équipe : aperçu des liens (carte d'équipe), puis la fiche. */
export default function TeamPage({ meta }) {
  // Le paramètre v change avec les résultats : Discord recharge la carte à chaque évolution.
  const image = meta ? `${SITE_URL}/api/og/team?id=${meta.id}&v=t2-${meta.points}-${meta.wins}-${meta.losses}-${meta.trophies}` : null;
  return (
    <>
      <Head>
        {meta ? <meta key="og:title" property="og:title" content={`Équipe · [${meta.tag}] ${meta.name}`} /> : null}
        {meta ? <meta key="og:description" property="og:description" content="" /> : null}
        {image ? <meta key="og:image" property="og:image" content={image} /> : null}
        {image ? <meta key="og:image:alt" property="og:image:alt" content={`Carte de l'équipe ${meta.name}`} /> : null}
      </Head>
      <TeamSheet />
    </>
  );
}

function TeamSheet() {
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
  const [shared, setShared] = useState(false);

  // Partager la fiche : partage natif sur téléphone, sinon lien copié (carte d'équipe en aperçu sur Discord).
  async function share() {
    const url = `${SITE_URL}/cod/equipes/${id}`;
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title: `[${team.tag}] ${team.name} — SixSence`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    } catch {
      window.prompt("Copie ce lien :", url);
    }
  }

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
          subline={team.disbanded ? "Équipe dissoute" : `Fondée le ${dateFr(team.createdAt)}${leagueOf(team.league) ? ` · ${leagueOf(team.league).label}` : ""}`}
          actions={
            <div className="flex flex-wrap items-center gap-3">
            {team.disbanded ? null : (
              <Button size="lg" variant="outline" onClick={share}>
                {shared ? <LuCheck aria-hidden className="h-5 w-5" /> : <LuShare2 aria-hidden className="h-5 w-5" />}
                {shared ? "Lien copié" : "Partager"}
              </Button>
            )}
            {team.disbanded || isMember || !userId ? null : <ChallengeButton target={team} />}
            {team.disbanded ? null : isMember ? (
              <ButtonLink href="/cod/equipe" size="lg">
                <LuSettings aria-hidden className="h-5 w-5" />
                Gérer mon équipe
              </ButtonLink>
            ) : !mine?.team ? (
              <Button size="lg" onClick={apply} disabled={pending || requested || team.recruiting === false || team.members.length >= TEAM_LIMITS.maxMembers}>
                <LuUserPlus aria-hidden className="h-5 w-5" />
                {requested ? "Candidature envoyée" : team.members.length >= TEAM_LIMITS.maxMembers ? "Équipe complète" : team.recruiting === false ? "Recrutement fermé" : "Candidater"}
              </Button>
            ) : null}
            </div>
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

        {/* Recrutement (ouvert avec le message des Leaders, ou fermé) et force de l'équipe. */}
        {team.disbanded ? null : (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-stretch">
            <RecruitingBanner team={team} />
            <TeamStrength strength={team.strength} />
          </div>
        )}

        <TeamTrophyCase trophies={team.trophies} />

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
