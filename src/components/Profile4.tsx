import type { NextPage } from "next";
import Image from "next/image";

const Container: NextPage = () => {
  return (
    <div className="w-[1152px] rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border max-w-full flex flex-col items-start py-5 px-6 leading-[normal] tracking-[normal] text-left text-[11px] text-[#94a3b8] font-[Inter]">
      <div className="self-stretch flex items-center gap-2">
        <Image
          className="cursor-pointer [border:none] p-0 bg-[transparent] h-[18px] w-[18px] relative"
          width={18}
          height={18}
          sizes="100vw"
          alt=""
          src="/MedalIcon.svg"
        />
        <div className="h-[17px] flex flex-col items-start">
          <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
            Statistiques Totales
          </b>
        </div>
      </div>
      <section className="self-stretch flex flex-col items-start pt-4 px-0 pb-0 text-left text-[26px] text-[#fff] font-[Inter]">
        <div className="self-stretch flex items-center justify-center flex-wrap content-center py-0 pl-0 pr-0.5 gap-3">
          <div className="flex-1 shadow-[0px_0px_18px_rgba(192,_132,_252,_0.12)_inset] rounded-lg [background:radial-gradient(111.8%_111.8%_at_50%_0%,_#1e0d3a,_#0f0a1e_55%,_#111114)] border-[#3b1f6a] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[105px] shrink-0">
            <Image
              className="w-7 h-7 relative shadow-[0px_0px_5px_rgba(192,_132,_252,_0.85)]"
              width={28}
              height={28}
              sizes="100vw"
              alt=""
              src="/CrossedSwordsIcon.svg"
            />
            <div className="w-[33px] h-[26px] flex flex-col items-start">
              <h1 className="m-0 relative text-[length:inherit] leading-[26px] font-bold font-[inherit] mq450:text-[21px] mq450:leading-[21px]">
                37
              </h1>
            </div>
            <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
              Matchs Joués
            </div>
          </div>
          <div className="flex-1 rounded-lg bg-[#111114] border-[#2a2a30] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[119px] shrink-0 text-[#4ade80]">
            <Image
              className="w-7 h-7 relative"
              width={28}
              height={28}
              sizes="100vw"
              alt=""
              src="/TrophyStatIcon.svg"
            />
            <div className="w-[33px] h-[26px] flex flex-col items-start">
              <h2 className="m-0 relative text-[length:inherit] leading-[26px] font-bold font-[inherit] mq450:text-[21px] mq450:leading-[21px]">
                22
              </h2>
            </div>
            <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
              Victoires Totales
            </div>
          </div>
          <div className="flex-1 rounded-lg bg-[#111114] border-[#2a2a30] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[115px] shrink-0 text-[#f87171]">
            <Image
              className="w-7 h-7 relative"
              width={28}
              height={28}
              sizes="100vw"
              alt=""
              src="/HeartBrokenIcon.svg"
            />
            <div className="w-[30px] h-[26px] flex flex-col items-start">
              <h2 className="m-0 relative text-[length:inherit] leading-[26px] font-bold font-[inherit] mq450:text-[21px] mq450:leading-[21px]">
                15
              </h2>
            </div>
            <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
              Défaites Totales
            </div>
          </div>
          <div className="flex-1 rounded-lg bg-[#111114] border-[#2a2a30] border-solid border-[1px] box-border overflow-hidden flex flex-col items-center py-[18px] px-4 gap-1.5 min-w-[117px] shrink-0 text-[#fb923c]">
            <Image
              className="w-7 h-7 relative"
              width={28}
              height={28}
              sizes="100vw"
              alt=""
              src="/TrendUpIcon.svg"
            />
            <div className="w-[60px] h-[26px] flex flex-col items-start">
              <h2 className="m-0 relative text-[length:inherit] leading-[26px] font-bold font-[inherit] inline-block min-w-[60px] mq450:text-[21px] mq450:leading-[21px]">
                59%
              </h2>
            </div>
            <div className="relative text-[11px] leading-[16.5px] text-[#6b7280]">
              Ratio de Victoire
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Container;
