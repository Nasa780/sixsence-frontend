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
        justify-between
        px-[36px]
        py-[20px]
      "
    >
      {/* Bloc gauche : Logo + Texte */}
      <div className="flex flex-row items-center gap-[10px]">
        <Image
          src="/SixSenceLogo.png"
          alt="Six Sence Logo"
          width={37}
          height={37}
        />

        <span className="text-white font-semibold tracking-[0.2em] text-[14px]">
          SIX SENCE
        </span>
      </div>

      {/* Bloc droit : Boutons */}
      <div className="flex flex-row items-center gap-[20px]">
        <Image
          src="/Buttonfr.png"
          alt="Bouton FR"
          width={120}
          height={40}
        />

        <Image
          src="/Buttondiscord.png"
          alt="Bouton Discord"
          width={120}
          height={40}
        />
      </div>
    </header>
  );
}
