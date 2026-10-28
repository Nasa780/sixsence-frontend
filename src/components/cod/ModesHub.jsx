import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuCrosshair, LuCrown, LuShield, LuTrophy } from "react-icons/lu";
import { LeaderboardView } from "./LeaderboardView";
import { ActiveMatchBanner } from "./ActiveMatchBanner";
import { MySeason } from "./MySeason";
import { OnboardingPanel } from "./OnboardingPanel";
import { Reveal } from "../effects/Reveal";
import { ButtonLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { Chip, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow, PageHeader, SectionHeading } from "../ui/Typography";
import { TeamCrest } from "../teams/TeamParts";
import useDisputedMatch from "../../hooks/useDisputedMatch";
import useLive from "../../hooks/useLive";
import useSeasons from "../../hooks/useSeasons";
import useSession from "../../hooks/useSession";
import useUser from "../../hooks/useUser";
import { supabase } from "../../lib/supabase";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { HubHighlights, SHOW_WEEK_HIGHLIGHTS } from "./HubHighlights";

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
    lead: "Prouve ton niveau.",
    text: "Affronte la communauté du 2v2 au 5v5, gagne des points et grimpe jusqu'au rang Légende.",
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
    lead: "Bâtis ton escouade.",
    text: "Forme une équipe jusqu'à 8 joueurs, aligne ton meilleur 4v4 en BO3 et domine le classement général.",
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
    lead: "Décroche le titre.",
    text: "Les meilleures équipes de la Division s'affrontent en arbre final pour la gloire et les récompenses.",
    facts: ["Top du classement", "BO3, finale BO5", "Trophée et rôle Discord"],
    primary: { href: "/cod/tournoi", label: "Voir le tournoi" },
    links: [
      { href: "/cod/equipes", label: "Équipes qualifiables" },
      { href: "/reglement#tournoi", label: "Règlement du tournoi" },
    ],
  },
];


/** Hub COD : « Ma saison » du joueur connecté, les trois sections (Classé, Division, Tournoi) séparées, top joueurs et top équipes. Public. */
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
            <ButtonLink href="/cod/ranked" size="lg">
              <LuCrosshair aria-hidden className="h-5 w-5" />
              Classé
            </ButtonLink>
            <ButtonLink href="/cod/division" size="lg" variant="outline">
              <LuShield aria-hidden className="h-5 w-5" />
              Division
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
        {session && extra.activeMatchId ? <ActiveMatchBanner matchId={extra.activeMatchId} /> : null}

        {/* Ma saison : Classé et Division du joueur connecté, en une ligne. */}
        {profile ? <MySeason profile={profile} position={extra.position} /> : null}

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
                  <div className="flex h-14 items-center justify-between gap-3">
                    <mode.icon aria-hidden className="h-10 w-10 shrink-0 text-gold drop-shadow-[0_0_14px_color-mix(in_srgb,var(--color-gold)_55%,transparent)]" />
                    <LiveBadge mode={mode.key} />
                  </div>
                  <Eyebrow className="mt-16">{mode.eyebrow}</Eyebrow>
                  <h2 className="mt-2 font-display text-5xl font-black uppercase leading-none sm:text-6xl">{mode.title}</h2>
                  <p className="mt-4 min-h-[5.75rem] max-w-md text-sm leading-relaxed text-white/60">
                    <span className="font-semibold text-white">{mode.lead}</span> {mode.text}
                  </p>
                  <ul className="mt-5 flex min-h-[4rem] flex-wrap content-start gap-2">
                    {mode.facts.map((fact) => (
                      <li key={fact}>
                        <Chip tone="neutral">{fact}</Chip>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-8">
                    <ButtonLink href={mode.primary.href}>
                      <mode.icon aria-hidden className="h-5 w-5" />
                      {mode.primary.label}
                    </ButtonLink>
                    <ModeLinks links={mode.links} />
                  </div>
                </div>
              </TacticalCard>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Premiers pas : compte, puis parcours Classé ou Division (onglets). */}
        <OnboardingPanel user={user} />


        {/* Joueur et match de la semaine, fil d'activité en direct. */}
        {SHOW_WEEK_HIGHLIGHTS ? <HubHighlights /> : null}

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

/** Liens secondaires d'une carte : une ligne par lien, trait qui s'allonge au survol. */
function ModeLinks({ links }) {
  return (
    <div className="mt-5 border-t border-white/10">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group/l flex items-center justify-between gap-4 border-b border-white/10 py-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-white/70 transition-colors hover:text-gold"
        >
          {link.label}
          <span aria-hidden className="h-px w-5 bg-gold/50 transition-all duration-300 group-hover/l:w-10 group-hover/l:bg-gold" />
        </Link>
      ))}
    </div>
  );
}

/**
 * Info sur chaque carte (GET /live, partagé avec l'accueil) : jamais de zéro. Au calme, une info utile sans point
 * clignotant (file ouverte, équipes actives, prochaine coupe) ; le point pulse dès qu'il se passe quelque chose.
 */
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
function badgeOf(mode, live) {
  if (mode === "classe") {
    const c = live.classe;
    if (!c) return { text: "File ouverte · 2v2 à 5v5", hot: false };
    return { text: [c.inQueue ? `${c.inQueue} en file` : null, c.inProgress ? `${c.inProgress} en jeu` : null].filter(Boolean).join(" · "), hot: true };
  }
  if (mode === "team") {
    const d = live.division;
    if (d?.inProgress) return { text: `${plural(d.inProgress, "match")} en cours`, hot: true };
    if (d?.searching) return { text: `${plural(d.searching, "équipe")} en recherche`, hot: true };
    return live.activeTeams ? { text: `${plural(live.activeTeams, "équipe")} ${live.activeTeams > 1 ? "actives" : "active"}`, hot: false } : null;
  }
  const cup = live.cup;
  if (!cup) return null;
  if (cup.phase === "checkin") return { text: "Check-in ouvert", hot: true };
  if (cup.phase === "drawn" || cup.phase === "running") return { text: `${cup.name} en cours`, hot: true };
  return { text: `${cup.name} · ${new Date(cup.startsAt).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}`, hot: false };
}

function LiveBadge({ mode }) {
  const live = useLive();
  const badge = live ? badgeOf(mode, live) : null;
  if (!badge) return null;
  return (
    <span className="inline-flex max-w-full items-center gap-2 border border-gold/40 bg-ink/70 px-2.5 py-1 font-tech text-[10px] uppercase tracking-[0.2em] text-gold backdrop-blur-sm">
      <span aria-hidden className={cn("h-1.5 w-1.5 shrink-0 bg-gold", badge.hot ? "animate-pulse-gold" : "opacity-60")} />
      <span className="truncate">{badge.text}</span>
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
      {/* Tout le bloc dans la couleur de la Division (cyan). */}
      <div data-univers="division" className="mt-8">
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
            <p className="mb-6 inline-flex items-center gap-2 text-xs text-gold">
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
              {teams.map((team) => {
                const podium = team.position <= 3;
                const played = team.wins + team.losses;
                const rate = played ? Math.round((team.wins / played) * 100) : 0;
                return (
                  <li key={team.id}>
                    <Link
                      href={`/cod/equipes/${team.id}`}
                      className={cn(
                        "group relative grid min-h-[3.875rem] grid-cols-[4rem_minmax(0,1fr)_auto_auto] items-center gap-x-4 overflow-hidden border-l-2 py-3 transition-colors hover:bg-white/[0.06]",
                        team.position === 1 ? "border-gold bg-linear-to-r from-gold/[0.14] via-gold/[0.04] to-white/[0.03]" : podium ? "border-gold/60 bg-white/[0.035]" : "border-transparent bg-white/[0.03] hover:border-gold",
                      )}
                    >
                      {/* Balayage lumineux au survol, comme le classement des équipes. */}
                      <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-[20deg] bg-linear-to-r from-transparent via-gold/20 to-transparent opacity-0 group-hover:animate-[standings-sweep_0.9s_ease] group-hover:opacity-100" />
                      <span className="relative flex items-center gap-1.5 px-4">
                        <span
                          className={cn(
                            "font-display font-black leading-none tabular-nums",
                            team.position === 1 ? "text-2xl text-gold drop-shadow-[0_0_12px_color-mix(in_srgb,var(--color-gold)_75%,transparent)]" : podium ? "text-xl text-gold" : "text-lg text-white/50",
                          )}
                        >
                          {team.position}
                        </span>
                        {team.position === 1 ? <LuCrown aria-label="Numéro 1" className="h-4 w-4 text-gold" /> : null}
                      </span>
                      <span className="relative flex min-w-0 items-center gap-3">
                        <TeamCrest team={team} size={34} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-lg font-bold uppercase leading-none tracking-wide transition-colors group-hover:text-gold">{team.name}</span>
                          <span className="mt-1 block font-tech text-[10px] tracking-[0.2em]" style={{ color: team.color }}>
                            <span className="normal-case">[{team.tag}]</span>
                          </span>
                        </span>
                      </span>
                      <span className="relative w-16 text-right">
                        <span className="block whitespace-nowrap text-sm tabular-nums text-white/70">
                          <span className="text-win">{team.wins}</span> / <span className="text-loss">{team.losses}</span>
                        </span>
                        {/* Part de victoires en fine jauge. */}
                        <span aria-label={`${rate} % de victoires`} className="mt-1.5 block h-[3px] -skew-x-[20deg] bg-white/10">
                          <span className="block h-full bg-gold" style={{ width: `${rate}%` }} />
                        </span>
                      </span>
                      <span className="relative pr-4 text-right font-tech text-base font-bold tabular-nums text-gold">{team.points}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </>
        )}
        {/* Même style que les liens des cartes des modes : trait qui s'allonge au survol, sans flèche. */}
        <Link href="/cod/equipes" className="group/l mt-5 inline-flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-gold hover:text-gold-light">
          Classement des équipes
          <span aria-hidden className="h-px w-5 bg-gold/50 transition-all duration-300 group-hover/l:w-10 group-hover/l:bg-gold" />
        </Link>
      </div>
    </section>
  );
}
