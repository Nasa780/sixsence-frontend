import type { NextPage } from "next";
import Image from "next/image";

const ranks = [
  {
    id: "01",
    name: "Champion",
    pts: "3500+ pts",
    color: "#e8b4f8",
    border: "rgba(232,180,248,0.2)",
    bg: "rgba(232,180,248,0.12)",
    icon: "/assets/Iconchampion.svg",
    badge: "Top 10",
  },
  {
    id: "02",
    name: "Grand Maître",
    pts: "3000–3499 pts",
    color: "#c084fc",
    border: "rgba(192,132,252,0.2)",
    bg: "rgba(192,132,252,0.12)",
    icon: "/assets/Icongrandmaitre.svg",
  },
  {
    id: "03",
    name: "Maître",
    pts: "2500–2999 pts",
    color: "#a78bfa",
    border: "rgba(167,139,250,0.2)",
    bg: "rgba(167,139,250,0.12)",
    icon: "/assets/Iconmaitre.svg",
  },
  {
    id: "04",
    name: "Diamant",
    pts: "2000–2499 pts",
    color: "#38bdf8",
    border: "rgba(56,189,248,0.2)",
    bg: "rgba(56,189,248,0.12)",
    icon: "/assets/Icondiament.svg",
  },
  {
    id: "05",
    name: "Platine",
    pts: "1500–1999 pts",
    color: "#34d399",
    border: "rgba(52,211,153,0.2)",
    bg: "rgba(52,211,153,0.12)",
    icon: "/assets/Iconplatine.svg",
  },
  {
    id: "06",
    name: "Or",
    pts: "1000–1499 pts",
    color: "#c9a227",
    border: "rgba(201,162,39,0.2)",
    bg: "rgba(201,162,39,0.12)",
    icon: "/assets/Iconor.svg",
  },
  {
    id: "07",
    name: "Argent",
    pts: "500–999 pts",
    color: "#94a3b8",
    border: "rgba(148,163,184,0.2)",
    bg: "rgba(148,163,184,0.12)",
    icon: "/assets/Iconargent.svg",
  },
  {
    id: "08",
    name: "Bronze",
    pts: "0–499 pts",
    color: "#c97b4b",
    border: "rgba(201,123,75,0.2)",
    bg: "rgba(201,123,75,0.12)",
    icon: "/assets/Iconbronze.svg",
  },
];

const Sectionmarginranked4Mobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center px-4 py-10 text-left font-[Rajdhani]">

      {/* TITRE */}
      <div className="w-full mb-6">
        <b className="tracking-[1.5px] uppercase text-[15px] text-[#6b7d94]">
          Les rangs
        </b>
      </div>

      {/* LISTE DES RANGS */}
      <div className="w-full flex flex-col gap-4">

        {ranks.map((rank) => (
          <div
            key={rank.id}
            className="w-full rounded-[10px] bg-[rgba(13,21,32,0.6)] border-l-[3px] border border-[#1a1b22] p-4 flex items-center gap-4"
            style={{
              borderColor: rank.border,
            }}
          >
            {/* ID */}
            <div className="w-8 text-center text-[#3a4d65] font-[Cousine] font-bold">
              {rank.id}
            </div>

            {/* ICON */}
            <div
              className="h-[38px] w-[38px] flex items-center justify-center rounded"
              style={{ backgroundColor: rank.bg }}
            >
              <Image
                src={rank.icon}
                alt={rank.name}
                width={18}
                height={18}
              />
            </div>

            {/* TEXTE */}
            <div className="flex-1 flex flex-col">
              <b
                className="text-[17px] tracking-[0.5px]"
                style={{ color: rank.color }}
              >
                {rank.name}
              </b>
              <span className="text-[13px] text-[#4a6080] font-[Inter]">
                {rank.pts}
              </span>
            </div>

            {/* BADGE (uniquement Champion) */}
            {rank.badge && (
              <div className="rounded bg-[rgba(232,180,248,0.12)] border border-[rgba(232,180,248,0.25)] px-3 py-1">
                <b className="text-[11px] uppercase tracking-[0.6px] text-[#e8b4f8] font-[Inter]">
                  {rank.badge}
                </b>
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
};

export default Sectionmarginranked4Mobile;
