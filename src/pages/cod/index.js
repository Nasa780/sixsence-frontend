import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LeaderboardTable from "../../components/site/LeaderboardTable";
import PageShell from "../../components/site/PageShell";
import { SectionTitle } from "../../components/site/ui";
import { api } from "../../lib/api";

/** Hub Call of Duty : accès au classé, au classement et au profil, chiffres en direct. */
const CARDS = [
  {
    href: "/cod/ranked",
    icon: "/assets/Iconranked.svg",
    title: "Ranked",
    text: "Entre dans la file : à 10 joueurs, le match se lance avec une carte et des équipes tirées au sort.",
    cta: "Jouer",
  },
  {
    href: "/cod/leaderboard",
    icon: "/assets/Iconleaderboard.svg",
    title: "Classement",
    text: "Suis ton rang en direct et compare-toi aux meilleurs joueurs de la saison.",
    cta: "Voir le classement",
  },
  {
    href: "/cod/profile",
    icon: "/assets/Iconprofil.svg",
    title: "Mon profil",
    text: "Statistiques, trophées, progression et historique complet de tes matchs.",
    cta: "Ouvrir mon profil",
  },
];

export default function CodHub() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api("/cod/status").then(setStatus).catch(() => {});
  }, []);

  return (
    <PageShell active="cod" title="Call of Duty">
      <div className="flex flex-col gap-8">
        <section className="relative overflow-hidden border border-solid border-[rgba(26,107,220,0.25)] min-h-[220px] flex items-end">
          <div className="absolute inset-0 bg-[url('/images/call-of-duty-black-3840x2160-22670.jpg')] bg-cover bg-center opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,15,0.95),rgba(6,7,15,0.4))]" />
          <div className="relative p-8 max-sm:p-5">
            <div className="text-[11px] text-[#ffa040] font-[Rajdhani] tracking-[2px] uppercase font-bold">Saison 1 · Compétition ouverte</div>
            <h1 className="m-0 pt-1 text-[44px] max-sm:text-[30px] leading-[1.05] font-bold font-[Rajdhani] text-white tracking-[2px] uppercase">
              Call of Duty — Classé 5v5
            </h1>
            <p className="m-0 pt-2 text-sm text-[#a0b0c8] font-[Inter] max-w-[560px]">
              Recherche & Destruction, matchmaking automatique, classement en direct.
            </p>
            {status && (
              <div className="flex flex-wrap gap-4 pt-4 text-xs text-[#a0b0c8] font-[Inter]">
                <span>🔵 {status.playersInQueue} en file</span>
                <span>🟠 {status.matchesInProgress} match(s) en cours</span>
                <span>🟢 {status.playersOnline} en ligne</span>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-3 max-md:grid-cols-1 gap-4">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="no-underline rounded-[10px] bg-[rgba(10,22,40,0.6)] border border-solid border-[rgba(26,107,220,0.15)] p-5 flex flex-col gap-3 hover:border-[rgba(26,107,220,0.5)] transition-colors"
            >
              <Image className="h-10 w-10" width={40} height={40} alt="" src={card.icon} />
              <b className="text-xl text-[#e8f0fa] font-[Rajdhani] tracking-[0.4px]">{card.title}</b>
              <p className="m-0 flex-1 text-sm text-[#6b7d94] font-[Inter] leading-[21px]">{card.text}</p>
              <span className="text-sm text-[#4a90d9] font-[Inter] font-semibold">{card.cta} →</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <SectionTitle
            right={
              <Link href="/cod/leaderboard" className="text-xs text-[#4a90d9] font-[Inter] no-underline normal-case tracking-normal">
                Tout voir →
              </Link>
            }
          >
            Top 10 joueurs
          </SectionTitle>
          <LeaderboardTable limit={10} />
        </div>
      </div>
    </PageShell>
  );
}
