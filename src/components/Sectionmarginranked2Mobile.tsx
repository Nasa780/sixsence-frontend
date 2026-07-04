import type { NextPage } from "next";
import Image from "next/image";

const Sectionmarginranked2Mobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center px-4 py-10 text-left text-[13px] text-[#6b7d94] font-[Rajdhani]">

      {/* TITRE */}
      <div className="w-full flex flex-col items-start">
        <b className="tracking-[1.5px] leading-[18px] uppercase">
          Mode de jeu principal
        </b>
      </div>

      {/* CARD */}
      <div className="w-full mt-5 bg-[rgba(26,107,220,0.25)] p-[1px] rounded-md">
        <div className="w-full bg-[linear-gradient(135deg,#0d1520,#0a1628)] rounded-md py-6 px-4 relative">

          {/* CONTENU */}
          <div className="flex flex-col gap-6">

            {/* HEADER MODE */}
            <div className="flex items-center gap-3 flex-wrap">

              {/* ICON MODE */}
              <button className="cursor-pointer border border-[rgba(26,107,220,0.3)] bg-[rgba(26,107,220,0.15)] h-10 w-10 flex items-center justify-center rounded">
                <Image
                  src="/assets/IconRD.svg"
                  alt="RD"
                  width={20}
                  height={20}
                />
              </button>

              {/* NOM MODE */}
              <h1 className="text-[22px] font-bold text-[#e8eaf0] tracking-[0.2px] leading-[26px]">
                Recherche & Destruction
              </h1>

              {/* BADGE DISPONIBLE */}
              <button className="cursor-pointer border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.12)] py-[3px] px-[10px] rounded hover:bg-[rgba(8,171,69,0.12)]">
                <span className="text-[11px] font-semibold text-[#22c55e] tracking-[0.5px]">
                  Disponible
                </span>
              </button>
            </div>

            {/* DESCRIPTION */}
            <p className="text-[14px] text-[#6b7d94] leading-[22px] font-[Inter]">
              Le mode compétitif officiel de la saison. Élimine l'équipe adverse
              ou accomplis l'objectif pour remporter la manche.
            </p>

            {/* BOUTONS */}
            <div className="flex flex-col gap-3 w-full">

              {/* RÈGLES */}
              <button className="cursor-pointer bg-[linear-gradient(90deg,#1a6bdc,#1559b8)] py-3 px-4 rounded flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  Voir les règles du mode
                </span>
                <Image
                  src="/assets/Iconfleche3.svg"
                  alt="→"
                  width={14}
                  height={14}
                />
              </button>

              {/* MAPS */}
              <button className="cursor-pointer border border-[rgba(26,107,220,0.25)] bg-[rgba(26,107,220,0.06)] py-3 px-4 rounded flex items-center justify-between hover:bg-[rgba(64,145,255,0.06)] hover:border-[rgba(64,145,255,0.25)]">
                <span className="text-sm font-medium text-[#a0b0c8]">
                  Maps disponibles
                </span>
                <Image
                  src="/assets/Iconfleche3.svg"
                  alt="→"
                  width={14}
                  height={14}
                />
              </button>

              {/* HISTORIQUE */}
              <button className="cursor-pointer border border-[rgba(26,107,220,0.25)] bg-[rgba(26,107,220,0.06)] py-3 px-4 rounded flex items-center justify-between hover:bg-[rgba(64,145,255,0.06)] hover:border-[rgba(64,145,255,0.25)]">
                <span className="text-sm font-medium text-[#a0b0c8]">
                  Voir les 30 derniers matchs
                </span>
                <Image
                  src="/assets/Iconfleche3.svg"
                  alt="→"
                  width={14}
                  height={14}
                />
              </button>

            </div>
          </div>

          {/* DÉCORATIONS */}
          <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-[radial-gradient(141.42%_141.42%_at_100%_0%,rgba(26,107,220,0.1),rgba(0,0,0,0)_60%)] pointer-events-none" />
          <div className="absolute top-0 left-0 w-[3px] h-[180px] bg-[linear-gradient(180deg,#1a6bdc,rgba(0,0,0,0))] pointer-events-none" />

        </div>
      </div>
    </div>
  );
};

export default Sectionmarginranked2Mobile;
