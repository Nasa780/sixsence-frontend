import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LuArrowRight, LuGamepad2, LuShield, LuSwords, LuTimer, LuUsers } from "react-icons/lu";
import { api } from "../../lib/api";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import useSeasons from "../../hooks/useSeasons";
import useSiteStats, { formatCount } from "../../hooks/useSiteStats";
import useTopPlayers from "../../hooks/useTopPlayers";
import { rankFor } from "../../lib/ranks";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { TacticalCard } from "../ui/TacticalCard";
import { SectionHeading } from "../ui/Typography";

/** Section « En direct » : vrais compteurs de la plateforme et top 5 du classement. */
export function LiveBoard() {
  const stats = useSiteStats();
  const top = useTopPlayers(5);
  const { label } = useSeasons();
  const [teams, setTeams] = useState(null);

  // Compteurs de la Division (équipes actives, équipes en recherche), rafraîchis toutes les 30 s.
  useEffect(() => {
    if (!MATCH_TEAM_ENABLED) return undefined;
    let alive = true;
    const load = () =>
      api("/teams/status")
        .then((data) => alive && setTeams(data))
        .catch(() => {});
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <section className="py-20 sm:py-28">
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
        <Reveal>
          <SectionHeading
            eyebrow="En direct"
            title={
              <>
                La plateforme <span className="text-gold-gradient">en chiffres</span>
              </>
            }
            description="Mis à jour en continu : joueurs, matchs, files d'attente et équipes."
          />
          {/* Joueurs en ligne mis en avant, puis les compteurs (animés à chaque mise à jour). */}
          <div className="mt-8 flex items-center justify-between gap-4 border border-gold/30 bg-gold/[0.06] px-5 py-4">
            <div className="flex items-center gap-3">
              <span aria-hidden className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-win" />
              </span>
              <span className="font-tech text-[11px] uppercase tracking-[0.24em] text-white/60">En ligne maintenant</span>
            </div>
            <span className="font-display text-4xl font-black leading-none tabular-nums text-win">
              <CountUp value={stats?.playersOnline} />
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            <Counter icon={LuUsers} label="Joueurs inscrits" value={stats?.players} />
            <Counter icon={LuGamepad2} label="Matchs joués" value={stats?.matchesPlayed} accent />
            <Counter icon={LuTimer} label="En file" value={stats?.playersInQueue} hint={MATCH_TEAM_ENABLED && teams ? `+ ${teams.teamsSearching} équipe${teams.teamsSearching > 1 ? "s" : ""}` : null} />
            <Counter icon={LuSwords} label="Matchs en cours" value={(stats?.matchesInProgress ?? 0) + (teams?.matchesInProgress ?? 0)} ready={Boolean(stats)} />
            {MATCH_TEAM_ENABLED ? <Counter icon={LuShield} label="Équipes en Division" value={teams?.activeTeams} wide /> : null}
          </dl>
        </Reveal>

        <Reveal delay={0.12}>
          <TacticalCard cut={24} innerClassName="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Top 5 — {label}</p>
              <Link href="/cod/leaderboard" className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold">
                Classement complet
                <LuArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>

            {top === null ? (
              <p className="mt-6 text-sm text-white/45">Chargement…</p>
            ) : top.length === 0 ? (
              <p className="mt-6 text-sm leading-relaxed text-white/55">
                Aucun match classé n&apos;a encore été joué. La première place est à prendre.
              </p>
            ) : (
              <ol className="mt-6 space-y-2">
                {top.map((player, index) => (
                  <li key={player.user_id}>
                    <Link
                      href={`/cod/profile/${player.user_id}`}
                      className="flex items-center gap-4 border-l-2 border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-gold hover:bg-white/[0.06]"
                    >
                      <span className={`w-6 font-tech text-sm font-bold tabular-nums ${index === 0 ? "text-gold" : "text-white/50"}`}>
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-display text-xl font-bold uppercase leading-none tracking-wide">
                        {player.username}
                      </span>
                      <span className="hidden font-display text-sm font-bold uppercase tracking-[0.14em] text-white/45 sm:inline">
                        {rankFor(player.points).name}
                      </span>
                      <span className="font-tech text-base font-bold tabular-nums text-gold">{player.points}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </TacticalCard>
        </Reveal>
      </Container>
    </section>
  );
}

/** Nombre qui défile jusqu'à sa valeur (0,9 s) ; « — » tant qu'il n'est pas connu. */
function CountUp({ value }) {
  const [shown, setShown] = useState(null);
  const from = useRef(0);
  useEffect(() => {
    if (typeof value !== "number") return undefined;
    const start = performance.now();
    const origin = from.current;
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(origin + (value - origin) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return shown === null ? "—" : formatCount(shown);
}

function Counter({ icon: Icon, label, value, hint = null, accent = false, wide = false, ready = true }) {
  return (
    <div className={`group flex items-center gap-4 border-l-2 bg-white/[0.03] px-4 py-4 transition-colors hover:bg-white/[0.06] ${accent ? "border-gold" : "border-white/10"} ${wide ? "col-span-2" : ""}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center border border-gold/30 bg-gold/[0.07] text-gold clip-corner">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <dt className="truncate font-tech text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</dt>
        <dd className={`mt-1 font-display text-3xl font-black leading-none tabular-nums ${accent ? "text-gold" : ""}`}>
          {ready ? <CountUp value={value} /> : "—"}
          {hint ? <span className="ml-2 align-middle font-tech text-[10px] font-normal tracking-[0.14em] text-white/40">{hint}</span> : null}
        </dd>
      </div>
    </div>
  );
}
