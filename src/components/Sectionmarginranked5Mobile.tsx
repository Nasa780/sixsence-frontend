import type { NextPage } from "next";

const losses = [
  { name: "Bronze", color: "#c97b4b", loss: "-10" },
  { name: "Argent", color: "#94a3b8", loss: "-12" },
  { name: "Or", color: "#c9a227", loss: "-15" },
  { name: "Platine", color: "#34d399", loss: "-18" },
  { name: "Diamant", color: "#38bdf8", loss: "-20" },
  { name: "Maître", color: "#a78bfa", loss: "-22" },
  { name: "Grand Maître", color: "#c084fc", loss: "-25" },
  { name: "Champion", color: "#e8b4f8", loss: "-30" },
];

const Sectionmarginranked5Mobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center px-4 py-10 text-left font-[Rajdhani]">

      {/* TITRE */}
      <div className="w-full mb-6">
        <b className="tracking-[1.5px] uppercase text-[15px] text-[#6b7d94]">
          Points perdus en cas de défaite
        </b>
      </div>

      {/* TABLEAU MOBILE */}
      <div className="w-full rounded-[10px] bg-[rgba(26,107,220,0.15)] p-[1px]">
        <div className="w-full rounded-[10px] bg-[rgba(13,21,32,0.6)]">

          {/* HEADER */}
          <div className="w-full flex justify-between px-4 py-3 border-b border-[rgba(26,107,220,0.12)] text-xs font-[Inter] text-[#3a4d65]">
            <span className="uppercase tracking-[1px] font-semibold">Rang</span>
            <span className="uppercase tracking-[1px] font-semibold">Points perdus</span>
          </div>

          {/* LIGNES */}
          {losses.map((rank) => (
            <div
              key={rank.name}
              className="w-full flex justify-between items-center px-4 py-3 border-b border-[rgba(26,107,220,0.08)]"
            >
              {/* Rang */}
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded"
                  style={{ backgroundColor: rank.color }}
                />
                <span className="text-[15px] text-[#e8eaf0] font-semibold">
                  {rank.name}
                </span>
              </div>

              {/* Points perdus */}
              <b className="text-[15px] font-[Cousine] text-[#ef4444]">
                {rank.loss}
              </b>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default Sectionmarginranked5Mobile;
