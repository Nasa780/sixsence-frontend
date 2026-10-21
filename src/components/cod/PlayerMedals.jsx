import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";
import { supabase } from "../../lib/supabase";

const IMAGE = { or: "/images/trophees/anubis-or.png", argent: "/images/trophees/anubis-argent.png", bronze: "/images/trophees/anubis-bronze.png" };
const LABEL = { or: "Or", argent: "Argent", bronze: "Bronze" };
const TONE = { or: "text-[#e7c05a]", argent: "text-white/75", bronze: "text-[#d6935a]" };
const GLOW = { or: "rgba(234,192,90,0.4)", argent: "rgba(220,226,234,0.3)", bronze: "rgba(214,140,82,0.32)" };
const dateFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/**
 * Médailles Anubis d'un joueur (profil) : une médaille par podium de Coupe Anubis, suspendue sur une
 * vitrine éclairée, la plus récente d'abord. Rien n'est affiché sans médaille.
 */
export function PlayerMedals({ playerId }) {
  const [medals, setMedals] = useState([]);

  useEffect(() => {
    let alive = true;
    supabase
      .from("cup_medals")
      .select("id, place, name, team_name, created_at")
      .eq("user_id", playerId)
      .order("created_at", { ascending: false })
      .then(({ data }) => alive && setMedals(data || []));
    return () => {
      alive = false;
    };
  }, [playerId]);

  if (!medals.length) return null;
  const count = (place) => medals.filter((medal) => medal.place === place).length;
  return (
    <section aria-labelledby="titre-medailles" className="relative overflow-hidden border border-[#e7c05a]/25 bg-linear-to-b from-white/[0.04] to-transparent px-5 pb-6 pt-5 [clip-path:polygon(18px_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%,0_18px)] sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_center,rgba(234,192,90,0.18),transparent_70%)]" />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-tech text-[10px] uppercase tracking-[0.3em] text-[#e7c05a]">Coupe Anubis</p>
          <h2 id="titre-medailles" className="mt-2 font-display text-3xl font-black uppercase leading-none sm:text-4xl">
            Médailles
          </h2>
        </div>
        <p className="flex flex-wrap gap-4 font-tech text-[11px] uppercase tracking-[0.2em] text-white/55">
          <span className={TONE.or}>Or {count("or")}</span>
          <span className={TONE.argent}>Argent {count("argent")}</span>
          <span className={TONE.bronze}>Bronze {count("bronze")}</span>
        </p>
      </div>
      <ul className="relative mt-6 flex gap-6 overflow-x-auto pb-2">
        {medals.map((medal, index) => (
          <motion.li
            key={medal.id}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: "spring", stiffness: 120, damping: 12 }}
            className="group flex w-28 shrink-0 flex-col items-center text-center sm:w-32"
          >
            <div className="relative flex h-36 w-full items-end justify-center sm:h-40">
              <span aria-hidden className="absolute bottom-2 h-6 w-16 rounded-[50%] blur-md" style={{ background: GLOW[medal.place] }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={IMAGE[medal.place]}
                alt={`Médaille ${LABEL[medal.place]} · ${medal.name}`}
                width={420}
                height={420}
                loading="lazy"
                className="relative h-full w-auto origin-top object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.7)] transition duration-500 group-hover:rotate-[4deg] group-hover:scale-105"
              />
            </div>
            <p className={cn("mt-2 font-tech text-[10px] uppercase tracking-[0.2em]", TONE[medal.place])}>{LABEL[medal.place]}</p>
            <p className="mt-1 line-clamp-2 text-xs font-semibold text-white/80">{medal.name}</p>
            <p className="mt-0.5 text-[11px] text-white/40">
              {medal.team_name ? `${medal.team_name} · ` : ""}
              {dateFr(medal.created_at)}
            </p>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
