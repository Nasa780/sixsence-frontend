import type { NextPage } from "next";
import Image from "next/image";
import Sectionmarginranked from "./Sectionmarginranked";

const Sectionmarginranked2: NextPage = () => {
  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-[13px] text-[#6b7d94] font-[Rajdhani]">
      <div className="w-[1200px] flex flex-col items-start pt-0 px-6 pb-14 box-border max-w-[1200px] lg:max-w-full">
        <div className="self-stretch flex flex-col items-start">
          <b className="relative tracking-[1.82px] leading-[19.5px] uppercase">
            Mode de jeu principal
          </b>
        </div>
        <div className="self-stretch flex flex-col items-start pt-5 px-0 pb-0 box-border max-w-full text-[28px] text-[#e8eaf0]">
          <div className="self-stretch bg-[rgba(26,107,220,0.25)] flex flex-col items-start p-px box-border max-w-full">
            <div className="self-stretch [background:linear-gradient(135deg,_#0d1520,_#0a1628)] flex flex-col items-start py-10 px-11 box-border relative isolate max-w-full lg:pl-[22px] lg:pr-[22px] lg:box-border">
              <div className="self-stretch h-[153px] flex items-start flex-wrap content-start gap-[359.5px] max-w-full shrink-0 lg:h-auto mq1050:gap-[180px] mq750:gap-[90px] mq450:gap-[45px]">
                <div className="flex flex-col items-start max-w-full">
                  <div className="flex items-center gap-[13.5px] mq750:flex-wrap">
                    <button className="cursor-pointer border-[rgba(26,107,220,0.3)] border-solid border-[1px] p-0 bg-[rgba(26,107,220,0.15)] h-11 w-11 box-border flex items-center justify-center">
                      <Image
                        className="h-[22px] w-full relative"
                        width={22}
                        height={22}
                        sizes="100vw"
                        alt=""
                        src="/assets/IconRD.svg"
                      />
                    </button>
                    <div className="flex flex-col items-start">
                      <h1 className="m-0 relative text-[length:inherit] tracking-[0.28px] leading-[30.8px] font-bold font-[inherit] mq450:text-[22px] mq450:leading-[25px]">{`Recherche & Destruction`}</h1>
                    </div>
                    <button className="cursor-pointer border-[rgba(34,197,94,0.3)] border-solid border-[1px] py-[3px] pl-[11px] pr-2.5 bg-[rgba(34,197,94,0.12)] flex flex-col items-start hover:bg-[rgba(8,171,69,0.12)] hover:border-[rgba(8,171,69,0.3)] hover:border-solid hover:hover:border-[1px] hover:box-border">
                      <div className="relative text-xs tracking-[0.6px] leading-[18px] font-semibold font-[Inter] text-[#22c55e] text-left">
                        Disponible
                      </div>
                    </button>
                  </div>
                  <div className="flex flex-col items-start pt-3 px-0 pb-0 text-sm text-[#6b7d94] font-[Inter]">
                    <div className="w-[420px] relative leading-[22.4px] inline-block">
                      Le mode compétitif officiel de la saison. Élimine l'équipe
                      adverse ou accomplis l'objectif pour remporter la manche.
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2.5 min-w-[220px]">
                  <button className="cursor-pointer [border:none] py-[11px] px-[18px] bg-[transparent] self-stretch [background:linear-gradient(90deg,_#1a6bdc,_#1559b8)] flex items-center justify-between gap-5">
                    <div className="relative text-sm tracking-[0.14px] leading-[21px] font-medium font-[Inter] text-[#fff] text-center">
                      Voir les règles du mode
                    </div>
                    <Image
                      className="h-3.5 w-3.5 relative"
                      width={14}
                      height={14}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconfleche3.svg"
                    />
                  </button>
                  <button className="cursor-pointer border-[rgba(26,107,220,0.25)] border-solid border-[1px] py-[11px] px-[18px] bg-[rgba(26,107,220,0.06)] self-stretch flex items-center justify-between gap-5 hover:bg-[rgba(64,145,255,0.06)] hover:gap-5 hover:border-[rgba(64,145,255,0.25)] hover:border-solid hover:hover:border-[1px] hover:box-border">
                    <div className="relative text-sm tracking-[0.14px] leading-[21px] font-medium font-[Inter] text-[#a0b0c8] text-center">
                      Maps disponibles
                    </div>
                    <Image
                      className="h-3.5 w-3.5 relative"
                      loading="lazy"
                      width={14}
                      height={14}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconfleche3.svg"
                    />
                  </button>
                  <button className="cursor-pointer border-[rgba(26,107,220,0.25)] border-solid border-[1px] py-[11px] px-[18px] bg-[rgba(26,107,220,0.06)] flex items-center gap-[9px] hover:bg-[rgba(64,145,255,0.06)] hover:border-[rgba(64,145,255,0.25)] hover:border-solid hover:hover:border-[1px] hover:box-border">
                    <div className="relative text-sm tracking-[0.14px] leading-[21px] font-medium font-[Inter] text-[#a0b0c8] text-center">
                      Voir les 30 derniers matchs
                    </div>
                    <Image
                      className="h-3.5 w-3.5 relative"
                      loading="lazy"
                      width={14}
                      height={14}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconfleche3.svg"
                    />
                  </button>
                </div>
              </div>
              <div className="w-[280px] h-[280px] absolute !!m-[0 important] top-[0px] left-[870px] [background:radial-gradient(141.42%_141.42%_at_100%_0%,_rgba(26,_107,_220,_0.1),_rgba(0,_0,_0,_0)_60%)] z-[1] shrink-0" />
              <div className="w-[3px] h-[233px] absolute !!m-[0 important] top-[0px] left-[0px] [background:linear-gradient(180deg,_#1a6bdc,_rgba(0,_0,_0,_0))] z-[2] shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sectionmarginranked2;
