import { AnimatePresence, animate, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LuArrowRight,
  LuCalendarDays,
  LuCheck,
  LuChevronDown,
  LuCrown,
  LuDices,
  LuLoaderCircle,
  LuMap,
  LuRepeat,
  LuShield,
  LuSwords,
  LuTrophy,
  LuUserMinus,
  LuUserPlus,
  LuUsers,
} from "react-icons/lu";
import { RulesConduct, RulesEssentials, RulesLoadout } from "../cod/MatchRules";
import { TeamCrest } from "../teams/TeamParts";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Chip, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { FillBar, FloatingMedal, HexAvatar, RegisteredPlayers, SoloRegistration } from "./AnubisCup";
import { BracketBoard, bracketMatches } from "./BracketBoard";
import { OrganisationMessages } from "./TournamentViews";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { roundsToWin } from "../../lib/matchRules";

/**
 * Fiche d'un tournoi (Coupe Horus, Coupe Anubis, tournoi de fin de saison, play-in), d'un seul tenant :
 * en-tête (affiche, statut, infos, compte à rebours, trophée sur une bande en biais), podium une fois terminé,
 * bande de commandement (phases de la soirée, chiffres en direct, ma place ou à suivre), messages de l'organisation,
 * puis sections reliées par une navigation collante : Inscription, Tableau, Participants, Récompenses, Règles.
 * Rouge du mode Tournoi (variables gold redéfinies par data-univers), métaux des médailles en couleurs fixes.
 */

const EASE = [0.22, 1, 0.36, 1];
const ART = {
  anubis: { or: "/images/trophees/anubis-or.png", argent: "/images/trophees/anubis-argent.png", bronze: "/images/trophees/anubis-bronze.png" },
  horus: { or: "/images/trophees/horus-or.png", argent: "/images/trophees/horus-argent.png", bronze: "/images/trophees/horus-bronze.png" },
};
const artOf = (kind) => (kind === "anubis" ? ART.anubis : ART.horus);
const KIND = { horus: "Coupe Horus", anubis: "Coupe Anubis", saison: "Tournoi de fin de saison", playin: "Play-in de la grande finale" };
const METALS = [
  { key: "winner", metal: "or", label: "Or", place: "1re place", color: "#e7c05a" },
  { key: "finalist", metal: "argent", label: "Argent", place: "2e place", color: "#d7dde5" },
  { key: "third", metal: "bronze", label: "Bronze", place: "3e place", color: "#d6935a" },
];
// Jours des rendez-vous récurrents (0 = dimanche, comme le serveur).
const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const ms = (iso) => new Date(iso).getTime();
/** « 21 h », « 20 h 45 ». */
const hm = (iso) => {
  const date = new Date(iso);
  return `${date.getHours()} h${date.getMinutes() ? ` ${String(date.getMinutes()).padStart(2, "0")}` : ""}`;
};
const dayHm = (iso) => `${new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · ${hm(iso)}`;
const idOf = (team) => team?.id ?? team ?? null;

export function countdown(target, now) {
  const seconds = Math.max(0, Math.floor((ms(target) - now) / 1000));
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return d > 0 ? `${d} j ${h} h ${String(m).padStart(2, "0")}` : `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Phase de la soirée : 0 inscriptions, 1 check-in, 2 tirage effectué, 3 matchs, 4 terminée ; -1 annulée. */
function phaseOf(t, now) {
  if (t.status === "completed") return 4;
  if (t.status === "cancelled") return -1;
  if (t.status === "running") return now < ms(t.startsAt) ? 2 : 3;
  return now >= ms(t.checkInOpensAt) ? 1 : 0;
}

function statusOf(t, phase) {
  if (phase === 4) return { label: "Terminée", tone: "muted" };
  if (phase === -1) return { label: "Annulée", tone: "loss" };
  if (phase === 3) return { label: "En direct", live: true };
  if (phase === 2) return { label: "Tirage effectué", live: true };
  if (phase === 1) return { label: "Check-in ouvert", live: true };
  return { label: t.kind === "horus" || t.kind === "anubis" ? "Inscriptions ouvertes" : "Qualifiés connus" };
}

/** Lecture du tableau : rencontres numérotées, jouées, en cours, équipes encore en lice, tour du moment. */
function useBracket(t) {
  return useMemo(() => {
    const matches = t.rounds?.length ? bracketMatches(t) : [];
    // Une place sans match (exempt, forfait au tirage) n'est pas une rencontre jouée.
    const real = matches.filter((m) => !(m.entry.status === "done" && !m.entry.matchId && !m.entry.decided));
    const open = new Set();
    for (const m of matches) {
      if (m.entry.status === "done") continue;
      if (idOf(m.entry.teamA)) open.add(idOf(m.entry.teamA));
      if (idOf(m.entry.teamB)) open.add(idOf(m.entry.teamB));
    }
    const played = real.filter((m) => m.entry.status === "done").length;
    const live = matches.filter((m) => m.entry.status === "playing");
    const current = real.find((m) => m.entry.status !== "done");
    return { matches, total: real.length, played, live, open, round: current?.roundName ?? null };
  }, [t]);
}

/** Nombre qui monte jusqu'à sa valeur (une fois, à l'affichage). */
function CountUp({ value }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? value : 0);
  useEffect(() => {
    if (reduce) {
      setShown(value);
      return undefined;
    }
    const controls = animate(0, value, { duration: 1.1, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [value, reduce]);
  return shown;
}

export function CupFiche({ tournament: t, userId, now, onDone, cups = null }) {
  const phase = phaseOf(t, now);
  const bracket = useBracket(t);
  const anubis = t.kind === "anubis";
  const scheduled = t.status === "scheduled";
  const viewer = t.viewer ?? null;
  const myTeamId = viewer?.teamId ?? null;
  // Tirage au sort (Horus, Anubis) : pas de tableau avant la fin du check-in ; têtes de série (saison, play-in) : tableau connu.
  const drawn = !scheduled || (t.kind !== "horus" && !anubis);

  // Participants à la même forme : équipes (Horus, saison) ou équipes tirées au sort (Anubis, capitaine).
  const teams = anubis ? (t.squads ?? []).map((squad) => ({ ...squad.team, players: squad.starters, captain: squad.captain, forfeit: squad.forfeit })) : t.teams;
  const playersOf = (teamId) => teams.find((team) => team.id === teamId)?.players ?? [];
  const placeOf = (teamId) => METALS.find((m) => idOf(t[m.key]) === teamId) ?? null;

  const stateOf = (team) => {
    if (team.forfeit) return { label: "Forfait", tone: "loss", out: true };
    if (scheduled) {
      if (team.bench) return { label: "Non retenue", tone: "neutral", out: true };
      if (team.reserve) return { label: "Remplaçante", tone: "gold" };
      return team.checkedIn ? { label: "Prête", tone: "win" } : { label: "En attente", tone: "neutral" };
    }
    if (t.status === "completed") {
      const place = placeOf(team.id);
      return place ? { label: t.kind === "playin" ? "Qualifiée" : place.label, tone: "gold", rank: METALS.indexOf(place) } : { label: "Éliminée", tone: "neutral", out: true, rank: 9 };
    }
    if (t.status === "cancelled") return { label: "Inscrite", tone: "neutral" };
    return bracket.open.has(team.id) ? { label: "En lice", tone: "win" } : { label: "Éliminée", tone: "neutral", out: true };
  };

  const myNext = myTeamId ? bracket.matches.find((m) => m.entry.status !== "done" && (idOf(m.entry.teamA) === myTeamId || idOf(m.entry.teamB) === myTeamId)) : null;
  const myTeam = myTeamId ? teams.find((team) => team.id === myTeamId) ?? null : null;

  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  let cta = null;
  if (scheduled && (viewer?.canRegister || (viewer?.registered && viewer?.canCheckIn && !viewer?.checkedIn) || (!viewer && t.kind === "horus") || (anubis && !viewer?.registered))) {
    cta = { label: viewer?.registered ? "Faire le check-in" : anubis ? "M'inscrire" : "Inscrire mon équipe", onClick: () => jump("inscription"), icon: viewer?.registered ? LuCheck : LuUserPlus };
  } else if (myNext?.entry.matchId) cta = { label: "Ma feuille de match", href: `/cod/equipes/match/${myNext.entry.matchId}`, icon: LuSwords };
  else if (drawn && phase >= 2) cta = { label: phase === 4 ? "Revoir le tableau" : "Voir le tableau", onClick: () => jump("tableau"), icon: LuArrowRight };
  else cta = { label: "Voir les participants", onClick: () => jump("participants"), icon: LuUsers };

  const sections = [
    scheduled ? { id: "inscription", label: "Inscription" } : null,
    { id: "tableau", label: "Tableau" },
    { id: "participants", label: "Participants", count: anubis && scheduled ? t.registered : teams.length },
    t.kind !== "playin" ? { id: "recompenses", label: "Récompenses" } : null,
    { id: "regles", label: "Règles" },
  ].filter(Boolean);
  const number = (id) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, "0");

  return (
    <div className="space-y-10">
      <FicheHero t={t} now={now} phase={phase} cta={cta} />
      {t.status === "completed" && t.winner ? <CupPodium t={t} playersOf={playersOf} /> : null}
      {phase === -1 ? <Notice tone="error">{t.kind === "anubis" ? "Cette coupe a été annulée : pas assez de joueurs présents au check-in." : t.kind === "horus" ? "Cette coupe a été annulée : pas assez d'équipes présentes au check-in." : "Ce tournoi a été annulé."}</Notice> : null}
      {phase !== -1 ? (
        <CommandBand t={t} now={now} phase={phase} bracket={bracket} teams={teams} myTeam={myTeam} myNext={myNext} stateOf={stateOf} viewer={viewer} cups={cups} jump={jump} />
      ) : null}
      <OrganisationMessages key={t.id} tournament={t} isAdmin={false} api={api} />

      <SectionNav items={sections} />

      {scheduled ? (
        <Section id="inscription" n={number("inscription")} title="Inscription" aside={anubis ? "Solo" : t.kind === "horus" ? "Par un Leader" : "Qualifiés"}>
          {anubis ? (
            <TacticalCard highlight cut={22} innerClassName="space-y-5 p-6 sm:p-8">
              <SoloRegistration tournament={t} userId={userId} checkInOpen={phase === 1} onDone={onDone} />
              <FillBar value={t.registered} max={t.capacity} minimum={4 * t.teamSize} />
            </TacticalCard>
          ) : (
            <div className="space-y-4">
              {t.kind === "horus" ? <RegistrationPanel tournament={t} userId={userId} onDone={onDone} /> : null}
              {viewer?.registered ? <CheckInPanel tournament={t} open={phase === 1} onDone={onDone} /> : null}
              {t.kind !== "horus" && !viewer?.registered ? <p className="text-sm text-white/55">Les équipes qualifiées font leur check-in ici, de 2 h à 15 min avant le début.</p> : null}
            </div>
          )}
        </Section>
      ) : null}

      <Section id="tableau" n={number("tableau")} title="Tableau" aside={drawn && !scheduled && bracket.total ? `${bracket.played} / ${bracket.total} matchs joués` : null}>
        {drawn && t.rounds?.length && phase !== -1 ? <BracketBoard tournament={t} myTeamId={myTeamId} /> : <DrawTeaser t={t} now={now} cancelled={phase === -1} />}
      </Section>

      <Section id="participants" n={number("participants")} title="Participants" aside={anubis && scheduled ? `${t.registered} joueur${t.registered > 1 ? "s" : ""}` : `${teams.length} équipe${teams.length > 1 ? "s" : ""}`}>
        {anubis && scheduled ? <RegisteredPlayers tournament={t} userId={userId} /> : <TeamGrid t={t} teams={teams} stateOf={stateOf} myTeamId={myTeamId} />}
      </Section>

      {t.kind !== "playin" ? (
        <Section id="recompenses" n={number("recompenses")} title="Récompenses" aside={anubis ? "Médailles" : "Trophées"}>
          <RewardCards t={t} />
        </Section>
      ) : null}

      <Section id="regles" n={number("regles")} title="Règles" aside={`BO${t.bestOf} · finale BO${t.finalBestOf}`}>
        <RulesBlock t={t} />
      </Section>
    </div>
  );
}

/* ───────────────────────── En-tête ───────────────────────── */

function StatusPill({ status }) {
  return (
    <span
      className={cn(
        "clip-slant inline-flex items-center gap-2 px-3.5 py-1.5 font-tech text-[10px] font-bold uppercase tracking-[0.24em] [--slant:8px]",
        status.tone === "muted" ? "bg-white/10 text-white/70" : status.tone === "loss" ? "bg-loss/15 text-loss" : "bg-gold text-ink",
      )}
    >
      {status.live ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-ink" />
        </span>
      ) : null}
      {status.label}
    </span>
  );
}

function FicheHero({ t, now, phase, cta }) {
  const reduce = useReducedMotion();
  const status = statusOf(t, phase);
  const closesAt = t.checkInClosesAt ?? t.startsAt;
  const timer = phase === 0 ? ["Check-in dans", t.checkInOpensAt] : phase === 1 ? ["Tirage dans", closesAt] : phase === 2 ? ["Premiers matchs dans", t.startsAt] : null;
  const losers = t.losersBestOf && t.losersBestOf !== t.bestOf ? ` · perdants BO${t.losersBestOf}` : "";
  const chips = [
    [LuCalendarDays, dayHm(t.startsAt)],
    [LuUsers, `${t.teamSize}v${t.teamSize}${t.kind === "anubis" ? " · inscription solo" : ""}`],
    [LuSwords, t.bracket === "double" ? "Double élimination" : t.kind === "horus" ? "Élimination directe · petite finale" : "Élimination directe"],
    [LuShield, `BO${t.bestOf} (${roundsToWin(t.bestOf)} manches)${losers} · finale BO${t.finalBestOf}`],
    [LuMap, "Maps tirées au sort"],
    [LuDices, t.kind === "horus" || t.kind === "anubis" ? "Tirage au sort" : "Têtes de série"],
    t.schedule ? [LuRepeat, `Tous les ${WEEKDAYS[t.schedule.weekday]}s · édition #${t.schedule.edition}`] : null,
  ].filter(Boolean);
  const Icon = cta?.icon ?? LuArrowRight;
  const ctaClass =
    "clip-slant group inline-flex items-center gap-2.5 bg-gold px-6 py-3.5 font-display text-sm font-black uppercase tracking-[0.16em] text-ink shadow-[0_0_30px_color-mix(in_srgb,var(--color-gold)_45%,transparent)] transition hover:-translate-y-0.5 [--slant:12px]";

  return (
    <header className="relative isolate overflow-hidden border border-white/10 bg-ink">
      {t.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={t.posterUrl} alt="" aria-hidden className="absolute inset-0 -z-10 h-full w-full scale-125 object-cover opacity-30 blur-2xl" />
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/90 to-ink/30" />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(90deg,black,transparent_70%)]" />
      {/* Bande en biais aux couleurs du mode, reflet qui passe, trophée par-dessus. */}
      <motion.div
        aria-hidden
        style={{ skewX: -14 }}
        initial={reduce ? false : { x: "30%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="absolute inset-y-0 -right-28 -z-10 hidden w-[40%] overflow-hidden bg-linear-to-br from-gold via-gold/85 to-gold-dark lg:block"
      >
        {!reduce ? <span className="absolute inset-y-0 left-0 w-24 bg-white/20 blur-md animate-[bracket-sheen_7s_ease-in-out_infinite]" /> : null}
      </motion.div>
      <motion.div
        aria-hidden
        style={{ skewX: -14 }}
        initial={reduce ? false : { x: "40%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        className="absolute inset-y-0 right-[37%] -z-10 hidden w-2 bg-gold/70 lg:block"
      />

      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
        <div className="flex min-w-0 gap-7">
          {t.posterUrl ? (
            <motion.img
              src={t.posterUrl}
              alt={`Affiche — ${t.name}`}
              initial={reduce ? false : { opacity: 0, y: 24, rotate: -6 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="hidden h-64 w-auto shrink-0 self-center border border-white/15 shadow-[0_24px_60px_rgba(0,0,0,0.7)] md:block"
            />
          ) : null}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={artOf(t.kind).or} alt="" aria-hidden className="h-12 w-auto lg:hidden" />
              <StatusPill status={status} />
            </div>
            <p className="mt-5 font-tech text-[10px] uppercase tracking-[0.32em] text-gold-light">{KIND[t.kind] ?? "Tournoi"}</p>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
              className="mt-2 font-display text-5xl font-black uppercase leading-[0.86] [text-shadow:0_6px_30px_rgba(0,0,0,0.6)] sm:text-7xl"
            >
              {t.name}
            </motion.h1>
            <motion.ul
              initial="hide"
              animate="show"
              variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: 0.25 } } }}
              className="mt-6 flex flex-wrap gap-2"
            >
              {chips.map(([ChipIcon, text]) => (
                <motion.li
                  key={text}
                  variants={{ hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                  className="inline-flex items-center gap-1.5 border border-white/10 bg-black/45 px-2.5 py-1.5 font-tech text-[10px] uppercase tracking-[0.14em] text-white/75 backdrop-blur-sm"
                >
                  <ChipIcon aria-hidden className="h-3.5 w-3.5 text-gold-light" />
                  {text}
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
              {cta ? (
                cta.href ? (
                  <Link href={cta.href} className={ctaClass}>
                    <Icon aria-hidden className="h-4 w-4" />
                    {cta.label}
                  </Link>
                ) : (
                  <button type="button" onClick={cta.onClick} className={ctaClass}>
                    <Icon aria-hidden className="h-4 w-4" />
                    {cta.label}
                  </button>
                )
              ) : null}
              {timer ? (
                <div>
                  <p className="font-tech text-[9px] uppercase tracking-[0.3em] text-white/45">{timer[0]}</p>
                  <p className="mt-1 font-tech text-3xl font-black tabular-nums text-white">{countdown(timer[1], now)}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="relative hidden lg:block">
          <FloatingMedal backing size={300} src={artOf(t.kind).or} alt={t.kind === "anubis" ? "Médaille de la Coupe Anubis" : "Trophée du tournoi"} />
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────── Podium ───────────────────────── */

function CupPodium({ t, playersOf }) {
  const reduce = useReducedMotion();
  const art = artOf(t.kind);
  const places = METALS.filter((m) => t[m.key]);
  // Or au centre, plus haut ; argent à gauche, bronze à droite.
  const order = places.length === 3 ? [places[1], places[0], places[2]] : places.length === 2 ? [places[1], places[0]] : places;
  const delay = { or: 0.55, argent: 0.3, bronze: 0.1 };
  return (
    <section aria-label="Podium" className="relative">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-12 mx-auto h-80 max-w-3xl rounded-full bg-[radial-gradient(ellipse,rgba(231,192,90,0.14),transparent_70%)] blur-2xl" />
      <ol className={cn("relative grid items-end gap-4", order.length === 3 ? "sm:grid-cols-3" : "mx-auto max-w-3xl sm:grid-cols-2")}>
        {order.map((m) => {
          const team = t[m.key];
          const first = m.metal === "or";
          const players = playersOf(team.id);
          return (
            <motion.li
              key={m.key}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay[m.metal], duration: 0.7, ease: EASE }}
              className={cn(first && "order-first sm:order-none")}
            >
              <TacticalCard highlight={first} cut={22} innerClassName={cn("relative overflow-hidden px-5 pb-6 pt-5 text-center", first && "holo sm:pb-9 sm:pt-8")}>
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-48" style={{ background: `radial-gradient(ellipse at top, ${m.color}33, transparent 70%)` }} />
                <div className="relative mx-auto flex items-center justify-center" style={{ height: first ? 208 : 148 }}>
                  {first && !reduce ? (
                    <motion.div
                      aria-hidden
                      className="absolute h-64 w-64 opacity-50 [mask-image:radial-gradient(circle,black_25%,transparent_68%)]"
                      style={{ background: "repeating-conic-gradient(from 0deg, rgba(231,192,90,0.25) 0deg 4deg, transparent 4deg 18deg)" }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                    />
                  ) : null}
                  <motion.img
                    src={art[m.metal]}
                    alt={`${t.kind === "anubis" ? "Médaille" : "Trophée"} ${m.label.toLowerCase()}`}
                    width={420}
                    height={420}
                    animate={reduce ? undefined : { y: [0, -6, 0] }}
                    transition={{ duration: first ? 5 : 6, repeat: Infinity, ease: "easeInOut", delay: delay[m.metal] }}
                    className={cn("relative w-auto object-contain drop-shadow-[0_16px_20px_rgba(0,0,0,0.75)]", first ? "h-52" : "h-36")}
                  />
                </div>
                <p className="relative mt-3 font-tech text-[10px] uppercase tracking-[0.32em]" style={{ color: m.color }}>
                  {t.kind === "playin" ? "Qualifiée" : m.label}
                </p>
                <p className={cn("relative mt-1 font-display font-black uppercase leading-none", first ? "text-4xl" : "text-3xl")}>{team.name}</p>
                {players.length ? (
                  <ul className="relative mt-5 flex flex-wrap justify-center gap-x-3 gap-y-3">
                    {players.map((player) => (
                      <li key={player.id}>
                        <Link href={`/cod/profile/${player.id}`} className="group flex w-20 flex-col items-center gap-1.5">
                          <HexAvatar player={player} size={first ? 44 : 38} gold={first} />
                          <span className="w-full truncate text-xs font-semibold text-white/75 group-hover:text-white">{player.username}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </TacticalCard>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

/* ───────────────────────── Bande de commandement ───────────────────────── */

function CommandBand({ t, now, phase, bracket, teams, myTeam, myNext, stateOf, viewer, cups, jump }) {
  const anubis = t.kind === "anubis";
  let stats;
  if (t.status === "scheduled") {
    const registered = anubis ? Math.min(t.registered, t.capacity) : t.teams.filter((team) => !team.reserve).length;
    const capacity = anubis ? t.capacity : t.size;
    const checked = anubis ? t.checkedInCount : t.teams.filter((team) => team.checkedIn).length;
    const waiting = anubis ? Math.max(0, t.registered - t.capacity) : t.teams.filter((team) => team.reserve).length;
    stats = [
      [anubis ? "Joueurs inscrits" : t.kind === "horus" ? "Équipes inscrites" : "Qualifiés", registered, capacity],
      ["Check-in", checked, anubis ? t.registered : t.teams.length],
      [waiting ? "Liste d'attente" : "Places libres", waiting || Math.max(0, capacity - registered)],
      ["Départ", hm(t.startsAt), null, new Date(t.startsAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })],
    ];
  } else if (t.status === "completed") {
    const minutes = t.completedAt ? Math.max(0, Math.round((ms(t.completedAt) - ms(t.startsAt)) / 60000)) : null;
    stats = [
      ["Équipes", teams.length],
      ["Matchs joués", bracket.played],
      ["Champion", t.winner?.name ?? "—"],
      ["Durée", minutes != null ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")}` : "—"],
    ];
  } else {
    stats = [
      ["Équipes en lice", teams.filter((team) => !stateOf(team).out).length, teams.length],
      ["Matchs joués", bracket.played, bracket.total],
      ["En cours", bracket.live.length],
      ["Tour", phase === 2 ? "Tirage fait" : (bracket.round ?? "—").replace(/^(Gagnants|Perdants) · /, "").replace(/^./, (c) => c.toUpperCase()), null, /^Perdants/.test(bracket.round ?? "") ? "Tableau des perdants" : /^Gagnants/.test(bracket.round ?? "") ? "Tableau des gagnants" : null],
    ];
  }
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6 border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <PhaseRail t={t} phase={phase} />
        <StatStrip items={stats} />
      </div>
      <MySpot t={t} now={now} phase={phase} bracket={bracket} myTeam={myTeam} myNext={myNext} stateOf={stateOf} viewer={viewer} cups={cups} jump={jump} />
    </div>
  );
}

function PhaseRail({ t, phase }) {
  const reduce = useReducedMotion();
  const closesAt = t.checkInClosesAt ?? t.startsAt;
  const steps = [
    ["Inscriptions", t.kind === "horus" || t.kind === "anubis" ? `jusqu'à ${hm(closesAt)}` : "qualification"],
    ["Check-in", `${hm(t.checkInOpensAt)} → ${hm(closesAt)}`],
    ["Tirage", hm(closesAt)],
    ["Matchs", `dès ${hm(t.startsAt)}`],
    [t.kind === "anubis" ? "Médailles" : "Podium", t.completedAt ? hm(t.completedAt) : "en fin de soirée"],
  ];
  const finished = t.status === "completed";
  const fill = finished ? 100 : (phase / (steps.length - 1)) * 100;
  return (
    <ol className="relative grid grid-cols-5" aria-label="Déroulé de la soirée">
      <span aria-hidden className="absolute left-[10%] right-[10%] top-[13px] h-px bg-white/10" />
      <motion.span
        aria-hidden
        className="absolute left-[10%] top-[13px] h-px bg-gold shadow-[0_0_12px_var(--color-gold)]"
        initial={reduce ? false : { width: 0 }}
        animate={{ width: `${fill * 0.8}%` }}
        transition={{ duration: 1.3, ease: EASE, delay: 0.3 }}
      />
      {steps.map(([name, when], index) => {
        const done = finished || index < phase;
        const current = !finished && index === phase;
        return (
          <li key={name} className="relative flex flex-col items-center px-1 text-center">
            <span
              className={cn(
                "relative grid h-7 w-7 place-items-center rounded-full border font-tech text-[10px] font-bold",
                done ? "border-gold bg-gold text-ink" : current ? "border-gold bg-ink text-gold-light" : "border-white/15 bg-ink text-white/30",
              )}
            >
              {current && !reduce ? <span aria-hidden className="absolute -inset-1 animate-ping rounded-full border border-gold/50" /> : null}
              {done ? <LuCheck aria-hidden className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className={cn("mt-2 font-display text-xs font-bold uppercase leading-none sm:text-sm", done || current ? "text-white" : "text-white/35")}>{name}</span>
            <span className="mt-1 hidden font-tech text-[9px] uppercase tracking-[0.12em] text-white/35 sm:block">{when}</span>
          </li>
        );
      })}
    </ol>
  );
}

function StatStrip({ items }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-4">
      {items.map(([label, value, total = null, hint = null]) => (
        <div key={label} className="bg-ink px-4 py-3">
          <dt className="font-tech text-[9px] uppercase tracking-[0.24em] text-white/45">{label}</dt>
          <dd className={cn("mt-1.5 truncate font-tech font-black tabular-nums text-white", typeof value === "number" ? "text-3xl" : "text-xl")}>
            {typeof value === "number" ? <CountUp value={value} /> : value}
            {total != null ? <span className="text-base text-white/35"> / {total}</span> : null}
          </dd>
          {hint ? <p className="mt-0.5 truncate text-[11px] first-letter:uppercase text-white/40">{hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}

/** Colonne de droite : ma place (inscrit, en lice, résultat), sinon match à suivre, appel à s'inscrire ou prochaine coupe. */
function MySpot({ t, now, phase, bracket, myTeam, myNext, stateOf, viewer, cups, jump }) {
  const anubis = t.kind === "anubis";
  const frame = "relative flex h-full flex-col justify-between gap-5 overflow-hidden border p-6";
  const glow = <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />;

  const next = (cups?.upcoming ?? []).filter((cup) => cup.kind === t.kind && cup.id !== t.id).sort((a, b) => ms(a.startsAt) - ms(b.startsAt))[0] ?? null;

  // Joueur engagé : son équipe et la suite.
  if (myTeam && t.status !== "scheduled") {
    const state = stateOf(myTeam);
    const record = bracket.matches.reduce(
      (total, m) => {
        // Rencontres jouées seulement (pas d'exempt ni de forfait au tirage).
        if (m.entry.status !== "done" || !m.entry.winner || !idOf(m.entry.teamA) || !idOf(m.entry.teamB) || (idOf(m.entry.teamA) !== myTeam.id && idOf(m.entry.teamB) !== myTeam.id)) return total;
        return idOf(m.entry.winner) === myTeam.id ? { ...total, wins: total.wins + 1 } : { ...total, losses: total.losses + 1 };
      },
      { wins: 0, losses: 0 },
    );
    const opponent = myNext ? [myNext.entry.teamA, myNext.entry.teamB].find((team) => idOf(team) && idOf(team) !== myTeam.id) : null;
    return (
      <aside className={cn(frame, "border-gold/40 bg-gold/[0.06]")}>
        {glow}
        <div className="relative">
          <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-gold-light">Ton équipe</p>
          <div className="mt-3 flex items-center gap-3">
            <TeamCrest team={myTeam} size={48} />
            <div className="min-w-0">
              <p className="truncate font-display text-2xl font-black uppercase leading-none">{myTeam.name}</p>
              <p className="mt-1.5">
                <Chip tone={state.tone}>{state.label}</Chip>
              </p>
            </div>
          </div>
          {myNext ? (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
                {myNext.entry.status === "playing" ? "Match en cours" : "Prochain match"} · M{myNext.number} · {myNext.roundName}
              </p>
              <p className="mt-2 flex items-center gap-2 font-display text-xl font-bold uppercase leading-none">
                contre {opponent ? <TeamCrest team={opponent} size={22} /> : null}
                <span className="truncate">{opponent?.name ?? "à déterminer"}</span>
              </p>
              <p className="mt-1.5 text-xs text-white/50">BO{myNext.bestOf}{phase === 2 ? ` · à ${hm(t.startsAt)}` : ""}</p>
            </div>
          ) : t.status === "running" ? (
            <p className="mt-5 border-t border-white/10 pt-4 text-sm text-white/55">{state.out ? "Le parcours s'arrête ici : merci d'avoir joué !" : "En attente du prochain adversaire."}</p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-px border border-white/10 bg-white/10">
              {[
                ["Victoires", record.wins],
                ["Défaites", record.losses],
              ].map(([label, value]) => (
                <div key={label} className="bg-ink px-4 py-3">
                  <p className="font-tech text-[9px] uppercase tracking-[0.24em] text-white/45">{label}</p>
                  <p className="mt-1 font-tech text-3xl font-black text-white">
                    <CountUp value={value} />
                  </p>
                </div>
              ))}
            </div>
          )}
          {t.status === "completed" ? (
            <p className="mt-4 text-sm text-white/55">
              {next ? (
                <>
                  Prochaine :{" "}
                  <Link href={`/cod/tournoi?id=${next.id}`} className="font-semibold text-gold-light underline underline-offset-4">
                    {next.name}
                  </Link>
                  , <span className="first-letter:uppercase">{dayHm(next.startsAt)}</span>.
                </>
              ) : (
                "La prochaine coupe sera annoncée ici et sur Discord."
              )}
            </p>
          ) : null}
        </div>
        {myNext?.entry.matchId ? (
          <Link href={`/cod/equipes/match/${myNext.entry.matchId}`} className="clip-slant relative flex items-center justify-center gap-2 bg-gold py-3 font-display text-sm font-black uppercase tracking-[0.14em] text-ink [--slant:12px]">
            Ma feuille de match <LuArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        ) : null}
      </aside>
    );
  }

  // Avant le tirage : inscrit (check-in) ou appel à s'inscrire.
  if (t.status === "scheduled") {
    const registered = Boolean(viewer?.registered);
    const checked = Boolean(viewer?.checkedIn);
    return (
      <aside className={cn(frame, registered ? "border-gold/40 bg-gold/[0.06]" : "border-white/10 bg-white/[0.02]")}>
        {glow}
        <div className="relative">
          <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-gold-light">{registered ? (anubis ? "Tu es inscrit" : "Ton équipe est inscrite") : "Rejoins la coupe"}</p>
          <p className="mt-3 font-display text-3xl font-black uppercase leading-[0.9]">
            {registered ? (checked ? "Check-in validé" : phase === 1 ? "Check-in à faire" : "Check-in à venir") : anubis ? "Inscris-toi seul" : t.kind === "horus" ? "Inscris ton équipe" : "Sur qualification"}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {registered
              ? checked
                ? `Tout est prêt : ${anubis ? "ton équipe est tirée au sort" : "le tableau est tiré au sort"} à ${hm(t.checkInClosesAt ?? t.startsAt)}.`
                : `De ${hm(t.checkInOpensAt)} à ${hm(t.checkInClosesAt ?? t.startsAt)} : sans check-in, ${anubis ? "pas de place" : "forfait au tirage"}.`
              : anubis
                ? "Pas besoin d'équipe : le site forme les équipes au hasard parmi les présents. Médaille sur ton profil à la clé."
                : t.kind === "horus"
                  ? "Un Leader inscrit l'équipe. Trophée dans la vitrine, points de Division et de circuit pour le podium."
                  : "Les meilleures équipes de la saison sont qualifiées d'office."}
          </p>
        </div>
        {t.kind === "horus" || anubis ? (
          <button type="button" onClick={() => jump("inscription")} className="clip-slant relative flex items-center justify-center gap-2 bg-gold py-3 font-display text-sm font-black uppercase tracking-[0.14em] text-ink [--slant:12px]">
            {registered ? (checked ? "Mon inscription" : "Faire le check-in") : anubis ? "M'inscrire" : "Inscrire mon équipe"}
            <LuArrowRight aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </aside>
    );
  }

  // Spectateur pendant la soirée : un match à suivre.
  if (t.status === "running") {
    const featured = bracket.live[bracket.live.length - 1] ?? null;
    return (
      <aside className={cn(frame, "border-white/10 bg-white/[0.02]")}>
        {glow}
        <div className="relative">
          <p className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.3em] text-gold-light">
            <span className="h-2 w-2 animate-pulse rounded-full bg-gold" /> À suivre
          </p>
          {featured ? (
            <>
              <p className="mt-3 font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">
                M{featured.number} · {featured.roundName} · BO{featured.bestOf}
              </p>
              <div className="mt-3 space-y-2.5">
                {[featured.entry.teamA, featured.entry.teamB].map((team, index) => (
                  <p key={idOf(team) ?? index} className="flex items-center gap-3 font-display text-2xl font-black uppercase leading-none">
                    <TeamCrest team={team} size={30} />
                    <span className="min-w-0 flex-1 truncate">{team?.name}</span>
                    <span className="font-tech text-lg text-white/50">{featured.entry.score?.[index] ?? 0}</span>
                  </p>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-white/55">{phase === 2 ? `Tirage effectué : premiers matchs à ${hm(t.startsAt)}.` : "Prochaines rencontres dès la fin des matchs en cours."}</p>
          )}
        </div>
        <button type="button" onClick={() => jump("tableau")} className="clip-slant relative flex items-center justify-center gap-2 border border-gold/50 py-3 font-display text-sm font-black uppercase tracking-[0.14em] text-gold-light transition hover:bg-gold/10 [--slant:12px]">
          Voir le tableau <LuArrowRight aria-hidden className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  // Terminée : prochaine coupe du même type.
  return (
    <aside className={cn(frame, "border-white/10 bg-white/[0.02]")}>
      {glow}
      <div className="relative">
        <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-gold-light">Prochaine {t.kind === "anubis" ? "Coupe Anubis" : t.kind === "horus" ? "Coupe Horus" : "édition"}</p>
        {next ? (
          <>
            <p className="mt-3 font-display text-3xl font-black uppercase leading-[0.9]">{next.name}</p>
            <p className="mt-2 text-sm first-letter:uppercase text-white/60">{dayHm(next.startsAt)}</p>
          </>
        ) : (
          <>
            <p className="mt-3 font-display text-3xl font-black uppercase leading-[0.9]">Bientôt annoncée</p>
            <p className="mt-2 text-sm text-white/55">La prochaine sera annoncée ici et sur Discord.</p>
          </>
        )}
      </div>
      {next ? (
        <Link href={`/cod/tournoi?id=${next.id}`} className="clip-slant relative flex items-center justify-center gap-2 bg-gold py-3 font-display text-sm font-black uppercase tracking-[0.14em] text-ink [--slant:12px]">
          Voir la coupe <LuArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : null}
    </aside>
  );
}

/* ───────────────────────── Navigation et sections ───────────────────────── */

function SectionNav({ items }) {
  const [active, setActive] = useState(items[0]?.id ?? null);
  const key = items.map((item) => item.id).join();
  useEffect(() => {
    const nodes = items.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (!nodes.length || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <nav aria-label="Sections du tournoi" className="sticky top-16 z-30 border-b border-white/10 bg-ink/85 backdrop-blur-md">
      <div className="flex overflow-x-auto">
        {items.map((item) => {
          const on = active === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={cn("relative flex shrink-0 items-center gap-2 px-4 py-4 font-display text-sm font-bold uppercase tracking-[0.14em] transition-colors sm:px-5", on ? "text-white" : "text-white/45 hover:text-white/80")}
            >
              {item.label}
              {item.count != null ? <span className={cn("font-tech text-[10px]", on ? "text-gold-light" : "text-white/30")}>{item.count}</span> : null}
              {on ? <motion.span layoutId="fiche-nav" className="absolute inset-x-3 -bottom-px h-0.5 bg-gold shadow-[0_0_12px_var(--color-gold)]" transition={{ type: "spring", stiffness: 420, damping: 36 }} /> : null}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function Section({ id, n, title, aside = null, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      aria-labelledby={`titre-${id}`}
      className="scroll-mt-36 space-y-6"
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <header className="flex items-end gap-4">
        <span aria-hidden className="font-tech text-4xl font-black leading-none text-gold/30 sm:text-5xl">
          {n}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`titre-${id}`} className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
            {title}
          </h2>
          <span aria-hidden className="mt-3 block h-px bg-linear-to-r from-gold/70 via-gold/15 to-transparent" />
        </div>
        {aside ? <p className="hidden pb-1 font-tech text-[10px] uppercase tracking-[0.24em] text-white/45 sm:block">{aside}</p> : null}
      </header>
      {children}
    </motion.section>
  );
}

/** Avant le tirage : tableau en filigrane qui scintille, heure du tirage et compte à rebours. */
function DrawTeaser({ t, now, cancelled }) {
  const reduce = useReducedMotion();
  const closesAt = t.checkInClosesAt ?? t.startsAt;
  const columns = [8, 4, 2, 1];
  return (
    <div className="relative overflow-hidden border border-white/10 bg-white/[0.02] px-6 py-14 sm:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-4 gap-6 px-8 py-6 opacity-50 [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_85%)]">
        {columns.map((count, column) => (
          <div key={count} className="flex flex-col justify-around">
            {Array.from({ length: count }, (_, index) => (
              <motion.span
                key={index}
                className={cn("block h-7 border", column === columns.length - 1 ? "border-gold/60 bg-gold/15" : "border-white/15 bg-white/[0.04]")}
                animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: column * 0.3 + index * 0.12 }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="relative mx-auto max-w-lg text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center border border-gold/50 bg-gold/10 text-gold-light">
          <LuDices aria-hidden className="h-7 w-7" />
        </span>
        <p className="mt-5 font-display text-3xl font-black uppercase leading-none sm:text-4xl">{cancelled ? "Pas de tableau" : `Tirage au sort à ${hm(closesAt)}`}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          {cancelled
            ? "La coupe a été annulée avant le tirage."
            : t.kind === "anubis"
              ? "À la fin du check-in, les présents sont répartis au hasard en équipes, puis le tableau est tiré au sort et dévoilé à tous."
              : "À la fin du check-in, les équipes présentes sont placées au hasard dans le tableau, dévoilé à tous."}
        </p>
        {!cancelled ? <p className="mt-5 font-tech text-2xl font-black tabular-nums text-white">{countdown(closesAt, now)}</p> : null}
      </div>
    </div>
  );
}

/* ───────────────────────── Participants ───────────────────────── */

function TeamGrid({ t, teams, stateOf, myTeamId }) {
  const [filter, setFilter] = useState("all");
  const running = t.status === "running";
  const sorted = [...teams].sort((a, b) => {
    const sa = stateOf(a);
    const sb = stateOf(b);
    if (t.status === "completed") return (sa.rank ?? 9) - (sb.rank ?? 9);
    return Number(Boolean(sa.out)) - Number(Boolean(sb.out)) || (a.seed ?? 99) - (b.seed ?? 99);
  });
  const shown = sorted.filter((team) => filter === "all" || (filter === "alive" ? !stateOf(team).out : stateOf(team).out));
  if (!teams.length) return <p className="text-sm text-white/50">{t.kind === "horus" ? "Aucune équipe inscrite pour l'instant : sois la première." : "Aucune équipe pour l'instant."}</p>;
  return (
    <div className="space-y-5">
      {running ? (
        <div className="flex gap-2">
          {[
            ["all", "Toutes"],
            ["alive", "En lice"],
            ["out", "Éliminées"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn("clip-slant px-4 py-2 font-tech text-[10px] uppercase tracking-[0.2em] transition [--slant:8px]", filter === id ? "bg-gold text-ink" : "bg-white/[0.05] text-white/55 hover:text-white")}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {shown.map((team, index) => {
          const state = stateOf(team);
          const mine = team.id === myTeamId;
          const color = team.color ?? "var(--color-gold)";
          const name = <span className="block truncate font-display text-xl font-black uppercase leading-none">{team.name}</span>;
          return (
            <motion.li key={team.id} layout initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index, 12) * 0.04, duration: 0.45 }}>
              <div
                className={cn(
                  "group relative h-full overflow-hidden border bg-white/[0.03] p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.05]",
                  mine ? "border-gold/60 shadow-[0_0_24px_color-mix(in_srgb,var(--color-gold)_20%,transparent)]" : "border-white/10",
                  state.out && "opacity-55",
                )}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
                <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" style={{ background: `${team.color ?? "#e5484d"}44` }} />
                <div className="relative flex items-center gap-3">
                  <TeamCrest team={team} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-tech text-[9px] uppercase tracking-[0.24em]" style={{ color }}>
                        [{team.tag}]{team.seed && (t.kind === "saison" || t.kind === "playin") ? ` · tête de série n°${team.seed}` : ""}
                      </p>
                      <Chip tone={state.tone} className="shrink-0 px-2.5 py-1 text-[9px]">
                        {state.label}
                      </Chip>
                    </div>
                    <span className="mt-1 block">{t.kind === "anubis" ? name : <Link href={`/cod/equipes/${team.id}`} className="hover:text-gold-light">{name}</Link>}</span>
                  </div>
                </div>
                {team.players?.length ? (
                  <ul className="relative mt-4 space-y-1.5 border-t border-white/[0.06] pt-3">
                    {team.players.map((player) => (
                      <li key={player.id} className="flex items-center gap-2.5">
                        <HexAvatar player={player} size={26} gold={player.id === team.captain} />
                        <Link href={`/cod/profile/${player.id}`} className="min-w-0 flex-1 truncate text-[13px] font-semibold text-white/75 hover:text-white">
                          {player.username}
                        </Link>
                        {player.id === team.captain ? <LuCrown aria-label="Capitaine" className="h-3.5 w-3.5 text-[#e7c05a]" /> : null}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {mine ? <p className="relative mt-3 font-tech text-[9px] uppercase tracking-[0.24em] text-gold-light">Ton équipe</p> : null}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/* ───────────────────────── Récompenses ───────────────────────── */

function RewardCards({ t }) {
  const art = artOf(t.kind);
  const r = t.rewards;
  const anubis = t.kind === "anubis";
  const horus = t.kind === "horus";
  const lines = {
    winner: horus
      ? [`+${r?.division.winner ?? 150} pts de Division`, `+${r?.circuit.winner ?? 100} pts de circuit`, "Rôle Discord « Vainqueur — Coupe Horus »"]
      : anubis
        ? ["Médaille d'or sur le profil", "Rôle Discord « Vainqueur — Coupe Anubis »"]
        : ["Trophée dans la vitrine de l'équipe", `Rôle Discord « Vainqueur — ${t.name} »`],
    finalist: horus ? [`+${r?.division.finalist ?? 100} pts de Division`, `+${r?.circuit.finalist ?? 70} pts de circuit`] : anubis ? ["Médaille d'argent sur le profil"] : ["Trophée de finaliste dans la vitrine"],
    third: horus ? [`+${r?.division.third ?? 75} pts de Division`, `+${r?.circuit.third ?? 50} pts de circuit`] : anubis ? ["Médaille de bronze sur le profil"] : null,
  };
  const subtitle = (m) => (horus ? `Coupe Horus ${m.label.toLowerCase()} : vitrine de l'équipe et profil des joueurs` : anubis ? `Pour chaque joueur de l'équipe` : m.key === "winner" ? "Vainqueur" : "Finaliste");
  const cards = METALS.filter((m) => lines[m.key]);
  return (
    <div className="space-y-4">
      <ul className={cn("grid gap-4", cards.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
        {cards.map((m, index) => {
          const first = m.metal === "or";
          return (
            <motion.li key={m.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1, duration: 0.5 }}>
              <div className={cn("group relative h-full overflow-hidden border p-6 transition duration-300 hover:-translate-y-1", first ? "border-gold/50 bg-gold/[0.05]" : "border-white/10 bg-white/[0.03]")}>
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-36" style={{ background: `radial-gradient(ellipse at top, ${m.color}26, transparent 70%)` }} />
                <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-white/10 opacity-0 blur-md transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                <div className="relative flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={art[m.metal]} alt="" className="h-24 w-24 shrink-0 object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-4deg]" />
                  <div className="min-w-0">
                    <p className="font-tech text-[10px] uppercase tracking-[0.3em]" style={{ color: m.color }}>
                      {m.place}
                    </p>
                    <p className="mt-1 font-display text-3xl font-black uppercase leading-none">{m.label}</p>
                    <p className="mt-1.5 text-[11px] leading-snug text-white/45">{subtitle(m)}</p>
                  </div>
                </div>
                <ul className="relative mt-5 space-y-2">
                  {lines[m.key].map((line) => (
                    <li key={line} className="flex items-start gap-2 text-sm text-white/75">
                      <LuCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0" style={{ color: m.color }} />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-2 border border-white/10 bg-white/[0.02] px-5 py-4 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        {horus && r ? (
          <span>
            Autres équipes présentes au check-in : <span className="text-white/85">+{r.division.present} pts de Division · +{r.circuit.present} pts de circuit</span>
          </span>
        ) : (
          <span>{anubis ? "Pas de points de Division : la Coupe Anubis se joue pour les médailles." : "Pas de points de Division en jeu."}</span>
        )}
        <span className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">Chaque joueur du match : +{r?.xp.win ?? 500} XP par victoire · +{r?.xp.loss ?? 150} XP par défaite</span>
      </div>
    </div>
  );
}

/* ───────────────────────── Règles ───────────────────────── */

function RulesBlock({ t }) {
  const anubis = t.kind === "anubis";
  const horus = t.kind === "horus";
  const steps = [
    [LuUsers, anubis ? "Inscris-toi seul" : horus ? "Inscription" : "Qualification", anubis ? "Pas besoin d'équipe : identifiant Activision et compte Discord suffisent." : horus ? "Un Leader inscrit l'équipe, jusqu'à la fermeture du check-in." : t.kind === "playin" ? "7e et 8e du circuit contre les 2 meilleures équipes de la Division, effectifs figés." : "Les meilleures équipes (circuit, puis Division) sont qualifiées, effectifs figés."],
    [LuCheck, "Check-in", anubis ? "De 2 h à 15 min avant le début, confirme ta présence. Sans check-in, pas de place." : "De 2 h à 15 min avant : un joueur de l'équipe confirme et choisit les joueurs du match. Sans check-in, forfait."],
    [LuDices, "Tirage", anubis ? `Équipes de ${t.teamSize} tirées au hasard, le mieux classé est capitaine. Un inscrit en liste d'attente prend la place d'un absent ; ensuite, plus aucun changement.` : horus ? "15 min avant : tableau tiré au sort parmi les présentes, dévoilé à tous." : "15 min avant : tableau dévoilé, équipes absentes forfait."],
    [LuSwords, "Matchs", `BO${t.bestOf}, finale en BO${t.finalBestOf}${t.bracket === "double" ? ", double élimination" : horus ? ", petite finale pour le bronze" : ""}. Hôte tiré au sort, code de la partie dans le tchat de la feuille de match.`],
    [LuTrophy, anubis ? "Médailles" : t.kind === "playin" ? "Grande finale" : "Podium", anubis ? "Or, argent, bronze sur le profil de chaque joueur du podium." : t.kind === "playin" ? "Les 2 vainqueurs prennent les dernières places de la grande finale." : horus ? "Trophées, points de Division et de circuit." : "Trophées et rôle Discord du vainqueur."],
  ];
  const format = [
    ["Format", `${t.teamSize}v${t.teamSize} · Recherche & Destruction Hardcore`],
    ["Matchs", `BO${t.bestOf} (${roundsToWin(t.bestOf)} manches par map)${t.losersBestOf && t.losersBestOf !== t.bestOf ? ` · perdants BO${t.losersBestOf}` : ""}`],
    ["Finale", `BO${t.finalBestOf} (${roundsToWin(t.finalBestOf)} manches par map)`],
    ["Tableau", t.bracket === "double" ? "Double élimination, grande finale en un match" : horus ? "Élimination directe, petite finale" : "Élimination directe"],
    ["Maps", "Tirées au sort dans le map pool Tournoi"],
    ["Litige", "Pas d'annulation : un match bloqué est tranché par l'équipe SixSence"],
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <ol className="relative space-y-5 border-l border-gold/25 pl-6">
          {steps.map(([Icon, title, text], index) => (
            <motion.li key={title} className="relative" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}>
              <span className="absolute -left-[37px] grid h-6 w-6 place-items-center border border-gold/50 bg-ink text-gold-light">
                <Icon aria-hidden className="h-3.5 w-3.5" />
              </span>
              <p className="font-display text-lg font-black uppercase leading-none">
                <span className="text-white/30">{index + 1}.</span> {title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-white/55">{text}</p>
            </motion.li>
          ))}
        </ol>
        <dl className="divide-y divide-white/[0.06] border border-white/10 bg-white/[0.02]">
          {format.map(([label, value]) => (
            <div key={label} className="grid grid-cols-[110px_1fr] gap-3 px-5 py-3.5">
              <dt className="font-tech text-[10px] uppercase tracking-[0.22em] text-gold-light">{label}</dt>
              <dd className="text-sm text-white/75">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <RulesEssentials />
      <Fold title="Classe autorisée" hint="Armes, accessoires, équipements, atouts imposés">
        <p className="mb-4 text-sm text-white/60">Tout ce qui n&apos;est pas autorisé ci-dessous est interdit. Les trois atouts sont imposés.</p>
        <RulesLoadout />
      </Fold>
      <Fold title="Pendant le match" hint="Glitchs, snaking, déconnexions, preuves">
        <RulesConduct />
      </Fold>
      <p className="text-sm text-white/50">
        Le reste est dans le{" "}
        <Link href="/reglement" className="text-gold-light underline underline-offset-4">
          règlement complet
        </Link>
        .
      </p>
    </div>
  );
}

function Fold({ title, hint, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 bg-white/[0.02]">
      <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-white/[0.03]">
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl font-black uppercase leading-none">{title}</span>
          <span className="mt-1 block text-xs text-white/45">{hint}</span>
        </span>
        <LuChevronDown aria-hidden className={cn("h-5 w-5 shrink-0 text-gold-light transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div key="contenu" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <div className="border-t border-white/[0.06] p-5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────────────── Inscription et check-in (équipes) ───────────────────────── */

/** Coupe Horus : inscription ou désinscription de son équipe (un Leader), jusqu'au début. */
function RegistrationPanel({ tournament, userId, onDone }) {
  const viewer = tournament.viewer;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const placed = tournament.teams.filter((team) => !team.reserve).length;
  const full = placed >= tournament.size;

  async function run(method) {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/tournaments/${tournament.id}/register`, { method });
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  let content;
  if (!userId) content = <p className="text-sm text-white/55">Connecte-toi avec Discord pour inscrire ton équipe.</p>;
  else if (!viewer)
    content = (
      <p className="text-sm text-white/55">
        Il faut une équipe pour participer.{" "}
        <Link href="/cod/equipes/creer" className="font-semibold text-gold-light underline underline-offset-4">
          Crée la tienne
        </Link>{" "}
        ou rejoins-en une.
      </p>
    );
  else if (viewer.registered)
    content = (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/65">
          {viewer.reserveRank
            ? `Ton équipe est remplaçante n°${viewer.reserveRank} : elle prend la place d'une équipe qui ne fait pas son check-in. Faites quand même le check-in.`
            : "Ton équipe est inscrite. Le check-in est ouvert de 2 h à 15 min avant le début."}
        </p>
        {viewer.canUnregister ? (
          <Button variant="outline" size="sm" disabled={pending} onClick={() => run("DELETE")}>
            <LuUserMinus aria-hidden className="h-4 w-4" />
            Désinscrire
          </Button>
        ) : null}
      </div>
    );
  else if (viewer.canRegister)
    content = (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/65">
          {viewer.asReserve
            ? "Coupe complète : inscris ton équipe comme remplaçante. Elle jouera si une équipe ne fait pas son check-in (dans l'ordre d'inscription)."
            : `${tournament.size - placed} place${tournament.size - placed > 1 ? "s" : ""} libre${tournament.size - placed > 1 ? "s" : ""}.`}{" "}
          Il faut au moins {viewer.rosterSize} joueur{viewer.rosterSize > 1 ? "s" : ""} dans l&apos;équipe.
        </p>
        <Button disabled={pending} onClick={() => run("POST")}>
          {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuUserPlus aria-hidden className="h-5 w-5" />}
          {viewer.asReserve ? "Inscrire comme remplaçante" : "Inscrire mon équipe"}
        </Button>
      </div>
    );
  else content = <p className="text-sm text-white/55">{viewer.isLeader || tournament.teams.length >= tournament.size + (tournament.reserveSlots ?? 0) ? "La coupe est complète, places de remplaçant comprises." : full ? "Coupe complète : un Leader de ton équipe peut l'inscrire comme remplaçante." : "Un Leader de ton équipe peut l'inscrire."}</p>;

  return (
    <TacticalCard cut={20} innerClassName="space-y-3 p-6">
      <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-gold-light">Inscription de l&apos;équipe</p>
      {content}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </TacticalCard>
  );
}

/** Check-in d'une équipe inscrite ou qualifiée : joueurs du match choisis dans l'effectif. */
function CheckInPanel({ tournament, open, onDone }) {
  const viewer = tournament.viewer;
  const [roster, setRoster] = useState(() => viewer.matchRoster ?? viewer.frozenRoster.slice(0, viewer.rosterSize).map((player) => player.id));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const toggle = (id) => setRoster((current) => (current.includes(id) ? current.filter((x) => x !== id) : current.length < viewer.rosterSize ? [...current, id] : current));

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await api(`/teams/tournaments/${tournament.id}/checkin`, { method: "POST", body: { roster } });
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <TacticalCard highlight cut={24} innerClassName="space-y-4 p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-gold-light">{tournament.kind === "horus" ? "Ton équipe est inscrite" : "Ton équipe est qualifiée"}</p>
          <p className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">{viewer.checkedIn ? "Check-in validé" : "Check-in"}</p>
        </div>
        {viewer.checkedIn ? (
          <Chip tone="win">
            <LuCheck aria-hidden className="h-3 w-3" />
            Prête
          </Chip>
        ) : null}
      </div>
      {!open ? (
        <p className="text-sm text-white/55">Le check-in est ouvert de 2 h à 15 min avant le début. N&apos;importe quel joueur de l&apos;équipe peut le faire ; sans check-in à sa fermeture, ton équipe est déclarée forfait.</p>
      ) : viewer.canCheckIn ? (
        <>
          <p className="text-sm text-white/55">
            Choisis tes {viewer.rosterSize} joueurs parmi l&apos;effectif ({roster.length} / {viewer.rosterSize}). Tu peux les changer jusqu&apos;à la fin du check-in.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {viewer.frozenRoster.map((player) => {
              const selected = roster.includes(player.id);
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggle(player.id)}
                    className={cn("flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition", selected ? "border-gold bg-gold/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]")}
                  >
                    <Avatar full src={player.avatarUrl} name={player.username} size={32} />
                    <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase leading-none">{player.username}</span>
                    {selected ? <Chip>Joue</Chip> : null}
                  </button>
                </li>
              );
            })}
          </ul>
          {error ? <Notice tone="error">{error}</Notice> : null}
          <Button disabled={pending || roster.length !== viewer.rosterSize} onClick={submit}>
            {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <LuCheck aria-hidden className="h-5 w-5" />}
            {viewer.checkedIn ? "Mettre à jour les joueurs" : "Valider le check-in"}
          </Button>
        </>
      ) : (
        <p className="text-sm text-white/55">{viewer.checkedIn ? "Le check-in est validé : soyez prêts à l'heure." : "Le check-in est fermé."}</p>
      )}
    </TacticalCard>
  );
}
