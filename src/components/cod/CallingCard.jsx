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
  if (art.type === "sunset") {
    // Cartes GTA 6 : ciel violet → orange, soleil rayé, silhouette de ville et de palmiers.
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ background: "linear-gradient(180deg,#1a0b2e 0%,#4a1450 38%,#b3305e 68%,#ff7a4a 88%,#ffb45c 100%)" }}>
        {motif ? (
          <div className={spot}>
            <div
              className={cn("rounded-full", big ? "h-56 w-56" : "h-20 w-20")}
              style={{
                background: "linear-gradient(180deg,#ffe08a 0%,#ffb05c 45%,#ff5f8a 100%)",
                maskImage: "linear-gradient(180deg,#000 52%,transparent 52%,transparent 58%,#000 58%,#000 66%,transparent 66%,transparent 71%,#000 71%,#000 78%,transparent 78%,transparent 82%,#000 82%)",
                WebkitMaskImage: "linear-gradient(180deg,#000 52%,transparent 52%,transparent 58%,#000 58%,#000 66%,transparent 66%,transparent 71%,#000 71%,#000 78%,transparent 78%,transparent 82%,#000 82%)",
                boxShadow: "0 0 40px rgba(255,120,120,.45)",
              }}
            />
          </div>
        ) : null}
        <svg className="absolute inset-x-0 bottom-0 h-[42%] w-full" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
          <path
            fill="#12061c"
            d="M0 60V44h10v-8h8v8h6V30h10v14h8v-6h10v6h6V24h12v20h6v-10h8v10h10V36h6v8h8V28h14v16h6v-8h10v8h12V32h8v12h6V20h10v24h8v-6h12v6h10V38h6v6h8V26h12v18h6v-8h10v8h10V34h8v10h10V30h12v14h8v-10h10v10h12V40h10v20Z"
          />
          <g fill="#12061c">
            <path d="M330 60 L333 22 L335 22 L337 60Z" />
            <path d="M334 22 q-14 -4 -22 4 q10 -6 22 -2Z M334 22 q14 -4 22 4 q-10 -6 -22 -2Z M334 22 q-8 -10 -18 -10 q10 2 18 12Z M334 22 q8 -10 18 -10 q-10 2 -18 12Z" />
            <path d="M372 60 L374 30 L376 30 L377 60Z" />
            <path d="M375 30 q-11 -3 -17 3 q8 -5 17 -1Z M375 30 q11 -3 17 3 q-8 -5 -17 -1Z M375 30 q-6 -8 -14 -8 q8 2 14 9Z" />
          </g>
        </svg>
        {art.glyph && motif && !big ? (
          <div
            className={cn("absolute font-display font-black italic leading-none", big ? "right-[6%] top-[12%]" : "right-[3%] top-[8%]")}
            style={{ fontSize: big ? "6rem" : "2.2rem", color: "#fff", textShadow: `0 0 18px ${art.color}, 0 0 4px ${art.color}` }}
          >
            {art.glyph}
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
/** Fondu plus court : sujet large (art.vivid) qui doit garder ses bords. */
const FADE_SOFT = "linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)";
function CardVideo({ art, place }) {
  // art.cover : vidéo déjà au format bannière (fond prolongé), affichée en plein cadre.
  if (art.cover) {
    const pos = place === "profile" && art.mobilePosition ? "[object-position:var(--pos-m)] lg:[object-position:var(--pos)]" : "[object-position:var(--pos)]";
    const vars = { "--pos": art.position ?? "center", "--pos-m": art.mobilePosition ?? art.position ?? "center" };
    return (
      <div className="absolute inset-0 overflow-hidden bg-black" style={vars}>
        <video src={art.video} poster={art.poster} autoPlay muted loop playsInline aria-hidden className={cn("cc-video absolute inset-0 h-full w-full object-cover", pos)} />
        <img src={art.poster} alt="" aria-hidden className={cn("cc-video-still absolute inset-0 hidden h-full w-full object-cover", pos)} />
      </div>
    );
  }
  // art.aspect (« largeur/hauteur ») : vidéo affichée entière, sans être rognée (sujet qui se déplace).
  const whole = Boolean(art.aspect);
  const sharp = whole
    ? place === "profile"
      ? "w-auto right-[3%] lg:right-auto lg:left-[45%] lg:-translate-x-1/2"
      : "w-auto right-[4%]"
    : place === "profile"
      ? "right-0 w-[60%] lg:left-[30%] lg:right-auto lg:w-[32%]"
      : "right-0 w-[55%]";
  const shape = whole ? { aspectRatio: art.aspect } : {};
  // art.vivid : fond flouté plus lumineux et fondu plus court (couleurs vives qui remplissent la carte).
  const fade = art.vivid ? FADE_SOFT : FADE;
  const blurred = art.vivid ? "opacity-90 blur-2xl brightness-75 saturate-150" : "opacity-70 blur-2xl brightness-50";
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div className={cn("absolute inset-0 scale-110 bg-cover bg-center", blurred)} style={{ backgroundImage: `url(${art.poster})` }} />
      <div className="cc-video absolute inset-0">
        <video src={art.video} poster={art.poster} autoPlay muted loop playsInline aria-hidden className={cn("absolute inset-0 h-full w-full scale-110 object-cover", blurred)} />
        <video src={art.video} poster={art.poster} autoPlay muted loop playsInline aria-hidden className={cn("absolute inset-y-0 h-full object-cover", sharp)} style={{ ...shape, maskImage: fade, WebkitMaskImage: fade }} />
      </div>
      <div className={cn("cc-video-still absolute inset-y-0 hidden bg-cover bg-center", sharp)} style={{ ...shape, backgroundImage: `url(${art.poster})`, maskImage: fade, WebkitMaskImage: fade }} />
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
