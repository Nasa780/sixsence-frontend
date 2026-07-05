import type { NextPage } from "next";
import Image from "next/image";

const Profile2: NextPage = () => {
  return (
    <div className="flex items-center gap-1.5 leading-[normal] tracking-[normal] text-center text-[13px] text-[#94a3b8] font-[Inter]">
      <Image
        className="h-[15px] w-[15px] relative shrink-0"
        loading="lazy"
        width={15}
        height={15}
        sizes="100vw"
        alt=""
        src="/assets/Iconfleche6.svg"
      />
      <div className="flex-1 relative leading-[19.5px] font-medium shrink-0">
        Retour
      </div>
    </div>
  );
};

export default Profile2;
