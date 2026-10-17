import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuCrosshair, LuShield } from "react-icons/lu";
import { LeaderboardView } from "./LeaderboardView";
import { OnboardingPanel } from "./OnboardingPanel";
import { RankBadge } from "./RankBadge";
import { Reveal } from "../effects/Reveal";
import { ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { Chip, Notice, StatTile } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow, PageHeader, SectionHeading } from "../ui/Typography";
import { TeamCrest } from "../teams/TeamParts";
import useDisputedMatch from "../../hooks/useDisputedMatch";
import useSeasons from "../../hooks/useSeasons";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { supabase } from "../../lib/supabase";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";

/** Les deux modes de jeu, présentés séparément sur le hub. */
const MODES = [
  {
    key: "classe",
    icon: LuCrosshair,
    eyebrow: "Mode joueur",
    title: "Classé",
    text: "Seul ou en groupe, du 2v2 au 5v5. Tes points, ton rang et ta place au classement des joueurs.",
    facts: ["2v2 → 5v5", "Points individuels", "Rangs Bronze → Légende"],
    primary: { href: "/cod/ranked", label: "Jouer en classé" },
    links: [
      { href: "/cod/leaderboard", label: "Classement des joueurs" },
      { href: "/cod/profile", label: "Mon profil" },
    ],
  },
  {
    key: "team",
    icon: LuShield,
    eyebrow: "Mode équipe",
    title: "Match team",
    text: "Ton équipe de 4 titulaires et 4 remplaçants en BO3 4v4. Les points de l'équipe, son classement et le tournoi de fin de saison.",
    facts: ["BO3 4v4", "Points d'équipe", "Tournoi de fin de saison"],
    primary: { href: "/cod/equipe", label: "Mon équipe" },
    links: [
      { href: "/cod/equipes", label: "Classement des équipes" },
      { href: "/cod/equipes/tournoi", label: "Tournoi" },
    ],
  },
];

const winRate = (wins, losses) => (wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null);

/** Hub COD : résumé du joueur connecté, les deux modes (Classé, Match team) séparés, top joueurs et top équipes. Public. */
export function ModesHub() {
  const { session } = useSession();
  const user = useUser();
  const disputed = useDisputedMatch(user?.id);
  const profile = user?.profile;
  const { label: seasonLabel } = useSeasons();
  const [extra, setExtra] = useState({ position: null, activeMatchId: null });

  useEffect(() => {
    if (!user?.id || !profile) return;
    (async () => {
      const [{ data: active }, positionResult] = await Promise.all([
        supabase.rpc("cod_active_match_id", { p_user: user.id }),
        profile.wins + profile.losses > 0
          ? supabase.from("cod_leaderboard").select("user_id", { count: "exact", head: true }).gt("points", profile.points)
          : Promise.resolve({ count: null }),
      ]);
      setExtra({ activeMatchId: active || null, position: positionResult.count === null ? null : positionResult.count + 1 });
    })();
  }, [user?.id, profile]);

  const rate = profile ? winRate(profile.wins, profile.losses) : null;

  return (
    <>
      <Head>
        <title>Call of Duty — SixSence</title>
      </Head>
      <PageHeader

        image="/images/mw4.webp"
        eyebrow="Call of Duty"
        title={
          <>
            Zone de <span className="text-gold-gradient">combat</span>
          </>
        }
        description={
          user ? `Content de te revoir, ${user.username}. Deux modes t'attendent : le classé et les match team.` : "Recherche & Destruction Hardcore : le classé pour les joueurs (2v2 à 5v5), les match team pour les équipes (BO3 4v4)."
        }
        actions={
          <>
            <ButtonLink href="/cod/ranked" size="lg">
              <LuCrosshair aria-hidden className="h-5 w-5" />
              Classé
            </ButtonLink>
            <ButtonLink href="/cod/equipes" size="lg" variant="outline">
              <LuShield aria-hidden className="h-5 w-5" />
              Match team
            </ButtonLink>
          </>
        }
      />

      <Container className="space-y-16 py-12">
        {session && disputed && !extra.activeMatchId ? (
          <Notice>
            Ton match {disputed.format ? `${disputed.format} ` : ""}sur {disputed.map} est contesté : un arbitre SixSence va trancher.{" "}
            <Link href={`/cod/match/${disputed.id}`} className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              Ouvrir le match
            </Link>
          </Notice>
        ) : null}
        {session && extra.activeMatchId ? (
          <Notice>
            Tu as un match en cours.{" "}
            <Link href={`/cod/match/${extra.activeMatchId}`} className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              Ouvrir le salon de match
            </Link>
          </Notice>
        ) : null}

        {/* Mise en route d'un nouveau joueur (identifiant Activision, notifications, Discord, premier match). */}
        <OnboardingPanel user={user} />

        {profile ? (
          <section aria-label="Mon résumé" className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <RankBadge points={profile.points} showProgress />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Points" value={profile.points} accent />
              <StatTile label="Classement" value={extra.position ? `#${extra.position}` : "—"} />
              <StatTile label="Victoires / Défaites" value={`${profile.wins} / ${profile.losses}`} />
              <StatTile label="Taux de victoire" value={rate === null ? "—" : `${rate}%`} />
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {MODES.map((mode, index) => (
            <Reveal key={mode.key} delay={index * 0.08} className="h-full">
              <TacticalCard highlight={mode.key === "classe"} cut={28} className="h-full" innerClassName={cn("flex h-full flex-col overflow-hidden p-7 sm:p-9", mode.key === "classe" && "holo")}>
                <div aria-hidden className="absolute -right-6 -top-8 select-none font-display text-[9rem] font-black uppercase leading-none text-outline opacity-40">
                  {mode.key === "classe" ? "#1" : "4v4"}
                </div>
                <div className="relative flex h-full flex-col">
                  <mode.icon aria-hidden className="h-10 w-10 text-gold" />
                  <Eyebrow className="mt-6">{mode.eyebrow}</Eyebrow>
                  <h2 className="mt-2 font-display text-5xl font-black uppercase leading-none sm:text-6xl">{mode.title}</h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">{mode.text}</p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {mode.facts.map((fact) => (
                      <li key={fact}>
                        <Chip tone="neutral">{fact}</Chip>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8">
                    <ButtonLink href={mode.primary.href}>
                      <mode.icon aria-hidden className="h-5 w-5" />
                      {mode.primary.label}
                    </ButtonLink>
                    {mode.links.map((link) => (
                      <Link key={link.href} href={link.href} className="inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-light">
                        {link.label}
                        <LuArrowRight aria-hidden className="h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </TacticalCard>
            </Reveal>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-12 xl:grid-cols-[3fr_2fr]">
          <section aria-labelledby="titre-top10">
            <SectionHeading eyebrow={`${seasonLabel} · Classé`} title={<span id="titre-top10">Top 10 joueurs</span>} />
            <div className="mt-8">
              <LeaderboardView limit={10} currentUserId={user?.id ?? null} compact />
            </div>
          </section>
          <TopTeams label={seasonLabel} />
        </div>
      </Container>
    </>
  );
}

/** Top 5 des équipes (mode Match team). */
function TopTeams({ label }) {
  const [teams, setTeams] = useState(null);
  useEffect(() => {
    api("/teams")
      .then((data) => setTeams(data.teams.slice(0, 5)))
      .catch(() => setTeams([]));
  }, []);

  return (
    <section aria-labelledby="titre-top-equipes">
      <SectionHeading eyebrow={`${label} · Match team`} title={<span id="titre-top-equipes">Top équipes</span>} />
      <div className="mt-8">
        {teams === null ? null : teams.length === 0 ? (
          <p className="text-sm text-white/50">
            Aucune équipe pour l&apos;instant.{" "}
            <Link href="/cod/equipes/creer" className="font-semibold text-gold underline underline-offset-4 hover:text-gold-light">
              Crée la première
            </Link>
            .
          </p>
        ) : (
          <ol className="space-y-1.5">
            {teams.map((team) => (
              <li key={team.id}>
                <Link href={`/cod/equipes/${team.id}`} className="flex items-center gap-3 border-l-2 border-transparent bg-white/[0.03] px-4 py-3 transition-colors hover:border-gold hover:bg-white/[0.06]">
                  <span className="w-6 font-tech text-sm font-bold tabular-nums text-white/50">{team.position}</span>
                  <TeamCrest team={team} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg font-bold uppercase leading-none tracking-wide">{team.name}</span>
                    <span className="mt-1 block font-tech text-[10px] tracking-[0.2em]" style={{ color: team.color }}>
                      [{team.tag}]
                    </span>
                  </span>
                  <span className="font-tech text-base font-bold tabular-nums text-gold">{team.points}</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
        <Link href="/cod/equipes" className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-light">
          Classement des équipes
          <LuArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
