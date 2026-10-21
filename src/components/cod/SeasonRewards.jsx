import { motion } from "framer-motion";
import { LuCrown, LuMedal, LuStar, LuUsers } from "react-icons/lu";
import { CardTile } from "./CallingCard";
import { TacticalCard } from "../ui/TacticalCard";
import { Eyebrow } from "../ui/Typography";

/**
 * Récompenses de la saison en cours (classement) : ce que gagnent le champion, le top 10 et les
 * participants à la clôture, avec les vraies cartes de visite de la saison (mêmes règles que
 * backend/src/cards.ts : participant 10 matchs, top 10, n°1) et les cartes de rang selon le pic de la saison.
 */
export function SeasonRewards({ seasonId, label }) {
  if (!seasonId) return null;
  const tiers = [
    {
      key: "champion",
      icon: LuCrown,
      title: "Champion",
      who: "N°1 du classement à la clôture",
      color: "#e7c05a",
      rewards: ["Carte légendaire Champion", "Badge Champion de la saison", "Entrée au Hall of Fame"],
      card: { key: `s${seasonId}-champion`, name: `Champion S${seasonId}`, condition: "Finir n°1 de la saison", rarity: "legendaire", owned: true, exclusive: true },
    },
    {
      key: "top10",
      icon: LuMedal,
      title: "Top 10",
      who: "Places 1 à 10 à la clôture",
      color: "#c084fc",
      rewards: ["Carte épique Top 10", "Badge Top 10 de la saison", "Podium du Hall of Fame (top 3)"],
      card: { key: `s${seasonId}-top10`, name: `Top 10 S${seasonId}`, condition: "Finir dans le top 10", rarity: "epique", owned: true, exclusive: true },
    },
    {
      key: "participant",
      icon: LuUsers,
      title: "Participant",
      who: "10 matchs classés dans la saison",
      color: "#34d399",
      rewards: ["Carte Participant de la saison", "Récap de saison sur ton profil"],
      card: { key: `s${seasonId}-participant`, name: `Participant S${seasonId}`, condition: "10 matchs dans la saison", rarity: "commune", owned: true, exclusive: true },
    },
  ];

  return (
    <section aria-labelledby="titre-recompenses">
      <Eyebrow>{label} · à la clôture</Eyebrow>
      <h2 id="titre-recompenses" className="mt-3 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
        Récompenses <span className="text-gold-gradient">de saison</span>
      </h2>
      <p className="mt-3 max-w-2xl text-sm text-white/55">Exclusives : elles ne se gagnent que pendant cette saison et ne reviendront pas. Les points repartent à zéro à la saison suivante, ton XP et tes cartes restent.</p>
      <ol className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <motion.li key={tier.key} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
            <TacticalCard highlight={index === 0} cut={22} innerClassName="relative flex h-full flex-col overflow-hidden p-5">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl" style={{ background: `${tier.color}2a` }} />
              <div className="relative flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center border" style={{ borderColor: `${tier.color}88`, color: tier.color }}>
                  <tier.icon aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-3xl font-black uppercase leading-none" style={{ color: tier.color }}>
                    {tier.title}
                  </p>
                  <p className="mt-1 text-xs text-white/50">{tier.who}</p>
                </div>
              </div>
              <div className="relative mt-5 pointer-events-none">
                <CardTile card={tier.card} />
              </div>
              <ul className="relative mt-5 space-y-1.5">
                {tier.rewards.map((reward) => (
                  <li key={reward} className="flex items-center gap-2 text-sm text-white/75">
                    <LuStar aria-hidden className="h-3.5 w-3.5 shrink-0" style={{ color: tier.color }} />
                    {reward}
                  </li>
                ))}
              </ul>
            </TacticalCard>
          </motion.li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-white/40">
        En plus : la carte de rang de la saison correspondant au plus haut rang atteint pendant la saison (Argent, Or, Platine, Diamant…). La Division a son propre classement final et son tournoi de fin de saison.
      </p>
    </section>
  );
}
