import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowDownRight, LuArrowUpRight, LuCrown, LuSwords, LuTrophy, LuUsers } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { Eyebrow } from "../ui/Typography";

/**
 * Section « Analyse » du profil, sous la performance (GET /cod/players/:id/insights) : place sur le site pour
 * chaque chiffre, ratio sur 30 jours, face à face avec le visiteur, parcours en Division (équipes, rôle, arrivée et
 * départ, matchs et trophées pendant le passage). Adversaires, coéquipiers et activité retirés le 2026-10-28.
 * Chaque bloc ne s'affiche que s'il a quelque chose à montrer.
 */
const PLACES = [
  ["played", "Matchs joués", (v) => v],
  ["wins", "Victoires", (v) => v],
  ["rate", "Taux de victoire", (v) => `${v} %`],
  ["bestStreak", "Meilleure série", (v) => v],
  ["xp", "Expérience", (v) => v.toLocaleString("fr-FR")],
];
const dateShort = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export function PlayerInsights({ playerId, initialData = null }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (initialData) return undefined;
    let alive = true;
    api(`/cod/players/${playerId}/insights`)
      .then((result) => alive && setData(result))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [playerId, initialData]);

  if (!data) return null;
  const places = data.ranks ? PLACES.filter(([key]) => data.ranks[key]?.place) : [];
  const trend = data.ratio.last30 !== null && data.ratio.overall !== null ? data.ratio.last30 - data.ratio.overall : null;
  const h2h = data.headToHead && data.headToHead.viewerWins + data.headToHead.viewerLosses + data.headToHead.together > 0 ? data.headToHead : null;
  const teams = MATCH_TEAM_ENABLED ? data.teams : [];

  return (
    <section aria-labelledby="titre-analyse" className="space-y-6">
      <div>
        <Eyebrow>Analyse</Eyebrow>
        <h2 id="titre-analyse" className="mt-3 font-display text-4xl font-black uppercase leading-none">
          Sur le site
        </h2>
      </div>

      {/* Place sur le site pour chaque chiffre */}
      {places.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {places.map(([key, label, format]) => {
            const { value, place } = data.ranks[key];
            return (
              <div key={key} className={cn("clip-tactical border p-4 [--cut:12px]", place <= 3 ? "border-gold/50 bg-gold/[0.06]" : "border-white/10 bg-white/[0.03]")}>
                <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</p>
                <p className={cn("mt-2 font-display text-4xl font-black leading-none tabular-nums", place <= 3 ? "text-gold-gradient" : "text-white")}>#{place}</p>
                <p className="mt-1.5 text-xs text-white/50">
                  {format(value)} · sur {data.ranks.players} joueurs
                </p>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ratio sur 30 jours */}
        {data.ratio.last30 !== null ? (
          <div className="flex flex-wrap items-center gap-8 border border-white/10 bg-white/[0.03] px-5 py-4">
            <div>
              <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Ratio 30 jours · Classé</p>
              <p className="mt-1 flex items-center gap-2 font-display text-4xl font-black tabular-nums">
                {data.ratio.last30} %
                {trend ? (
                  <span className={cn("flex items-center text-sm", trend > 0 ? "text-win" : "text-loss")}>
                    {trend > 0 ? <LuArrowUpRight aria-hidden className="h-4 w-4" /> : <LuArrowDownRight aria-hidden className="h-4 w-4" />}
                    {trend > 0 ? `+${trend}` : trend}
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-white/45">{data.ratio.last30Played} matchs</p>
            </div>
            <div>
              <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Ratio sur un an</p>
              <p className="mt-1 font-display text-4xl font-black tabular-nums text-white/70">{data.ratio.overall} %</p>
              <p className="text-xs text-white/45">{data.ratio.overallPlayed} matchs</p>
            </div>
          </div>
        ) : null}

        {/* Face à face avec le visiteur */}
        {h2h ? (
          <div className="clip-tactical border border-gold/30 bg-gold/[0.04] px-5 py-4 [--cut:14px]">
            <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">Face à face · toi contre ce joueur</p>
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
              <div>
                <p className="font-display text-4xl font-black text-gold">{h2h.viewerWins}</p>
                <p className="text-xs text-white/50">tes victoires</p>
              </div>
              <LuSwords aria-hidden className="h-6 w-6 text-white/30" />
              <div>
                <p className="font-display text-4xl font-black text-white/60">{h2h.viewerLosses}</p>
                <p className="text-xs text-white/50">tes défaites</p>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-white/45">
              {h2h.together ? `${h2h.together} match${h2h.together > 1 ? "s" : ""} ensemble (${h2h.togetherWins} V)` : "Jamais dans la même équipe"}
              {h2h.last ? ` · dernier duel le ${dateShort(h2h.last)}` : ""}
            </p>
          </div>
        ) : null}
      </div>

      {/* Parcours en Division : équipe actuelle puis anciennes */}
      {teams.length ? (
        <div>
          <p className="flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.24em] text-gold">
            <LuUsers aria-hidden className="h-3.5 w-3.5" /> Parcours
          </p>
          <ol className="relative mt-3 space-y-2 border-l border-white/15 pl-5">
            {teams.map((t) => (
              <li key={t.id} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[26.5px] top-1/2 h-3 w-3 -translate-y-1/2 rotate-45 border-2"
                  style={{ borderColor: t.color, background: t.current ? t.color : "var(--color-ink)" }}
                />
                <Link
                  href={`/cod/equipes/${t.id}`}
                  className={cn(
                    "flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 transition-colors",
                    t.current ? "border border-gold/40 bg-gold/[0.06] hover:bg-gold/10" : "bg-white/[0.03] hover:bg-white/[0.06]",
                  )}
                >
                  {t.logoUrl ? (
                    <img src={t.logoUrl} alt="" className="h-10 w-10 object-cover" loading="lazy" />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center border font-display text-xs font-black" style={{ borderColor: t.color, color: t.color }}>
                      {t.tag}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-lg font-black uppercase leading-none">
                      <span className="normal-case text-white/50">[{t.tag}]</span> {t.name}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-white/50">
                      {t.role === "leader" ? <LuCrown aria-hidden className="h-3.5 w-3.5 text-gold" /> : null}
                      {t.role ? (t.role === "leader" ? "Leader" : "Joueur") : null}
                      {t.role && t.since ? " · " : null}
                      {t.since ? <>{t.exact || t.current ? "arrivé le" : "depuis le"} {dateShort(t.since)}</> : null}
                      {!t.current && t.until ? <> · {t.exact ? "parti le" : "dernier match le"} {dateShort(t.until)}</> : null}
                      {!t.current && t.leftReason ? <> ({t.leftReason === "disbanded" ? "équipe dissoute" : "parti"})</> : null}
                    </span>
                  </span>
                  <span className="text-sm text-white/55">
                    <span className="font-display text-xl font-black text-white">{t.played}</span> match{t.played > 1 ? "s" : ""}
                  </span>
                  {t.trophies ? (
                    <span className="inline-flex items-center gap-1 text-sm text-gold" title="Trophées gagnés pendant son passage">
                      <LuTrophy aria-hidden className="h-4 w-4" />×{t.trophies}
                    </span>
                  ) : null}
                  {t.current ? (
                    <span className="bg-gold px-2 py-0.5 font-tech text-[9px] uppercase text-ink">Actuelle</span>
                  ) : t.disbanded && !t.leftReason ? (
                    <span className="font-tech text-[9px] uppercase text-white/40">Dissoute</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}
