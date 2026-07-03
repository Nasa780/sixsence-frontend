import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Image from "next/image";

const Sectionmarginranked3: NextPage = () => {
  /* ---------------------------------------------------------
     État de connexion Discord
  --------------------------------------------------------- */
  const [isConnected, setIsConnected] = useState(false);

  /* ---------------------------------------------------------
     Compteurs dynamiques (playersInQueue, matchesInProgress, playersOnline)
  --------------------------------------------------------- */
  const [queueStatus, setQueueStatus] = useState({
    playersInQueue: 0,
    matchesInProgress: 0,
    playersOnline: 0,

    // PATCH FILE D'ATTENTE
    inQueue: false,
    timeLeft: null as number | null,
    message: null as string | null,
    loading: false,
  });

  /* ---------------------------------------------------------
     Récupération des compteurs toutes les 3 secondes
  --------------------------------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://sixsence-backend.onrender.com/queue/status", {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) =>
          setQueueStatus((prev) => ({
            ...prev,
            playersInQueue: data.playersInQueue ?? prev.playersInQueue,
            matchesInProgress: data.matchesInProgress ?? prev.matchesInProgress,
            playersOnline: data.playersOnline ?? prev.playersOnline,

            // PATCH : si le backend renvoie inQueue/timeLeft/message
            inQueue: data.inQueue ?? prev.inQueue,
            timeLeft: data.timeLeft ?? prev.timeLeft,
            message: data.message ?? prev.message,
          }))
        );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* ---------------------------------------------------------
     Vérification du token Discord
  --------------------------------------------------------- */
  useEffect(() => {
    const token = localStorage.getItem("discord_token");
    if (!token) return;

    fetch("https://sixsence-backend.onrender.com/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setIsConnected(res.ok))
      .catch(() => setIsConnected(false));
  }, []);

  /* ---------------------------------------------------------
     PATCH : Rejoindre la file
  --------------------------------------------------------- */
  const handleJoinQueue = async () => {
    setQueueStatus((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch("https://sixsence-backend.onrender.com/queue/join", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      setQueueStatus((prev) => ({
        ...prev,
        inQueue: data.inQueue ?? false,
        timeLeft: data.timeLeft ?? null,
        message: data.message ?? null,
        loading: false,
      }));
    } catch (err) {
      console.error(err);
      setQueueStatus((prev) => ({
        ...prev,
        loading: false,
        message: "Erreur lors de la connexion à la file",
      }));
    }
  };

  /* ---------------------------------------------------------
     PATCH : Quitter la file
  --------------------------------------------------------- */
  const handleLeaveQueue = async () => {
    setQueueStatus((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch("https://sixsence-backend.onrender.com/queue/leave", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      setQueueStatus((prev) => ({
        ...prev,
        inQueue: false,
        timeLeft: null,
        message: data.message ?? null,
        loading: false,
      }));
    } catch (err) {
      console.error(err);
      setQueueStatus((prev) => ({
        ...prev,
        loading: false,
        message: "Erreur lors de la sortie de la file",
      }));
    }
  };

  /* ---------------------------------------------------------
     Rendu du composant
  --------------------------------------------------------- */
  return (
    <div className="w-[2174px] max-w-full flex flex-col items-center text-left text-xl text-[#e8eaf0] font-[Rajdhani]">
      <div className="w-[1200px] flex flex-col items-start px-6 pb-16 box-border max-w-[1200px]">

        {/* ============================
            SI PAS CONNECTÉ
        ============================ */}
        {!isConnected && (
          <div className="self-stretch bg-[rgba(201,162,39,0.22)] flex flex-col items-start p-px">
            <div className="self-stretch h-[119px] bg-[rgba(201,162,39,0.06)] flex items-start py-8 pl-10 pr-[39px] gap-6">

              {/* Icône */}
              <div className="pt-[4.5px]">
                <div className="w-[46px] h-[46px] bg-[rgba(201,162,39,0.18)] flex items-center justify-center">
                  <Image src="/assets/Iconbouclier.svg" width={20} height={20} alt="" />
                </div>
              </div>

              {/* Texte */}
              <div className="w-[830px] flex flex-col">
                <h3 className="tracking-[0.4px] leading-[30px] font-bold">
                  Connecte-toi pour jouer
                </h3>
                <div className="text-sm text-[#6b7d94] font-[Inter]">
                  Tu dois être connecté pour accéder au mode classé.
                </div>
              </div>

              {/* Bouton */}
              <div className="pt-[7px]">
                <button
                  onClick={() =>
                    (window.location.href =
                      "https://sixsence-backend.onrender.com/auth/discord")
                  }
                  className="py-2.5 px-6 bg-gradient-to-r from-[#c9a227] to-[#a07a10]"
                >
                  <b className="text-sm text-[#080c14]">Se connecter</b>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================
            SI CONNECTÉ
        ============================ */}
        {isConnected && (
          <div className="w-[1198px] flex flex-col gap-[23px] py-6 pl-8 pr-6">

            {/* HEADER */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 flex gap-4 min-w-[623px]">
                <Image src="/assets/IconRD4.svg" width={44} height={44} alt="" />

                <div className="flex-1 flex flex-col gap-1">
                  <h1 className="tracking-[0.28px] leading-[30px] font-bold">
                    Rechercher un match
                  </h1>
                  <div className="text-sm text-[#6b7d94] font-[Inter]">
                    Tu es prêt à jouer en mode classé. Lance une recherche pour trouver un match compétitif.
                  </div>
                </div>
              </div>

              {/* Joueurs en ligne */}
              <button className="border border-[rgba(26,107,220,0.2)] bg-[rgba(26,107,220,0.1)] h-[34px] rounded-full px-3 flex items-center gap-2">
                <div className="h-2 w-2 bg-[#22c55e] rounded-full shadow" />
                <div className="text-[13px] text-[#a0b0c8]">
                  {queueStatus.playersOnline} joueur(s) en ligne
                </div>
              </button>
            </div>

            {/* ============================
                BOUTON PATCHÉ FILE D'ATTENTE
            ============================ */}
            <button
              className="py-3.5 px-5 rounded-[10px] bg-gradient-to-r from-[#1a6bdc] to-[#1559b8] flex items-center justify-between disabled:opacity-60"
              onClick={queueStatus.inQueue ? handleLeaveQueue : handleJoinQueue}
              disabled={queueStatus.loading}
            >
              <b className="text-[17px] text-white">
                {queueStatus.loading
                  ? "Chargement..."
                  : queueStatus.inQueue
                  ? "Quitter la file d'attente"
                  : "Rejoindre / Chercher un match"}
              </b>

              <Image
                src={
                  queueStatus.inQueue
                    ? "/assets/Iconfleche5.svg"
                    : "/assets/Iconfleche4.svg"
                }
                width={18}
                height={18}
                alt=""
              />
            </button>

            {/* Message de statut */}
            {queueStatus.message && (
              <div className="text-xs text-[#a0b0c8] font-[Inter] mt-2">
                {queueStatus.message}
                {queueStatus.inQueue && queueStatus.timeLeft !== null && (
                  <span className="ml-1 text-[#4a90d9]">
                    · Temps restant : {Math.floor(queueStatus.timeLeft / 60)} min
                  </span>
                )}
              </div>
            )}

            {/* ============================
                LE RESTE DE TON UI (inchangé)
            ============================ */}

            {/* Statut de la file */}
            {/* Mode de jeu */}
            {/* Objets utilisables */}
            {/* Engagement requis */}
            {/* Récompenses */}
            {/* Mode classé uniquement */}

            {/* (Ton code complet continue ici, inchangé) */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sectionmarginranked3;
