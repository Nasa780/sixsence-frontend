import type { NextPage } from "next";
import Image from "next/image";

const Profile1: NextPage = () => {
  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-xs text-[#fff] font-[Inter]">
      <div className="h-[52px] flex items-center flex-wrap content-center py-0 px-6 box-border gap-8 max-w-[1200px] lg:max-w-full mq750:gap-4 mq1050:h-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg [background:linear-gradient(135deg,_#ff4500,_#ff6b35)] flex items-center justify-center">
            <Image
              className="h-6 w-full relative"
              width={22}
              height={24}
              sizes="100vw"
              alt=""
              src="/assets/IconS.svg"
            />
          </div>
          <div className="w-[68.1px] flex flex-col items-start">
            <div className="self-stretch flex flex-col items-start">
              <b className="relative tracking-[0.96px] leading-3">SIXSENCE</b>
            </div>
            <div className="self-stretch flex flex-col items-start text-[8px] text-[#6b7280]">
              <div className="relative tracking-[1.2px] leading-[8px] font-medium">
                HARDCORE
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-1 min-w-[335px] text-center text-[13px] text-[#94a3b8] mq450:flex-wrap">
          <div className="rounded-md flex items-center py-1.5 px-3 gap-1">
            <Image
              className="h-3.5 w-3.5 relative"
              loading="lazy"
              width={14}
              height={14}
              sizes="100vw"
              alt=""
              src="/assets/Iconhome.svg"
            />
            <div className="relative leading-[19.5px] font-medium">Accueil</div>
          </div>
          <div className="rounded-md flex items-center py-1.5 px-3 gap-[5px]">
            <Image
              className="h-3.5 w-3.5 relative"
              loading="lazy"
              width={14}
              height={14}
              sizes="100vw"
              alt=""
              src="/assets/Iconstats.svg"
            />
            <div className="relative leading-[19.5px] font-medium">
              Classements
            </div>
          </div>
          <div className="rounded-md flex items-center py-1.5 px-3 gap-[5px]">
            <Image
              className="h-3.5 w-3.5 relative"
              loading="lazy"
              width={14}
              height={14}
              sizes="100vw"
              alt=""
              src="/assets/Icontrophy.svg"
            />
            <div className="relative leading-[19.5px] font-medium">
              Mode classé
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <button className="cursor-pointer [border:none] py-1.5 px-3.5 bg-[transparent] rounded-md [background:linear-gradient(135deg,_#8b5cf6,_#7c3aed)] flex flex-col items-center justify-center">
            <div className="relative text-xs leading-[18px] font-semibold font-[Inter] text-[#fff] text-center">
              Roue
            </div>
          </button>
          <div className="rounded flex items-center p-1">
            <Image
              className="h-4 w-full relative"
              loading="lazy"
              width={16}
              height={16}
              sizes="100vw"
              alt=""
              src="/assets/Iconmessage.svg"
            />
          </div>
          <div className="rounded flex items-center p-1">
            <Image
              className="h-4 w-full relative"
              loading="lazy"
              width={16}
              height={16}
              sizes="100vw"
              alt=""
              src="/assets/Iconflechebas.svg"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-7 w-7 rounded-[14px] [background:linear-gradient(135deg,_#c084fc,_#818cf8)] flex items-center justify-center">
              <b className="relative leading-[16.5px]">N</b>
            </div>
            <div className="flex flex-col items-start text-xs text-[#e2e8f0]">
              <div className="relative leading-[18px] font-medium">NaSa</div>
            </div>
            <Image
              className="h-3 w-3 relative"
              loading="lazy"
              width={12}
              height={12}
              sizes="100vw"
              alt=""
              src="/assets/Iconloupe.svg"
            />
          </div>
          <div className="h-3.5 w-5 relative rounded-sm [background:linear-gradient(180deg,_#003189_33%,_#fff_33%,_#fff_66%,_#ed2939_66%)]" />
        </div>
      </div>
    </div>
  );
};

export default Profile1;
