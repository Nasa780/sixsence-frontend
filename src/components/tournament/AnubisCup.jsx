import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { LuCheck, LuCrown, LuLoaderCircle, LuShuffle, LuUserMinus, LuUserPlus } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";
import { Button, ButtonLink } from "../ui/Button";
import { Chip, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

/** Hexagone de la médaille Anubis (avatars, cadres). */
const HEX = "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)";
const GOLD = "#e7c05a";
export const MEDAL_IMAGE = { or: "/images/trophees/anubis-or.png", argent: "/images/trophees/anubis-argent.png", bronze: "/images/trophees/anubis-bronze.png" };
const PLACES = [
  ["winner", "or", "Or", "text-[#e7c05a]"],
  ["finalist", "argent", "Argent", "text-white/80"],
  ["third", "bronze", "Bronze", "text-[#d6935a]"],
];

const dateFr = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

/** Avatar dans l'hexagone de la médaille, liseré doré (capitaine) ou discret. */
export function HexAvatar({ player, size = 44, gold = false, dim = false }) {
  return (
    <span className={cn("relative inline-flex shrink-0", dim && "opacity-45")} style={{ width: size, height: size * 0.94 }}>
      <span aria-hidden className="absolute inset-0" style={{ clipPath: HEX, background: gold ? `linear-gradient(140deg, #fff3c4, ${GOLD} 45%, #8a6418)` : "rgba(255,255,255,0.16)" }} />
      <span className="absolute inset-[2px] overflow-hidden bg-ink" style={{ clipPath: HEX }}>
        <Avatar full src={player.avatarUrl} name={player.username} size={size} className="h-full w-full" />
      </span>
    </span>
  );
}

/** Médaille flottante : halo, rayons qui tournent lentement, léger balancement. */
function FloatingMedal({ metal = "or", size = 260, src = null, alt = null }) {
  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: size, height: size }}>
      <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(231,192,90,0.35),transparent_68%)] blur-2xl" />
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-40 [mask-image:radial-gradient(circle,black_30%,transparent_70%)]"
        style={{ background: "repeating-conic-gradient(from 0deg, rgba(231,192,90,0.22) 0deg 4deg, transparent 4deg 18deg)" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />
      <motion.img
        src={src ?? MEDAL_IMAGE[metal]}
        alt={alt ?? `Médaille Anubis (${metal})`}
        width={420}
        height={420}
        className="relative h-[92%] w-auto object-contain drop-shadow-[0_24px_30px_rgba(0,0,0,0.75)]"
        animate={{ y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/**
 * Coupe Anubis : inscription individuelle, check-in de chaque joueur, joueurs inscrits, équipes tirées au
 * sort (capitaine, sans remplaçant ; liste d'attente avant le tirage), tableau (fourni par la page) et podium des médailles.
 */
export function AnubisCup({ tournament, userId, now, countdown, onDone, bracket }) {
  const scheduled = tournament.status === "scheduled";
  // Check-in : de 2 h à 15 min avant le début ; à la fermeture, tirage dévoilé, premiers matchs à l'heure du début.
  const closesAt = tournament?.checkInClosesAt ?? tournament?.startsAt;
  const checkInOpen = scheduled && now >= new Date(tournament.checkInOpensAt).getTime() && now < new Date(closesAt).getTime();
  const drawnWaiting = tournament?.status === "running" && now < new Date(tournament.startsAt).getTime();
  const plannedTeams = Math.min(tournament.size, Math.floor(tournament.registered / tournament.teamSize));

  return (
    <div className="space-y-12">
      {tournament.status === "completed" ? <AnubisPodium tournament={tournament} /> : null}

      <TacticalCard highlight cut={30} innerClassName="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,rgba(231,192,90,0.16),transparent_55%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(231,192,90,1)_1px,transparent_1px),linear-gradient(90deg,rgba(231,192,90,1)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div className={cn("relative grid items-center gap-8 p-6 sm:p-10", tournament.status !== "completed" && "lg:grid-cols-[300px_1fr]")}>
          {/* Coupe terminée : les médailles sont sur le podium au-dessus. */}
          {tournament.status !== "completed" ? <FloatingMedal /> : null}
          <div className="min-w-0">
            <p className="font-tech text-[11px] uppercase tracking-[0.32em] text-[#e7c05a]">Inscription solo · équipes tirées au sort</p>
            <h2 className="mt-3 font-display text-5xl font-black uppercase leading-[0.88] sm:text-6xl">{tournament.name}</h2>
            <p className="mt-3 text-sm text-white/60">
              {tournament.status === "completed" ? "Terminée" : dateFr(tournament.startsAt)} · équipes de {tournament.teamSize} · {tournament.bracket === "double" ? "double élimination" : "élimination directe"} · BO
              {tournament.bestOf}, finale BO{tournament.finalBestOf}
            </p>

            {scheduled ? (
              <>
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <HudStat label={checkInOpen ? "Tirage dans" : "Check-in dans"} value={countdown(checkInOpen ? closesAt : tournament.checkInOpensAt)} gold />
                  <HudStat
                    label="Inscrits"
                    value={`${Math.min(tournament.registered, tournament.capacity)} / ${tournament.capacity}`}
                    hint={
                      tournament.registered > tournament.capacity
                        ? `+ ${tournament.registered - tournament.capacity} en liste d'attente`
                        : tournament.reserveSlots
                          ? `+ ${tournament.reserveSlots} places en liste d'attente`
                          : null
                    }
                  />
                  <HudStat label="Équipes prévues" value={plannedTeams} hint={plannedTeams < 4 ? `4 minimum (${4 * tournament.teamSize} joueurs)` : `${tournament.size} au plus`} />
                  <HudStat label="Check-in" value={`${tournament.checkedInCount} / ${tournament.registered}`} />
                </div>
                <FillBar value={tournament.registered} max={tournament.capacity} minimum={4 * tournament.teamSize} />
              </>
            ) : null}

            <div className="mt-7">
              <SoloRegistration tournament={tournament} userId={userId} checkInOpen={checkInOpen} onDone={onDone} />
            </div>
          </div>
        </div>
      </TacticalCard>

      {drawnWaiting ? <Notice>Équipes tirées au sort : premiers matchs dans {countdown(tournament.startsAt)}. Rejoins ton capitaine et ton salon vocal.</Notice> : null}
      {tournament.status === "cancelled" ? <Notice tone="error">Cette coupe a été annulée : pas assez de joueurs présents au check-in.</Notice> : null}

      {tournament.squads.length ? <Squads tournament={tournament} myTeamId={tournament.viewer?.teamId} /> : null}

      {tournament.status !== "scheduled" && tournament.status !== "cancelled" ? bracket : null}

      {scheduled ? <RegisteredPlayers tournament={tournament} userId={userId} /> : null}
      <AnubisRules teamSize={tournament.teamSize} />
    </div>
  );
}

function HudStat({ label, value, hint = null, gold = false }) {
  return (
    <div className="relative border border-white/10 bg-black/30 px-4 py-3 [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]">
      <p className="font-tech text-[9px] uppercase tracking-[0.26em] text-white/45">{label}</p>
      <p className={cn("mt-1.5 font-display text-3xl font-black leading-none tabular-nums", gold && "text-[#e7c05a]")}>{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-white/40">{hint}</p> : null}
    </div>
  );
}

/** Jauge des inscriptions, avec le seuil des 4 équipes. */
function FillBar({ value, max, minimum }) {
  const pct = Math.min(100, (value / Math.max(1, max)) * 100);
  const mark = Math.min(100, (minimum / Math.max(1, max)) * 100);
  return (
    <div className="mt-4">
      <div className="relative h-1.5 bg-white/8">
        <motion.div className="absolute inset-y-0 left-0 bg-linear-to-r from-[#8a6418] via-[#e7c05a] to-[#fff3c4]" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: "easeOut" }} />
        <span aria-hidden className="absolute -top-1 h-3.5 w-px bg-white/60" style={{ left: `${mark}%` }} />
      </div>
      <p className="mt-2 font-tech text-[9px] uppercase tracking-[0.24em] text-white/40">Seuil de départ : {minimum} joueurs</p>
    </div>
  );
}

function SoloRegistration({ tournament, userId, checkInOpen, onDone }) {
  const viewer = tournament.viewer;
  const [pending, setPending] = useState(null);
  const [error, setError] = useState(null);

  async function run(action) {
    setPending(action);
    setError(null);
    try {
      if (action === "checkin") await api(`/teams/tournaments/${tournament.id}/checkin`, { method: "POST", body: {} });
      else await api(`/teams/tournaments/${tournament.id}/register`, { method: action === "join" ? "POST" : "DELETE" });
      await onDone();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(null);
    }
  }
  const spin = (action, Icon) => (pending === action ? <LuLoaderCircle aria-hidden className="h-5 w-5 animate-spin" /> : <Icon aria-hidden className="h-5 w-5" />);

  let content = null;
  if (tournament.status !== "scheduled") {
    content = viewer?.teamId ? (
      <p className="text-sm text-white/65">
        Tu joues avec <span className="font-semibold text-white">{tournament.squads.find((s) => s.team?.id === viewer.teamId)?.team?.name}</span>
        {viewer.isCaptain ? " : tu en es le capitaine." : "."}
      </p>
    ) : null;
  } else if (!userId) {
    content = <p className="text-sm text-white/60">Connecte-toi avec Discord pour t&apos;inscrire.</p>;
  } else if (viewer?.registered) {
    content = (
      <div className="flex flex-wrap items-center gap-3">
        <Chip tone={viewer.checkedIn ? "win" : "gold"}>
          <LuCheck aria-hidden className="h-3 w-3" />
          {viewer.checkedIn ? "Présent" : viewer.reserveRank ? `Liste d'attente n°${viewer.reserveRank}` : "Inscrit"}
        </Chip>
        <p className="min-w-0 flex-1 text-sm text-white/65">
          {viewer.reserveRank ? "Tu prends la place d'un inscrit qui ne fait pas son check-in. " : ""}
          {viewer.checkedIn ? "Check-in validé : ton équipe sera tirée au sort 15 min avant le début." : checkInOpen ? "Le check-in est ouvert : confirme ta présence." : "Le check-in ouvre 2 h avant le début."}
        </p>
        {viewer.canCheckIn ? (
          <Button disabled={Boolean(pending)} onClick={() => run("checkin")}>
            {spin("checkin", LuCheck)}
            Je suis présent
          </Button>
        ) : null}
        {viewer.canUnregister ? (
          <Button variant="outline" size="sm" disabled={Boolean(pending)} onClick={() => run("leave")}>
            {spin("leave", LuUserMinus)}
            Me désinscrire
          </Button>
        ) : null}
      </div>
    );
  } else if (viewer?.canRegister) {
    content = (
      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg" disabled={Boolean(pending)} onClick={() => run("join")}>
          {spin("join", LuUserPlus)}
          {viewer.asReserve ? "M'inscrire en liste d'attente" : "M'inscrire"}
        </Button>
        <p className="text-sm text-white/55">
          {viewer.asReserve ? "Coupe complète : tu joueras si un inscrit ne fait pas son check-in. " : ""}Seul, sans équipe : identifiant Activision requis.
        </p>
      </div>
    );
  } else {
    content = <p className="text-sm text-white/55">La coupe est complète, liste d'attente comprise.</p>;
  }
  return (
    <div className="space-y-3">
      {content}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}

/** Joueurs inscrits, en hexagones (présents au check-in en couleur). */
function RegisteredPlayers({ tournament, userId }) {
  return (
    <section aria-labelledby="titre-inscrits">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="titre-inscrits" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
          Joueurs inscrits
        </h2>
        <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
          {tournament.registered} joueur{tournament.registered > 1 ? "s" : ""}
        </p>
      </div>
      {tournament.players.length === 0 ? (
        <p className="mt-4 text-sm text-white/50">Personne pour l&apos;instant : sois le premier.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5 lg:grid-cols-8">
          {tournament.players.map((player, index) => (
            <motion.li
              key={player.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 20) * 0.03 }}
              className="flex flex-col items-center text-center"
            >
              <span className="relative">
                <HexAvatar player={player} size={56} gold={player.id === userId} />
                {player.checkedIn ? (
                  <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-win text-ink">
                    <LuCheck aria-label="Présent" className="h-3 w-3" />
                  </span>
                ) : null}
              </span>
              <Link href={`/cod/profile/${player.id}`} className="mt-2 w-full truncate text-xs font-semibold text-white/80 hover:text-white">
                {player.username}
              </Link>
              {player.reserve ? <span className="font-tech text-[9px] uppercase tracking-[0.2em] text-[#e7c05a]">En attente</span> : null}
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Équipes formées : nom égyptien, capitaine et joueurs (pas de remplaçant). */
function Squads({ tournament, myTeamId }) {
  return (
    <section aria-labelledby="titre-equipes-formees">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="titre-equipes-formees" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
          Équipes <span className="text-[#e7c05a]">tirées au sort</span>
        </h2>
        <p className="inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">
          <LuShuffle aria-hidden className="h-3.5 w-3.5" />
          {tournament.squads.length} équipes de {tournament.teamSize}
        </p>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tournament.squads.map((squad, index) => {
          const mine = squad.team?.id === myTeamId;
          const color = squad.team?.color ?? GOLD;
          return (
            <motion.li key={squad.team?.id ?? index} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
              <TacticalCard cut={18} highlight={mine} innerClassName={cn("relative h-full overflow-hidden p-5", squad.forfeit && "opacity-50")}>
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                <span aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl" style={{ background: `${color}33` }} />
                <div className="relative flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-tech text-[10px] uppercase tracking-[0.26em]" style={{ color }}>
                      [{squad.team?.tag}]
                    </p>
                    <p className="mt-1 truncate font-display text-3xl font-black uppercase leading-none">{squad.team?.name}</p>
                  </div>
                  {mine ? <Chip>Ton équipe</Chip> : null}
                </div>
                <ul className="relative mt-5 space-y-2.5">
                  {squad.starters.map((player) => (
                    <SquadRow key={player.id} player={player} captain={player.id === squad.captain} />
                  ))}
                </ul>
              </TacticalCard>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

function SquadRow({ player, captain = false }) {
  return (
    <li className="flex items-center gap-3">
      <HexAvatar player={player} size={34} gold={captain} />
      <Link href={`/cod/profile/${player.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold text-white/85 hover:text-white">
        {player.username}
      </Link>
      {captain ? (
        <span className="inline-flex items-center gap-1 font-tech text-[9px] uppercase tracking-[0.2em] text-[#e7c05a]">
          <LuCrown aria-hidden className="h-3.5 w-3.5" />
          Capitaine
        </span>
      ) : (
        <span className="font-tech text-[10px] tabular-nums text-white/35">{player.points} pts</span>
      )}
    </li>
  );
}

/** Podium final : trois médailles, équipe et joueurs. */
function AnubisPodium({ tournament }) {
  const playersOf = (teamId) => {
    const squad = tournament.squads.find((s) => s.team?.id === teamId);
    return squad ? squad.starters : [];
  };
  const order = [PLACES[1], PLACES[0], PLACES[2]];
  return (
    <section aria-label="Podium" className="relative">
      <ol className="grid items-end gap-4 sm:grid-cols-3">
        {order.map(([key, metal, label, tone]) => {
          const team = tournament[key];
          if (!team) return <li key={key} className="hidden sm:block" />;
          const first = metal === "or";
          return (
            <motion.li
              key={key}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: first ? 0.1 : 0.3, duration: 0.6 }}
              className={cn(first ? "sm:order-none" : "", "order-none")}
            >
              <TacticalCard highlight={first} cut={22} innerClassName={cn("relative overflow-hidden px-5 pb-6 pt-4 text-center", first && "holo")}>
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(231,192,90,0.22),transparent_70%)]" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={MEDAL_IMAGE[metal]}
                  alt={`Médaille ${label}`}
                  width={420}
                  height={420}
                  className={cn("relative mx-auto w-auto object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.7)]", first ? "h-48" : "h-36")}
                />
                <p className={cn("relative mt-2 font-tech text-[10px] uppercase tracking-[0.3em]", tone)}>{label}</p>
                <p className="relative mt-1 font-display text-3xl font-black uppercase leading-none">{team.name}</p>
                <ul className="relative mt-4 flex flex-wrap justify-center gap-1.5">
                  {playersOf(team.id).map((player) => (
                    <li key={player.id} title={player.username}>
                      <Link href={`/cod/profile/${player.id}`}>
                        <HexAvatar player={player} size={30} gold={first} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </TacticalCard>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

function AnubisRules({ teamSize }) {
  const steps = [
    ["01", "Inscris-toi seul", "Pas besoin d'équipe : identifiant Activision et compte Discord suffisent."],
    ["02", "Check-in", "De 2 h à 15 min avant le début, confirme ta présence. Sans check-in, pas de place."],
    ["03", "Tirage", `Les présents sont répartis au hasard en équipes de ${teamSize}, le mieux classé devient capitaine. Un inscrit en liste d'attente prend la place d'un absent ; ensuite, les équipes ne changent plus.`],
    ["04", "Médailles", "Or, argent, bronze sur ton profil, et le rôle Discord « Vainqueur — Coupe Anubis » jusqu'à la prochaine coupe."],
  ];
  return (
    <section aria-labelledby="titre-deroule" className="border-t border-white/8 pt-10">
      <h2 id="titre-deroule" className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">
        Comment ça <span className="text-[#e7c05a]">marche</span>
      </h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([n, title, text]) => (
          <li key={n} className="relative border-l border-[#e7c05a]/30 pl-5">
            <span className="font-tech text-3xl font-black text-[#e7c05a]/25">{n}</span>
            <p className="mt-1 font-display text-xl font-bold uppercase leading-none">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Aucune Coupe Horus prévue : même carte que l'Anubis, avec le trophée Horus. */
export function HorusTeaser() {
  return (
    <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(231,192,90,0.14),transparent_55%)]" />
      <div className="relative grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-[260px_1fr]">
        <FloatingMedal size={230} src="/images/trophees/horus-or.png" alt="Trophée de la Coupe Horus" />
        <div className="max-w-xl">
          <p className="font-tech text-[11px] uppercase tracking-[0.32em] text-[#e7c05a]">Coupe d&apos;équipe</p>
          <p className="mt-3 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
            Aucune Coupe Horus <span className="text-[#e7c05a]">prévue</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            La Coupe Horus se joue en équipe : le Leader inscrit sa formation pour rejoindre le tableau en direct. Décroche un trophée d&apos;or,
            d&apos;argent ou de bronze sur la fiche d&apos;équipe et le profil de chaque joueur, et gagne des points de Division. La prochaine sera annoncée ici et sur Discord.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/cod/division" size="lg">
              File Division
            </ButtonLink>
            <ButtonLink href="/cod/equipes" size="lg" variant="outline">
              Classement des équipes
            </ButtonLink>
          </div>
        </div>
      </div>
    </TacticalCard>
  );
}

/** Aucune Coupe Anubis prévue. */
export function AnubisTeaser() {
  return (
    <TacticalCard highlight cut={28} innerClassName="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(231,192,90,0.14),transparent_55%)]" />
      <div className="relative grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-[260px_1fr]">
        <FloatingMedal size={230} />
        <div className="max-w-xl">
          <p className="font-tech text-[11px] uppercase tracking-[0.32em] text-[#e7c05a]">Inscription solo</p>
          <p className="mt-3 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
            Aucune Coupe Anubis <span className="text-[#e7c05a]">prévue</span>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            La Coupe Anubis se joue en solo : inscris-toi individuellement et le site forme les équipes au hasard au début de la coupe. Décroche une
            médaille d&apos;or, d&apos;argent ou de bronze sur ton profil. La prochaine sera annoncée ici et sur Discord.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/cod/ranked" size="lg">
              Jouer en Classé
            </ButtonLink>
          </div>
        </div>
      </div>
    </TacticalCard>
  );
}
