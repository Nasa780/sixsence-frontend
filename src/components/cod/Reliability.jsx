import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { LuShieldCheck } from "react-icons/lu";
import { api } from "../../lib/api";
import { TacticalCard } from "../ui/TacticalCard";

const LEVEL = {
  excellent: { label: "Excellente", color: "#34d399" },
  bon: { label: "Bonne", color: "#a3e635" },
  moyen: { label: "Moyenne", color: "#f59e0b" },
  faible: { label: "Faible", color: "#e5484d" },
};

/**
 * Score de fiabilité du joueur (profil) : anneau sur 100 et détail des 60 derniers jours (« Prêt ? »
 * manqués, forfaits, résultats corrigés, matchs propres). Données GET /cod/players/:id/reliability.
 */
export function Reliability({ playerId }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let alive = true;
    api(`/cod/players/${playerId}/reliability`)
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [playerId]);
  if (!data) return null;

  const level = LEVEL[data.level] ?? LEVEL.bon;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const items = [
    ["Matchs propres", data.details.clean, "text-win"],
    ["Avertissements (« Prêt ? » manqué…)", data.details.warnings, data.details.warnings ? "text-loss" : "text-white/40"],
    ["Forfaits perdus", data.details.forfeits, data.details.forfeits ? "text-loss" : "text-white/40"],
    ["Résultats corrigés contre", data.details.corrected, data.details.corrected ? "text-loss" : "text-white/40"],
  ];

  return (
    <TacticalCard cut={20} innerClassName="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={level.color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * (1 - data.score / 100) }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-display text-3xl font-black tabular-nums">{data.score}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="inline-flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.26em]" style={{ color: level.color }}>
          <LuShieldCheck aria-hidden className="h-4 w-4" />
          Fiabilité · {level.label}
        </p>
        <p className="mt-1 text-xs text-white/45">Sur les {data.windowDays} derniers jours. Elle remonte avec chaque match joué jusqu&apos;au bout.</p>
        <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {items.map(([label, value, tone]) => (
            <li key={label} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-white/60">{label}</span>
              <span className={`font-tech font-bold tabular-nums ${tone}`}>{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </TacticalCard>
  );
}
