export default function WindowsCard() {
  return (
    <section className="w-[400px] mx-auto mt-20 bg-[#0B0B12] rounded-[6px] p-6 flex flex-col items-center">

      {/* TITLE */}
      <div className="flex gap-2 mb-4">
        <span className="font-raj font-bold text-[11.2px] tracking-small uppercase text-white">
          Application
        </span>
        <span className="font-raj font-semibold text-[11.2px] tracking-small uppercase text-[rgba(255,255,255,0.4)]">
          Windows
        </span>
      </div>

      {/* BUTTON */}
      <button className="w-[202px] h-[34.8px] bg-accent rounded-[3px] shadow-accent font-raj font-bold uppercase">
        Installer l'application
      </button>
    </section>
  );
}
