import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import useSeasons from "../../hooks/useSeasons";
import useSiteStats, { formatCount } from "../../hooks/useSiteStats";
import useTopPlayers from "../../hooks/useTopPlayers";
import { rankFor } from "../../lib/ranks";
import { Reveal } from "../effects/Reveal";
import { Container } from "../ui/Container";
import { StatTile } from "../ui/Feedback";
import { TacticalCard } from "../ui/TacticalCard";
import { SectionHeading } from "../ui/Typography";

/** Section « En direct » : vrais compteurs de la plateforme et top 5 du classement. */
export function LiveBoard() {
  const stats = useSiteStats();
  const top = useTopPlayers(5);
  const { label } = useSeasons();

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
            description="Mis à jour en continu : joueurs, matchs et file d'attente."
          />
          <div className="mt-8 grid grid-cols-2 gap-3">
            <StatTile label="Joueurs inscrits" value={formatCount(stats?.players)} />
            <StatTile label="Matchs joués" value={formatCount(stats?.matchesPlayed)} accent />
            <StatTile label="En file" value={formatCount(stats?.playersInQueue)} />
            <StatTile label="Matchs en cours" value={formatCount(stats?.matchesInProgress)} />
          </div>
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
