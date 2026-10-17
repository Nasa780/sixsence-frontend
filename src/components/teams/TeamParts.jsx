import Link from "next/link";
import { LuCrown, LuShield } from "react-icons/lu";
import { cn } from "../../lib/cn";
import { rankFor, rankGradient } from "../../lib/ranks";
import { RankEmblem } from "../cod/RankEmblem";
import { Avatar } from "../ui/Avatar";
import { Chip } from "../ui/Feedback";

/** Blason d'équipe : logo envoyé par l'équipe, sinon son tag sur sa couleur (coin coupé). */
export function TeamCrest({ team, size = 56, className = "" }) {
  const color = team?.color ?? "#d4af37";
  return (
    <span
      className={cn("clip-corner inline-flex shrink-0 p-[2px]", className)}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${color}, var(--color-gold))` }}
    >
      {team?.logoUrl ? (
        <img src={team.logoUrl} alt="" width={size - 4} height={size - 4} loading="lazy" className="clip-corner h-full w-full bg-ink-800 object-cover" />
      ) : (
        <span
          aria-hidden
          className="clip-corner flex h-full w-full items-center justify-center bg-ink-800 font-display font-black uppercase"
          style={{ color, fontSize: Math.round(size * (team?.tag?.length > 3 ? 0.26 : 0.32)) }}
        >
          {team?.tag ?? "?"}
        </span>
      )}
    </span>
  );
}

/** Rôle dans l'équipe : couronne (créateur, Leader d'office), Leader ou Joueur. */
export function RoleChip({ member }) {
  if (member.crown) {
    return (
      <Chip className="shrink-0">
        <LuCrown aria-label="Couronne" className="h-3 w-3" />
        Leader
      </Chip>
    );
  }
  if (member.role === "leader") {
    return (
      <Chip className="shrink-0">
        <LuShield aria-hidden className="h-3 w-3" />
        Leader
      </Chip>
    );
  }
  return (
    <Chip tone="neutral" className="shrink-0">
      {member.starter ? "Joueur" : "Remplaçant"}
    </Chip>
  );
}

/** Ligne d'un joueur de l'effectif (même rendu que les équipes d'un match classé). */
export function MemberRow({ member, children = null, isMe = false }) {
  const rank = rankFor(member.points ?? 0);
  return (
    <li className={cn("flex flex-wrap items-center gap-3 border-l-2 bg-white/[0.03] px-3 py-3 sm:px-4", isMe ? "border-gold bg-gold/8" : member.crown ? "border-gold/60" : "border-white/10")}>
      <Avatar src={member.avatarUrl} name={member.username} size={42} ring={rankGradient(rank, 160)} />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2">
          <RankEmblem rank={rank} size={20} animated={false} />
          <Link
            href={`/cod/profile/${member.id}`}
            className="truncate font-display text-xl font-bold uppercase leading-none tracking-wide hover:!text-gold"
            style={{ color: rank.text }}
          >
            {member.username}
          </Link>
          <RoleChip member={member} />
          {isMe ? <Chip className="shrink-0">Toi</Chip> : null}
        </p>
        <p className="mt-1.5 truncate text-xs text-white/50">{rank.name} en classé</p>
      </div>
      {children}
    </li>
  );
}

/** En-tête d'un bloc d'effectif (« Titulaires 4 / 4 »). */
export function RosterHeading({ title, count, max, gold = false, className = "" }) {
  return (
    <header className={cn("flex items-end justify-between border-b-2 pb-3", gold ? "border-gold" : "border-white/70", className)}>
      <h2 className={cn("font-display text-3xl font-black uppercase leading-none sm:text-4xl", gold && "text-gold")}>{title}</h2>
      <span className="font-tech text-xs uppercase tracking-[0.2em] text-white/45">
        {count} / {max}
      </span>
    </header>
  );
}

/** Onglet incliné (même style que les onglets de saison du classement). */
export function SlantTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "clip-slant shrink-0 px-5 py-2.5 font-display text-sm font-bold uppercase tracking-[0.14em] transition-colors",
        active ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export const fieldClass = "w-full border border-white/15 bg-ink-700 px-3.5 py-3 text-sm text-white placeholder:text-white/30 focus:border-gold focus:outline-none";
export const labelClass = "mb-2 block font-tech text-[10px] uppercase tracking-[0.24em] text-white/45";
