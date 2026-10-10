/**
 * Petits composants partagés, au style du site existant (page Ranked, salle
 * de match) : panneaux bleu nuit, titres avec barre bleue, badges de rang.
 */
import Image from "next/image";
import { PLATFORMS, rankFor } from "../../lib/ranks";

/** Avatar Discord, ou initiales si le joueur n'a pas de photo. */
export function Avatar({ src, name = "?", size = 32, className = "" }) {
  const initials = name.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2).toUpperCase() || "?";
  if (src && src.startsWith("http")) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`shrink-0 flex items-center justify-center [background:linear-gradient(135deg,_#1f3a55,_#0a1a2f)] border border-[rgba(255,160,64,0.25)] text-[#ffa040] font-[Rajdhani] font-bold ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.34) }}
    >
      {initials}
    </div>
  );
}

/** Panneau standard (fond bleu nuit translucide, bordure bleue). */
export function Panel({ children, className = "" }) {
  return (
    <div
      className={`rounded-[10px] bg-[rgba(10,22,40,0.6)] border border-solid border-[rgba(26,107,220,0.15)] p-4 ${className}`}
    >
      {children}
    </div>
  );
}

/** Titre de section : petite barre bleue + libellé en capitales. */
export function SectionTitle({ children, right = null, className = "" }) {
  return (
    <div className={`flex items-center gap-2 font-[Rajdhani] text-[13px] text-[#5b7fa8] ${className}`}>
      <div className="h-4 w-1 rounded-full [background:linear-gradient(180deg,_#1a6bdc,_rgba(26,_107,_220,_0.53))]" />
      <b className="tracking-[1.04px] leading-[19.5px] uppercase flex-1">{children}</b>
      {right}
    </div>
  );
}

/** Grand titre de page (style « Rechercher un match »). */
export function PageTitle({ icon, title, subtitle, right = null }) {
  return (
    <div className="flex items-start gap-4 flex-wrap">
      {icon && <Image className="h-11 w-11 rounded-[10px]" width={44} height={44} alt="" src={icon} />}
      <div className="flex-1 min-w-[220px]">
        <h1 className="m-0 text-[28px] tracking-[0.28px] leading-[30.8px] font-bold text-[#e8f0fa] font-[Rajdhani] max-sm:text-[22px] max-sm:leading-[25px]">
          {title}
        </h1>
        {subtitle && <p className="m-0 mt-1 text-sm text-[#6b7d94] font-[Inter] leading-[21px]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/** Badge de rang (point de couleur + nom), comme dans la salle de match. */
export function RankBadge({ points = 0, withPoints = false }) {
  const rank = rankFor(points);
  return (
    <span
      className="inline-flex items-center gap-[5px] h-[21px] px-[9px] border border-solid font-['Barlow_Condensed'] text-[10px] whitespace-nowrap"
      style={{ color: rank.color, borderColor: `${rank.color}44`, background: `${rank.color}22` }}
    >
      <span className="h-[5px] w-[5px] rounded-full" style={{ background: rank.color }} />
      <b className="tracking-[1px] leading-[15px] uppercase">
        {rank.name}
        {withPoints && ` · ${points} pts`}
      </b>
    </span>
  );
}

/** Badge de plateforme (PC / PS / XBOX). */
export function PlatformBadge({ platform }) {
  if (!platform) return null;
  return (
    <span className="inline-flex items-center h-[21px] px-[7px] border border-solid border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.1)] text-[#00d4ff] font-['Barlow_Condensed'] text-[10px] tracking-[0.8px] uppercase font-semibold">
      {PLATFORMS[platform] || platform}
    </span>
  );
}

/** Bouton principal bleu (style « Rejoindre / Chercher un match »). */
export function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={`cursor-pointer [border:none] py-3 px-5 rounded-[10px] [background:linear-gradient(90deg,_#1a6bdc,_#1559b8)] text-white font-[Rajdhani] font-bold text-[16px] tracking-[0.6px] disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Bouton or (style « Se connecter » de la page Ranked). */
export function GoldButton({ children, className = "", ...props }) {
  return (
    <button
      className={`cursor-pointer [border:none] py-2.5 px-6 [background:linear-gradient(90deg,_#c9a227,_#a07a10)] text-[#080c14] font-[Inter] font-bold text-sm tracking-[0.56px] disabled:opacity-60 hover:brightness-110 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Message d'information / d'erreur sous un bouton. */
export function Notice({ tone = "info", children }) {
  if (!children) return null;
  const styles = {
    info: "text-[#a0b0c8] border-[rgba(26,107,220,0.2)] bg-[rgba(26,107,220,0.06)]",
    error: "text-[#fecaca] border-[rgba(220,38,38,0.3)] bg-[rgba(220,38,38,0.08)]",
    success: "text-[#86efac] border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.08)]",
  };
  return (
    <div className={`rounded-[10px] border border-solid px-3 py-2 text-xs font-[Inter] leading-[18px] ${styles[tone]}`}>
      {children}
    </div>
  );
}

/** Texte de chargement discret. */
export function Loading({ label = "Chargement…" }) {
  return <div className="py-10 text-center text-sm text-[#5b7fa8] font-[Inter]">{label}</div>;
}

/** Formate une date en français (« 23 janv., 23:47 »). */
export function formatDate(value, withTime = true) {
  if (!value) return "";
  return new Date(value).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : { year: "numeric" }),
  });
}
