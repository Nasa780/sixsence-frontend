import type { NextPage } from "next";
import Image from "next/image";

const AppqueueMobile: NextPage = () => {
  return (
    <div className="w-full h-[48px] bg-[rgba(10,26,47,0.95)] border-b border-[rgba(255,160,64,0.25)] flex items-center justify-between px-4 text-[#f5f5f5] font-[Rajdhani]">

      {/* Left */}
      <div className="flex items-center gap-3">
        <button className="h-6 w-6 bg-[#ffa040] flex items-center justify-center">
          <Image src="/assets/Iconepee.svg" width={12} height={12} alt="" />
        </button>

        <h3 className="text-sm tracking-[2px] uppercase font-bold">
          SixSence
        </h3>

        <Image src="/assets/Iconfleche7.svg" width={10} height={10} alt="" />

        <span className="text-[10px] text-[#6b7f94] tracking-[1px] uppercase font-['Barlow_Condensed']">
          Match en cours
        </span>
      </div>

      {/* Right */}
      <button className="border border-[rgba(76,175,80,0.3)] bg-[rgba(76,175,80,0.1)] px-2 py-1 flex items-center gap-1">
        <Image src="/assets/Icondirect.svg" width={10} height={10} alt="" />
        <span className="text-[10px] tracking-[1px] uppercase text-[#4caf50] font-['Barlow_Condensed']">
          En direct
        </span>
      </button>

    </div>
  );
};

export default AppqueueMobile;
