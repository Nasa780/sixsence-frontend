import type { NextPage } from "next";
import Image from "next/image";

const Sectionmarginranked3: NextPage = () => {
  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-xl text-[#e8eaf0] font-[Rajdhani]">
      <div className="w-[1200px] flex flex-col items-start pt-0 px-6 pb-16 box-border max-w-[1200px] lg:max-w-full">
        <div className="self-stretch bg-[rgba(201,162,39,0.22)] flex flex-col items-start p-px box-border max-w-full">
          <div className="self-stretch h-[119px] bg-[rgba(201,162,39,0.06)] flex items-start py-8 pl-10 pr-[39px] box-border gap-6 max-w-full lg:h-auto lg:flex-wrap">
            <div className="flex flex-col items-start pt-[4.5px] px-0 pb-0">
              <div className="w-[46px] h-[46px] bg-[rgba(201,162,39,0.18)] flex items-center justify-center">
                <Image
                  className="h-5 w-full relative"
                  width={20}
                  height={20}
                  sizes="100vw"
                  alt=""
                  src="/assets/Iconbouclier.svg"
                />
              </div>
            </div>
            <div className="w-[830.6px] flex flex-col items-start max-w-full">
              <div className="self-stretch flex flex-col items-start">
                <h3 className="m-0 relative text-[length:inherit] tracking-[0.4px] leading-[30px] font-bold font-[inherit] mq450:text-base mq450:leading-6">
                  Connecte-toi pour jouer
                </h3>
              </div>
              <div className="w-[830.6px] h-[25px] flex flex-col items-start pt-1 px-0 pb-0 box-border text-sm text-[#6b7d94] font-[Inter]">
                <div className="relative leading-[21px]">
                  Tu dois être connecté pour accéder au mode classé.
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start pt-[7px] px-0 pb-0">
              <button className="cursor-pointer [border:none] py-2.5 px-6 bg-[transparent] [background:linear-gradient(90deg,_#c9a227,_#a07a10)] flex flex-col items-center justify-center">
                <b className="relative text-sm tracking-[0.56px] leading-[21px] font-[Inter] text-[#080c14] text-center">
                  Se connecter
                </b>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sectionmarginranked3;
