import { useEffect, useState } from "react";
import { LuArrowDownRight, LuArrowUpRight, LuMinus } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { Loading, Notice, StatTile } from "../ui/Feedback";
import { ActivityChart } from "./ActivityChart";

const COLORS = { or: "#d4af37", classe: "#34d399", division: "#22d3ee" };
const shortDay = (day) => new Date(`${day}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
const longDay = (day) => new Date(`${day}T12:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;

/** Résumé au-dessus d'un graphique : le total et le meilleur jour. */
function daySummary(points, word) {
  const total = points.reduce((sum, point) => sum + point.value, 0);
  if (!total) return null;
  const best = points.reduce((top, point) => (point.value > top.value ? point : top));
  return `${plural(total, word)} · pic le ${best.short}`;
}

/** Écart avec la période précédente, en texte : la flèche porte le sens, jamais la couleur seule. */
function Trend({ current, previous, period }) {
  const diff = current - previous;
  const Icon = diff > 0 ? LuArrowUpRight : diff < 0 ? LuArrowDownRight : LuMinus;
  return (
    <span className="inline-flex items-center gap-1">
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {diff === 0 ? "stable" : `${diff > 0 ? "+" : ""}${diff}`} sur les {period} jours d&apos;avant
    </span>
  );
}

/** Une marche du parcours : barre proportionnelle aux inscrits, nombre et part écrits à côté. */
function FunnelStep({ label, count, total, previous }) {
  const share = total ? Math.round((count / total) * 100) : 0;
  const kept = previous ? Math.round((count / previous) * 100) : null;
  return (
    <li>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-white/75">{label}</span>
        <span className="shrink-0 font-tech text-xs tabular-nums text-white/55">
          <b className="font-bold text-white">{count}</b> · {share} %
        </span>
      </div>
      <div className="mt-1.5 h-2 bg-white/[0.06]">
        <div className="h-full rounded-r-[3px] bg-gold" style={{ width: count ? `${Math.max(1, share)}%` : 0 }} />
      </div>
      {kept !== null ? <p className="mt-1 text-[11px] text-white/35">{kept} % de l&apos;étape d&apos;avant</p> : null}
    </li>
  );
}

/** Onglet Activité de l'admin (GET /admin/activity) : ce que font les visiteurs et les joueurs, sur 7 ou 30 jours. */
export function ActivityPanel({ initial = null }) {
  const [period, setPeriod] = useState(30);
  const [data, setData] = useState(initial);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initial) return undefined;
    let alive = true;
    setError(null);
    api(`/admin/activity?days=${period}`).then(
      (result) => alive && setData(result),
      (caught) => alive && setError(caught.message),
    );
    return () => {
      alive = false;
    };
  }, [period, initial]);

  if (error) return <Notice tone="error">{error}</Notice>;
  if (!data) return <Loading />;

  const { days, trends, hours, funnel, community } = data;
  const dayPoints = (pick) => days.map((row) => ({ key: row.day, tick: shortDay(row.day), short: shortDay(row.day), label: longDay(row.day), value: pick(row) }));
  const visitors = dayPoints((row) => row.visitors);
  const signups = dayPoints((row) => row.signups);
  const ranked = dayPoints((row) => row.ranked);
  const division = dayPoints((row) => row.division);
  const hourPoints = hours.map((row) => ({ key: String(row.hour), tick: `${row.hour} h`, label: `De ${row.hour} h à ${row.hour + 1} h`, value: row.matches }));
  const busiest = hourPoints.reduce((top, point) => (point.value > top.value ? point : top));
  const shown = data.period;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/55">Du {shortDay(days[0].day)} au {shortDay(days[days.length - 1].day)}, à l&apos;heure de Paris.</p>
        <div className="flex gap-2" role="group" aria-label="Période">
          {[7, 30].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={period === value}
              onClick={() => setPeriod(value)}
              className={cn("clip-slant px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em] transition-colors [--slant:8px]", period === value ? "bg-gold text-ink" : "bg-white/[0.05] text-white/60 hover:text-white")}
            >
              {value} jours
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Visiteurs" value={trends.visitors.current} hint={<Trend {...trends.visitors} period={shown} />} />
        <StatTile label="Inscrits" value={trends.signups.current} hint={<Trend {...trends.signups} period={shown} />} />
        <StatTile label="Matchs joués" value={trends.matches.current} hint={<Trend {...trends.matches} period={shown} />} />
        <StatTile label="Joueurs actifs" value={trends.activePlayers.current} hint={<Trend {...trends.activePlayers} period={shown} />} />
      </div>

      <ActivityChart key={`visiteurs-${shown}`} title="Visiteurs par jour" summary={daySummary(visitors, "visiteur")} unit="visiteurs" type="area" color={COLORS.or} height={240} average points={visitors} />
      <div className="grid gap-3 lg:grid-cols-3">
        <ActivityChart key={`inscrits-${shown}`} title="Inscrits" summary={daySummary(signups, "inscrit")} unit="inscrits" color={COLORS.or} points={signups} empty="Pas d'inscrit sur cette période." />
        <ActivityChart key={`classe-${shown}`} title="Matchs classés" summary={daySummary(ranked, "match")} unit="matchs" color={COLORS.classe} points={ranked} empty="Pas de match sur cette période." />
        <ActivityChart key={`division-${shown}`} title="Division et tournois" summary={daySummary(division, "match")} unit="matchs" color={COLORS.division} points={division} empty="Pas de match sur cette période." />
      </div>
      <p className="text-xs text-white/40">Matchs comptés depuis le début de la saison 1 : ceux de la période de test sont archivés.</p>

      <div className="grid gap-3 lg:grid-cols-2">
        <section aria-labelledby="titre-parcours" className="border border-white/10 bg-white/[0.02] p-4">
          <h3 id="titre-parcours" className="font-display text-lg font-bold uppercase tracking-wide">Parcours des joueurs</h3>
          <ol className="mt-4 space-y-4">
            <FunnelStep label="Inscrits" count={funnel.players} total={funnel.players} />
            <FunnelStep label="Identifiant Activision renseigné" count={funnel.activision} total={funnel.players} previous={funnel.players} />
            <FunnelStep label="Au moins un match joué" count={funnel.played} total={funnel.players} previous={funnel.activision} />
            <FunnelStep label="5 matchs joués ou plus" count={funnel.regular} total={funnel.players} previous={funnel.played} />
          </ol>
        </section>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Équipes" value={community.teams} hint={`${community.teamPlayers} joueurs`} />
            <StatTile label="Équipes à 4 ou plus" value={community.fullTeams} hint="prêtes pour la Division" accent={community.fullTeams > 0} />
            <StatTile label="Chaînes Twitch" value={community.twitch} />
            <StatTile label="Clips" value={community.clips} />
          </div>
          <ActivityChart key={`heures-${shown}`} title="Heures de jeu" summary={busiest.value ? `surtout vers ${busiest.tick}` : null} unit="matchs" color={COLORS.or} points={hourPoints} empty="Pas de match sur cette période." />
        </div>
      </div>

      <details className="border border-white/10 bg-white/[0.02]">
        <summary className="cursor-pointer px-4 py-3 text-sm text-white/60 hover:text-white">Voir les chiffres jour par jour</summary>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full min-w-[420px] text-left text-sm tabular-nums">
            <thead className="font-tech text-[9px] uppercase tracking-[0.16em] text-white/40">
              <tr>
                <th scope="col" className="py-2 font-normal">Jour</th>
                <th scope="col" className="py-2 text-right font-normal">Visiteurs</th>
                <th scope="col" className="py-2 text-right font-normal">Inscrits</th>
                <th scope="col" className="py-2 text-right font-normal">Classé</th>
                <th scope="col" className="py-2 text-right font-normal">Division</th>
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((row) => (
                <tr key={row.day} className="border-t border-white/5">
                  <th scope="row" className="py-1.5 font-normal text-white/60">{shortDay(row.day)}</th>
                  <td className="py-1.5 text-right">{row.visitors}</td>
                  <td className="py-1.5 text-right">{row.signups}</td>
                  <td className="py-1.5 text-right">{row.ranked}</td>
                  <td className="py-1.5 text-right">{row.division}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
