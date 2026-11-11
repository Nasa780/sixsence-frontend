import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuAward, LuCheck, LuIdCard, LuLock } from "react-icons/lu";
import { signInWithDiscord } from "../../lib/auth";
import { RARITY, cardInfo } from "../../lib/cards";
import { celebrate } from "../../lib/celebrate";
import { cn } from "../../lib/cn";
import { CountUp } from "../effects/CountUp";
import { Reveal } from "../effects/Reveal";
import { Button } from "../ui/Button";
import { TacticalCard } from "../ui/TacticalCard";
import { CardArt, RarityFx } from "./CallingCard";

const METALS = { bronze: "#cd7f32", argent: "#c9d1d9", or: "#e7c05a" };
const metalOf = (key) => METALS[/pass-(bronze|argent|or)$/.exec(key)?.[1]] ?? METALS.or;

/** Niveau, barre vers le palier suivant, et comment gagner de l'XP. */
function Progress({ data }) {
  const reduced = useReducedMotion();
  const { me, tierXp, tiers, season } = data;
  const level = me?.level ?? 0;
  const done = level >= tiers;
  const inTier = me ? me.xp - level * tierXp : 0;
  const percent = done ? 100 : Math.round((inTier / tierXp) * 100);

  // Nouveau palier depuis la dernière visite : petite pluie de paillettes (palier gardé dans le navigateur).
  useEffect(() => {
    if (!me) return;
    try {
      const key = `sixsence:pass:${season.id ?? "saison"}`;
      const before = Number(window.localStorage.getItem(key));
      window.localStorage.setItem(key, String(level));
      if (before > 0 && level > before) setTimeout(() => celebrate("petit"), 700);
    } catch {
      // Sans stockage : pas de célébration.
    }
  }, [me, level, season.id]);

  return (
    <TacticalCard cut={22} highlight innerClassName="relative overflow-hidden p-6 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative grid items-center gap-6 lg:grid-cols-[auto_1fr]">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-8xl font-black leading-none tabular-nums text-gold">
            <CountUp value={level} delay={200} />
          </span>
          <span className="font-tech text-xs uppercase tracking-[0.2em] text-white/50">
            palier
            <br />
            sur {tiers}
          </span>
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-white/70">{done ? "Pass terminé, bravo !" : `Palier ${level + 1}`}</span>
            {me && !done ? (
              <span className="font-tech text-xs tabular-nums text-white/55">
                <CountUp value={inTier} delay={300} /> / {tierXp} XP
              </span>
            ) : null}
          </div>
          <div className="mt-2 h-3 overflow-hidden bg-white/[0.07]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Progression vers le palier suivant">
            <motion.div className="h-full bg-gold-sheen" initial={reduced ? false : { width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
          </div>
          <p className="mt-3 text-sm text-white/55">+500 XP par victoire et +150 XP par défaite, en Classé comme en Division.</p>
          <p className="mt-1 text-xs text-white/40">
            {season.endsAt
              ? `Se termine avec la saison, le ${new Date(season.endsAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}.`
              : "Se termine avec la saison. Les récompenses gagnées restent à toi."}
          </p>
        </div>
      </div>
      {!me ? (
        <div className="relative mt-6 border-t border-white/10 pt-5">
          <Button onClick={() => signInWithDiscord()}>
            <FaDiscord aria-hidden className="h-5 w-5" />
            Connexion pour suivre ton pass
          </Button>
        </div>
      ) : null}
    </TacticalCard>
  );
}

/** Les paliers en cases : atteints en or, le suivant en surbrillance, récompenses marquées d'une icône. */
function Road({ data }) {
  const level = data.me?.level ?? 0;
  const rewards = new Map();
  for (const reward of data.rewards) rewards.set(reward.level, [...(rewards.get(reward.level) ?? []), reward]);

  return (
    <section aria-labelledby="titre-paliers">
      <h2 id="titre-paliers" className="font-display text-3xl font-black uppercase leading-none">
        Les {data.tiers} paliers
      </h2>
      <ol className="mt-5 grid grid-cols-5 gap-2 sm:grid-cols-10">
        {Array.from({ length: data.tiers }, (_, index) => index + 1).map((tier) => {
          const reached = tier <= level;
          const next = tier === level + 1;
          const reward = rewards.get(tier);
          const label = reward ? reward.map((item) => item.name).join(" et ") : null;
          return (
            <li
              key={tier}
              title={label ? `Palier ${tier} : ${label}` : `Palier ${tier}`}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center border text-center transition-colors",
                reached ? "border-gold/60 bg-gold/15" : next ? "border-gold bg-white/[0.04]" : "border-white/10 bg-white/[0.02]",
                reward && !reached && "border-white/25",
              )}
            >
              <span className={cn("font-tech text-xs font-bold tabular-nums", reached ? "text-gold-light" : "text-white/50")}>{tier}</span>
              {reward ? (
                <span className="mt-1 flex items-center gap-1" aria-label={label}>
                  {reward.map((item) =>
                    item.kind === "card" ? (
                      <LuIdCard key={item.key} aria-hidden className="h-4 w-4" style={{ color: RARITY[item.rarity].text }} />
                    ) : (
                      <LuAward key={item.key} aria-hidden className="h-4 w-4" style={{ color: metalOf(item.key) }} />
                    ),
                  )}
                </span>
              ) : null}
              {next ? <span aria-hidden className="absolute inset-0 animate-pulse border border-gold/60" /> : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/45">
        <span className="inline-flex items-center gap-1.5">
          <LuIdCard aria-hidden className="h-3.5 w-3.5" /> Carte de visite
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LuAward aria-hidden className="h-3.5 w-3.5" /> Badge du profil
        </span>
      </p>
    </section>
  );
}

function Status({ owned, level }) {
  return owned ? (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-win">
      <LuCheck aria-hidden className="h-3.5 w-3.5" /> Obtenu
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-white/45">
      <LuLock aria-hidden className="h-3.5 w-3.5" /> Palier {level}
    </span>
  );
}

function CardReward({ reward, owned }) {
  const rarity = RARITY[reward.rarity];
  return (
    <article className="overflow-hidden border bg-white/[0.02]" style={{ borderColor: owned ? rarity.text : "rgba(255,255,255,0.1)" }}>
      <div className={cn("relative aspect-[8/3] overflow-hidden", !owned && "opacity-75 saturate-50")}>
        <CardArt cardKey={reward.key} place="tile" />
        <RarityFx rarity={cardInfo(reward.key).rarity} />
      </div>
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold uppercase leading-none">{reward.name}</p>
          <p className="mt-1 text-xs" style={{ color: rarity.text }}>
            Carte {rarity.label}
          </p>
        </div>
        <Status owned={owned} level={reward.level} />
      </div>
    </article>
  );
}

function BadgeReward({ reward, owned }) {
  const color = metalOf(reward.key);
  return (
    <article className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3">
      <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-full border-2", !owned && "opacity-50")} style={{ borderColor: color, background: `${color}22` }}>
        <LuAward aria-hidden className="h-6 w-6" style={{ color }} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-bold uppercase leading-none">{reward.name}</p>
        <p className="mt-1 text-xs text-white/50">Badge du profil</p>
      </div>
      <Status owned={owned} level={reward.level} />
    </article>
  );
}

/** Pass de saison gratuit (GET /cod/pass) : progression, paliers et récompenses, toutes obtenues en jouant. */
export function SeasonPass({ data }) {
  const { me, rewards } = data;
  const cards = rewards.filter((reward) => reward.kind === "card");
  const badges = rewards.filter((reward) => reward.kind === "badge");

  return (
    <div className="space-y-12">
      <Reveal>
        <Progress data={data} />
      </Reveal>
      <Reveal delay={0.05}>
        <Road data={data} />
      </Reveal>
      <Reveal delay={0.1}>
        <section aria-labelledby="titre-recompenses">
          <h2 id="titre-recompenses" className="font-display text-3xl font-black uppercase leading-none">
            Les récompenses
          </h2>
          <p className="mt-2 text-sm text-white/55">
            Attribuées toutes seules. Exclusives à cette saison : tu les gardes pour toujours.{" "}
            <Link href="/cod/profile?cartes=1" className="text-gold underline underline-offset-4 hover:text-gold-light">
              Mes cartes de visite
            </Link>
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {cards.map((reward) => (
              <CardReward key={reward.key} reward={reward} owned={Boolean(me?.cards.includes(reward.key))} />
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {badges.map((reward) => (
              <BadgeReward key={reward.key} reward={reward} owned={Boolean(me?.badges.includes(reward.key))} />
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
