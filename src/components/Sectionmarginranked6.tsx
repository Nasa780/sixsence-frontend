import Link from "next/link";
import LeaderboardTable from "./site/LeaderboardTable";

/** Section « Classement — Top 100 » de la page Ranked, alimentée en direct. */
const Sectionmarginranked6 = () => {
  return (
    <div className="w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-[13px] text-[#6b7d94] font-[Rajdhani]">
      <div className="w-full max-w-[1200px] flex flex-col items-start pt-0 px-6 pb-24 box-border max-sm:px-0 max-sm:pb-[62px]">
        <div className="self-stretch flex items-center justify-between pb-6">
          <b className="tracking-[1.82px] leading-[19.5px] uppercase">Classement — Top 100</b>
          <Link href="/cod/leaderboard" className="text-xs text-[#4a90d9] font-[Inter] no-underline hover:underline">
            Voir le classement complet →
          </Link>
        </div>
        <LeaderboardTable limit={100} />
      </div>
    </div>
  );
};

export default Sectionmarginranked6;
