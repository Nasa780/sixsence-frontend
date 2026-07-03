import type { NextPage } from "next";

const Appqueue2Mobile: NextPage = () => {
  return (
    <div className="w-full h-[40px] bg-[rgba(10,26,47,0.7)] border-b border-[rgba(255,160,64,0.12)] flex items-center justify-around">

      <button className="px-4 py-2 border-b-2 border-[#ffa040]">
        <span className="text-[11px] tracking-[1.5px] uppercase text-[#ffa040] font-[Rajdhani]">
          Match
        </span>
      </button>

      <button className="px-4 py-2">
        <span className="text-[11px] tracking-[1.5px] uppercase text-[#6b7f94] font-[Rajdhani]">
          Chat
        </span>
      </button>

      <button className="px-4 py-2">
        <span className="text-[11px] tracking-[1.5px] uppercase text-[#6b7f94] font-[Rajdhani]">
          Vote
        </span>
      </button>

    </div>
  );
};

export default Appqueue2Mobile;
