import type { NextPage } from "next";
import Image from "next/image";
import { useEffect, useState } from "react";

const Sectionmarginranked3: NextPage = () => {
  // État réel basé sur ton backend Discord
  const [isConnected, setIsConnected] = useState(false);

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

        {/* ============================
            SI CONNECTÉ → MODULE FILE D’ATTENTE
           ============================ */}
        {isConnected && (
          <div className="self-stretch bg-[rgba(201,162,39,0.22)] flex flex-col items-start p-px box-border max-w-full">
            <div className="self-stretch bg-[rgba(201,162,39,0.06)] flex items-start py-8 pl-10 pr-[39px] box-border gap-6 max-w-full lg:flex-wrap">

              {/* Icône */}
              <div className="flex flex-col items-start pt-[4.5px] px-0 pb-0">
                <div className="w-[46px] h-[46px] bg-[rgba(201,162,39,0.18)] flex items-center justify-center">
                  <Image
                    className="h-5 w-full relative"
                    width={20}
                    height={20}
                    sizes="100vw"
                    alt=""
                    src="/assets/IconRD.svg"
                  />
                </div>
              </div>

              {/* Texte */}
              <div className="w-[830.6px] flex flex-col items-start max-w-full">
                <h3 className="m-0 tracking-[0.4px] leading-[30px] font-bold">
                  Recherche & Destruction — File d’attente
                </h3>

                <div className="pt-1 text-sm text-[#6b7d94] font-[Inter]">
                  Tu es prêt à jouer en mode classé S&D. Rejoins la file pour trouver un match compétitif.
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 pt-4 text-sm font-[Inter] text-[#a0b0c8]">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#3a8cff]" />
                    <span>7 joueur(s) dans la file</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#e8a020]" />
                    <span>4 match(s) en cours</span>
                  </div>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex flex-col items-start pt-[7px] px-0 pb-0">

                {/* Rejoindre */}
                <button className="cursor-pointer py-2.5 px-6 bg-[transparent] [background:linear-gradient(90deg,#1a6bdc,#1559b8)] flex flex-col items-center justify-center gap-2">
                  <b className="relative text-sm tracking-[0.56px] leading-[21px] font-[Inter] text-white text-center">
                    Rejoindre / Chercher un match
                  </b>
                </button>

                {/* Quitter */}
                <button className="cursor-pointer mt-3 py-2.5 px-6 bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.35)] flex flex-col items-center justify-center gap-2 hover:bg-[rgba(248,113,113,0.08)] hover:border-[rgba(248,113,113,0.35)]">
                  <b className="relative text-sm tracking-[0.56px] leading-[21px] font-[Inter] text-[#fecaca] text-center">
                    Quitter la file d’attente
                  </b>
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Sectionmarginranked3;
