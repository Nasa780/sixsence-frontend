import type { NextPage } from "next";
import Image from "next/image";

export type App3Type = {
  className?: string;
};

const Appqueue: NextPage<App3Type> = ({ className = "" }) => {
  return (
    <div
      className={`w-full h-[52px] !!m-[0 important] absolute top-[0px] left-[0px] bg-[rgba(10,26,47,0.95)] border-[rgba(255,160,64,0.25)] border-solid border-b-[1px] box-border flex items-center justify-between py-0 px-6 gap-5 z-[2] text-left text-base text-[#f5f5f5] font-[Rajdhani] ${className}`}
    >
      <div className="flex items-center gap-[11px]">
        <button className="cursor-pointer [border:none] p-0 bg-[#ffa040] h-7 w-7 flex items-center justify-center">
          <Image
            className="h-[13px] w-full relative"
            loading="lazy"
            width={13}
            height={13}
            sizes="100vw"
            alt=""
            src="/assets/Iconepee.svg"
          />
        </button>
        <div className="flex flex-col items-start">
          <h3 className="m-0 relative text-[length:inherit] tracking-[2.24px] leading-6 uppercase font-bold font-[inherit]">
            SixSence
          </h3>
        </div>
        <Image
          className="h-3 w-3 relative"
          loading="lazy"
          width={12}
          height={12}
          sizes="100vw"
          alt=""
          src="/assets/Iconfleche7.svg"
        />
        <div className="flex flex-col items-start text-xs text-[#6b7f94] font-['Barlow_Condensed']">
          <div className="relative tracking-[1.2px] leading-[18px] uppercase">
            Match en cours
          </div>
        </div>
      </div>
      <button className="cursor-pointer border-[rgba(76,175,80,0.3)] border-solid border-[1px] py-1 px-3 bg-[rgba(76,175,80,0.1)] flex items-center gap-[5px]">
        <Image
          className="h-2.5 w-2.5 relative"
          width={10}
          height={10}
          sizes="100vw"
          alt=""
          src="/assets/Icondirect.svg"
        />
        <div className="flex flex-col items-start">
          <div className="relative text-[11px] tracking-[1.32px] leading-[16.5px] uppercase font-semibold font-['Barlow_Condensed'] text-[#4caf50] text-left">
            En direct
          </div>
        </div>
      </button>
    </div>
  );
};

export default Appqueue;
