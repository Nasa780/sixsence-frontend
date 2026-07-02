import Image from "next/image";

type NavigationProps = {
  className?: string;
};

const NavigationaccueilMobile = ({ className = "" }: NavigationProps) => {
  return (
    <div
      className={`w-full max-w-[360px] flex items-center justify-between py-5 px-4 
                  text-left text-lg text-white font-[Barlow] ${className}`}
    >
      {/* LOGO + TEXT */}
      <div className="flex flex-col items-start">
        <h3 className="tracking-[3px] leading-6 uppercase font-black">
          SIXSENCE
        </h3>

        <div className="text-[9px] tracking-[3px] leading-[12px] uppercase text-[#ffb347] font-['JetBrains_Mono']">
          Competitive Platform
        </div>
      </div>

      {/* DISCORD BUTTON */}
      <button
        className="cursor-pointer border border-[rgba(88,101,242,0.33)] 
                   bg-[rgba(88,101,242,0.15)] py-2 px-3 rounded-md 
                   flex items-center gap-2"
      >
        <Image
          src="/assets/Icondiscord2.svg"
          alt="discord"
          width={12}
          height={12}
          className="h-3 w-3"
        />

        <span className="text-[10px] tracking-[1px] leading-4 uppercase font-semibold text-[#8b9cf4]">
          Discord
        </span>
      </button>
    </div>
  );
};

export default NavigationaccueilMobile;
