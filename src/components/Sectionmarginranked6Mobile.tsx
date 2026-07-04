import type { NextPage } from "next";
import Image from "next/image";

const Sectionmarginranked6Mobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center px-4 py-10 text-left font-[Rajdhani]">

      {/* TITRE */}
      <div className="w-full mb-6">
        <b className="tracking-[1.5px] uppercase text-[15px] text-[#6b7d94]">
          Classement — Top 100
        </b>
      </div>

      {/* CONTAINER */}
      <div className="w-full rounded-[10px] bg-[rgba(26,107,220,0.15)] p-[1px]">
        <div className="w-full rounded-[10px] bg-[rgba(13,21,32,0.6)]">

          {/* HEADER */}
          <div className="w-full flex items-center justify-between px-4 py-3 border-b border-[rgba(26,107,220,0.12)] text-xs font-[Inter] text-[#3a4d65]">
            <span className="uppercase tracking-[1px] font-semibold">#</span>
            <span className="uppercase tracking-[1px] font-semibold">Joueur</span>
            <span className="uppercase tracking-[1px] font-semibold">Rang</span>
            <span className="uppercase tracking-[1px] font-semibold">Points</span>
          </div>

          {/* AUCUN JOUEUR */}
          <div className="w-full flex flex-col items-center py-12 px-4 gap-3 text-center">

            <div className="w-[60px] h-[60px] bg-[rgba(26,107,220,0.07)] border border-[rgba(26,107,220,0.15)] flex items-center justify-center rounded">
              <Image
                src="/assets/Icontop.svg"
                alt="Top"
                width={26}
                height={26}
              />
            </div>

            <div className="text-[15px] text-[#4a6080] font-medium tracking-[0.3px]">
              Aucun joueur classé.
            </div>

            <div className="text-[13px] text-[#2e3d52] font-[Inter]">
              Sois le premier à rejoindre le classement.
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Sectionmarginranked6Mobile;
