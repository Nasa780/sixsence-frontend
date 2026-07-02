import type { NextPage } from "next";
import Image from "next/image";

const Sectionmarginranked6: NextPage = () => {
  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-[13px] text-[#6b7d94] font-[Rajdhani]">
      <div className="w-[1200px] flex flex-col items-start pt-0 px-6 pb-24 box-border max-w-[1200px] lg:max-w-full mq450:pb-[62px] mq450:box-border">
        <div className="self-stretch h-[19.5px] flex items-start pt-0 px-0 pb-0 box-border">
          <b className="h-5 w-[161px] relative tracking-[1.82px] leading-[19.5px] uppercase inline-block">
            Classement — Top 100
          </b>
        </div>
        <div className="self-stretch flex flex-col items-start pt-6 px-0 pb-0 box-border max-w-full text-xs text-[#3a4d65] font-[Inter]">
          <div className="self-stretch bg-[rgba(26,107,220,0.15)] flex flex-col items-start p-px box-border max-w-full">
            <div className="self-stretch bg-[rgba(13,21,32,0.6)] flex flex-col items-start max-w-full">
              <div className="self-stretch h-[43px] bg-[rgba(26,107,220,0.06)] border-[rgba(26,107,220,0.12)] border-solid border-b-[1px] box-border overflow-x-auto shrink-0 flex items-start pt-3 pb-[11px] pl-6 pr-[22px] gap-[189px] max-w-full lg:gap-[94px] mq750:gap-[47px] mq450:gap-6">
                <div className="w-[633px] shrink-0 flex items-start py-0 pl-0 pr-[516px] box-border gap-[51px] max-w-[calc(100%_-_471px)] mq750:gap-[25px] mq750:pr-[258px] mq750:box-border mq450:pr-5 mq450:box-border">
                  <div className="h-[18px] w-[9px] relative tracking-[1.2px] leading-[18px] uppercase font-semibold inline-block">
                    #
                  </div>
                  <div className="h-[18px] w-[57px] relative tracking-[1.2px] leading-[18px] uppercase font-semibold inline-block">
                    Joueur
                  </div>
                </div>
                <div className="h-[18px] w-10 relative tracking-[1.2px] leading-[18px] uppercase font-semibold inline-block">
                  Rang
                </div>
                <div className="h-[18px] w-[53px] relative tracking-[1.2px] leading-[18px] uppercase font-semibold text-right inline-block">
                  Points
                </div>
              </div>
              <div className="self-stretch flex flex-col items-center py-[72px] px-6 gap-3 text-[15px] text-[#4a6080]">
                <div className="flex flex-col items-start pt-0 px-0 pb-1">
                  <div className="w-[60px] h-[60px] bg-[rgba(26,107,220,0.07)] border-[rgba(26,107,220,0.15)] border-solid border-[1px] box-border flex items-center justify-center">
                    <Image
                      className="h-[26px] w-full relative"
                      width={26}
                      height={26}
                      sizes="100vw"
                      alt=""
                      src="/assets/Icontop.svg"
                    />
                  </div>
                </div>
                <div className="relative tracking-[0.3px] leading-[22.5px] font-medium">
                  Aucun joueur classé.
                </div>
                <div className="relative text-[13px] leading-[19.5px] text-[#2e3d52]">
                  Sois le premier à rejoindre le classement.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sectionmarginranked6;
