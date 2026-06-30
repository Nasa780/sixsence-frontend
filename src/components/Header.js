import Image from "next/image";

export default function Header() {
  return (
    <header
      className="
        w-full
        h-[77px]
        flex
        flex-row
        items-center
        px-[20px]
        pt-[36px]
        pb-[20px]
      "
    >
      {/* Bloc gauche : Logo + Texte */}
      <div className="flex flex-row items-center gap-[10px]">
        <Image
          src="/assets/Icon.png"
          alt="Six Sence Icon"
          width={37}
          height={37}
        />

        <span className="text-white font-semibold tracking-[0.2em] text-[14px]">
          SIX SENCE
        </span>
      </div>

      {/* Bloc droit : Boutons */}
      <div className="ml-auto flex flex-row items-center gap-[20px]">
        <Image
          src="/assets/Buttonfr.png"
          alt="Bouton FR"
          width={80}
          height={30}
        />

        <Image
          src="/assets/Buttondiscord.png"
          alt="Bouton Discord"
          width={100}
          height={30}
        />
      </div>
    </header>
  );
}