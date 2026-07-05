import type { NextPage } from "next";
import Image from "next/image";

const Profile3: NextPage = () => {
  return (
    <div className="w-[1152px] rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border max-w-full flex flex-col items-center pt-10 px-6 pb-8 relative isolate gap-2.5 leading-[normal] tracking-[normal] text-left text-xs text-[#6b7280] font-[Inter]">
      <button className="cursor-pointer border-[#2a2a30] border-solid border-[1px] py-1.5 pl-3 pr-[11px] bg-[#1c1c22] h-8 !!m-[0 important] absolute top-[16px] right-[18.2px] rounded-[7px] box-border flex items-center gap-1.5 whitespace-nowrap z-[0] shrink-0 hover:bg-[#4f4f54] hover:border-[#5e5e63] hover:border-solid hover:hover:border-[1px] hover:box-border">
        <Image
          className="h-3 w-3 relative"
          width={12}
          height={12}
          sizes="100vw"
          alt=""
          src="/assets/Iconstylo.svg"
        />
        <div className="relative text-xs leading-[18px] font-medium font-[Inter] text-[#94a3b8] text-left inline-block min-w-[110px]">
          Modifier mon profil
        </div>
      </button>
      <Image
        className="w-[100px] h-[100px] relative rounded-[50px] object-cover z-[1] shrink-0"
        loading="lazy"
        width={100}
        height={100}
        sizes="100vw"
        alt=""
        src="/Container@2x.png"
      />
      <h3 className="m-0 relative text-[22px] leading-[33px] font-bold font-[inherit] text-[#fff] z-[2] shrink-0 mq450:text-lg mq450:leading-[26px]">
        NASA
      </h3>
      <div className="w-[81px] h-5 flex items-center gap-1.5 z-[3] shrink-0 text-[13px] text-[#4fc3f7]">
        <Image
          className="h-4 w-4 relative"
          loading="lazy"
          width={16}
          height={16}
          sizes="100vw"
          alt=""
          src="/assets/Iconshield2.svg"
        />
        <div className="h-5 flex flex-col items-start">
          <div className="relative tracking-[0.39px] leading-[19.5px] font-semibold">
            Diamond
          </div>
        </div>
      </div>
      <div className="w-[153px] h-6 flex items-center gap-2.5 z-[4] shrink-0">
        <div className="h-[18px] flex items-center gap-[5px]">
          <Image
            className="h-3.5 w-3.5 relative"
            loading="lazy"
            width={14}
            height={14}
            sizes="100vw"
            alt=""
            src="/DiamondIcon.svg"
          />
          <div className="h-[18px] flex flex-col items-start">
            <div className="relative leading-[18px]">435 pts</div>
          </div>
        </div>
        <div className="h-6 flex flex-col items-start text-base text-[#2a2a30]">
          <div className="relative leading-6">|</div>
        </div>
        <div className="h-5 flex flex-col items-start text-[13px] text-[#4fc3f7]">
          <div className="relative leading-[19.5px] font-semibold">
            Niveau 42
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center pt-1 px-0 pb-0 gap-2 z-[5] shrink-0 text-[#cbd5e1]">
        <button className="cursor-pointer border-[#166534] border-solid border-[1px] py-[5px] px-3 bg-[#14532d] self-stretch rounded-md flex items-center gap-[5px]">
          <Image
            className="h-3 w-3 relative"
            width={12}
            height={12}
            sizes="100vw"
            alt=""
            src="/assets/Iconstats2.svg"
          />
          <div className="h-[18px] flex flex-col items-start">
            <div className="relative text-xs leading-[18px] font-semibold font-[Inter] text-[#4ade80] text-left">
              15461 XP
            </div>
          </div>
        </button>
        <button className="cursor-pointer border-[#2a2a30] border-solid border-[1px] py-[5px] px-3 bg-[#1c1c22] self-stretch flex-1 rounded-md overflow-x-auto flex items-center gap-[5px]">
          <Image
            className="h-3 w-3 relative shrink-0"
            width={12}
            height={12}
            sizes="100vw"
            alt=""
            src="/assets/Icontrophy2.svg"
          />
          <div className="h-[18px] flex flex-col items-start">
            <div className="relative text-xs leading-[18px] font-[Inter] text-[#cbd5e1] text-left">
              Six Sence
            </div>
          </div>
          <div className="h-[15px] flex flex-col items-start">
            <div className="relative text-[10px] leading-[15px] font-[Inter] text-[#6b7280] text-left">
              [5K]
            </div>
          </div>
        </button>
        <div className="self-stretch rounded-md bg-[#1c1c22] border-[#2a2a30] border-solid border-[1px] flex items-center py-[5px] px-3 gap-[5px]">
          <Image
            className="h-3 w-3 relative"
            loading="lazy"
            width={12}
            height={12}
            sizes="100vw"
            alt=""
            src="/assets/Iconpc2.svg"
          />
          <div className="h-[18px] flex flex-col items-start">
            <div className="relative leading-[18px]">PC</div>
          </div>
        </div>
      </div>
      <div className="w-[177px] h-10 flex flex-col items-start pt-1 px-0 pb-0 box-border z-[6] shrink-0">
        <button className="cursor-pointer border-[#2a2a30] border-solid border-[1px] py-[7px] px-3.5 bg-[#1c1c22] w-[177px] h-9 rounded-lg box-border overflow-x-auto shrink-0 flex items-center gap-2">
          <div className="h-5 flex flex-col items-start">
            <div className="relative text-[13px] leading-[19.5px] font-[Inter] text-[#6b7280] text-left">
              —
            </div>
          </div>
          <div className="h-5 flex flex-col items-start">
            <div className="relative text-[13px] leading-[19.5px] font-medium font-[Inter] text-[#cbd5e1] text-left">
              zNaSa#9589474
            </div>
          </div>
          <Image
            className="h-[13px] w-[13px] relative shrink-0"
            width={13}
            height={13}
            sizes="100vw"
            alt=""
            src="/assets/Iconactivision.svg"
          />
        </button>
      </div>
      <div className="w-[214px] h-5 flex flex-col items-start pt-0.5 px-0 pb-0 box-border z-[7] shrink-0">
        <div className="relative leading-[18px]">
          Membre depuis le 30 décembre 2025
        </div>
      </div>
    </div>
  );
};

export default Profile3;
