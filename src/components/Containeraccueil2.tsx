import Image from "next/image";

const Containeraccueil2 = () => {
  return (
    <div className="w-full max-w-[2174px] mx-auto flex flex-col items-center pt-0 px-0 pb-6 box-border opacity-100 leading-[normal] tracking-[normal]">
      <Image
        className="w-full h-[40px] relative"
        width={40}
        height={40}
        alt=""
        src="/assets/Iconfleche2.svg"
      />
    </div>
  );
};

export default Containeraccueil2;
