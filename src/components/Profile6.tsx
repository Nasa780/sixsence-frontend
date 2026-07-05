import type { NextPage } from "next";
import Image from "next/image";

const Profile6: NextPage = () => {
  return (
    <div className="w-[1152px] rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border max-w-full flex flex-col items-start py-5 px-6 leading-[normal] tracking-[normal] text-left text-[11px] text-[#94a3b8] font-[Rajdhani]">
      <div className="self-stretch flex items-center gap-2">
        <Image
          className="h-[18px] w-[18px] relative"
          width={18}
          height={18}
          sizes="100vw"
          alt=""
          src="/assets/Iconbadge.svg"
        />
        <div className="h-[17px] flex flex-col items-start">
          <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
            Badges du joueur
          </b>
        </div>
      </div>
      <section className="self-stretch flex flex-col items-start pt-4 px-0 pb-0">
        <div className="self-stretch flex items-start justify-center flex-wrap content-start py-0 pl-0 pr-0.5 gap-2.5">
          <button className="cursor-pointer border-[rgba(79,195,247,0.27)] border-solid border-[1px] py-3.5 px-2 bg-[#111114] h-[75px] flex-1 shadow-[0px_0px_12px_rgba(79,_195,_247,_0.35)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[64px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.7px] left-[1px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(79,_195,_247,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-[22px] h-[22px] flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-[22px] leading-[22px] font-[Inter] text-[#fff] text-left inline-block min-w-[22px] mq450:text-lg mq450:leading-[18px]">
                🎯
              </div>
            </div>
            <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#4fc3f7] text-left z-[2] shrink-0">
              Précision
            </div>
          </button>
          <button className="cursor-pointer border-[rgba(251,146,60,0.27)] border-solid border-[1px] py-3.5 px-2 bg-[#111114] h-[75px] flex-1 shadow-[0px_0px_12px_rgba(251,_146,_60,_0.35)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[54px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.73px] left-[0.97px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(251,_146,_60,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-[22px] h-[22px] flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-[22px] leading-[22px] font-[Inter] text-[#fff] text-left inline-block min-w-[22px] mq450:text-lg mq450:leading-[18px]">
                🔥
              </div>
            </div>
            <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#fb923c] text-left z-[2] shrink-0">
              Furieux
            </div>
          </button>
          <button className="cursor-pointer border-[rgba(192,132,252,0.27)] border-solid border-[1px] py-3.5 px-2 bg-[#111114] h-[75px] flex-1 shadow-[0px_0px_12px_rgba(192,_132,_252,_0.35)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[40px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.66px] left-[1.04px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(192,_132,_252,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-[22px] h-[22px] flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-[22px] leading-[22px] font-[Inter] text-[#fff] text-left inline-block min-w-[22px] mq450:text-lg mq450:leading-[18px]">
                ⚡
              </div>
            </div>
            <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#c084fc] text-left z-[2] shrink-0">
              Élite
            </div>
          </button>
          <button className="cursor-pointer border-[rgba(250,204,21,0.27)] border-solid border-[1px] py-3.5 px-2 bg-[#111114] h-[75px] flex-1 shadow-[0px_0px_12px_rgba(250,_204,_21,_0.35)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[38px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.69px] left-[1.01px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(250,_204,_21,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-[22px] h-[22px] flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-[22px] leading-[22px] font-[Inter] text-[#fff] text-left inline-block min-w-[22px] mq450:text-lg mq450:leading-[18px]">
                👑
              </div>
            </div>
            <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#facc15] text-left z-[2] shrink-0">
              Mvp
            </div>
          </button>
          <button className="cursor-pointer border-[rgba(74,222,128,0.27)] border-solid border-[1px] py-3.5 px-2 bg-[#111114] h-[75px] flex-1 shadow-[0px_0px_12px_rgba(74,_222,_128,_0.35)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[48px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.73px] left-[0.97px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(74,_222,_128,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-[22px] h-[22px] flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-[22px] leading-[22px] font-[Inter] text-[#fff] text-left inline-block min-w-[22px] mq450:text-lg mq450:leading-[18px]">
                🛡️
              </div>
            </div>
            <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#4ade80] text-left z-[2] shrink-0">
              Survie
            </div>
          </button>
          <button className="cursor-pointer border-[rgba(55,65,81,0.27)] border-solid border-[1px] py-3.5 px-2 bg-[#111114] h-[75px] flex-1 shadow-[0px_0px_12px_rgba(55,_65,_81,_0.2)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[38px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.66px] left-[1.04px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(55,_65,_81,_0.53)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-[22px] h-[22px] flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-[22px] leading-[22px] font-[Inter] text-[#fff] text-left inline-block min-w-[22px] mq450:text-lg mq450:leading-[18px]">
                🔒
              </div>
            </div>
            <div className="relative text-[10px] tracking-[0.6px] leading-[15px] uppercase font-semibold font-[Rajdhani] text-[#374151] text-left z-[2] shrink-0">
              ???
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile6;
