import type { NextPage } from "next";
import Image from "next/image";

const Profile9: NextPage = () => {
  return (
    <div className="w-[1152px] rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border max-w-full flex flex-col items-start py-5 px-6 leading-[normal] tracking-[normal] text-left text-[11px] text-[#94a3b8] font-[Inter]">
      <div className="self-stretch flex items-center gap-2 mq251:flex-wrap">
        <Image
          className="cursor-pointer [border:none] p-0 bg-[transparent] h-[18px] w-[18px] relative"
          width={18}
          height={18}
          sizes="100vw"
          alt=""
          src="/assets/Iconhistory.svg"
        />
        <div className="h-[17px] flex flex-col items-start">
          <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
            Historique des Matchs
          </b>
        </div>
        <div className="h-[17px] flex flex-col items-start text-[#4b5563]">
          <div className="relative leading-[16.5px] font-medium">[1]</div>
        </div>
      </div>
      <div className="self-stretch flex flex-col items-center pt-4 px-0 pb-0 box-border max-w-full text-xs text-[#6b7280]">
        <div className="w-full h-14 rounded-lg bg-[#111114] border-[#2a2a30] border-solid border-[1px] box-border flex items-center flex-wrap content-center py-3 px-4 gap-2.5 max-w-full">
          <button className="cursor-pointer [border:none] py-[3px] px-2.5 bg-[#14532d] h-[23px] rounded flex flex-col items-start box-border hover:bg-[#3b7a54]">
            <b className="relative text-[11px] tracking-[0.33px] leading-[16.5px] font-[Inter] text-[#4ade80] text-left">
              Victoire
            </b>
          </button>
          <button className="cursor-pointer [border:none] py-[3px] px-2.5 bg-[#431407] h-[23px] rounded flex flex-col items-start box-border hover:bg-[#75473b]">
            <div className="relative text-[11px] leading-[16.5px] font-semibold font-[Inter] text-[#fb923c] text-left">{`Recherche & Destruction`}</div>
          </button>
          <div className="h-[18px] flex items-center gap-1">
            <Image
              className="h-3.5 w-3.5 relative"
              loading="lazy"
              width={14}
              height={14}
              sizes="100vw"
              alt=""
              src="/ControllerIcon.svg"
            />
            <div className="h-[18px] flex flex-col items-start">
              <div className="relative leading-[18px]">5v5</div>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-1 min-w-[86px] max-w-full">
            <div className="h-[18px] flex flex-col items-start">
              <div className="relative leading-[18px]">vs</div>
            </div>
            <div className="h-5 flex flex-col items-start text-[13px] text-[#e2e8f0]">
              <div className="relative leading-[19.5px] font-semibold">
                SameBlood
              </div>
            </div>
          </div>
          <div className="h-[18px] flex items-center gap-[5px]">
            <Image
              className="h-[13px] w-[13px] relative"
              loading="lazy"
              width={13}
              height={13}
              sizes="100vw"
              alt=""
              src="/assets/Iconhorloge.svg"
            />
            <div className="h-[18px] flex flex-col items-start">
              <div className="relative leading-[18px]">12 janv., 22:08</div>
            </div>
          </div>
          <button className="cursor-pointer border-[#7e22ce] border-solid border-[1px] py-[5px] px-3 bg-[#581c87] h-[30px] rounded-md box-border flex items-center gap-[5px] hover:bg-[#8042ad] hover:border-[#a347f5] hover:border-solid hover:hover:border-[1px] hover:box-border">
            <Image
              className="h-[11px] w-[11px] relative"
              width={11}
              height={11}
              sizes="100vw"
              alt=""
              src="/assets/Iconplay.svg"
            />
            <div className="relative text-xs leading-[18px] font-semibold font-[Inter] text-[#c084fc] text-left">
              Voir détails
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile9;
