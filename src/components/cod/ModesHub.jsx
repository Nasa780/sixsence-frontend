import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuCrosshair, LuShield, LuTrophy } from "react-icons/lu";
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
    univers: "classe",
    image: "/images/modes/classe.webp",
    watermark: "#1",
    icon: LuCrosshair,
    eyebrow: "Mode joueur",
    title: "Classé",
    text: "En solo, du 2v2 au 5v5. Tes points, ton rang et ta place au classement des joueurs.",
    facts: ["2v2 → 5v5", "Points individuels", "Rangs Bronze → Légende"],
    primary: { href: "/cod/ranked", label: "Jouer en classé" },
    links: [
      { href: "/cod/leaderboard", label: "Classement des joueurs" },
      { href: "/cod/profile", label: "Mon profil" },
    ],
  },
  {
    key: "team",
    univers: "division",
    image: "/images/modes/division.jpg",
    watermark: "4v4",
    icon: LuShield,
    eyebrow: "Mode équipe",
    title: "Division",
    text: "Ton équipe jusqu'à 8 joueurs en BO3 4v4, le Leader choisit les 4 de chaque match. Les points de l'équipe et son classement en direct.",
    facts: ["BO3 4v4", "Points d'équipe", "Classement des équipes"],
    primary: { href: "/cod/division", label: "Jouer en Division" },
    links: [
      { href: "/cod/equipe", label: "Mon équipe" },
      { href: "/cod/equipes", label: "Classement des équipes" },
    ],
  },
  {
    key: "tournoi",
    univers: "tournoi",
    image: "/images/modes/tournoi.webp",
    watermark: "BO5",
    icon: LuTrophy,
    eyebrow: "Fin de saison",
    title: "Tournoi",
    text: "Les meilleures équipes de la Division s'affrontent à la fin de la saison : élimination directe en BO3, finale en BO5.",
    facts: ["Top du classement", "BO3, finale BO5", "Trophée et rôle Discord"],
    primary: { href: "/cod/tournoi", label: "Voir le tournoi" },
    links: [],
  },
];

const winRate = (wins, losses) => (wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : null);

/** Hub COD : résumé du joueur connecté, les trois sections (Classé, Division, Tournoi) séparées, top joueurs et top équipes. Public. */
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
          user ? `Content de te revoir, ${user.username}. Classé, Division et Tournoi t'attendent.` : "Recherche & Destruction Hardcore : le classé en solo (2v2 à 5v5), la Division pour les équipes (BO3 4v4) et le tournoi de fin de saison."
        }
        actions={
          <>
            <span data-univers="classe">
              <ButtonLink href="/cod/ranked" size="lg">
                <LuCrosshair aria-hidden className="h-5 w-5" />
                Classé
              </ButtonLink>
            </span>
            <span data-univers="division">
              <ButtonLink href="/cod/division" size="lg" variant="outline">
                <LuShield aria-hidden className="h-5 w-5" />
                Division
              </ButtonLink>
            </span>
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {MODES.map((mode, index) => (
            <Reveal key={mode.key} delay={index * 0.08} className="h-full">
              <div data-univers={mode.univers} className="group/card h-full transition duration-300 hover:-translate-y-1">
              <TacticalCard highlight cut={28} className="h-full" innerClassName="flex h-full flex-col overflow-hidden p-7 sm:p-9">
                {/* Visuel du mode en haut de la carte, fondu vers le bas, teinté de la couleur du mode. */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-60 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mode.image} alt="" className="h-full w-full object-cover object-[50%_22%] opacity-40 transition duration-500 group-hover/card:scale-105 group-hover/card:opacity-55" />
                  <div className="absolute inset-0 bg-gold/20 mix-blend-color" />
                  <div className="absolute inset-0 bg-linear-to-b from-ink/10 via-ink/60 to-ink-800" />
                </div>
                <div aria-hidden className="pointer-events-none absolute -left-10 top-1/3 h-56 w-56 rounded-full bg-gold/10 blur-3xl transition group-hover/card:bg-gold/20" />
                <div aria-hidden className="absolute -right-6 -top-8 select-none font-display text-[9rem] font-black uppercase leading-none text-outline opacity-30">
                  {mode.watermark}
                </div>
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-14 w-14 place-items-center border border-gold/50 bg-ink/70 clip-corner backdrop-blur-sm">
                      <mode.icon aria-hidden className="h-7 w-7 text-gold" />
                    </span>
                    <LiveBadge mode={mode.key} />
                  </div>
                  <Eyebrow className="mt-16">{mode.eyebrow}</Eyebrow>
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
              </div>
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

/** Info en direct sur chaque carte : joueurs en file (Classé), équipes en recherche (Division), prochain tournoi. */
function LiveBadge({ mode }) {
  const [text, setText] = useState(null);
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        if (mode === "classe") {
          const status = await api("/cod/status");
          if (alive) setText(`${status.playersInQueue} en file · ${status.matchesInProgress} en jeu`);
        } else if (mode === "team") {
          const status = await api("/teams/status");
          if (alive) setText(`${status.teamsSearching} équipe${status.teamsSearching > 1 ? "s" : ""} en recherche`);
        } else {
          const { tournament } = await api("/teams/tournament");
          if (!alive) return;
          if (!tournament || tournament.status === "completed" || tournament.status === "cancelled") setText("Aucun tournoi prévu");
          else if (tournament.status === "running") setText("En cours");
          else setText(new Date(tournament.startsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }));
        }
      } catch {
        // Info facultative.
      }
    };
    load();
    const timer = setInterval(load, 20_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [mode]);
  if (!text) return null;
  return (
    <span className="inline-flex items-center gap-2 border border-gold/40 bg-ink/70 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
      <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold" />
      {text}
    </span>
  );
}

/** Top 5 des équipes (Division). */
function TopTeams({ label }) {
  const [teams, setTeams] = useState(null);
  useEffect(() => {
    api("/teams")
      .then((data) => setTeams(data.teams.slice(0, 10)))
      .catch(() => setTeams([]));
  }, []);

  return (
    <section aria-labelledby="titre-top-equipes">
      <SectionHeading eyebrow={`${label} · Division`} title={<span id="titre-top-equipes">Top équipes</span>} />
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
          <>
            {/* Même structure que le Top 10 joueurs (ligne d'état, en-têtes, lignes de même hauteur) : les deux listes s'alignent. */}
            {/* Même design que « Mis à jour en direct » (Top 10 joueurs), dans la couleur de la Division : garde aussi les deux listes alignées. */}
            <p data-univers="division" className="mb-6 inline-flex items-center gap-2 text-xs text-gold">
              <span aria-hidden className="h-1.5 w-1.5 animate-pulse-gold bg-gold" />
              {teams.length} équipe{teams.length > 1 ? "s" : ""} au classement
            </p>
            <div className="mt-1.5 grid grid-cols-[4rem_minmax(0,1fr)_auto_auto] gap-x-4 py-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/40">
              <span className="px-4">Rang</span>
              <span>Équipe</span>
              <span className="text-right">V / D</span>
              <span className="pr-4 text-right">Points</span>
            </div>
            <ol className="mt-3 space-y-1.5">
              {teams.map((team) => (
                <li key={team.id}>
                  <Link
                    href={`/cod/equipes/${team.id}`}
                    className="grid grid-cols-[4rem_minmax(0,1fr)_auto_auto] min-h-[3.875rem] items-center gap-x-4 border-l-2 border-transparent bg-white/[0.03] py-3 transition-colors hover:border-gold hover:bg-white/[0.06]"
                  >
                    <span className="px-4 font-tech text-sm font-bold tabular-nums text-white/50">{team.position}</span>
                    <span className="flex min-w-0 items-center gap-3">
                      <TeamCrest team={team} size={34} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-lg font-bold uppercase leading-none tracking-wide">{team.name}</span>
                        <span className="mt-1 block font-tech text-[10px] tracking-[0.2em]" style={{ color: team.color }}>
                          <span className="normal-case">[{team.tag}]</span>
                        </span>
                      </span>
                    </span>
                    <span className="whitespace-nowrap text-right text-sm tabular-nums text-white/70">
                      {team.wins} / {team.losses}
                    </span>
                    <span className="pr-4 text-right font-tech text-base font-bold tabular-nums text-gold">{team.points}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </>
        )}
        <Link href="/cod/equipes" className="mt-5 inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-light">
          Classement des équipes
          <LuArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
