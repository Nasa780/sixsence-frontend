import Image from "next/image";

type NavigationProps = {
  className?: string;
};

const Navigationaccueil = ({ className = "" }: NavigationProps) => {
  return (
    <div
      className={`w-[2174px] max-w-full flex items-center justify-between pt-5 px-8 pb-4 box-border gap-5 leading-[normal] tracking-[normal] text-left text-lg text-[#fff] font-[Barlow] mq359:flex-wrap mq359:gap-5 ${className}`}
    >
      <div className="flex flex-col items-start">
        <div className="self-stretch flex flex-col items-start">
          <h3 className="m-0 relative tracking-[4.5px] leading-7 uppercase font-black">
            SIXSENCE
          </h3>
        </div>
        <div className="self-stretch flex flex-col items-start text-[9px] text-[#ffb347] font-['JetBrains_Mono']">
          <div className="tracking-[3.15px] leading-[11.3px] uppercase">
            Competitive Platform
          </div>
        </div>
      </div>

      <button className="cursor-pointer border-[rgba(88,101,242,0.33)] border-solid border-[1px] py-2 px-4 bg-[rgba(88,101,242,0.15)] rounded-md flex items-center gap-[7px] hover:bg-[rgba(112,128,255,0.15)] hover:border-[rgba(112,128,255,0.33)]">
        <Image
          className="h-3 w-3"
          width={12}
          height={12}
          alt=""
          src="/assets/Icondiscord2.svg"
        />
        <div className="text-xs tracking-[0.96px] leading-4 uppercase font-semibold text-[#8b9cf4] text-center">
          Discord
        </div>
      </button>
    </div>
  );
};

export default Navigationaccueil;
