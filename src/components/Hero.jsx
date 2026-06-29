export default function Hero() {
  return (
    <section className="flex flex-col items-center mt-10">

      {/* TITLE */}
      <h1 className="font-raj font-bold text-[168px] leading-[148px] tracking-hero uppercase bg-heroText bg-clip-text text-transparent text-center">
        SIX SENCE
      </h1>

      {/* SUBTITLE */}
      <p className="font-raj font-semibold text-[15.68px] leading-[24px] tracking-sub uppercase text-whiteDim text-center mt-4">
        Matchmaking structuré, mode Ranked, progression réelle.
      </p>

      {/* PARAGRAPH */}
      <p className="font-inter text-[14.08px] leading-[25px] text-whiteSoft text-center w-[349px] mt-4">
        La plateforme de compétition nouvelle génération.
      </p>

      {/* CTA BUTTONS */}
      <div className="flex gap-4 mt-10">
        <button className="px-8 py-3 bg-white text-black font-raj font-bold rounded-[3px] shadow">
          Créer un compte
        </button>

        <button className="px-8 py-3 bg-accent text-black font-raj font-bold rounded-[3px] shadow-accent">
          Télécharger l'application
        </button>
      </div>
    </section>
  );
}
