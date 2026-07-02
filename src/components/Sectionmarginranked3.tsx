import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Image from "next/image";

const Sectionmarginranked3: NextPage = () => {
  // État réel basé sur ton backend Discord
  const [isConnected, setIsConnected] = useState(false);

  // ⭐ COMPTEURS DYNAMIQUES — À METTRE ICI
  const [queueStatus, setQueueStatus] = useState({
    playersInQueue: 0,
    matchesInProgress: 0,
    playersOnline: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://sixsence-backend.onrender.com/queue/status")
        .then((res) => res.json())
        .then((data) => setQueueStatus(data));
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  // ⭐ FIN COMPTEURS DYNAMIQUES
  
  // Vérification du token Discord + appel /me
  useEffect(() => {
    const token = localStorage.getItem("discord_token");
    if (!token) return;

    fetch("https://sixsence-backend.onrender.com/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      })
      .catch(() => setIsConnected(false));
  }, []);

  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center leading-[normal] tracking-[normal] text-left text-xl text-[#e8eaf0] font-[Rajdhani]">
      <div className="w-[1200px] flex flex-col items-start pt-0 px-6 pb-16 box-border max-w-[1200px] lg:max-w-full">

        {/* ============================
            SI PAS CONNECTÉ → MODULE ORIGINAL
           ============================ */}
        {!isConnected && (
          <div className="self-stretch bg-[rgba(201,162,39,0.22)] flex flex-col items-start p-px box-border max-w-full">
            <div className="self-stretch h-[119px] bg-[rgba(201,162,39,0.06)] flex items-start py-8 pl-10 pr-[39px] box-border gap-6 max-w-full lg:h-auto lg:flex-wrap">

              {/* Icône */}
              <div className="flex flex-col items-start pt-[4.5px] px-0 pb-0">
                <div className="w-[46px] h-[46px] bg-[rgba(201,162,39,0.18)] flex items-center justify-center">
                  <Image
                    className="h-5 w-full relative"
                    width={20}
                    height={20}
                    sizes="100vw"
                    alt=""
                    src="/assets/Iconbouclier.svg"
                  />
                </div>
              </div>

              {/* Texte */}
              <div className="w-[830.6px] flex flex-col items-start max-w-full">
                <div className="self-stretch flex flex-col items-start">
                  <h3 className="m-0 relative text-[length:inherit] tracking-[0.4px] leading-[30px] font-bold font-[inherit] mq450:text-base mq450:leading-6">
                    Connecte-toi pour jouer
                  </h3>
                </div>
                <div className="w-[830.6px] h-[25px] flex flex-col items-start pt-1 px-0 pb-0 box-border text-sm text-[#6b7d94] font-[Inter]">
                  <div className="relative leading-[21px]">
                    Tu dois être connecté pour accéder au mode classé.
                  </div>
                </div>
              </div>

              {/* Bouton */}
              <div className="flex flex-col items-start pt-[7px] px-0 pb-0">
<button
  onClick={() => window.location.href = "https://sixsence-backend.onrender.com/auth/discord"}
  className="cursor-pointer [border:none] py-2.5 px-6 bg-[transparent] [background:linear-gradient(90deg,_#c9a227,_#a07a10)] flex flex-col items-center justify-center"
>
  <b className="relative text-sm tracking-[0.56px] leading-[21px] font-[Inter] text-[#080c14] text-center">
    Se connecter
  </b>
</button>
              </div>

            </div>
          </div>
        )}


        {/* SI CONNECTÉ → TON CONTAINER PARFAIT AVEC ASSETS + DYNAMIQUE */}
        {isConnected && (
          <div className="w-[1198px] max-w-full flex flex-col items-start justify-center py-6 pl-8 pr-6 box-border gap-[23.2px] leading-[normal] tracking-[normal] text-left text-[28px] text-[#e8f0fa] font-[Rajdhani]">
            <div className="self-stretch flex items-start flex-wrap content-start gap-4 max-w-full">
              <div className="flex-1 flex items-start gap-4 min-w-[623px] max-w-full mq825:flex-wrap mq825:min-w-full">
                <Image
                  className="cursor-pointer [border:none] p-0 bg-[transparent] h-11 w-11 relative rounded-[10px]"
                  width={44}
                  height={44}
                  sizes="100vw"
                  alt=""
                  src="/assets/IconRD4.svg"
                />
                <div className="flex-1 flex flex-col items-start gap-1 min-w-[584px] max-w-full mq825:min-w-full">
                  <div className="self-stretch flex flex-col items-start">
                    <h1 className="m-0 relative text-[length:inherit] tracking-[0.28px] leading-[30.8px] font-bold font-[inherit] mq450:text-[22px] mq450:leading-[25px]">
                      Rechercher un match
                    </h1>
                  </div>
                  <div className="self-stretch flex flex-col items-start max-w-full text-sm text-[#6b7d94] font-[Inter]">
                    <div className="relative leading-[21px] inline-block max-w-full">
                      Tu es prêt à jouer en mode classé. Lance une recherche pour
                      trouver un match compétitif.
                    </div>
                  </div>
                </div>
              </div>
              <button className="cursor-pointer border-[rgba(26,107,220,0.2)] border-solid border-[1px] py-1.5 px-3 bg-[rgba(26,107,220,0.1)] h-[34px] rounded-[33554400px] box-border flex items-center gap-2">
                <div className="h-2 w-2 relative shadow-[0px_0px_6px_rgba(34,_197,_94,_0.53)] rounded-[33554400px] bg-[#22c55e]" />
                <div className="h-5 flex flex-col items-start">
                  <div className="relative text-[13px] leading-[19.5px] font-medium font-[Inter] text-[#a0b0c8] text-left">
                    {queueStatus.playersOnline} joueur(s) en ligne
                  </div>
                </div>
              </button>
            </div>

            <main className="self-stretch h-[564px] flex items-start flex-wrap content-start gap-6 max-w-full">
              <section className="flex-1 flex flex-col items-start gap-6 min-w-[506px] max-w-full text-left text-[13px] text-[#5b7fa8] font-[Rajdhani] mq675:min-w-full">
                {/* Statut de la file */}
                <div className="self-stretch rounded-[10px] bg-[rgba(10,22,40,0.6)] border-[rgba(26,107,220,0.15)] border-solid border-[1px] flex flex-col items-start p-4 gap-2.5">
                  <div className="self-stretch flex flex-col items-start pt-0 px-0 pb-3">
                    <div className="self-stretch flex items-center gap-2">
                      <div className="h-4 w-1 relative rounded-[33554400px] [background:linear-gradient(180deg,_#1a6bdc,_rgba(26,_107,_220,_0.53))]" />
                      <div className="h-5 flex flex-col items-start">
                        <b className="relative tracking-[1.04px] leading-[19.5px] uppercase">
                          Statut de la file
                        </b>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start gap-2 text-sm text-[#a0b0c8] font-[Inter]">
                    <div className="self-stretch flex items-center gap-2.5">
                      <input
                        className="cursor-pointer m-0 h-2 w-2 relative shadow-[0px_0px_6px_rgba(59,_130,_246,_0.53)] rounded-[33554400px] bg-[#3b82f6]"
                        type="radio"
                      />
                      <div className="h-[21px] flex flex-col items-start">
                        <div className="relative leading-[21px]">
                          {queueStatus.playersInQueue} joueur(s) en recherche
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch flex items-center gap-2.5">
                      <div className="h-2 w-2 relative shadow-[0px_0px_6px_rgba(249,_115,_22,_0.53)] rounded-[33554400px] bg-[#f97316]" />
                      <div className="h-[21px] flex flex-col items-start">
                        <div className="relative leading-[21px]">
                          {queueStatus.matchesInProgress} match(s) en cours
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch flex items-center gap-2.5">
                      <input
                        className="cursor-pointer m-0 h-2 w-2 relative shadow-[0px_0px_6px_rgba(34,_197,_94,_0.53)] rounded-[33554400px] bg-[#22c55e]"
                        type="radio"
                      />
                      <div className="h-[21px] flex flex-col items-start">
                        <div className="relative leading-[21px]">
                          {queueStatus.playersOnline} joueur(s) en ligne
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mode de jeu sélectionné */}
                <div className="self-stretch rounded-[10px] bg-[rgba(10,22,40,0.6)] border-[rgba(26,107,220,0.15)] border-solid border-[1px] flex flex-col items-start p-4">
                  <div className="self-stretch flex items-center gap-2">
                    <div className="h-4 w-1 relative rounded-[33554400px] [background:linear-gradient(180deg,_#1a6bdc,_rgba(26,_107,_220,_0.53))]" />
                    <div className="h-5 flex flex-col items-start">
                      <b className="relative tracking-[1.04px] leading-[19.5px] uppercase">
                        Mode de jeu sélectionné
                      </b>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-center pt-3 px-0 pb-0 text-[15px] text-[#c5d8f0]">
                    <div className="w-full h-[69px] rounded-[10px] bg-[rgba(26,107,220,0.08)] border-[rgba(26,107,220,0.2)] border-solid border-[1px] box-border overflow-x-auto shrink-0 flex items-center py-3 px-4 gap-3 max-w-full">
                      <Image
                        className="h-9 w-9 relative rounded shrink-0"
                        width={36}
                        height={36}
                        sizes="100vw"
                        alt=""
                        src="/assets/IconRD6.svg"
                      />
                      <div className="h-[43px] flex flex-col items-start gap-0.5">
                        <div className="w-[165px] h-[23px] flex flex-col items-start">
                          <b className="relative tracking-[0.6px] leading-[22.5px]">
                            Recherche & Destruction
                          </b>
                        </div>
                        <div className="flex flex-col items-start text-xs text-[#5b7fa8] font-[Inter]">
                          <div className="relative leading-[18px]">
                            Mode compétitif classé · 5v5
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex items-start justify-end text-xs text-[#4a90d9] font-[Inter]">
                        <div className="h-6 flex items-end">
                          <div className="h-[19px] flex-1 rounded-[33554400px] bg-[rgba(26,107,220,0.2)] flex items-center justify-center pt-0.5 pb-px pl-2 pr-[7px] box-border">
                            <div className="relative tracking-[0.6px] leading-4 font-semibold">
                              ACTIF
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objets utilisables */}
                <div className="self-stretch rounded-[10px] bg-[rgba(10,22,40,0.6)] border-[rgba(26,107,220,0.15)] border-solid border-[1px] flex flex-col items-start p-4">
                  <div className="self-stretch flex items-center gap-2">
                    <div className="h-4 w-1 relative rounded-[33554400px] [background:linear-gradient(180deg,_#1a6bdc,_rgba(26,_107,_220,_0.53))]" />
                    <div className="h-5 flex flex-col items-start">
                      <b className="relative tracking-[1.04px] leading-[19.5px] uppercase">
                        Objets utilisables
                      </b>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-center pt-3 px-0 pb-0 text-[15px] text-[#86efac]">
                    <div className="w-full h-[69px] rounded-[10px] bg-[rgba(34,197,94,0.12)] border-[rgba(34,197,94,0.3)] border-solid border-[1px] box-border overflow-x-auto shrink-0 flex items-center py-3 px-4 gap-3 max-w-full">
                      <Image
                        className="h-9 w-9 relative rounded shrink-0"
                        width={36}
                        height={36}
                        sizes="100vw"
                        alt=""
                        src="/assets/Iconetoile.svg"
                      />
                      <div className="h-[43px] flex flex-col items-start gap-0.5">
                        <div className="w-[100px] h-[23px] flex flex-col items-start">
                          <b className="relative tracking-[0.6px] leading-[22.5px]">
                            Points doublés
                          </b>
                        </div>
                        <div className="flex flex-col items-start text-xs text-[#4ade80] font-[Inter]">
                          <div className="relative leading-[18px]">
                            3 matchs restants · Actif
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex items-start justify-end text-xs text-[#22c55e] font-[Inter]">
                        <div className="h-6 flex items-end">
                          <div className="h-[19px] flex-1 rounded-[33554400px] bg-[rgba(34,197,94,0.2)] flex items-center justify-center pt-0.5 px-2 pb-px box-border">
                            <div className="relative tracking-[0.6px] leading-4 font-semibold">
                              ×2 XP
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engagement requis */}
                <div className="self-stretch h-[67px] rounded-[10px] bg-[rgba(234,179,8,0.07)] border-[rgba(234,179,8,0.22)] border-solid border-[1px] box-border flex items-start py-3 px-4 gap-3 max-w-full text-[#eab308] font-[Inter] mq825:flex-wrap">
                  <Image
                    className="h-[18px] w-4 relative"
                    loading="lazy"
                    width={16}
                    height={18}
                    sizes="100vw"
                    alt=""
                    src="/assets/Iconwarning.svg"
                  />
                  <div className="flex-1 flex flex-col items-start min-w-[465px] max-w-full mq675:min-w-full">
                    <div className="w-full relative leading-[20.2px] inline-block max-w-[716px] mq825:max-w-full">
                      <span className="font-semibold leading-[20.2px]">
                        ⚠️ Engagement requis.
                      </span>
                      <span className="text-[#ca8a04] leading-[20.2px]">
                        {" "}
                        En lançant un match classé, vous vous engagez à le jouer. Ne
                        pas jouer un match après l'avoir lancé peut entraîner des
                        sanctions si cela se reproduit plusieurs fois.
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Colonne droite */}
              <section className="h-[564px] flex-1 flex flex-col items-start gap-4 min-w-[221px] max-w-[340px] text-left text-[13px] text-[#5b7fa8] font-[Rajdhani]">
                <button className="cursor-pointer [border:none] py-3.5 px-5 bg-[transparent] self-stretch rounded-[10px] [background:linear-gradient(90deg,_#1a6bdc,_#1559b8)] flex items-center justify-between gap-0 [row-gap:20px]">
                  <div className="h-[26px] flex flex-col items-center">
                    <b className="relative text-[17px] tracking-[0.68px] leading-[25.5px] font-[Rajdhani] text-[#fff] text-left">
                      Rejoindre / Chercher un match
                    </b>
                  </div>
                  <Image
                    className="h-[18px] w-[18px] relative"
                    width={18}
                    height={18}
                    sizes="100vw"
                    alt=""
                    src="/assets/Iconfleche4.svg"
                  />
                </button>
                <button className="cursor-pointer border-[rgba(220,38,38,0.25)] border-solid border-[1px] py-3 px-5 bg-[rgba(220,38,38,0.06)] self-stretch h-[49px] rounded-[10px] box-border flex items-center justify-between gap-0 [row-gap:20px]">
                  <div className="h-[23px] flex flex-col items-center">
                    <b className="relative text-[15px] tracking-[0.6px] leading-[22.5px] font-[Rajdhani] text-[#fecaca] text-left">
                      Quitter la file d'attente
                    </b>
                  </div>
                  <Image
                    className="h-4 w-4 relative"
                    width={16}
                    height={16}
                    sizes="100vw"
                    alt=""
                    src="/assets/Iconfleche5.svg"
                  />
                </button>
                <div className="self-stretch flex flex-col items-start py-1 px-0">
                  <div className="self-stretch h-px relative bg-[rgba(26,107,220,0.12)]" />
                </div>
                <div className="self-stretch flex flex-col items-start">
                  <div className="self-stretch flex items-center py-0 pl-0 pr-[35px] gap-2">
                    <div className="h-4 w-1 relative rounded-[33554400px] [background:linear-gradient(180deg,_#1a6bdc,_rgba(26,_107,_220,_0.53))]" />
                    <div className="h-5 flex-1 flex flex-col items-start">
                      <b className="relative tracking-[1.04px] leading-[19.5px] uppercase">
                        Récompenses en cas de victoire (par mode)
                      </b>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start pt-3 px-0 pb-0 gap-2 text-[#c5d8f0]">
                    <div className="self-stretch rounded-[10px] bg-[rgba(10,22,40,0.7)] border-[rgba(26,107,220,0.18)] border-solid border-[1px] flex flex-col items-start p-3">
                      <div className="self-stretch flex items-center gap-2">
                        <Image
                          className="h-7 w-7 relative rounded"
                          width={28}
                          height={28}
                          sizes="100vw"
                          alt=""
                          src="/assets/IconRD5.svg"
                        />
                        <div className="h-5 flex flex-col items-start">
                          <b className="relative tracking-[0.65px] leading-[19.5px]">
                            S&D
                          </b>
                        </div>
                      </div>
                      <div className="self-stretch flex items-start pt-2 px-0 pb-0 gap-4 text-[11px] text-[#5b7fa8] font-[Inter] mq450:flex-wrap">
                        <div className="self-stretch flex flex-col items-start gap-0.5">
                          <div className="w-[77px] flex flex-col items-start">
                            <div className="relative tracking-[0.66px] leading-[16.5px] uppercase">
                              Points
                            </div>
                          </div>
                          <div className="w-[77px] h-6 flex items-center gap-1 text-base text-[#f59e0b]">
                            <Image
                              className="h-[11px] w-[11px] relative"
                              loading="lazy"
                              width={11}
                              height={11}
                              sizes="100vw"
                              alt=""
                              src="/assets/Iconxp.svg"
                            />
                            <div className="h-6 flex flex-col items-start">
                              <b className="relative leading-6">+30 pts</b>
                            </div>
                          </div>
                        </div>
                        <div className="self-stretch flex flex-col items-start gap-0.5">
                          <div className="w-[84px] flex flex-col items-start">
                            <div className="relative tracking-[0.66px] leading-[16.5px] uppercase">
                              Expérience
                            </div>
                          </div>
                          <div className="w-[84px] h-6 flex items-center gap-1 text-base text-[#818cf8]">
                            <Image
                              className="h-[11px] w-[11px] relative"
                              loading="lazy"
                              width={11}
                              height={11}
                              sizes="100vw"
                              alt=""
                              src="/assets/Iconstar.svg"
                            />
                            <div className="h-6 flex flex-col items-start">
                              <b className="relative leading-6">+500 XP</b>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch h-9 rounded-[10px] bg-[rgba(34,197,94,0.06)] border-[rgba(34,197,94,0.2)] border-solid border-[1px] box-border flex items-center py-2 px-3 gap-2 text-xs text-[#4ade80] font-[Inter]">
                      <Image
                        className="h-3 w-3 relative"
                        loading="lazy"
                        width={12}
                        height={12}
                        sizes="100vw"
                        alt=""
                        src="/assets/Iconstar2.svg"
                      />
                      <div className="h-[18px] flex flex-col items-start">
                        <div className="relative leading-[18px]">
                          <span className="leading-[18px]">
                            {`Bonus actif : XP ×2 → `}
                          </span>
                          <b className="leading-[18px]">+1 000 XP</b>
                          <span className="leading-[18px]"> ce match</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="self-stretch h-[84px] rounded-[10px] bg-[rgba(10,22,40,0.6)] border-[rgba(26,107,220,0.15)] border-solid border-[1px] box-border flex flex-col items-start py-3 px-4 gap-1 text-xs text-[#4a90d9]">
                  <div className="self-stretch flex items-center gap-2">
                    <Image
                      className="h-[13px] w-[13px] relative"
                      loading="lazy"
                      width={13}
                      height={13}
                      sizes="100vw"
                      alt=""
                      src="/assets/Iconranked2.svg"
                    />
                    <div className="h-[18px] flex flex-col items-start">
                      <b className="relative tracking-[0.96px] leading-[18px] uppercase">
                        Mode classé uniquement
                      </b>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col items-start text-[#5b7fa8] font-[Inter]">
                    <div className="relative leading-[18px]">
                      Les points et récompenses ne sont attribués qu'en cas de
                      victoire en mode classé.
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sectionmarginranked3;