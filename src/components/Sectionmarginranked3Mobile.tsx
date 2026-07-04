import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Image from "next/image";

const Sectionmarginranked3Mobile: NextPage = () => {
  const [queueState, setQueueState] = useState({
    inQueue: false,
    timeLeft: null,
    message: null,
    loading: false,
  });

  const [queueStatus, setQueueStatus] = useState({
    playersInQueue: 0,
    matchesInProgress: 0,
    playersOnline: 0,
  });

  // COMPTEURS DYNAMIQUES
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("https://sixsence-backend.onrender.com/queue/status")
        .then((res) => res.json())
        .then((data) => setQueueStatus(data));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // STATUT + TIMER
  useEffect(() => {
    let intervalStatus;
    let intervalTimer;

    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("session");

        const res = await fetch("https://sixsence-backend.onrender.com/queue/status", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setQueueState((prev) => ({
          ...prev,
          inQueue: data.inQueue ?? false,
          timeLeft: data.timeLeft ?? null,
          message: data.message ?? null,
        }));
      } catch (err) {
        console.error("Erreur statut file :", err);
      }
    };

    const startTimer = () => {
      intervalTimer = setInterval(() => {
        setQueueState((prev) => {
          if (!prev.inQueue || prev.timeLeft === null) return prev;
          if (prev.timeLeft <= 0) return { ...prev, inQueue: false, timeLeft: null };
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    };

    fetchStatus();
    intervalStatus = setInterval(fetchStatus, 5000);
    startTimer();

    return () => {
      clearInterval(intervalStatus);
      clearInterval(intervalTimer);
    };
  }, []);

  const joinQueue = async () => {
    setQueueState((prev) => ({ ...prev, loading: true }));

    try {
      const token = localStorage.getItem("session");

      const res = await fetch("https://sixsence-backend.onrender.com/queue/join", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setQueueState({
        inQueue: data.inQueue ?? false,
        timeLeft: data.timeLeft ?? null,
        message: data.message ?? null,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      setQueueState((prev) => ({
        ...prev,
        loading: false,
        message: "Erreur lors de la connexion à la file",
      }));
    }
  };

  const leaveQueue = async () => {
    setQueueState((prev) => ({ ...prev, loading: true }));

    try {
      const token = localStorage.getItem("session");

      const res = await fetch("https://sixsence-backend.onrender.com/queue/leave", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setQueueState({
        inQueue: false,
        timeLeft: null,
        message: data.message ?? null,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      setQueueState((prev) => ({
        ...prev,
        loading: false,
        message: "Erreur lors de la sortie de la file",
      }));
    }
  };

  return (
    <div className="w-full flex flex-col items-center px-4 py-10 text-left font-[Rajdhani]">

      {/* ============================
          PARTIE 1 — COMPTEURS
      ============================ */}
      <div className="w-full bg-[rgba(26,107,220,0.12)] border border-[rgba(26,107,220,0.3)] rounded-md p-4 flex flex-col gap-3 text-sm font-[Inter] text-[#94a3b8]">
        <div className="flex justify-between">
          <span>Joueurs en file</span>
          <span className="text-[#22d3ee] font-bold">{queueStatus.playersInQueue}</span>
        </div>

        <div className="flex justify-between">
          <span>Matchs en cours</span>
          <span className="text-[#22d3ee] font-bold">{queueStatus.matchesInProgress}</span>
        </div>

        <div className="flex justify-between">
          <span>Joueurs en ligne</span>
          <span className="text-[#22d3ee] font-bold">{queueStatus.playersOnline}</span>
        </div>
      </div>

      {/* ============================
          PARTIE 2 — MODE + OBJETS + ENGAGEMENT
      ============================ */}
      <div className="w-full mt-8 flex flex-col gap-6">

        {/* Mode sélectionné */}
        <div className="w-full rounded-[10px] bg-[rgba(10,22,40,0.6)] border border-[rgba(26,107,220,0.15)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-1 rounded bg-[linear-gradient(180deg,#1a6bdc,rgba(26,107,220,0.53))]" />
            <b className="uppercase tracking-[1px] text-[15px] text-[#e8eaf0]">
              Mode de jeu sélectionné
            </b>
          </div>

          <div className="rounded-[10px] bg-[rgba(26,107,220,0.08)] border border-[rgba(26,107,220,0.2)] p-4 flex items-center gap-3">
            <Image src="/assets/IconRD6.svg" alt="RD" width={36} height={36} className="rounded" />

            <div className="flex flex-col">
              <b className="text-[15px] tracking-[0.5px] text-[#c5d8f0]">
                Recherche & Destruction
              </b>
              <span className="text-xs text-[#5b7fa8] font-[Inter]">
                Mode compétitif classé · 5v5
              </span>
            </div>

            <div className="ml-auto">
              <div className="rounded-full bg-[rgba(26,107,220,0.2)] px-3 py-1 text-xs text-[#4a90d9] font-[Inter] font-semibold">
                ACTIF
              </div>
            </div>
          </div>
        </div>

        {/* Objets utilisables */}
        <div className="w-full rounded-[10px] bg-[rgba(10,22,40,0.6)] border border-[rgba(26,107,220,0.15)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-4 w-1 rounded bg-[linear-gradient(180deg,#1a6bdc,rgba(26,107,220,0.53))]" />
            <b className="uppercase tracking-[1px] text-[15px] text-[#e8eaf0]">
              Objets utilisables
            </b>
          </div>

          <div className="rounded-[10px] bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] p-4 flex items-center gap-3">
            <Image src="/assets/Iconetoile.svg" alt="Bonus" width={36} height={36} className="rounded" />

            <span className="text-xs text-[#4ade80] font-[Inter]">
              3 matchs restants · Actif
            </span>

            <div className="ml-auto">
              <div className="rounded-full bg-[rgba(34,197,94,0.2)] px-3 py-1 text-xs text-[#22c55e] font-[Inter] font-semibold">
                ×2 XP
              </div>
            </div>
          </div>
        </div>

        {/* Engagement requis */}
        <div className="w-full rounded-[10px] bg-[rgba(234,179,8,0.07)] border border-[rgba(234,179,8,0.22)] p-4 flex items-start gap-3 text-[#eab308] font-[Inter]">
          <Image src="/assets/Iconwarning.svg" alt="Warning" width={18} height={18} />

          <p className="text-[13px] leading-[20px]">
            <span className="font-semibold">⚠️ Engagement requis.</span>  
            En lançant un match classé, vous vous engagez à le jouer.  
            Ne pas jouer un match peut entraîner des sanctions.
          </p>
        </div>
      </div>

      {/* ============================
          PARTIE 3 — BOUTONS + RÉCOMPENSES
      ============================ */}
      <div className="w-full mt-8 flex flex-col gap-6">

        {/* Bouton rejoindre */}
        <button
          className="w-full py-3.5 px-5 rounded-[10px] bg-[linear-gradient(90deg,#1a6bdc,#1559b8)] flex items-center justify-between disabled:opacity-60"
          onClick={joinQueue}
          disabled={queueState.loading || queueState.inQueue}
        >
          <b className="text-[17px] tracking-[0.6px] text-white">
            {queueState.loading
              ? "Chargement..."
              : queueState.inQueue
              ? "Déjà dans la file"
              : "Rejoindre / Chercher un match"}
          </b>

          <Image src="/assets/Iconfleche4.svg" alt="→" width={18} height={18} />
        </button>

        {/* Message + timer */}
        {queueState.message && (
          <div className="text-xs text-[#a0b0c8] font-[Inter]">
            {queueState.message}

            {queueState.inQueue && queueState.timeLeft !== null && (
              <span className="ml-1 text-[#4a90d9]">
                · Temps restant : {Math.floor(queueState.timeLeft / 60)} min{" "}
                {queueState.timeLeft % 60}s
              </span>
            )}
          </div>
        )}

        {/* Bouton quitter */}
        <button
          className="w-full py-3 px-5 rounded-[10px] bg-[rgba(220,38,38,0.06)] border border-[rgba(220,38,38,0.25)] flex items-center justify-between disabled:opacity-60"
          onClick={leaveQueue}
          disabled={queueState.loading || !queueState.inQueue}
        >
          <b className="text-[15px] tracking-[0.6px] text-[#fecaca]">
            {queueState.loading
              ? "Chargement..."
              : queueState.inQueue
              ? "Quitter la file d'attente"
              : "Pas dans la file"}
          </b>

          <Image src="/assets/Iconfleche5.svg" alt="→" width={16} height={16} />
        </button>

        {/* Séparateur */}
        <div className="w-full h-px bg-[rgba(26,107,220,0.12)]" />

        {/* Récompenses */}
        <div className="w-full flex flex-col gap-3">

          <div className="flex items-center gap-2">
            <div className="h-4 w-1 rounded bg-[linear-gradient(180deg,#1a6bdc,rgba(26,107,220,0.53))]" />
            <b className="uppercase tracking-[1px] text-[15px] text-[#e8eaf0]">
              Récompenses en cas de victoire
            </b>
          </div>

          {/* Carte S&D */}
          <div className="w-full rounded-[10px] bg-[rgba(10,22,40,0.7)] border border-[rgba(26,107,220,0.18)] p-4 flex flex-col gap-3">

            <div className="flex items-center gap-2">
              <Image src="/assets/IconRD5.svg" alt="S&D" width={28} height={28} className="rounded" />
              <b className="tracking-[0.6px] text-[#c5d8f0]">S&D</b>
            </div>

            <div className="flex flex-col gap-3 text-[11px] text-[#5b7fa8] font-[Inter]">

              <div className="flex items-center gap-2">
                <Image src="/assets/Iconxp.svg" alt="XP" width={11} height={11} />
                <b className="text-[#f59e0b] text-base">+30 pts</b>
              </div>

              <div className="flex items-center gap-2">
                <Image src="/assets/Iconstar.svg" alt="Star" width={11} height={11} />
                <b className="text-[#818cf8] text-base">+500 XP</b>
              </div>

            </div>
          </div>

          {/* Bonus actif */}
          <div className="w-full rounded-[10px] bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.2)] p-3 flex items-center gap-2 text-xs text-[#4ade80] font-[Inter]">
            <Image src="/assets/Iconstar2.svg" alt="Bonus" width={12} height={12} />
            <span>
              Bonus actif : XP ×2 → <b>+1 000 XP</b> ce match
            </span>
          </div>
        </div>

        {/* Mode classé uniquement */}
        <div className="w-full rounded-[10px] bg-[rgba(10,22,40,0.6)] border border-[rgba(26,107,220,0.15)] p-4 text-xs text-[#4a90d9]">
          <div className="flex items-center gap-2 mb-1">
            <Image src="/assets/Iconranked2.svg" alt="Ranked" width={13} height={13} />
            <b className="uppercase tracking-[1px]">Mode classé uniquement</b>
          </div>

          <p className="text-[#5b7fa8] font-[Inter] leading-[18px]">
            Les points et récompenses ne sont attribués qu'en cas de victoire en mode classé.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Sectionmarginranked3Mobile;
