import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { rankFor } from "../../lib/ranks";
import { supabase } from "../../lib/supabase";
import { Avatar, Loading } from "./ui";

/**
 * Tableau du classement COD (style de la section « Classement — Top 100 »).
 * Lit la table publique cod_leaderboard et se met à jour en direct quand un
 * match se termine (Supabase Realtime).
 */
export default function LeaderboardTable({ limit = 100, highlightId = null }) {
  const [rows, setRows] = useState(null);
  const instanceId = useId();

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("cod_leaderboard")
        .select("user_id, username, avatar_url, points, wins, losses, win_streak")
        .order("points", { ascending: false })
        .order("wins", { ascending: false })
        .limit(limit);
      if (active) setRows(data || []);
    };
    load();

    const channel = supabase
      .channel(`leaderboard-${limit}-${instanceId}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cod_leaderboard" }, load)
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [limit, instanceId]);

  return (
    <div className="self-stretch w-full bg-[rgba(26,107,220,0.15)] p-px box-border">
      <div className="bg-[rgba(13,21,32,0.6)] flex flex-col">
        <div className="grid grid-cols-[40px_1fr_120px_80px] max-sm:grid-cols-[28px_1fr_70px] gap-3 items-center bg-[rgba(26,107,220,0.06)] border-b border-solid border-[rgba(26,107,220,0.12)] py-3 px-6 max-sm:px-3 text-xs text-[#3a4d65] font-[Inter] tracking-[1.2px] uppercase font-semibold">
          <div>#</div>
          <div>Joueur</div>
          <div className="max-sm:hidden">Rang</div>
          <div className="text-right">Points</div>
        </div>

        {rows === null && <Loading />}

        {rows !== null && rows.length === 0 && (
          <div className="flex flex-col items-center py-[72px] px-6 gap-3 text-[15px] text-[#4a6080] font-[Inter]">
            <div className="w-[60px] h-[60px] bg-[rgba(26,107,220,0.07)] border border-solid border-[rgba(26,107,220,0.15)] flex items-center justify-center">
              <Image className="h-[26px] w-[26px]" width={26} height={26} alt="" src="/assets/Icontop.svg" />
            </div>
            <div className="tracking-[0.3px] leading-[22.5px] font-medium">Aucun joueur classé.</div>
            <div className="text-[13px] leading-[19.5px] text-[#2e3d52]">Sois le premier à rejoindre le classement.</div>
          </div>
        )}

        {rows?.map((row, index) => {
          const rank = rankFor(row.points);
          const isMe = row.user_id === highlightId;
          return (
            <Link
              key={row.user_id}
              href={`/cod/profile/${row.user_id}`}
              className={`no-underline grid grid-cols-[40px_1fr_120px_80px] max-sm:grid-cols-[28px_1fr_70px] gap-3 items-center py-2.5 px-6 max-sm:px-3 border-b border-solid border-[rgba(26,107,220,0.07)] hover:bg-[rgba(26,107,220,0.06)] ${
                isMe ? "bg-[rgba(255,160,64,0.06)]" : ""
              }`}
            >
              <div
                className="font-[Rajdhani] font-bold text-[15px]"
                style={{ color: index < 3 ? ["#ffd700", "#c0c0c0", "#cd7f32"][index] : "#4a6080" }}
              >
                {index + 1}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <Avatar src={row.avatar_url} name={row.username} size={30} />
                <div className="min-w-0">
                  <div className="text-[14px] text-[#e8f0fa] font-semibold font-[Inter] truncate">{row.username}</div>
                  <div className="text-[11px] text-[#5b7fa8] font-[Inter]">
                    {row.wins} V · {row.losses} D
                    {row.win_streak >= 3 && <span className="text-[#f97316]"> · 🔥 {row.win_streak}</span>}
                  </div>
                </div>
              </div>
              <div className="max-sm:hidden flex items-center gap-2 font-[Rajdhani] font-bold text-[13px]" style={{ color: rank.color }}>
                <Image className="h-5 w-5" width={20} height={20} alt="" src={rank.icon} />
                {rank.name}
              </div>
              <div className="text-right font-[Rajdhani] font-bold text-[15px] text-[#e8f0fa]">{row.points}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
