import type { NextPage } from "next";
import Image from "next/image";

const Containeraccueil2: NextPage = () => {
  return (
    <div className="w-full max-w-[2174px] mx-auto flex flex-col items-center pt-0 px-0 pb-6 box-border opacity-100 leading-[normal] tracking-[normal]">

      {/* Flèche */}
      <Image
        className="w-full h-[18px] relative"
        width={18}
        height={18}
        sizes="100vw"
        alt=""
        src="/assets/Iconfleche2.svg"
      />

      {/* Trait jaune */}
      <div className="w-full h-[2px] bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(232,160,32,0.27)_50%,rgba(0,0,0,0)_100%)]"></div>

    </div>
  );
};

export default Containeraccueil2;
