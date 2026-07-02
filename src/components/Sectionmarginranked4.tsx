import type { NextPage } from "next";
import Image from "next/image";

const Sectionmarginranked4: NextPage = () => {
  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-[13px] text-[#6b7d94] font-[Rajdhani]">
      <div className="w-[1200px] flex flex-col items-start pt-0 px-6 pb-16 box-border max-w-[1200px] lg:max-w-full mq750:pb-[42px] mq750:box-border">
        <div className="self-stretch flex flex-col items-start">
          <b className="relative tracking-[1.82px] leading-[19.5px] uppercase">
            Les rangs
          </b>
        </div>
        <main className="self-stretch h-[696px] flex flex-col items-start pt-6 px-0 pb-0 box-border gap-2 text-center text-[13px] text-[#3a4d65] font-[Cousine] mq1050:h-auto">
          <div className="[background:linear-gradient(90deg,_rgba(232,_180,_248,_0.07),_rgba(13,_21,_32,_0.8))] border-[rgba(232,180,248,0.2)] border-solid border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] flex items-center py-4 px-6 gap-[18px] mq1050:flex-wrap">
            <div className="w-7 flex flex-col items-center">
              <b className="relative leading-[19.5px]">01</b>
            </div>
            <div className="h-[38px] w-[38px] bg-[rgba(232,180,248,0.12)] flex items-center justify-center">
              <Image
                className="h-[18px] w-full relative"
                loading="lazy"
                width={18}
                height={18}
                sizes="100vw"
                alt=""
                src="/assets/Iconchampion.svg"
              />
            </div>
            <div className="flex-1 flex flex-col items-start min-w-[593px] text-left text-[17px] text-[#e8b4f8] font-[Rajdhani] mq750:min-w-full">
              <div className="self-stretch flex flex-col items-start">
                <b className="relative tracking-[0.51px] leading-[20.4px]">
                  Champion
                </b>
              </div>
              <div className="w-[912px] h-[22px] flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-[13px] text-[#4a6080] font-[Inter]">
                <div className="relative leading-[19.5px]">3500+ pts</div>
              </div>
            </div>
            <button className="cursor-pointer border-[rgba(232,180,248,0.25)] border-solid border-[1px] py-[3px] px-3 bg-[rgba(232,180,248,0.12)] flex flex-col items-start hover:bg-[rgba(181,130,196,0.12)] hover:border-[rgba(181,130,196,0.25)] hover:border-solid hover:hover:border-[1px] hover:box-border">
              <b className="relative text-[11px] tracking-[0.66px] leading-[16.5px] uppercase font-[Inter] text-[#e8b4f8] text-left">
                Top 10
              </b>
            </button>
          </div>
          <div className="bg-[rgba(13,21,32,0.6)] border-[#c084fc] border-solid border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] flex items-center flex-wrap content-center py-4 px-6 gap-[18px]">
            <div className="w-7 flex flex-col items-center">
              <b className="relative leading-[19.5px]">02</b>
            </div>
            <div className="h-[38px] w-[38px] bg-[rgba(192,132,252,0.12)] flex items-center justify-center">
              <Image
                className="h-[18px] w-full relative"
                loading="lazy"
                width={18}
                height={18}
                sizes="100vw"
                alt=""
                src="/assets/Icongrandmaitre.svg"
              />
            </div>
            <div className="flex-1 flex flex-col items-start min-w-[649px] text-left text-[17px] text-[#c084fc] font-[Rajdhani] mq1050:min-w-full">
              <div className="self-stretch flex flex-col items-start">
                <b className="relative tracking-[0.51px] leading-[20.4px]">
                  Grand Maître
                </b>
              </div>
              <div className="w-[998px] h-[22px] flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-[13px] text-[#4a6080] font-[Inter]">
                <div className="relative leading-[19.5px]">3000–3499 pts</div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(13,21,32,0.6)] border-[#a78bfa] border-solid border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] flex items-center flex-wrap content-center py-4 px-6 gap-[18px]">
            <div className="w-7 flex flex-col items-center">
              <b className="relative leading-[19.5px]">03</b>
            </div>
            <div className="h-[38px] w-[38px] bg-[rgba(167,139,250,0.12)] flex items-center justify-center">
              <Image
                className="h-[18px] w-full relative"
                loading="lazy"
                width={18}
                height={18}
                sizes="100vw"
                alt=""
                src="/assets/Iconmaitre.svg"
              />
            </div>
            <div className="flex-1 flex flex-col items-start min-w-[649px] text-left text-[17px] text-[#a78bfa] font-[Rajdhani] mq1050:min-w-full">
              <div className="self-stretch flex flex-col items-start">
                <b className="relative tracking-[0.51px] leading-[20.4px]">
                  Maître
                </b>
              </div>
              <div className="w-[998px] h-[22px] flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-[13px] text-[#4a6080] font-[Inter]">
                <div className="relative leading-[19.5px]">2500–2999 pts</div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(13,21,32,0.6)] border-[#38bdf8] border-solid border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] flex items-center flex-wrap content-center py-4 px-6 gap-[18px]">
            <div className="w-7 flex flex-col items-center">
              <b className="relative leading-[19.5px]">04</b>
            </div>
            <div className="h-[38px] w-[38px] bg-[rgba(56,189,248,0.12)] flex items-center justify-center">
              <Image
                className="h-[18px] w-full relative"
                loading="lazy"
                width={18}
                height={18}
                sizes="100vw"
                alt=""
                src="/assets/Icondiament.svg"
              />
            </div>
            <div className="flex-1 flex flex-col items-start min-w-[649px] text-left text-[17px] text-[#38bdf8] font-[Rajdhani] mq1050:min-w-full">
              <div className="self-stretch flex flex-col items-start">
                <b className="relative tracking-[0.51px] leading-[20.4px]">
                  Diamant
                </b>
              </div>
              <div className="w-[998px] h-[22px] flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-[13px] text-[#4a6080] font-[Inter]">
                <div className="relative leading-[19.5px]">2000–2499 pts</div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(13,21,32,0.6)] border-[#34d399] border-solid border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] flex items-center flex-wrap content-center py-4 px-6 gap-[18px]">
            <div className="w-7 flex flex-col items-center">
              <b className="relative leading-[19.5px]">05</b>
            </div>
            <div className="h-[38px] w-[38px] bg-[rgba(52,211,153,0.12)] flex items-center justify-center">
              <Image
                className="h-[18px] w-full relative"
                loading="lazy"
                width={18}
                height={18}
                sizes="100vw"
                alt=""
                src="/assets/Iconplatine.svg"
              />
            </div>
            <div className="flex-1 flex flex-col items-start min-w-[649px] text-left text-[17px] text-[#34d399] font-[Rajdhani] mq1050:min-w-full">
              <div className="self-stretch flex flex-col items-start">
                <b className="relative tracking-[0.51px] leading-[20.4px]">
                  Platine
                </b>
              </div>
              <div className="w-[998px] h-[22px] flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-[13px] text-[#4a6080] font-[Inter]">
                <div className="relative leading-[19.5px]">1500–1999 pts</div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(13,21,32,0.6)] border-[#c9a227] border-solid border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] flex items-center flex-wrap content-center py-4 px-6 gap-[18px]">
            <div className="w-7 flex flex-col items-center">
              <b className="relative leading-[19.5px]">06</b>
            </div>
            <div className="h-[38px] w-[38px] bg-[rgba(201,162,39,0.12)] flex items-center justify-center">
              <Image
                className="h-[18px] w-full relative"
                loading="lazy"
                width={18}
                height={18}
                sizes="100vw"
                alt=""
                src="/assets/Iconor.svg"
              />
            </div>
            <div className="flex-1 flex flex-col items-start min-w-[649px] text-left text-[17px] text-[#c9a227] font-[Rajdhani] mq1050:min-w-full">
              <div className="self-stretch flex flex-col items-start">
                <b className="relative tracking-[0.51px] leading-[20.4px]">
                  Or
                </b>
              </div>
              <div className="w-[998px] h-[22px] flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-[13px] text-[#4a6080] font-[Inter]">
                <div className="relative leading-[19.5px]">1000–1499 pts</div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(13,21,32,0.6)] border-[#94a3b8] border-solid border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] flex items-center flex-wrap content-center py-4 px-6 gap-[18px]">
            <div className="w-7 flex flex-col items-center">
              <b className="relative leading-[19.5px]">07</b>
            </div>
            <div className="h-[38px] w-[38px] bg-[rgba(148,163,184,0.12)] flex items-center justify-center">
              <Image
                className="h-[18px] w-full relative"
                loading="lazy"
                width={18}
                height={18}
                sizes="100vw"
                alt=""
                src="/assets/Iconargent.svg"
              />
            </div>
            <div className="flex-1 flex flex-col items-start min-w-[649px] text-left text-[17px] text-[#94a3b8] font-[Rajdhani] mq1050:min-w-full">
              <div className="self-stretch flex flex-col items-start">
                <b className="relative tracking-[0.51px] leading-[20.4px]">
                  Argent
                </b>
              </div>
              <div className="w-[998px] h-[22px] flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-[13px] text-[#4a6080] font-[Inter]">
                <div className="relative leading-[19.5px]">500–999 pts</div>
              </div>
            </div>
          </div>
          <div className="bg-[rgba(13,21,32,0.6)] border-[#c97b4b] border-solid border-t-[1px] border-r-[1px] border-b-[1px] border-l-[3px] flex items-center flex-wrap content-center py-4 px-6 gap-[18px]">
            <div className="w-7 flex flex-col items-center">
              <b className="relative leading-[19.5px]">08</b>
            </div>
            <div className="h-[38px] w-[38px] bg-[rgba(201,123,75,0.12)] flex items-center justify-center">
              <Image
                className="h-[18px] w-full relative"
                loading="lazy"
                width={18}
                height={18}
                sizes="100vw"
                alt=""
                src="/assets/Iconbronze.svg"
              />
            </div>
            <div className="flex-1 flex flex-col items-start min-w-[649px] text-left text-[17px] text-[#c97b4b] font-[Rajdhani] mq1050:min-w-full">
              <div className="self-stretch flex flex-col items-start">
                <b className="relative tracking-[0.51px] leading-[20.4px]">
                  Bronze
                </b>
              </div>
              <div className="w-[998px] h-[22px] flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-[13px] text-[#4a6080] font-[Inter]">
                <div className="relative leading-[19.5px]">0–499 pts</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sectionmarginranked4;
