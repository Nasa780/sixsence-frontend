import type { NextPage } from "next";

const Appqueue2: NextPage = () => {
  return (
    <div className="w-[2189px] h-[43px] bg-[rgba(10,26,47,0.7)] border-[rgba(255,160,64,0.12)] border-solid border-b-[1px] box-border max-w-full overflow-x-auto shrink-0 flex items-start py-0 pl-6 pr-0 leading-[normal] tracking-[normal]">
      <button className="cursor-pointer [border:none] py-[11px] px-[21px] bg-[transparent] self-stretch border-[#ffa040] border-solid border-b-[2px] flex flex-col items-center justify-center hover:bg-[rgba(204,110,13,0.09)]">
        <b className="relative text-xs tracking-[1.68px] leading-[18px] uppercase font-[Rajdhani] text-[#ffa040] text-center">
          Match
        </b>
      </button>
      <button className="cursor-pointer [border:none] py-[11px] px-[21px] bg-[transparent] self-stretch flex flex-col items-center justify-center hover:bg-[rgba(51,51,51,0.09)]">
        <b className="relative text-xs tracking-[1.68px] leading-[18px] uppercase font-[Rajdhani] text-[#6b7f94] text-center">
          Chat
        </b>
      </button>
      <button className="cursor-pointer [border:none] py-[11px] px-[21px] bg-[transparent] self-stretch flex flex-col items-center justify-center hover:bg-[rgba(51,51,51,0.09)]">
        <b className="relative text-xs tracking-[1.68px] leading-[18px] uppercase font-[Rajdhani] text-[#6b7f94] text-center">
          Vote
        </b>
      </button>
    </div>
  );
};

export default Appqueue2;
