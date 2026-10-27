import Head from "next/head";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { LuChevronRight, LuCrown, LuShield, LuSwords, LuTrophy } from "react-icons/lu";
import { CodModeNav } from "../../components/cod/CodModeNav";
import { TeamCrest } from "../../components/teams/TeamParts";
import { Container } from "../../components/ui/Container";
import { EmptyState, Loading } from "../../components/ui/Feedback";
import { PageHeader } from "../../components/ui/Typography";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";

/**
 * Circuit SixSence (GET /teams/circuit) : les Coupes Horus de la saison rapportent des points, les premières du
 * circuit et les 2 meilleures de la Division (seconde chance) se qualifient pour la grande finale (tournoi de saison).
 */
const MEDALS = { winner: ["1re place", "#d4af37"], finalist: ["2e place", "#c0c7d0"], third: ["3e place", "#c97b4b"] };
const dateFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

export default function CircuitPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/teams/circuit")
      .then(setData)
      .catch((caught) => setError(caught.message));
  }, []);

  return <CircuitView data={data} error={error} />;
}

/** Affichage du circuit (sans appel réseau). */
export function CircuitView({ data, error = null }) {
  const played = data?.cups.filter((c) => c.status === "completed").length ?? 0;
  const next = data?.cups.find((c) => c.status !== "completed");

  return (
    <>
      <Head>
        <title>Circuit — SixSence</title>
        <meta name="description" content="Le circuit SixSence : les Coupes Horus rapportent des points, les meilleures équipes se qualifient pour la grande finale de la saison." />
      </Head>
      <PageHeader
        eyebrow="Tournoi · Saison"
        title={
          <>
            Circuit <span className="text-gold-gradient">SixSence</span>
          </>
        }
        description="Toute la saison mène à la grande finale : chaque Coupe Horus compte, la Division offre une seconde chance."
      />
      <Container className="space-y-12 py-10">
        <CodModeNav />
        {error ? <EmptyState title="Circuit indisponible">{error}</EmptyState> : null}
        {!data && !error ? <Loading label="Chargement du circuit" /> : null}

        {data ? (
          <>
            {/* Repères de la saison */}
            <div className="flex flex-wrap gap-3">
              {[
                ["Coupes Horus jouées", String(played)],
                ["Prochaine coupe", next ? dateFr(next.startsAt) : "—"],
                ["Équipes classées", String(data.standings.length)],
                ["Grande finale", data.final ? dateFr(data.final.startsAt) : "fin de saison"],
              ].map(([label, value]) => (
                <div key={label} className="border border-white/10 bg-white/[0.03] px-4 py-2">
                  <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</p>
                  <p className="font-display text-2xl font-black first-letter:uppercase">{value}</p>
                </div>
              ))}
            </div>

            {/* Les étapes */}
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
              {[
                { icon: LuShield, color: "#d4af37", title: "Coupes Horus", when: "Toute la saison", text: "Chaque coupe rapporte des points de circuit selon la place. Ils restent acquis toute la saison." },
                { icon: LuSwords, color: "#22d3ee", title: "Seconde chance", when: "Division", text: `Les ${data.divisionSpots} meilleures équipes de la Division pas encore qualifiées prennent les dernières places de la finale.` },
                { icon: LuCrown, color: "#e5484d", title: "Grande finale", when: "Fin de saison", text: `Le top ${data.circuitSpots} du circuit et les ${data.divisionSpots} équipes de la Division : le tournoi de fin de saison.` },
              ].map(({ icon: Icon, color, title, when, text }, i, all) => (
                <Fragment key={title}>
                  <div className="clip-tactical relative overflow-hidden border bg-white/[0.02] p-5 [--cut:16px]" style={{ borderColor: `${color}66` }}>
                    <div aria-hidden className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl" style={{ background: `${color}33` }} />
                    <p className="font-tech text-[10px] uppercase tracking-[0.24em]" style={{ color }}>
                      Étape {i + 1} · {when}
                    </p>
                    <p className="mt-2 flex items-center gap-2 font-display text-2xl font-black uppercase">
                      <Icon aria-hidden className="h-6 w-6" style={{ color }} />
                      {title}
                    </p>
                    <p className="mt-2 text-sm text-white/60">{text}</p>
                  </div>
                  {i < all.length - 1 ? <LuChevronRight aria-hidden className="hidden h-8 w-8 self-center text-white/25 lg:block" /> : null}
                </Fragment>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
              <div className="space-y-8">
                {/* Barème */}
                <section aria-labelledby="titre-bareme">
                  <p id="titre-bareme" className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">
                    Points par Coupe Horus
                  </p>
                  <div className="mt-3 space-y-2">
                    {[...Object.entries(MEDALS).map(([key, [label, color]]) => [label, data.points[key], color]), ["Autres équipes présentes", data.points.present, null]].map(([label, value, color]) => (
                      <div key={label} className="flex items-center justify-between bg-white/[0.03] px-4 py-3">
                        <span className="flex items-center gap-2">
                          {color ? <LuTrophy aria-hidden className="h-4 w-4" style={{ color }} /> : null}
                          {label}
                        </span>
                        <span className="font-display text-xl font-black text-gold">+{value}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-white/45">Présente = check-in fait. Les bonus de Division des coupes restent inchangés.</p>
                </section>

                {/* Coupes de la saison */}
                {data.cups.length ? (
                  <section aria-labelledby="titre-coupes">
                    <p id="titre-coupes" className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">
                      Coupes Horus de la saison
                    </p>
                    <ul className="mt-3 space-y-2">
                      {data.cups.map((cup) => (
                        <li key={cup.id}>
                          <Link href="/cod/tournoi" className="flex items-center gap-3 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.06]">
                            <span className="w-24 shrink-0 font-tech text-[11px] uppercase text-white/50">{dateFr(cup.startsAt)}</span>
                            <span className="min-w-0 flex-1 truncate font-semibold">{cup.name}</span>
                            {cup.status === "completed" ? (
                              <span className="truncate text-xs text-white/55">{cup.winner ? `Vainqueur : ${cup.winner}` : "Terminée"}</span>
                            ) : (
                              <span className="bg-gold/15 px-2 py-0.5 font-tech text-[10px] uppercase text-gold">{cup.status === "running" ? "En cours" : "À venir"}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>

              {/* Classement du circuit */}
              <section aria-labelledby="titre-classement">
                <p id="titre-classement" className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">
                  Classement du circuit · top {data.circuitSpots} qualifiées
                </p>
                {data.standings.length ? (
                  <div className="mt-3 border border-white/10">
                    {data.standings.map((row, i) => (
                      <Fragment key={row.team.id}>
                        {i === data.circuitSpots ? (
                          <div className="flex items-center gap-2 bg-white/[0.04] px-4 py-1.5">
                            <span aria-hidden className="h-px flex-1 bg-white/25" />
                            <span className="font-tech text-[9px] uppercase tracking-[0.24em] text-white/50">Qualification par la Division possible</span>
                            <span aria-hidden className="h-px flex-1 bg-white/25" />
                          </div>
                        ) : null}
                        <Link
                          href={`/cod/equipes/${row.team.id}`}
                          className={cn("flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/[0.06]", i < data.circuitSpots ? "bg-gold/[0.05]" : "", row.team.disbanded && "opacity-50")}
                        >
                          <span className={cn("w-6 font-display text-lg font-black tabular-nums", i < 3 ? "text-gold" : "text-white/50")}>{i + 1}</span>
                          <TeamCrest team={row.team} size={32} />
                          <span className="min-w-0 flex-1 truncate font-semibold">{row.team.name}</span>
                          <span className="hidden gap-1 sm:flex">
                            {Object.entries(MEDALS).map(([key, [, color]]) =>
                              row.podiums[key] ? (
                                <span key={key} className="inline-flex items-center gap-0.5 text-xs text-white/60">
                                  <LuTrophy aria-hidden className="h-3.5 w-3.5" style={{ color }} />×{row.podiums[key]}
                                </span>
                              ) : null,
                            )}
                          </span>
                          <span className="hidden text-xs text-white/45 sm:inline">
                            {row.cups} coupe{row.cups > 1 ? "s" : ""}
                          </span>
                          <span className="w-16 text-right font-display text-xl font-black tabular-nums">{row.points}</span>
                        </Link>
                      </Fragment>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-white/55">
                    Aucune Coupe Horus terminée cette saison : le classement s&apos;ouvre avec la première.{" "}
                    <Link href="/cod/tournoi" className="text-gold underline underline-offset-4">
                      Voir les coupes
                    </Link>
                  </p>
                )}
              </section>
            </div>
          </>
        ) : null}
      </Container>
    </>
  );
}
