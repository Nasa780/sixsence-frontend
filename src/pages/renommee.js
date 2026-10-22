import { motion } from "framer-motion";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuCrown, LuFlame, LuMedal, LuStar, LuTrophy, LuZap } from "react-icons/lu";
import { TeamCrest } from "../components/teams/TeamParts";
import { Avatar } from "../components/ui/Avatar";
import { Container } from "../components/ui/Container";
import { EmptyState, Loading, Notice } from "../components/ui/Feedback";
import { TacticalCard } from "../components/ui/TacticalCard";
import { Eyebrow, PageHeader } from "../components/ui/Typography";
import { api } from "../lib/api";
import { cn } from "../lib/cn";

const CUP_IMAGE = { horus: "/images/trophees/horus-or.png", anubis: "/images/trophees/anubis-or.png", saison: "/images/trophees/horus-or.png" };
const CUP_LABEL = { horus: "Coupe Horus", anubis: "Coupe Anubis", saison: "Tournoi de saison" };
const monthFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
const dateFr = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "");

/**
 * Renommée (page « Bureau des Légendes », ancienne page Hall of Fame) : records de tous les temps, champions de chaque saison (joueurs et équipes), vainqueurs
 * des coupes (trophées Horus, médailles Anubis) et MVP du mois. Données GET /hall-of-fame du backend.
 */
export default function RenownPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api("/hall-of-fame")
      .then(setData)
      .catch((caught) => setError(caught.message));
  }, []);

  const records = data
    ? [
        ["streak", "Plus longue série", LuFlame, (v) => `${v} victoires`],
        ["peak", "Plus haut sommet", LuZap, (v) => `${v.toLocaleString("fr-FR")} pts`],
        ["xp", "Plus d'expérience", LuStar, (v) => `${v.toLocaleString("fr-FR")} XP`],
        ["wins", "Victoires cette saison", LuTrophy, (v) => `${v} victoires`],
      ].filter(([key]) => data.records[key])
    : [];

  return (
    <>
      <Head>
        <title>Renommée — SixSence</title>
        <meta name="description" content="Renommée SixSence, le Bureau des Légendes : champions de saison, vainqueurs des coupes Horus et Anubis, MVP du mois et records." />
      </Head>
      <PageHeader
        eyebrow="SixSence · Renommée"
        title={
          <>
            Bureau des <span className="text-gold-gradient">Légendes</span>
          </>
        }
        description="Les champions, les vainqueurs de coupes et les records de SixSence. Ceux qui ont marqué l'histoire de la communauté."
      />
      <Container className="space-y-16 py-12">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {!data && !error ? <Loading /> : null}

        {data ? (
          <>
            {records.length ? (
              <section aria-labelledby="titre-records">
                <SectionTitle id="titre-records" eyebrow="De tous les temps" title="Records" />
                <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {records.map(([key, label, Icon, format], index) => {
                    const record = data.records[key];
                    return (
                      <motion.li key={key} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.07 }}>
                        <TacticalCard highlight={index === 0} cut={20} innerClassName="relative h-full overflow-hidden p-5">
                          <Icon aria-hidden className="absolute -right-3 -top-3 h-24 w-24 text-gold/10" />
                          <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-gold">{label}</p>
                          <p className="mt-3 font-display text-4xl font-black leading-none tabular-nums">{format(record.value)}</p>
                          <Link href={`/cod/profile/${record.id}`} className="mt-4 flex items-center gap-2.5 hover:text-gold">
                            <Avatar full src={record.avatarUrl} name={record.username} size={30} />
                            <span className="truncate text-sm font-semibold">{record.username}</span>
                          </Link>
                        </TacticalCard>
                      </motion.li>
                    );
                  })}
                </ul>
              </section>
            ) : null}

            <section aria-labelledby="titre-saisons">
              <SectionTitle id="titre-saisons" eyebrow="Classé et Division" title="Champions de saison" />
              {data.seasons.length === 0 ? (
                <div className="mt-6">
                  <EmptyState title="La première saison est en cours">Les champions apparaîtront ici à la clôture de la saison.</EmptyState>
                </div>
              ) : (
                <div className="mt-6 space-y-6">
                  {data.seasons.map((season) => (
                    <TacticalCard key={season.id} cut={24} innerClassName="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
                      <div>
                        <p className="font-display text-3xl font-black uppercase leading-none">{season.name}</p>
                        <p className="mt-1 text-xs text-white/45">Terminée le {dateFr(season.endedAt)}</p>
                        <ol className="mt-5 space-y-2">
                          {season.players.map((p) => (
                            <PodiumRow key={p.user_id} position={p.position} href={`/cod/profile/${p.user_id}`} label={p.username} detail={`${p.points} pts · ${p.wins} V`} />
                          ))}
                        </ol>
                      </div>
                      <div>
                        <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Division</p>
                        <ol className="mt-3 space-y-2">
                          {season.teams.length ? (
                            season.teams.map((t) => <PodiumRow key={t.team_id} position={t.position} href={`/cod/equipes/${t.team_id}`} label={`[${t.tag}] ${t.name}`} detail={`${t.points} pts`} />)
                          ) : (
                            <li className="text-sm text-white/45">Pas de classement des équipes cette saison.</li>
                          )}
                        </ol>
                      </div>
                    </TacticalCard>
                  ))}
                </div>
              )}
            </section>

            <section aria-labelledby="titre-coupes">
              <SectionTitle id="titre-coupes" eyebrow="Horus, Anubis, fin de saison" title="Vainqueurs des coupes" />
              {data.cups.length === 0 ? (
                <div className="mt-6">
                  <EmptyState title="Aucune coupe terminée">Le premier vainqueur aura sa place ici.</EmptyState>
                </div>
              ) : (
                <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {data.cups.map((cup, index) => (
                    <motion.li key={cup.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index, 6) * 0.05 }}>
                      <TacticalCard cut={20} innerClassName="relative flex h-full items-center gap-4 overflow-hidden p-5">
                        <span aria-hidden className="absolute left-4 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-[#e7c05a]/20 blur-xl" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={CUP_IMAGE[cup.kind] ?? CUP_IMAGE.horus} alt="" width={420} height={420} loading="lazy" className="relative h-20 w-16 shrink-0 object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]" />
                        <div className="min-w-0 flex-1">
                          <p className="font-tech text-[9px] uppercase tracking-[0.24em] text-[#e7c05a]">
                            {CUP_LABEL[cup.kind] ?? "Coupe"} · {dateFr(cup.completedAt)}
                          </p>
                          <p className="mt-1 truncate text-sm text-white/60">{cup.name}</p>
                          {cup.winner ? (
                            cup.winner.cup ? (
                              <p className="mt-1 truncate font-display text-2xl font-black uppercase leading-none">{cup.winner.name}</p>
                            ) : (
                              <Link href={`/cod/equipes/${cup.winner.id}`} className="mt-1 flex items-center gap-2 hover:text-gold">
                                <TeamCrest team={cup.winner} size={26} />
                                <span className="truncate font-display text-2xl font-black uppercase leading-none">{cup.winner.name}</span>
                              </Link>
                            )
                          ) : null}
                          {cup.players.length ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {cup.players.map((p) => (
                                <Link key={p.id} href={`/cod/profile/${p.id}`} title={p.username}>
                                  <Avatar full src={p.avatarUrl} name={p.username} size={22} />
                                </Link>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </TacticalCard>
                    </motion.li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-labelledby="titre-mvp">
              <SectionTitle id="titre-mvp" eyebrow="Élus par les joueurs" title="MVP du mois" />
              {data.mvps.length === 0 ? (
                <div className="mt-6">
                  <EmptyState title="Pas encore de MVP du mois">Vote pour le MVP après chaque victoire : le plus élu du mois entre dans la Renommée.</EmptyState>
                </div>
              ) : (
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                  {data.mvps.map((mvp, index) => (
                    <li key={mvp.month}>
                      <Link href={`/cod/profile/${mvp.id}`} className={cn("group flex flex-col items-center border-t-2 bg-white/[0.02] p-4 text-center transition hover:bg-white/[0.05]", index === 0 ? "border-gold" : "border-white/10")}>
                        <span className="relative">
                          <Avatar full src={mvp.avatarUrl} name={mvp.username} size={56} />
                          {index === 0 ? <LuCrown aria-hidden className="absolute -right-2 -top-3 h-5 w-5 rotate-12 text-gold" /> : null}
                        </span>
                        <span className="mt-3 w-full truncate text-sm font-semibold">{mvp.username}</span>
                        <span className="mt-0.5 font-tech text-[9px] uppercase tracking-[0.2em] text-white/45">{monthFr(mvp.month)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </Container>
    </>
  );
}

function SectionTitle({ id, eyebrow, title }) {
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}

const MEDAL = ["text-[#e7c05a]", "text-white/80", "text-[#d6935a]"];
function PodiumRow({ position, href, label, detail }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 border-l-2 border-white/10 bg-white/[0.03] px-3 py-2.5 transition hover:border-gold hover:bg-white/[0.06]">
        <LuMedal aria-hidden className={cn("h-5 w-5 shrink-0", MEDAL[position - 1] ?? "text-white/40")} />
        <span className="min-w-0 flex-1 truncate font-display text-lg font-bold uppercase leading-none">{label}</span>
        <span className="font-tech text-[10px] text-white/45">{detail}</span>
      </Link>
    </li>
  );
}
