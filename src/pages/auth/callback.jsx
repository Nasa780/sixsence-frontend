import { useEffect } from "react";

export default function Callback() {

  useEffect(() => {
    // 1) Lire le token dans l’URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      console.log("❌ Aucun token dans l’URL");
      window.location.href = "/";
      return;
    }

    // 2) Stocker le token dans localStorage
    localStorage.setItem("session", token);

    // 3) Vérifier le token immédiatement
    fetch("https://sixsence-backend.onrender.com/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(user => {
        console.log("🔥 USER CONNECTÉ :", user);
        window.location.href = "/";
      })
      .catch(() => {
        console.log("❌ Token invalide");
        window.location.href = "/";
      });

  }, []);

  return (
    <div className="text-white text-center mt-20">
      Connexion en cours...
    </div>
  );
}
