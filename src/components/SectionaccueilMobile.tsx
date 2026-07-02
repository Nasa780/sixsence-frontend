import type { NextPage } from "next";
import Image from "next/image";

const SectionaccueilMobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center py-12 px-4 text-center text-[10px] text-[#e8a020] font-['JetBrains_Mono']">

      {/* CARD */}
      <div className="w-full max-w-[360px] shadow-[0_0_40px_rgba(0,0,0,0.6)] [background:linear-gradient(145deg,#141311,#0f0e0c)] border border-[rgba(232,160,32,0.18)] rounded-lg flex flex-col items-center py-10 px-6">

        {/* ICON */}
        <div className="flex flex-col items-center pb-5">
          <div className="w-14 h-14 bg-[rgba(232,160,32,0.07)] border border-[rgba(232,160,32,0.22)] flex items-center justify-center rounded-md">
            <Image
              className="h-6 w-6"
              width={24}
              height={24}
              alt=""
              src="/assets/Iconapp2.svg"
            />
          </div>
        </div>

        {/* TITLE */}
        <div className="pb-2">
          <div className="tracking-[3px] leading-[14px] uppercase">
            Client Desktop
          </div>
        </div>

        {/* MAIN TITLE */}
        <div className="pb-2 text-2xl font-[Barlow]">
          <h1 className="m-0 tracking-[2px] leading-7 uppercase font-black text-transparent bg-clip-text [background:linear-gradient(180deg,#fff,#f5e8a0_45%,#e8a020)]">
            Application Windows
          </h1>
        </div>

        {/* SUBTEXT */}
        <div className="pb-6 text-sm text-[#6b6860] font-[Inter]">
          <h3 className="m-0 leading-5 font-normal">
            Téléchargez le client pour jouer
          </h3>
        </div>

        {/* BUTTON */}
        <button className="cursor-pointer py-3 px-6 bg-[transparent] [background:linear-gradient(135deg,#f5b332,#e8a020)] flex items-center gap-2 rounded-md">
          <Image
            className="h-3.5 w-3.5"
            width={14}
            height={14}
            alt=""
            src="/assets/Icontelecharger.svg"
          />
          <b className="text-sm tracking-[1.5px] leading-5 uppercase font-[Barlow] text-[#09090b]">
            Télécharger
          </b>
        </button>

        {/* FOOTER */}
        <div className="pt-4 text-[rgba(107,104,96,0.5)] tracking-[2px] leading-[14px] uppercase">
          Windows · Gratuit · Version 1.0.0
        </div>
      </div>
    </div>
  );
};

export default SectionaccueilMobile;
