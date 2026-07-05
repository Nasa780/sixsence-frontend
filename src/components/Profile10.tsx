import type { NextPage } from "next";
import Image from "next/image";

const Profile10: NextPage = () => {
  return (
    <div className="w-[1152px] rounded-xl bg-[#18181c] border-[#2a2a30] border-solid border-[1px] box-border max-w-full flex flex-col items-start py-5 px-6 leading-[normal] tracking-[normal] text-left text-[11px] text-[#94a3b8] font-[Inter]">
      <div className="self-stretch flex items-center gap-2 mq251:flex-wrap">
        <Image
          className="cursor-pointer [border:none] p-0 bg-[transparent] h-[18px] w-[18px] relative"
          width={18}
          height={18}
          sizes="100vw"
          alt=""
          src="/assets/Iconcasque.svg"
        />
        <div className="flex flex-col items-start">
          <b className="relative tracking-[1.1px] leading-[16.5px] uppercase">
            Historique Mode Classé
          </b>
        </div>
        <div className="flex flex-col items-start text-[#4b5563]">
          <div className="relative leading-[16.5px] font-medium">[20]</div>
        </div>
      </div>
    </div>
  );
};

export default Profile10;
