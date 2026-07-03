import type { NextPage } from "next";

const Sectionmarginranked: NextPage = () => {
  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-xs text-[#22d3ee] font-[Inter]">
      <div className="w-[1200px] flex flex-col items-start pt-[72px] px-6 pb-14 box-border max-w-[1200px] lg:max-w-full">
        <div className="self-stretch h-[48.5px] flex items-start pt-[0.5px] px-0 pb-5 box-border">
          <div className="bg-[rgba(26,107,220,0.12)] border-[rgba(26,107,220,0.3)] border-solid border-[1px] flex items-center py-1 px-3.5 gap-[7px]">
            <div className="h-[7px] w-[7px] relative shadow-[0px_0px_8px_#22d3ee] rounded-[3.5px] bg-[#22d3ee]" />
            <div className="flex flex-col items-start">
              <div className="relative tracking-[0.96px] leading-[18px] font-semibold">
                EN COURS
              </div>
            </div>
          </div>
        </div>
<div className="flex items-center gap-4 text-[58px] font-[Rajdhani] mq1050:text-[46px] mq450:text-[35px]">
  <h1 className="m-0 font-bold text-[#e8eaf0] tracking-[-0.58px] leading-[63.8px] mq1050:leading-[51px] mq450:leading-[38px]">
    Saison 1
  </h1>

  {/* TRAIT ENTRE LES DEUX */}
  <div className="w-[40px] h-[5px] bg-white rounded-full"></div>

  <h2 className="m-0 font-bold tracking-[-0.58px] leading-[63.8px] text-transparent !bg-clip-text [background:linear-gradient(90deg,_#1a6bdc,_#38bdf8)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] mq1050:leading-[51px] mq450:leading-[38px]">
    Compétition Ouverte
  </h2>
</div>
        <div className="w-[560px] h-[43px] flex flex-col items-start pt-4 px-0 pb-0 box-border max-w-[560px] text-lg text-[#6b7d94] mq750:max-w-full">
          <div className="relative leading-[27px]">
            Affronte les meilleurs joueurs et grimpe les échelons
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sectionmarginranked;
