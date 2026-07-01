import type { NextPage } from "next";
import Image from "next/image";

const Containeraccueil2: NextPage = () => {
  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center pt-0 px-0 pb-6 box-border opacity-[0.3] leading-[normal] tracking-[normal]">
      <Image
        className="w-full h-[18px] relative"
        width={18}
        height={18}
        sizes="100vw"
        alt=""
        src="/assets/Iconfleche2.svg"
      />
    </div>
  );
};

export default Containeraccueil2;
