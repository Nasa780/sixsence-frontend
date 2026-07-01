import type { NextPage } from "next";
import Image from "next/image";

export type HeaderType = {
  className?: string;
};

const Header: NextPage<HeaderType> = ({ className = "" }) => {
  return (
    <div
      className={`w-full relative flex items-center justify-between py-5 px-9 box-border gap-5 leading-[normal] tracking-[normal] text-left text-[14.1px] text-[#fff] font-[Rajdhani] mq414:flex-wrap mq414:gap-5 ${className}`}
    >
      {/* Bloc gauche : Logo + Texte */}
      <div className="flex items-center gap-1.5">
        <Image
          className="cursor-pointer h-[34px] w-[34px]"
          width={34}
          height={34}
          alt="Six Sence Logo"
          src="/assets/logosix.svg"
        />

        <div className="flex flex-col items-start">
          <b className="relative tracking-[3.94px] leading-[14.1px] uppercase">
            Six Sence
          </b>
        </div>
      </div>

      {/* Bloc droit : FR + Discord */}
      <div className="flex items-center gap-3">
        <button className="cursor-pointer border-[rgba(255,255,255,0.08)] border-solid border-[1px] py-1.5 px-[11px] bg-[rgba(255,255,255,0.04)] rounded flex items-center gap-[5px] opacity-[0.7]">
          <Image
            className="h-[13px] w-5"
            loading="lazy"
            width={20}
            height={13}
            alt="FR Icon"
            src="/assets/Iconfr.svg" // tu changeras quand tu auras l’icône FR
          />
          <div className="flex flex-col items-center">
            <div className="text-[10.9px] tracking-[1.09px] leading-[16.3px] font-semibold font-[Inter] text-[rgba(255,255,255,0.7)] text-center">
              FR
            </div>
          </div>
        </button>

<button
  onClick={() => window.location.href = "https://sixsence-backend.onrender.com/auth/discord"}
  className="cursor-pointer py-[9px] px-[18px] bg-[#5865f2] shadow-[0px_0px_16px_rgba(88,_101,_242,_0.32)] rounded flex items-center gap-[7px] hover:bg-[#7080ff]"
>
  <Image
    className="h-4 w-4"
    loading="lazy"
    width={16}
    height={16}
    alt="Discord Icon"
    src="/assets/Icondiscord.svg"
  />
  <div className="text-[12.5px] tracking-[0.5px] leading-[18.7px] font-semibold font-[Inter] text-[#fff] text-center">
    Discord
  </div>
</button>

      </div>
    </div>
  );
};

export default Header;
