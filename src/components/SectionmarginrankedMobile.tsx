import type { NextPage } from "next";
import Image from "next/image";

const SectionmarginrankedMobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center px-4 py-10 text-left text-xs text-[#22d3ee] font-[Inter]">

      {/* BADGE EN COURS */}
      <div className="w-full flex items-start pb-5">
        <div className="bg-[rgba(26,107,220,0.12)] border border-[rgba(26,107,220,0.3)] py-1 px-3.5 flex items-center gap-2 rounded">
          <div className="h-[7px] w-[7px] rounded bg-[#22d3ee] shadow-[0px_0px_8px_#22d3ee]" />
          <span className="tracking-[1px] text-[11px] font-semibold">
            EN COURS
          </span>
        </div>
      </div>

      {/* TITRE SAISON + COMPÉTITION */}
      <div className="w-full flex flex-col items-start gap-3">

{/* TITRE MOBILE OPTIMISÉ */}
<div className="w-full flex flex-col items-center text-center">

  {/* Compétition Ouverte */}
  <h2 className="text-[32px] font-bold tracking-[-0.4px] leading-[36px] 
    text-transparent bg-clip-text 
    [background:linear-gradient(90deg,#1a6bdc,#38bdf8)]
    [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
    Compétition Ouverte
  </h2>

  {/* Saison 1 */}
  <h1 className="mt-1 text-[20px] font-bold text-[#e8eaf0] tracking-[0.3px]">
    Saison 1
  </h1>

</div>

        {/* SOUS-TEXTE */}
        <p className="text-[14px] text-[#6b7d94] leading-[22px] pt-2">
          Affronte les meilleurs joueurs et grimpe les échelons.
        </p>
      </div>
    </div>
  );
};

export default SectionmarginrankedMobile;
