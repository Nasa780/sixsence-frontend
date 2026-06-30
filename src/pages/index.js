export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0B0812] flex justify-center items-center overflow-hidden">

      {/* FOND PRINCIPAL FIGMA */}
      <img
        src="/assets/HomePage.png"
        className="w-[2189px] h-[1304px]"
        alt="Six Sence Home"
      />

      {/* LOGO SIX SENCE (HEADER GAUCHE) */}
      <img
        src="/assets/SixSenceLogo.png"
        className="absolute"
        style={{
          left: "80px",
          top: "60px",
          width: "220px",
          height: "60px",
        }}
        alt="Six Sence Logo"
      />

      {/* BOUTON DISCORD (HEADER DROITE) */}
      <img
        src="/assets/Buttondiscord.png"
        className="absolute cursor-pointer"
        style={{
          right: "80px",
          top: "60px",
          width: "260px",
          height: "70px",
        }}
        onClick={() =>
          window.location.href = "https://sixsence-backend.onrender.com/auth/discord"
        }
        alt="Discord Header"
      />

      {/* BADGE SAISON 1 */}
      <img
        src="/assets/Saison 1 — Compétition Ouverte.png"
        className="absolute"
        style={{
          left: "260px",
          top: "160px",
          width: "420px",
          height: "60px",
        }}
        alt="Saison 1"
      />

      {/* TITRE SIX SENCE */}
      <img
        src="/assets/SIX SENCE.png"
        className="absolute"
        style={{
          left: "720px",
          top: "260px",
          width: "800px",
          height: "190px",
        }}
        alt="Six Sence Title"
      />

      {/* SOUS-TITRE */}
      <img
        src="/assets/Matchmaking structuré, mode Rank....png"
        className="absolute"
        style={{
          left: "720px",
          top: "390px",
          width: "780px",
          height: "60px",
        }}
        alt="Sous-titre"
      />

      {/* PARAGRAPHE */}
      <img
        src="/assets/La plateforme de compétition nouv....png"
        className="absolute"
        style={{
          left: "720px",
          top: "460px",
          width: "780px",
          height: "80px",
        }}
        alt="Paragraphe"
      />

      {/* BOUTON JOUEZ GRATUITEMENT (JAUNE) */}
      <img
        src="/assets/Buttonjaune.png"
        className="absolute cursor-pointer"
        style={{
          left: "720px",
          top: "560px",
          width: "320px",
          height: "80px",
        }}
        onClick={() => window.location.href = "/accueil"}
        alt="Jouez Gratuitement"
      />

      {/* BOUTON DISCORD (BLEU HERO) */}
      <img
        src="/assets/Buttonbleu.png"
        className="absolute cursor-pointer"
        style={{
          left: "1070px",
          top: "560px",
          width: "320px",
          height: "80px",
        }}
        onClick={() =>
          window.location.href = "https://sixsence-backend.onrender.com/auth/discord"
        }
        alt="Discord Hero"
      />

      {/* APP CARD (BAS GAUCHE) */}
      <img
        src="/assets/Containerapp.png"
        className="absolute"
        style={{
          left: "180px",
          top: "900px",
          width: "420px",
          height: "260px",
        }}
        alt="App Container"
      />

      <img
        src="/assets/Paragraphapplication.png"
        className="absolute"
        style={{
          left: "210px",
          top: "930px",
          width: "360px",
          height: "80px",
        }}
        alt="App Texte"
      />

      <img
        src="/assets/Buttonapp.png"
        className="absolute cursor-pointer"
        style={{
          left: "250px",
          top: "1040px",
          width: "280px",
          height: "70px",
        }}
        alt="Installer App"
      />
    </div>
  );
}
