import type { NextPage } from "next";
import Image from "next/image";

const Profile8: NextPage = () => {
  return (
    <div className="w-[1152px] rounded-xl [background:linear-gradient(135deg,_#1c0f00,_#2d1700_50%,_#1a0e00)] border-[#78350f] border-solid border-[1px] box-border max-w-full flex items-center py-5 px-7 gap-3.5 leading-[normal] tracking-[normal] text-left text-lg text-[#fff] font-[Inter]">
      <Image
        className="h-7 w-7 relative"
        width={28}
        height={28}
        sizes="100vw"
        alt=""
        src="/assets/Iconfire.svg"
      />
      <div className="w-[220.3px] flex flex-col items-start">
        <div className="self-stretch flex flex-col items-start">
          <h3 className="m-0 relative text-[length:inherit] leading-[27px] font-bold font-[inherit]">
            5 victoires consécutives!
          </h3>
        </div>
        <div className="w-[220.3px] h-5 flex flex-col items-start pt-0.5 px-0 pb-0 box-border text-xs text-[#92400e]">
          <div className="relative leading-[18px]">Record: 5</div>
        </div>
      </div>
    </div>
  );
};

export default Profile8;
