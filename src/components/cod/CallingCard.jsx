import { LuCheck, LuLock, LuSparkles } from "react-icons/lu";
import { RARITY, cardInfo } from "../../lib/cards";
import { cn } from "../../lib/cn";
import { RANKS } from "../../lib/ranks";
import { LogoMark } from "../ui/Logo";
import { RankEmblem } from "./RankEmblem";

/**
 * Cartes de visite : dessin (CardArt), effets de rareté (RarityFx), fond de la 1re section
 * du profil (CardBackdrop) et bannière de la fenêtre de choix (CardTile).
 * Placement du motif : bannière → à droite ; profil sur ordinateur → au centre, entre
 * l'identité et les chiffres ; profil sur téléphone → en bas à droite, plus petit.
 */

const rankByName = (name) => RANKS.find((rank) => rank.name === name);

/** Position du motif selon l'endroit où la carte est dessinée. */
const SPOT = {
  tile: "right-[5%] top-1/2 -translate-y-1/2",
  profile:
    "right-[3%] bottom-[2%] origin-bottom-right scale-[0.6] lg:bottom-auto lg:right-auto lg:top-1/2 lg:left-[45%] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:scale-100",
};

export function CardArt({ cardKey, place = "tile", motif = true }) {
  const { art } = cardInfo(cardKey);
  const big = place !== "tile";
  const spot = cn("absolute", SPOT[place] ?? SPOT.tile);

  if (art.video) {
    return <CardVideo art={art} place={place} />;
  }
  if (art.image) {
    // Profil sur téléphone (carte haute) : cadrage à part (art.mobilePosition), sujet sur le bord droit.
    const mobile = place === "profile" && art.mobilePosition;
    return (
      <div
        className={cn("absolute inset-0 bg-cover", mobile && "[background-position:var(--pos-m)] lg:[background-position:var(--pos)]")}
        style={{
          backgroundImage: `url(${art.image})`,
          ...(mobile ? { "--pos": art.position ?? "center", "--pos-m": art.mobilePosition } : { backgroundPosition: art.position ?? "center" }),
        }}
      />
    );
  }
  if (art.type === "default") {
    return (
      <div className="absolute inset-0 bg-[#121110]">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 80% 50%,rgba(212,175,55,.22),transparent 55%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(135deg,rgba(212,175,55,.08) 0 2px,transparent 2px 16px)" }} />
        {motif ? (
          <div className={spot}>
            <LogoMark className={cn("text-gold opacity-60 drop-shadow-[0_0_18px_rgba(212,175,55,.45)]", big ? "h-52 w-52" : "h-16 w-16")} />
          </div>
        ) : null}
      </div>
    );
  }
  if (art.type === "rank") {
    const rank = rankByName(art.rank);
    return (
      <div className="absolute inset-0" style={{ background: `linear-gradient(105deg,#0b0b0b 30%,${rank.dark}cc 78%,${rank.color} 130%)` }}>
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 82% 50%,${rank.color}55,transparent 55%)` }} />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `repeating-linear-gradient(100deg,${rank.light}14 0 1px,transparent 1px 22px)` }} />
        {motif ? (
          <div className={spot}>
            <RankEmblem rank={rank} size={big ? 220 : 64} animated={false} />
          </div>
        ) : null}
      </div>
    );
  }
  if (art.type === "glyph") {
    return (
      <div className="absolute inset-0" style={{ background: `linear-gradient(105deg,#0c0c0c 40%,${art.color}33 100%)` }}>
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 85% 50%,${art.color}40,transparent 50%)` }} />
        <div className="absolute inset-0" style={{ backgroundImage: `repeating-linear-gradient(135deg,${art.color}10 0 2px,transparent 2px 14px)` }} />
        {motif ? (
          <div
            className={cn(spot, "font-display font-black italic leading-none")}
            style={{ fontSize: big ? "11rem" : "4rem", color: art.color, opacity: 0.55, textShadow: `0 0 30px ${art.color}88` }}
          >
            {art.glyph}
          </div>
        ) : null}
      </div>
    );
  }
  // Illustration provisoire (Épiques et Légendaires), en attendant l'image.
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: `linear-gradient(105deg,#0a0610 25%,${art.hue}55 75%,${art.hue}aa 120%)` }}>
      <div className="cc-breathe absolute inset-0" style={{ backgroundImage: `radial-gradient(ellipse at 78% 40%,${art.hue}88,transparent 55%),radial-gradient(ellipse at 95% 100%,${art.hue}55,transparent 45%)` }} />
      <svg className="absolute inset-0 h-full w-full opacity-30" preserveAspectRatio="none" viewBox="0 0 400 100" aria-hidden>
        <path d="M0 80 L60 62 L110 74 L170 40 L230 58 L290 22 L350 44 L400 30 L400 100 L0 100 Z" fill="#000" opacity=".6" />
        <path d="M0 90 L80 76 L150 86 L220 64 L300 78 L400 60 L400 100 L0 100 Z" fill="#000" />
      </svg>
      {motif ? (
        <div
          className={cn(spot, "font-display font-black italic leading-none")}
          style={{ fontSize: big ? "10rem" : "3.6rem", color: "#fff", opacity: 0.85, textShadow: `0 0 28px ${art.hue}` }}
        >
          {art.glyph}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Fond vidéo : la vidéo (verticale) nette, en fondu sur les bords, au centre du profil sur
 * ordinateur et à droite ailleurs ; la même vidéo floutée et assombrie remplit la bannière.
 * Moins d'animations demandées : l'image fixe (poster) seulement.
 */
const FADE = "linear-gradient(90deg,transparent,#000 25%,#000 75%,transparent)";
function CardVideo({ art, place }) {
  const sharp = place === "profile" ? "right-0 w-[60%] lg:left-[30%] lg:right-auto lg:w-[32%]" : "right-0 w-[55%]";
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className="absolute inset-0 scale-110 bg-cover bg-center opacity-70 blur-2xl brightness-50" style={{ backgroundImage: `url(${art.poster})` }} />
      <div className="cc-video absolute inset-0">
        <video src={art.video} poster={art.poster} autoPlay muted loop playsInline aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl brightness-50" />
        <video src={art.video} poster={art.poster} autoPlay muted loop playsInline aria-hidden className={cn("absolute inset-y-0 h-full object-cover", sharp)} style={{ maskImage: FADE, WebkitMaskImage: FADE }} />
      </div>
      <div className={cn("cc-video-still absolute inset-y-0 hidden bg-cover bg-center", sharp)} style={{ backgroundImage: `url(${art.poster})`, maskImage: FADE, WebkitMaskImage: FADE }} />
    </div>
  );
}

/** Effets de rareté : reflet et particules pour les Légendaires (le halo des Épiques est sur le cadre). */
export function RarityFx({ rarity }) {
  if (rarity !== "legendaire") return null;
  return (
    <>
      <div className="cc-sweep pointer-events-none absolute inset-y-0 w-1/4 bg-linear-to-r from-transparent via-[#fff1c4]/35 to-transparent" />
      {[62, 71, 80, 90].map((left, index) => (
        <span key={left} className="cc-drift absolute h-1 w-1 rounded-full bg-[#f5d77a]" style={{ left: `${left}%`, top: "100%", animationDelay: `${index * 0.9}s` }} />
      ))}
    </>
  );
}

/** Fond de la 1re section du profil : carte, effets et voile de lisibilité. */
export function CardBackdrop({ cardKey, compact = false }) {
  const { rarity } = cardInfo(cardKey);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <CardArt cardKey={cardKey} place={compact ? "tile" : "profile"} />
      <RarityFx rarity={rarity} />
      <div
        className={cn(
          "absolute inset-0",
          compact ? "bg-linear-to-r from-ink/90 via-ink/50 to-ink/10" : "bg-ink/45 lg:bg-transparent lg:bg-linear-to-r lg:from-ink/90 lg:via-ink/35 lg:to-ink/85",
        )}
      />
    </div>
  );
}

/** Bannière 4:1 de la fenêtre de choix : nom, condition, rareté, état. */
export function CardTile({ card, selected = false, onSelect }) {
  const { rarity } = cardInfo(card.key);
  const style = RARITY[card.rarity ?? rarity];
  const locked = !card.owned;
  const pct = card.progress ? Math.min(100, Math.round((card.progress[0] / card.progress[1]) * 100)) : null;

  return (
    <button
      type="button"
      onClick={() => !locked && onSelect?.(card)}
      aria-pressed={selected}
      aria-label={`${card.name}${locked ? " (verrouillée)" : ""} — ${card.condition}`}
      className={cn("relative block w-full text-left", locked ? "cursor-default" : "cursor-pointer")}
    >
      <div
        className={cn("relative p-[2px] clip-corner [--cut:12px]", card.rarity === "epique" && !locked && "cc-glow")}
        style={{ background: locked ? "#2a2a2a" : style.frame }}
      >
        <div className="relative aspect-[4/1] overflow-hidden clip-corner [--cut:11px]">
          <div className={cn("absolute inset-0", locked && "opacity-35 grayscale")}>
            <CardArt cardKey={card.key} />
            {!locked ? <RarityFx rarity={card.rarity} /> : null}
          </div>
          <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/30 to-transparent" />

          {/* Ligne du haut, à gauche : jamais sous le motif (à droite). */}
          <div className="absolute left-3 top-2 flex flex-wrap items-center gap-1.5">
            {card.isNew ? (
              <span className="flex items-center gap-1 bg-gold px-1.5 py-0.5 font-tech text-[8px] font-bold uppercase tracking-[0.15em] text-ink">
                <LuSparkles aria-hidden className="h-2.5 w-2.5" />
                Nouvelle
              </span>
            ) : null}
            <span className="font-tech text-[8px] uppercase tracking-[0.2em]" style={{ color: locked ? "#7a7a7a" : style.text }}>
              {style.label}
            </span>
            {card.exclusive ? (
              <span className="border border-[#f5d77a]/50 bg-[#f5d77a]/10 px-1.5 py-0.5 font-tech text-[7px] uppercase tracking-[0.2em] text-[#f5d77a]">
                {card.unavailable ? "Plus disponible" : "Exclusive"}
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-2 left-3 right-3">
            <p className="flex items-center gap-1.5 font-display text-lg font-bold uppercase leading-none tracking-wide" style={{ color: locked ? "#9a9a9a" : "#fff" }}>
              {locked ? <LuLock aria-hidden className="h-3.5 w-3.5" /> : null}
              {card.name}
              {card.count > 1 ? <span className="font-tech text-[10px] text-[#facc15]">×{card.count}</span> : null}
            </p>
            <p className="mt-1 text-[11px] leading-none text-white/60">{card.condition}</p>
            {locked && pct !== null ? (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10">
                  <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                </div>
                <span className="font-tech text-[9px] tabular-nums text-white/55">
                  {card.progress[0]} / {card.progress[1]}
                </span>
              </div>
            ) : null}
          </div>

          {selected ? (
            <span className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center bg-gold text-ink">
              <LuCheck aria-hidden className="h-4 w-4" />
            </span>
          ) : null}
        </div>
      </div>
      {selected ? <span aria-hidden className="pointer-events-none absolute -inset-1 border border-gold" /> : null}
    </button>
  );
}
