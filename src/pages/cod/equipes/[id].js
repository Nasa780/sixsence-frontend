import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LuFlag, LuSettings, LuTrophy, LuUserPlus } from "react-icons/lu";
import { MemberRow, RosterHeading, TeamCrest } from "../../../components/teams/TeamParts";
import { TeamStats } from "../../../components/teams/TeamStats";
import { CodModeNav } from "../../../components/cod/CodModeNav";
import { Button, ButtonLink } from "../../../components/ui/Button";
import { Container } from "../../../components/ui/Container";
import { Chip, EmptyState, Loading, Notice, StatTile } from "../../../components/ui/Feedback";
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

  const starters = team.members.filter((member) => member.starter);
  const subs = team.members.filter((member) => !member.starter);
  const isMember = team.members.some((member) => member.id === userId);
  const requested = mine?.requests?.some((request) => request.team.id === team.id);
  const socials = SOCIALS.filter((social) => team.socials?.[social.key]);

  return (
    <>
      <Head>
        <title>{`[${team.tag}] ${team.name} — SixSence`}</title>
        <meta name="description" content={team.description || `Équipe ${team.name} du mode Match team de SixSence.`} />
      </Head>

      <header className="relative isolate overflow-hidden border-b border-white/10 pb-10 pt-28 sm:pb-14 sm:pt-36">
        {team.bannerUrl ? (
          <img src={team.bannerUrl} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-60" />
        ) : (
          <div aria-hidden className="absolute inset-0 -z-20" style={{ background: `radial-gradient(ellipse at 80% 20%, ${team.color}55, transparent 60%)` }} />
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/75 to-ink/10" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-transparent to-ink/40" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-40 mask-fade" />
        <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-5">
            <TeamCrest team={team} size={104} />
            <div className="min-w-0">
              <Eyebrow>
                Match team · <span style={{ color: team.color }}>[{team.tag}]</span>
              </Eyebrow>
              <h1 className="mt-3 break-words font-display text-5xl font-black uppercase leading-[0.9] sm:text-7xl">{team.name}</h1>
              <p className="mt-3 text-sm text-white/55">
                {team.disbanded ? "Équipe dissoute" : `Fondée le ${dateFr(team.createdAt)}`} · {team.members.length} / {TEAM_LIMITS.maxMembers} joueurs
              </p>
              {team.trophies?.length ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {team.trophies.map((trophy) => (
                    <li key={`${trophy.tournamentId}-${trophy.place}`}>
                      <Chip tone={trophy.place === "winner" ? "gold" : "neutral"}>
                        <LuTrophy aria-hidden className="h-3 w-3" />
                        {trophy.place === "winner" ? "Vainqueur" : "Finaliste"} · {trophy.name}
                      </Chip>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          {!team.disbanded ? (
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {isMember ? (
                <ButtonLink href="/cod/equipe" size="lg">
                  <LuSettings aria-hidden className="h-5 w-5" />
                  Gérer mon équipe
                </ButtonLink>
              ) : !mine?.team ? (
                <Button size="lg" onClick={apply} disabled={pending || requested || team.members.length >= TEAM_LIMITS.maxMembers}>
                  <LuUserPlus aria-hidden className="h-5 w-5" />
                  {requested ? "Candidature envoyée" : team.members.length >= TEAM_LIMITS.maxMembers ? "Équipe complète" : "Candidater"}
                </Button>
              ) : null}
            </div>
          ) : null}
        </Container>
        <Container className="mt-8">
          <CodModeNav />
        </Container>
      </header>

      <Container className="space-y-10 py-12">
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Classement" value={team.position ? `#${team.position}` : "—"} accent />
          <StatTile label="Points" value={team.points} />
          <StatTile label="Victoires / Défaites" value={`${team.wins} / ${team.losses}`} />
          <StatTile
            label="Tournoi"
            value={`${Math.min(team.played, TEAM_LIMITS.qualifyMatches)} / ${TEAM_LIMITS.qualifyMatches}`}
            hint={team.played >= TEAM_LIMITS.qualifyMatches ? "Qualifiable" : "Matchs avant d'être qualifiable"}
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <section aria-label="Effectif">
            <RosterHeading title="Titulaires" count={starters.length} max={TEAM_LIMITS.maxStarters} gold />
            {starters.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {starters.map((member) => (
                  <MemberRow key={member.id} member={member} isMe={member.id === userId} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-white/45">Aucun titulaire.</p>
            )}
            <RosterHeading title="Remplaçants" count={subs.length} max={TEAM_LIMITS.maxMembers - TEAM_LIMITS.maxStarters} className="mt-10" />
            {subs.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {subs.map((member) => (
                  <MemberRow key={member.id} member={member} isMe={member.id === userId} />
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-white/45">Aucun remplaçant pour l&apos;instant.</p>
            )}
          </section>

          <aside className="space-y-6">
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
            <TacticalCard innerClassName="p-6">
              <Eyebrow>Derniers matchs</Eyebrow>
              <MatchHistory history={history} />
            </TacticalCard>
            {userId && !isMember ? (
              <button type="button" onClick={() => setReporting(true)} className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-loss">
                <LuFlag aria-hidden className="h-3.5 w-3.5" />
                Signaler cette équipe
              </button>
            ) : null}
            <p>
              <Link href="/cod/equipes" className="text-sm font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
                Classement des équipes
              </Link>
            </p>
          </aside>
        </div>

        <TeamStats teamId={team.id} />
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

/** Derniers matchs d'équipe : adversaire, maps gagnées, points. */
function MatchHistory({ history }) {
  if (history === null) return <p className="mt-4 text-sm text-white/45">Chargement…</p>;
  if (history.length === 0) return <p className="mt-4 text-sm text-white/45">Aucun match d&apos;équipe pour l&apos;instant.</p>;
  return (
    <ul className="mt-4 space-y-2">
      {history.map((match) => (
        <li key={match.id}>
          <Link
            href={`/cod/equipes/match/${match.id}`}
            className="flex items-center gap-3 border-l-2 border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm transition hover:bg-white/[0.06]"
          >
            <TeamCrest team={match.opponent} size={30} />
            <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase leading-none">{match.opponent?.name ?? "Équipe"}</span>
            {match.status === "completed" ? (
              <span className={match.won ? "font-tech text-sm font-bold text-win" : "font-tech text-sm font-bold text-loss"}>
                {match.mapsFor} – {match.mapsAgainst}
                {typeof match.points === "number" ? <span className="ml-2">{match.points >= 0 ? `+${match.points}` : match.points}</span> : null}
              </span>
            ) : (
              <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-gold">En cours</span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
