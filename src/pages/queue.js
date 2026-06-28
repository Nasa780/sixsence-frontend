import { useEffect, useState } from "react";
import { getToken, isAuthenticated } from "../../utils/auth";

export default function QueuePage() {
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [inQueue, setInQueue] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
if (!isAuthenticated()) {
  window.location.href = "/";
  return;
}

const token = getToken();

    fetch("https://sixsence-backend.onrender.com/me", {
      headers: { Authorization: `Bearer ${getToken()}`
 },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUser(data);
        else window.location.href = "/";
      });

    fetch("https://sixsence-backend.onrender.com/queue/status", {
      headers: { Authorization: `Bearer ${getToken()}`
 },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.inQueue) {
          setInQueue(true);
          setTimeLeft(data.timeLeft || 30 * 60);
        }
      });

    fetch("https://sixsence-backend.onrender.com/queue/list", {
      headers: { Authorization: `Bearer ${getToken()}`
 },
    })
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data.players || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!inQueue || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [inQueue, timeLeft]);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  async function joinQueue() {
    const token = localStorage.getItem("token");
    const res = await fetch("https://sixsence-backend.onrender.com/queue/join", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`
,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (data.inQueue) {
      setInQueue(true);
      setTimeLeft(data.timeLeft || 30 * 60);
    }

    refreshPlayers();
  }

  async function leaveQueue() {
    const token = localStorage.getItem("token");
    await fetch("https://sixsence-backend.onrender.com/queue/leave", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`
,
        "Content-Type": "application/json",
      },
    });

    setInQueue(false);
    setTimeLeft(30 * 60);
    refreshPlayers();
  }

  function refreshPlayers() {
    const token = localStorage.getItem("token");
    fetch("https://sixsence-backend.onrender.com/queue/list", {
      headers: { Authorization: `Bearer ${getToken()}`
 },
    })
      .then((res) => res.json())
      .then((data) => setPlayers(data.players || []));
  }

  if (loading) {
    return (
      <div className="crt-scanlines crt-grain crt-warp crt-vibrate crt-glitch crt-flicker min-h-screen bg-black text-green-400 flex items-center justify-center font-mono tracking-widest">
        INITIALISATION<span className="blink">_</span>
      </div>
    );
  }

return (
  <div className="min-h-screen flex items-center justify-center bg-black text-sog-green font-sog crt-scanlines crt-grain">

    <div className="sog-panel w-[900px] crt-glitch crt-flicker">

      <h1 className="sog-title mb-8 text-center">
        ► MODE CLASSÉ : SND<span className="blink">_</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* PANEL GAUCHE */}
        <div>
          <h2 className="text-xl mb-4 text-sog-green tracking-widest">
            RECHERCHE & DESTRUCTION
          </h2>

          {inQueue ? (
            <>
              <p className="opacity-80 mb-2">TEMPS RESTANT :</p>
              <p className="text-6xl mb-6 text-sog-green tracking-widest">
                {formatTime(timeLeft)}
              </p>

              <div
                onClick={leaveQueue}
                className="sog-button bg-red-900/40 border-red-700 hover:bg-red-700/40"
              >
                QUITTER LA FILE
              </div>
            </>
          ) : (
            <>
              <p className="opacity-80 mb-4">TU N’ES PAS DANS LA FILE.</p>

              <div
                onClick={joinQueue}
                className="sog-button bg-green-900/40 border-green-700 hover:bg-green-700/40"
              >
                REJOINDRE LA FILE
              </div>
            </>
          )}

          {/* LISTE DES JOUEURS */}
          <div className="mt-10">
            <h3 className="text-lg mb-3 text-sog-green tracking-widest">
              JOUEURS DANS LA FILE :
            </h3>

            {players.length === 0 ? (
              <p className="opacity-60">AUCUN JOUEUR.</p>
            ) : (
              <ul className="space-y-2">
                {players.map((p) => (
                  <li
                    key={p.discord_id}
                    className="flex items-center gap-4 bg-black/30 p-3 border border-green-800 rounded-lg"
                  >
                    <img
                      src={p.avatar}
                      className="w-12 h-12 rounded-full border border-green-600"
                    />
                    <span className="truncate">{p.username}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* PANEL DROIT */}
        <div>
          <h2 className="text-xl mb-4 text-sog-green tracking-widest">
            CLASSIFICATION DES RANGS
          </h2>

          <ul className="space-y-1 opacity-90">
            <li>🏆 CHAMPION — 1000+ pts</li>
            <li>🔥 GRAND MAÎTRE — 750–1000 pts</li>
            <li>💎 MAÎTRE — 500–750 pts</li>
            <li>💠 DIAMANT — 400–500 pts</li>
            <li>🔷 PLATINE — 300–400 pts</li>
            <li>🟡 OR — 200–300 pts</li>
            <li>⚪ ARGENT — 100–200 pts</li>
            <li>🟤 BRONZE — 0–100 pts</li>
          </ul>

          <h3 className="text-lg mt-8 mb-3 text-sog-green tracking-widest">
            PÉNALITÉS DE DÉFAITE :
          </h3>

          <ul className="space-y-1 opacity-90">
            <li>🟤 Bronze : -10</li>
            <li>⚪ Argent : -12</li>
            <li>🟡 Or : -15</li>
            <li>🔷 Platine : -18</li>
            <li>💠 Diamant : -20</li>
            <li>💎 Maître : -22</li>
            <li>🔥 Grand Maître : -25</li>
            <li>🏆 Champion : -30</li>
          </ul>
        </div>
      </div>

      <a
        href="/"
        className="block text-center mt-10 opacity-70 hover:opacity-100 tracking-widest"
      >
        RETOUR
      </a>
    </div>
  </div>
);

}
