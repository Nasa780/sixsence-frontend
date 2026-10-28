import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import { api } from "../../lib/api";
import { supabase } from "../../lib/supabase";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import useSeasons from "../../hooks/useSeasons";
import useSiteStats, { formatCount } from "../../hooks/useSiteStats";
import useTopPlayers from "../../hooks/useTopPlayers";
import { rankFor } from "../../lib/ranks";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { TacticalCard } from "../ui/TacticalCard";
import { SectionHeading } from "../ui/Typography";
import { LiveFeed } from "../cod/HubHighlights";

/** Top 5 du classé à côté des chiffres, remplacé le 2026-10-22 par le fil d'activité : true pour le remettre. */
const SHOW_TOP5 = false;

/** Section « En direct » : vrais compteurs de la plateforme et top 5 du classement. */
export function LiveBoard() {
  const stats = useSiteStats();
  const top = useTopPlayers(5);
  const { label } = useSeasons();
  const [teams, setTeams] = useState(null);

  // Compteurs de la Division (équipes actives, matchs en cours, matchs terminés), rafraîchis toutes les 30 s.
  useEffect(() => {
    if (!MATCH_TEAM_ENABLED) return undefined;
    let alive = true;
    const load = () =>
      Promise.all([api("/teams/status"), supabase.from("team_matches").select("id", { count: "exact", head: true }).eq("status", "completed")])
        .then(([status, played]) => alive && setTeams({ ...status, matchesPlayed: played.count ?? 0 }))
        .catch(() => {});
    load();
    // Onglet caché : pas de relecture ; relu dès qu'il redevient visible.
    const timer = setInterval(() => document.visibilityState === "visible" && load(), 30_000);
    const onShow = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
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
          {/* Un seul panneau HUD : joueurs en ligne en tête, puis les compteurs séparés par de fins filets (animés à chaque mise à jour). */}
          <div className="mt-8 border border-white/10 bg-white/[0.02] clip-corner [--cut:18px]">
            <div className="relative flex items-center justify-between gap-4 overflow-hidden border-b border-white/10 bg-linear-to-r from-win/[0.10] via-win/[0.03] to-transparent px-6 py-5">
              <div>
                <p className="flex items-center gap-2.5 font-tech text-[11px] uppercase tracking-[0.24em] text-white/60">
                  <span aria-hidden className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-60" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-win" />
                  </span>
                  En ligne maintenant
                </p>
              </div>
              <div className="flex items-end gap-4">
                <span aria-hidden className="hidden h-8 items-end gap-[3px] sm:flex">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className="lobby-eq w-[3px] bg-win/70"
                      style={{
                        animationDuration: "0.9s",
                        animationDelay: `${bar * 0.15}s`,
                      }}
                    />
                  ))}
                </span>
                <span className="font-display text-5xl font-black leading-none tabular-nums text-win drop-shadow-[0_0_18px_rgba(52,211,153,0.45)]">
                  <CountUp value={stats?.playersOnline} />
                </span>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-white/10">
              <Counter label="Joueurs inscrits" value={stats?.players} />
              {/* Matchs joués : classé et Division réunis. */}
              <Counter label="Matchs joués" value={(stats?.matchesPlayed ?? 0) + (teams?.matchesPlayed ?? 0)} ready={Boolean(stats)} accent />
              <Counter label="En file" value={stats?.playersInQueue} />
              <Counter label="Matchs en cours" value={(stats?.matchesInProgress ?? 0) + (teams?.matchesInProgress ?? 0)} ready={Boolean(stats)} />
              {MATCH_TEAM_ENABLED ? <Counter label="Équipes en Division" value={teams?.activeTeams} univers="division" wide /> : null}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          {SHOW_TOP5 ? (
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
                <p className="mt-6 text-sm leading-relaxed text-white/55">Aucun match classé n&apos;a encore été joué. La première place est à prendre.</p>
              ) : (
                <ol className="mt-6 space-y-2">
                  {top.map((player, index) => (
                    <li key={player.user_id}>
                      <Link
                        href={`/cod/profile/${player.user_id}`}
                        className="flex items-center gap-4 border-l-2 border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:border-gold hover:bg-white/[0.06]"
                      >
                        <span className={`w-6 font-tech text-sm font-bold tabular-nums ${index === 0 ? "text-gold" : "text-white/50"}`}>{index + 1}</span>
                        <span className="min-w-0 flex-1 truncate font-display text-xl font-bold uppercase leading-none tracking-wide">{player.username}</span>
                        <span className="hidden font-display text-sm font-bold uppercase tracking-[0.14em] text-white/45 sm:inline">{rankFor(player.points).name}</span>
                        <span className="font-tech text-base font-bold tabular-nums text-gold">{player.points}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </TacticalCard>
          ) : (
            <LiveFeed />
          )}
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

/** Une case du panneau : petite légende et grand chiffre ; trait de couleur au survol. */
function Counter({ label, value, accent = false, wide = false, ready = true, univers = undefined }) {
  return (
    <div data-univers={univers} className={`group relative bg-ink px-6 py-5 transition-colors hover:bg-ink-800 ${wide ? "col-span-2" : ""}`}>
      <span aria-hidden className={`absolute inset-y-0 left-0 w-0.5 transition-colors ${accent || univers ? "bg-gold" : "bg-transparent group-hover:bg-gold/60"}`} />
      <dt className="min-h-[2.6em] font-tech text-[10px] uppercase leading-snug tracking-[0.2em] text-white/45 sm:min-h-0">{label}</dt>
      <dd className={`mt-2 font-display text-4xl font-black leading-none tabular-nums ${accent || univers ? "text-gold" : "text-white"}`}>
        {ready ? <CountUp value={value} /> : "—"}
      </dd>
    </div>
  );
}
