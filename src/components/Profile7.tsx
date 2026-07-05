import type { NextPage } from "next";
import Image from "next/image";

const Profile7: NextPage = () => {
  return (
    <div className="rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border max-w-full flex flex-col items-start justify-center py-5 px-6 gap-[6.2px] leading-[normal] tracking-[normal] text-left text-[11px] text-[#94a3b8] font-[Inter]">
      <div className="self-stretch flex items-center gap-2">
        <Image
          className="cursor-pointer [border:none] p-0 bg-[transparent] h-[18px] w-[18px] relative"
          width={18}
          height={18}
          sizes="100vw"
          alt=""
          src="/Icon.svg"
        />
        <div className="h-[17px] flex flex-col items-start">
          <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
            Progression classée
          </b>
        </div>
      </div>
      <section className="self-stretch flex flex-col items-start py-[9.8px] px-0 box-border max-w-full text-left text-[10px] text-[#4b5563] font-[Inter]">
        <div className="self-stretch overflow-hidden flex items-start flex-wrap content-start py-[1.1px] pl-3 pr-0 box-border gap-0 max-w-full [row-gap:20px]">
          <div className="h-[134.4px] flex flex-col items-start gap-[20.2px]">
            <div className="w-[19px] h-[37.8px] flex items-start pt-0 px-0 pb-[25.8px] box-border">
              <div className="relative">465</div>
            </div>
            <div className="self-stretch relative">360</div>
            <div className="self-stretch relative">305</div>
            <div className="self-stretch relative">250</div>
          </div>
          <div className="flex-1 flex flex-col items-center py-[2.4px] px-0 box-border gap-[4.2px] min-w-[695px] max-w-full text-center mq1000:min-w-full">
            <div className="w-full flex items-start py-0 pl-[5px] pr-1 box-border max-w-[1070px] mq1050:max-w-full">
              <Image
                className="h-[127px] flex-1 relative max-w-full overflow-hidden w-full object-cover"
                loading="lazy"
                width={1060}
                height={127}
                sizes="100vw"
                alt=""
                src="/merged-asset-1@2x.png"
              />
            </div>
            <div className="self-stretch flex items-center gap-[1.1px] mq1000:flex-wrap">
              <div className="flex-1 relative inline-block max-w-[25px]">
                1 jan
              </div>
              <div className="flex-1 relative inline-block min-w-[261px] max-w-[266px]">
                5 jan
              </div>
              <div className="flex-1 relative inline-block max-w-[32px]">
                8 jan
              </div>
              <div className="flex-1 relative text-right inline-block max-w-[148px]">
                10 jan
              </div>
              <div className="flex-1 relative inline-block min-w-[261px] max-w-[266px]">
                12 jan
              </div>
              <div className="flex-1 relative inline-block max-w-[36px]">
                14 jan
              </div>
              <div className="flex-1 relative inline-block min-w-[254px] max-w-[259px]">
                16 jan
              </div>
              <div className="flex-1 relative inline-block max-w-[29px]">
                18 jan
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile7;
