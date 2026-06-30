export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#0B0812] flex justify-center items-center overflow-x-auto">

      {/* TON FIGMA PARFAIT */}
      <img
        src="/assets/landing.png"
        className="w-[2189px] h-[1304px]"
        alt="Six Sence Landing"
      />

      {/* BOUTON DISCORD (HEADER) */}
      <div
        className="absolute cursor-pointer"
        style={{
          left: "1850px",
          top: "40px",
          width: "200px",
          height: "70px",
        }}
        onClick={() =>
          window.location.href = "https://sixsence-backend.onrender.com/auth/discord"
        }
      />

      {/* BOUTON JOUEZ GRATUITEMENT */}
      <div
        className="absolute cursor-pointer"
        style={{
          left: "730px",
          top: "520px",
          width: "300px",
          height: "70px",
        }}
        onClick={() => window.location.href = "/accueil"}
      />

      {/* BOUTON DISCORD (BLEU) */}
      <div
        className="absolute cursor-pointer"
        style={{
          left: "730px",
          top: "600px",
          width: "300px",
          height: "70px",
        }}
        onClick={() =>
          window.location.href = "https://sixsence-backend.onrender.com/auth/discord"
        }
      />

    </div>
  );
}
