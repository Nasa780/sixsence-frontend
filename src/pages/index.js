import { useEffect, useState } from "react";
import { getToken, isAuthenticated } from "../../utils/auth";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);

    // 1) Récupérer le token dans l'URL
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, "", "/");
    }

    // 2) Charger l'utilisateur
    if (!isAuthenticated()) return;

    fetch("https://sixsence-backend.onrender.com/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUser(data);
      });
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center text-sog-green font-sog crt-scanlines crt-grain bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/maxresdefault.jpg')" }}
    >
      <div className="sog-panel w-[600px] crt-glitch crt-flicker text-center">
        <h1 className="sog-title mb-10">
          ► SIXSENCE OPERATIONS TERMINAL<span className="blink">_</span>
        </h1>

        {!user ? (
          <a
            href="https://sixsence-backend.onrender.com/auth/discord"
            className="sog-button block mx-auto w-[300px]"
          >
            ► SE CONNECTER AVEC DISCORD
          </a>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 mb-10">
              <img
                src={user.avatar}
                className="w-20 h-20 rounded-full border border-sog-green shadow-sog"
              />
              <p className="text-xl">
                CONNECTÉ : <span className="text-sog-green">{user.username}</span>
              </p>
            </div>

            <div className="space-y-4 mx-auto w-[300px] flex flex-col items-center">
              <a href="/queue" className="sog-button block w-full">
                ► MODE CLASSÉ
              </a>

              <a href="/profile" className="sog-button block w-full">
                ► PROFIL
              </a>

              <a href="/leaderboard" className="sog-button block w-full">
                ► CLASSEMENT
              </a>

              <a href="/settings" className="sog-button block w-full">
                ► PARAMÈTRES
              </a>

              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.reload();
                }}
                className="sog-button block w-full text-red-400 border-red-600 hover:bg-red-900/40"
              >
                ► DÉCONNEXION
              </button>
            </div>
          </>
        )}

        <p className="opacity-60 mt-10 text-sm">
          SOG BUNKER SYSTEM — ACCESS LEVEL 3
        </p>
      </div>
    </div>
  );
}
