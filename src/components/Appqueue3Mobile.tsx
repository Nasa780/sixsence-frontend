import type { NextPage } from "next";
import Image from "next/image";

const Appaccueil3Mobile: NextPage = () => {
  return (
    <div className="w-full flex flex-col items-center bg-[#0a1a2f] text-[#f5f5f5]">

      {/* HEADER MELTDOWN */}
      <section className="w-full h-[140px] relative bg-[#111d2a] border border-[rgba(255,160,64,0.4)] overflow-hidden flex flex-col items-center justify-center">

        {/* Fond rose */}
        <div className="absolute inset-0 opacity-50">
          <Image src="/assets/fond-rose.png" alt="" fill className="object-cover" />
        </div>

        {/* Image de fond */}
        <div className="absolute inset-0 bg-[url('/App@3x.png')] bg-cover bg-top opacity-40" />

        {/* Overlay bleu */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,26,47,0.85),rgba(10,26,47,0.2)_50%,rgba(10,26,47,0.85))]" />

        {/* Contenu */}
        <div className="relative z-[4] flex flex-col items-center gap-2">
          <h1 className="text-[32px] tracking-[6px] uppercase font-bold">
            MELTDOWN
          </h1>

          <div className="flex items-center gap-3 text-xs text-[#ffa040] font-['Barlow_Condensed']">
            <div className="h-[26px] bg-[rgba(255,160,64,0.15)] border border-[rgba(255,160,64,0.5)] px-3 flex items-center gap-1">
              <Image src="/assets/Icon5v5.svg" width={10} height={10} alt="" />
              <b className="tracking-[1.5px] uppercase">5 v 5</b>
            </div>

            <div className="h-[26px] bg-[rgba(15,42,74,0.7)] border border-[rgba(200,200,200,0.2)] px-3 flex items-center gap-1 text-[#c8c8c8]">
              <Image src="/assets/Iconheure.svg" width={10} height={10} alt="" />
              <span className="tracking-[1px] font-semibold">23 janv., 23:47</span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENU MOBILE */}
      <main className="w-full flex flex-col gap-4 px-4 py-4">

        {/* ÉQUIPE 1 */}
        <section className="w-full bg-[#111d2a] border border-[rgba(255,160,64,0.18)] flex flex-col">
          <div className="h-[32px] bg-[rgba(255,160,64,0.07)] border-b border-[rgba(255,160,64,0.2)] flex items-center px-3 gap-2">
            <Image src="/assets/Iconshield.svg" width={10} height={10} alt="" />
            <b className="tracking-[1.5px] uppercase text-[12px]">Équipe 1</b>
          </div>

          {/* Liste joueurs */}
          <div className="flex flex-col">
            {/* Chaque joueur */}
            {/* Je te mets un exemple compacté, tu pourras dupliquer */}
            <div className="flex items-center gap-3 px-3 py-2 border-b border-[rgba(255,160,64,0.07)]">
              <div className="h-7 w-7 bg-[linear-gradient(135deg,#1f3a55,#0a1a2f)] border border-[rgba(255,160,64,0.25)] flex items-center justify-center">
                <b className="text-[10px]">NI</b>
              </div>

              <div className="flex-1 flex flex-col text-[12px]">
                <span className="font-semibold">NightFury</span>
                <span className="text-[10px] text-[#6b7f94]">#7823401</span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <div className="h-[20px] px-2 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] flex items-center gap-1 text-[#00d4ff]">
                  <Image src="/assets/Iconpc.svg" width={8} height={8} alt="" />
                  <span className="uppercase font-semibold">PC</span>
                </div>

                <div className="h-[20px] px-2 bg-[rgba(185,242,255,0.18)] border border-[rgba(125,211,252,0.27)] flex items-center gap-1 text-[#7dd3fc]">
                  <div className="h-[4px] w-[4px] bg-[#7dd3fc] rounded" />
                  <b className="uppercase">Diamant</b>
                </div>
              </div>
            </div>
          </div>

          <div className="px-3 py-2 text-[10px] text-[#3d5166]">
            5 joueurs
          </div>
        </section>

        {/* ÉQUIPE 2 */}
        <section className="w-full bg-[#111d2a] border border-[rgba(255,160,64,0.18)] flex flex-col">
          <div className="h-[32px] bg-[rgba(255,160,64,0.07)] border-b border-[rgba(255,160,64,0.2)] flex items-center px-3 gap-2">
            <Image src="/assets/Iconshield.svg" width={10} height={10} alt="" />
            <b className="tracking-[1.5px] uppercase text-[12px]">Équipe 2</b>
          </div>

          {/* Tu dupliques la même structure que Équipe 1 */}
        </section>

        {/* CHAT */}
        <section className="w-full bg-[#111d2a] border border-[rgba(255,160,64,0.4)] flex flex-col">
          <div className="h-[32px] bg-[rgba(255,160,64,0.07)] border-b border-[rgba(255,160,64,0.2)] flex items-center px-3">
            <b className="tracking-[1.5px] uppercase text-[12px]">Chat</b>
          </div>

          <div className="flex flex-col px-3 py-2 gap-2 text-[12px]">
            <i className="text-[#6b7f94] text-[10px]">
              Le match a démarré — bonne chance à tous !
            </i>

            {/* Messages */}
            {/* Tu dupliques comme dans ton fichier */}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-[rgba(255,160,64,0.2)]">
            <input
              className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,160,64,0.15)] px-2 py-1 text-[11px] outline-none"
              placeholder="Votre message..."
            />
            <Image src="/assets/Iconbuttom.svg" width={24} height={24} alt="" />
          </div>
        </section>

        {/* VOTE DU VAINQUEUR — VERSION MOBILE C */}
        <section className="w-full bg-[#111d2a] border border-[rgba(255,160,64,0.18)] flex flex-col p-3 gap-3">
          <h3 className="text-[14px] tracking-[1.5px] uppercase font-bold text-[#ffa040]">
            Vote du vainqueur
          </h3>

          {/* Barres compactées */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[12px]">
              <span>Équipe 1</span>
              <span className="text-[#7dd3fc] font-bold">54%</span>
            </div>
            <div className="h-2 bg-[#0f2a4a] rounded">
              <div className="h-full bg-[#7dd3fc] rounded w-[54%]" />
            </div>

            <div className="flex items-center justify-between text-[12px]">
              <span>Équipe 2</span>
              <span className="text-[#ffd700] font-bold">46%</span>
            </div>
            <div className="h-2 bg-[#0f2a4a] rounded">
              <div className="h-full bg-[#ffd700] rounded w-[46%]" />
            </div>
          </div>

          <button className="w-full py-2 bg-[#ffa040] text-[#111d2a] font-bold uppercase tracking-[1px]">
            Voter
          </button>
        </section>

      </main>
    </div>
  );
};

export default Appaccueil3Mobile;
