import type { NextPage } from "next";
import Image from "next/image";

const Profile5: NextPage = () => {
  return (
    <div className="w-[1152px] rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border max-w-full flex flex-col items-start py-5 px-6 leading-[normal] tracking-[normal] text-left text-[11px] text-[#94a3b8] font-[Rajdhani]">
      <div className="self-stretch flex items-center gap-2">
        <Image
          className="cursor-pointer [border:none] p-0 bg-[transparent] h-[18px] w-[18px] relative"
          width={18}
          height={18}
          sizes="100vw"
          alt=""
          src="/assets/Icontrophy3.svg"
        />
        <div className="h-[17px] flex flex-col items-start">
          <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
            Trophées du joueur
          </b>
        </div>
      </div>
      <section className="self-stretch flex flex-col items-start pt-4 px-0 pb-0">
        <div className="self-stretch flex items-start justify-center flex-wrap content-start py-0 pl-0 pr-0.5 gap-2.5">
          <button className="cursor-pointer border-[rgba(248,113,113,0.27)] border-solid border-[1px] pt-4 px-2 pb-3 bg-[#111114] h-[74px] flex-1 shadow-[0px_0px_14px_rgba(248,_113,_113,_0.3)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[83px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.7px] left-[1px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(248,_113,_113,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-6 h-6 flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-2xl leading-6 font-[Inter] text-[#fff] text-left inline-block min-w-[24px] mq450:text-[19px] mq450:leading-[19px]">
                🗡️
              </div>
            </div>
            <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#f87171] text-left z-[2] shrink-0">
              Premier Sang
            </b>
            <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(248,_113,_113,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
          </button>
          <button className="cursor-pointer border-[rgba(250,204,21,0.27)] border-solid border-[1px] pt-4 px-2 pb-3 bg-[#111114] h-[74px] flex-1 shadow-[0px_0px_14px_rgba(250,_204,_21,_0.3)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[72px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.73px] left-[0.97px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(250,_204,_21,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-6 h-6 flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-2xl leading-6 font-[Inter] text-[#fff] text-left inline-block min-w-[24px] mq450:text-[19px] mq450:leading-[19px]">
                🏆
              </div>
            </div>
            <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#facc15] text-left z-[2] shrink-0">
              Domination
            </b>
            <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2px] left-[calc(50%_-_70.1px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(250,_204,_21,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
          </button>
          <button className="cursor-pointer border-[rgba(74,222,128,0.27)] border-solid border-[1px] pt-4 px-2 pb-3 bg-[#111114] h-[74px] flex-1 shadow-[0px_0px_14px_rgba(74,_222,_128,_0.3)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[91px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.66px] left-[1.04px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(74,_222,_128,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-6 h-6 flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-2xl leading-6 font-[Inter] text-[#fff] text-left inline-block min-w-[24px] mq450:text-[19px] mq450:leading-[19px]">
                🛡️
              </div>
            </div>
            <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#4ade80] text-left z-[2] shrink-0">
              Indestructible
            </b>
            <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(74,_222,_128,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
          </button>
          <button className="cursor-pointer border-[rgba(79,195,247,0.27)] border-solid border-[1px] pt-4 px-2 pb-3 bg-[#111114] h-[74px] flex-1 shadow-[0px_0px_14px_rgba(79,_195,_247,_0.3)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[74px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.69px] left-[1.01px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(79,_195,_247,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-6 h-6 flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-2xl leading-6 font-[Inter] text-[#fff] text-left inline-block min-w-[24px] mq450:text-[19px] mq450:leading-[19px]">
                🎯
              </div>
            </div>
            <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#4fc3f7] text-left z-[2] shrink-0">
              Sniper Elite
            </b>
            <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(79,_195,_247,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
          </button>
          <button className="cursor-pointer border-[rgba(192,132,252,0.27)] border-solid border-[1px] pt-4 px-2 pb-3 bg-[#111114] h-[74px] flex-1 shadow-[0px_0px_14px_rgba(192,_132,_252,_0.3)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[60px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.73px] left-[0.97px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(192,_132,_252,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-6 h-6 flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-2xl leading-6 font-[Inter] text-[#fff] text-left inline-block min-w-[24px] mq450:text-[19px] mq450:leading-[19px]">
                🧠
              </div>
            </div>
            <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#c084fc] text-left z-[2] shrink-0">
              Stratège
            </b>
            <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2px] left-[calc(50%_-_70.1px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(192,_132,_252,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
          </button>
          <button className="cursor-pointer border-[rgba(251,146,60,0.27)] border-solid border-[1px] pt-4 px-2 pb-3 bg-[#111114] h-[74px] flex-1 shadow-[0px_0px_14px_rgba(251,_146,_60,_0.3)] rounded-[10px] box-border overflow-hidden flex flex-col items-center relative isolate gap-2 min-w-[71px] shrink-0">
            <div className="w-[calc(100%_-_1.7px)] h-0.5 absolute !!m-[0 important] top-[1px] right-[0.66px] left-[1.04px] [background:linear-gradient(90deg,_rgba(0,_0,_0,_0),_rgba(251,_146,_60,_0.6)_50%,_rgba(0,_0,_0,_0))] z-[0] shrink-0" />
            <div className="w-6 h-6 flex flex-col items-start z-[1] shrink-0">
              <div className="relative text-2xl leading-6 font-[Inter] text-[#fff] text-left inline-block min-w-[24px] mq450:text-[19px] mq450:leading-[19px]">
                ⚜️
              </div>
            </div>
            <b className="relative text-[10px] tracking-[0.5px] leading-3 uppercase font-[Rajdhani] text-[#fb923c] text-left z-[2] shrink-0">
              Légendaire
            </b>
            <div className="w-[138.7px] h-[18px] absolute !!m-[0 important] bottom-[2px] left-[calc(50%_-_70.2px)] [filter:blur(8px)] [background:radial-gradient(70.71%_70.71%_at_50%_50%,_rgba(251,_146,_60,_0.3),_rgba(0,_0,_0,_0)_80%)] z-[3] shrink-0" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile5;   
