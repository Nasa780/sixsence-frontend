import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { LuCheck, LuLoaderCircle, LuUserMinus, LuUserPlus } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Avatar } from "../ui/Avatar";
import { Button, ButtonLink } from "../ui/Button";
import { Chip, Notice } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";

/**
 * Briques de la Coupe Anubis (inscription solo, joueurs en hexagones, médaille flottante) et cartes « aucune coupe
 * prévue ». La fiche elle-même est CupFiche, commune à tous les tournois.
 */

/** Hexagone de la médaille Anubis (avatars, cadres). */
const HEX = "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)";
const GOLD = "#e7c05a";
export const MEDAL_IMAGE = { or: "/images/trophees/anubis-or.png", argent: "/images/trophees/anubis-argent.png", bronze: "/images/trophees/anubis-bronze.png" };

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
export function FloatingMedal({ metal = "or", size = 260, src = null, alt = null }) {
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

/** Jauge des inscriptions, avec le seuil des 4 équipes. */
export function FillBar({ value, max, minimum }) {
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

/** Inscription solo, check-in et désinscription d'un joueur (Coupe Anubis). */
export function SoloRegistration({ tournament, userId, checkInOpen, onDone }) {
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

/** Joueurs inscrits, en hexagones (présents au check-in en couleur) ; titre et nombre posés par la fiche. */
export function RegisteredPlayers({ tournament, userId }) {
  return (
    <div>
      {tournament.players.length === 0 ? (
        <p className="mt-4 text-sm text-white/50">Personne pour l&apos;instant : sois le premier.</p>
      ) : (
        <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-5 lg:grid-cols-8">
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
    </div>
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
