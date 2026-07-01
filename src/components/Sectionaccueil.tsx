import type { NextPage } from "next";
import Image from "next/image";

type Section1Props = {
  className?: string;
};

const Sectionaccueil: NextPage<Section1Props> = ({ className = "" }) => {
  return (
<div
  className={`w-full max-w-[2174px] flex items-center justify-center py-20 px-6 box-border leading-[normal] tracking-[normal] text-center text-[10px] text-[#e8a020] font-['JetBrains_Mono'] ${className}`}
>
      <div className="w-[672px] shadow-[0px_0px_80px_rgba(0,_0,_0,_0.6),_0px_0px_40px_rgba(232,_160,_32,_0.05)] [background:linear-gradient(145deg,_#141311,_#0f0e0c)] border-[rgba(232,160,32,0.18)] border-solid border-[1px] box-border flex flex-col items-center py-14 px-10 max-w-[672px] mq450:pt-9 mq450:pb-9 mq450:box-border mq750:max-w-full">
        <div className="flex flex-col items-start pt-0 px-0 pb-6">
          <div className="w-16 h-16 bg-[rgba(232,160,32,0.07)] border-[rgba(232,160,32,0.22)] border-solid border-[1px] box-border flex items-center justify-center">
            <Image
              className="h-7 w-full relative"
              width={28}
              height={28}
              alt=""
              src="/assets/Iconapp2.svg"
            />
          </div>
        </div>
        <div className="flex flex-col items-start pt-0 px-0 pb-3">
          <div className="relative tracking-[4px] leading-[15px] uppercase">
            Client Desktop
          </div>
        </div>
        <div className="flex flex-col items-start pt-0 px-0 pb-2 text-3xl font-[Barlow]">
          <h1 className="m-0 relative text-[length:inherit] tracking-[3px] leading-9 uppercase font-black font-[inherit] text-transparent !bg-clip-text [background:linear-gradient(180deg,_#fff,_#f5e8a0_45%,_#e8a020)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mq450:text-lg mq450:leading-[22px] mq750:text-2xl mq750:leading-[29px]">
            Application Windows
          </h1>
        </div>
        <div className="flex flex-col items-start pt-0 px-0 pb-8 text-sm text-[#6b6860] font-[Inter]">
          <h3 className="m-0 relative text-[length:inherit] leading-5 font-normal font-[inherit]">
            Téléchargez le client pour jouer
          </h3>
        </div>
        <button className="cursor-pointer [border:none] py-3 px-7 bg-[transparent] [background:linear-gradient(135deg,_#f5b332,_#e8a020)] flex items-center gap-[7px]">
          <Image
            className="h-3.5 w-3.5 relative"
            width={14}
            height={14}
            alt=""
            src="/Icon.svg"
          />
          <b className="relative text-sm tracking-[1.68px] leading-5 uppercase font-[Barlow] text-[#09090b] text-center">
            Télécharger
          </b>
        </button>
        <div className="flex flex-col items-start pt-4 px-0 pb-0 text-[rgba(107,104,96,0.5)]">
          <div className="relative tracking-[3px] leading-[15px] uppercase">
            Windows · Gratuit · Version 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sectionaccueil;
