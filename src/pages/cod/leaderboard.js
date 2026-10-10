import Image from "next/image";
import LeaderboardTable from "../../components/site/LeaderboardTable";
import PageShell from "../../components/site/PageShell";
import { PageTitle, Panel, SectionTitle } from "../../components/site/ui";
import useSession from "../../hooks/useSession";
import { RANKS } from "../../lib/ranks";

/** Classement COD complet, en direct. */
export default function Leaderboard() {
  const { userId } = useSession();

  return (
    <PageShell active="leaderboard" title="Classement COD">
      <div className="flex flex-col gap-8">
        <PageTitle
          icon="/assets/Iconleaderboard.svg"
          title="Classement — Saison 1"
          subtitle="Les 200 meilleurs joueurs du classé Call of Duty, mis à jour en direct après chaque match."
        />

        <Panel>
          <SectionTitle>Les rangs</SectionTitle>
          <div className="flex flex-wrap gap-2 pt-3">
            {RANKS.map((rank) => (
              <div
                key={rank.name}
                className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-solid font-[Rajdhani] font-bold text-[13px]"
                style={{ color: rank.color, borderColor: `${rank.color}44`, background: `${rank.color}12` }}
              >
                <Image className="h-4 w-4" width={16} height={16} alt="" src={rank.icon} />
                {rank.name}
                <span className="text-[#5b7fa8] font-[Inter] font-normal text-[11px]">{rank.min}+ pts</span>
              </div>
            ))}
          </div>
        </Panel>

        <LeaderboardTable limit={200} highlightId={userId} />
      </div>
    </PageShell>
  );
}
