import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowRight, LuCrown, LuFlame, LuStar, LuTrophy, LuZap } from "react-icons/lu";
import { api } from "../../lib/api";
import { Avatar } from "../ui/Avatar";
import { TacticalCard } from "../ui/TacticalCard";
import { SectionHeading } from "../ui/Typography";

const RECORDS = [
  ["streak", "Plus longue série", LuFlame, (v) => `${v} V`],
  ["peak", "Plus haut sommet", LuZap, (v) => `${v.toLocaleString("fr-FR")} pts`],
  ["xp", "Plus d'expérience", LuStar, (v) => `${v.toLocaleString("fr-FR")} XP`],
  ["wins", "Victoires cette saison", LuTrophy, (v) => `${v} V`],
];
const CUP_IMAGE = { horus: "/images/trophees/horus-or.png", anubis: "/images/trophees/anubis-or.png", saison: "/images/trophees/horus-or.png" };
const monthFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Hub MW4 : aperçu du Hall of Fame (records de tous les temps, dernier vainqueur de coupe, dernier MVP du
 * mois) et lien vers la page complète. Données GET /hall-of-fame ; rien n'est affiché sans données.
 */
export function HallOfFameBlock() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api("/hall-of-fame")
      .then(setData)
      .catch(() => {});
  }, []);
  if (!data) return null;
  const records = RECORDS.filter(([key]) => data.records?.[key]);
  const cup = data.cups?.[0];
  const mvp = data.mvps?.[0];
  if (!records.length && !cup && !mvp) return null;

  return (
    <section aria-labelledby="titre-hof">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Légendes" title={<span id="titre-hof">Hall of Fame</span>} />
        <Link href="/hall-of-fame" className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold">
          Voir le Hall of Fame
          <LuArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {records.map(([key, label, Icon, format], index) => {
          const record = data.records[key];
          return (
            <motion.li key={key} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}>
              <TacticalCard highlight={index === 0} cut={18} innerClassName="relative h-full overflow-hidden p-5">
                <Icon aria-hidden className="absolute -right-3 -top-3 h-20 w-20 text-gold/10" />
                <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-gold">{label}</p>
                <p className="mt-3 font-display text-3xl font-black leading-none tabular-nums sm:text-4xl">{format(record.value)}</p>
                <Link href={`/cod/profile/${record.id}`} className="mt-4 flex items-center gap-2.5 hover:text-gold">
                  <Avatar full src={record.avatarUrl} name={record.username} size={28} />
                  <span className="truncate text-sm font-semibold">{record.username}</span>
                </Link>
              </TacticalCard>
            </motion.li>
          );
        })}
      </ul>
      {cup || mvp ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {cup ? (
            <TacticalCard cut={18} innerClassName="flex items-center gap-4 p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CUP_IMAGE[cup.kind] ?? CUP_IMAGE.horus} alt="" width={420} height={420} loading="lazy" className="h-16 w-14 shrink-0 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]" />
              <div className="min-w-0">
                <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-[#e7c05a]">Dernier vainqueur · {cup.name}</p>
                <p className="mt-1 truncate font-display text-2xl font-black uppercase leading-none">{cup.winner?.name ?? "—"}</p>
              </div>
            </TacticalCard>
          ) : null}
          {mvp ? (
            <TacticalCard cut={18} innerClassName="flex items-center gap-4 p-5">
              <Link href={`/cod/profile/${mvp.id}`} className="relative shrink-0">
                <Avatar full src={mvp.avatarUrl} name={mvp.username} size={52} />
                <LuCrown aria-hidden className="absolute -right-2 -top-3 h-5 w-5 rotate-12 text-gold" />
              </Link>
              <div className="min-w-0">
                <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-gold">MVP du mois · {monthFr(mvp.month)}</p>
                <Link href={`/cod/profile/${mvp.id}`} className="mt-1 block truncate font-display text-2xl font-black uppercase leading-none hover:text-gold">
                  {mvp.username}
                </Link>
              </div>
            </TacticalCard>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
