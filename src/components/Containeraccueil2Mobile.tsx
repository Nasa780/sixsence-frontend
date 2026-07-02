import type { NextPage } from "next";
import Image from "next/image";

const Containeraccueil2Mobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-6 px-4">

      {/* Flèche */}
      <Image
        className="w-full h-[14px]"
        width={14}
        height={14}
        alt=""
        src="/assets/Iconfleche2.svg"
      />

      {/* Trait jaune */}
      <div className="w-full h-[2px] mt-2 bg-[linear-gradient(90deg,rgba(0,0,0,0)_0%,rgba(232,160,32,0.27)_50%,rgba(0,0,0,0)_100%)]"></div>

    </div>
  );
};

export default Containeraccueil2Mobile;
