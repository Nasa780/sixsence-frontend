import { useEffect } from "react";
import { getUser } from "../../utils/auth";

export default function Callback() {

  useEffect(() => {
    getUser()
      .then(user => {
        console.log("🔥 USER CONNECTÉ :", user);
        window.location.href = "/"; // retour sur la Home
      })
      .catch(() => {
        console.log("❌ PAS CONNECTÉ");
        window.location.href = "/"; // retour même si pas connecté
      });
  }, []);

  return (
    <div className="text-white text-center mt-20">
      Connexion en cours...
    </div>
  );
}
