import Link from "next/link";
import { useEffect, useState } from "react";
import { LuCalendarClock, LuCrown, LuFlame, LuSwords, LuZap } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/Typography";

/**
 * « En ce moment » (accueil, sous les chiffres) : podiums du Classé et de la Division, prochaine coupe, records du
 * moment (GET /highlights). Chaque carte n'apparaît que si elle a quelque chose à montrer.
 */
const COLORS = { classe: "#34d399", division: "#22d3ee", tournoi: "#e5484d" };
const CUP_PAGE = { horus: "/cod/tournoi", anubis: "/cod/tournoi?coupe=anubis", saison: "/cod/tournoi?coupe=saison" };
const when = (iso) => new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function RightNow({ initialData = null }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    if (initialData) return undefined;
    let alive = true;
    api("/highlights")
      .then((result) => alive && setData(result))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [initialData]);

  if (!data?.podiums) return null;
  const division = MATCH_TEAM_ENABLED ? data.podiums.division : [];
  const records = [
    data.records.mostMatchesToday ? { icon: LuSwords, label: "Le plus de matchs aujourd'hui", who: data.records.mostMatchesToday.username, href: `/cod/profile/${data.records.mostMatchesToday.id}`, value: data.records.mostMatchesToday.value } : null,
    data.records.longestStreak ? { icon: LuFlame, label: "Plus longue série en cours", who: data.records.longestStreak.username, href: `/cod/profile/${data.records.longestStreak.id}`, value: data.records.longestStreak.value } : null,
    MATCH_TEAM_ENABLED && data.records.mostActiveTeam
      ? { icon: LuZap, label: "Équipe la plus active · semaine", who: `[${data.records.mostActiveTeam.team.tag}] ${data.records.mostActiveTeam.team.name}`, href: `/cod/equipes/${data.records.mostActiveTeam.team.id}`, value: data.records.mostActiveTeam.value }
      : null,
  ].filter(Boolean);
  const cards = [data.podiums.classe.length ? "classe" : null, division.length ? "division" : null, MATCH_TEAM_ENABLED && data.nextCup ? "cup" : null].filter(Boolean);
  if (!cards.length && !records.length) return null;

  return (
    <section className="pb-20 sm:pb-28">
      <Container className="space-y-6">
        <Reveal>
          <SectionHeading
            eyebrow="En ce moment"
            title={
              <>
                Qui mène <span className="text-gold-gradient">la danse</span>
              </>
            }
          />
        </Reveal>

        {cards.length ? (
          <div className={cn("grid gap-4", cards.length === 3 ? "lg:grid-cols-3" : cards.length === 2 ? "md:grid-cols-2" : "")}>
            {data.podiums.classe.length ? (
              <Podium title="Classé" color={COLORS.classe} href="/cod/leaderboard" rows={data.podiums.classe.map((p) => ({ key: p.id, name: p.username, points: p.points, href: `/cod/profile/${p.id}` }))} />
            ) : null}
            {division.length ? (
              <Podium title="Division" color={COLORS.division} href="/cod/equipes" rows={division.map((t) => ({ key: t.id, name: `[${t.tag}] ${t.name}`, points: t.points, href: `/cod/equipes/${t.id}` }))} />
            ) : null}
            {MATCH_TEAM_ENABLED && data.nextCup ? <NextCup cup={data.nextCup} /> : null}
          </div>
        ) : null}

        {records.length ? (
          <div className={cn("grid gap-3", records.length === 3 ? "sm:grid-cols-3" : records.length === 2 ? "sm:grid-cols-2" : "")}>
            {records.map(({ icon: Icon, label, who, href, value }) => (
              <Link key={label} href={href} className="group flex items-center gap-4 border-l-2 border-gold bg-white/[0.03] px-4 py-4 transition-colors hover:bg-white/[0.06]">
                <Icon aria-hidden className="h-6 w-6 shrink-0 text-gold" />
                <span className="min-w-0 flex-1">
                  <span className="block font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</span>
                  <span className="block truncate font-semibold group-hover:text-gold">{who}</span>
                </span>
                <span className="font-display text-4xl font-black tabular-nums text-gold">{value}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}

/** Podium 2 · 1 · 3 d'un classement, dans la couleur du mode. */
function Podium({ title, color, href, rows }) {
  const order = [1, 0, 2].filter((i) => rows[i]);
  return (
    <div className="clip-tactical border border-white/10 bg-white/[0.02] p-5 [--cut:14px]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-2xl font-black uppercase" style={{ color }}>
          {title}
        </p>
        <Link href={href} className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white">
          Classement
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-3 items-end gap-2 text-center">
        {[1, 0, 2].map((i) =>
          rows[i] ? (
            <Link key={rows[i].key} href={rows[i].href} className="group min-w-0" style={{ gridColumn: [2, 1, 3][i] }}>
              {i === 0 ? <LuCrown aria-hidden className="mx-auto mb-1 h-5 w-5" style={{ color }} /> : null}
              <p className="truncate text-sm font-semibold group-hover:underline">{rows[i].name}</p>
              <p className="text-[11px] tabular-nums text-white/45">{rows[i].points.toLocaleString("fr-FR")} pts</p>
              <div className="mt-2 grid place-items-center font-display text-2xl font-black text-ink" style={{ height: [72, 52, 40][i], background: i === 0 ? color : `${color}${i === 1 ? "aa" : "66"}` }}>
                {i + 1}
              </div>
            </Link>
          ) : null,
        )}
      </div>
      {order.length < 3 ? <p className="mt-3 text-center text-xs text-white/40">Places encore à prendre</p> : null}
    </div>
  );
}

/** Prochaine coupe : date, remplissage des places, lien vers sa page. */
function NextCup({ cup }) {
  const color = COLORS.tournoi;
  const fill = cup.capacity ? Math.min(100, Math.round((cup.registered / cup.capacity) * 100)) : 0;
  return (
    <div className="clip-tactical flex flex-col border p-5 [--cut:14px]" style={{ borderColor: `${color}80`, background: `${color}0f` }}>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-2xl font-black uppercase" style={{ color }}>
          Prochaine coupe
        </p>
        <LuCalendarClock aria-hidden className="h-5 w-5" style={{ color }} />
      </div>
      <p className="mt-4 font-display text-3xl font-black uppercase leading-none">{cup.name}</p>
      <p className="mt-1 text-sm text-white/60">
        {when(cup.startsAt)} · BO{cup.bestOf}
      </p>
      <div className="mt-4 h-2 bg-white/10">
        <div className="h-full" style={{ width: `${fill}%`, background: color }} />
      </div>
      <p className="mt-2 text-xs text-white/50">
        {cup.registered} / {cup.capacity} {cup.unit} inscrit{cup.unit === "équipes" ? "es" : "s"}
      </p>
      <Link href={CUP_PAGE[cup.kind] ?? "/cod/tournoi"} className="clip-slant mt-auto inline-block self-start px-4 py-2 pt-2 font-display text-sm font-bold uppercase text-ink" style={{ background: color, marginTop: 16 }}>
        {cup.kind === "anubis" ? "S'inscrire" : "Voir la coupe"}
      </Link>
    </div>
  );
}
