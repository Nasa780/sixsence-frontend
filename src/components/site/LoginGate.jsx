import Image from "next/image";
import { signInWithDiscord } from "../../lib/auth";
import { GoldButton } from "./ui";

/**
 * Encadré « Connecte-toi pour jouer », repris tel quel de la page Ranked.
 * Affiché à la place d'une action réservée aux joueurs connectés.
 */
export default function LoginGate({
  title = "Connecte-toi pour jouer",
  text = "Tu dois être connecté avec Discord pour accéder au mode classé.",
  next,
}) {
  return (
    <div className="w-full bg-[rgba(201,162,39,0.22)] p-px box-border">
      <div className="bg-[rgba(201,162,39,0.06)] flex items-center flex-wrap py-8 px-10 gap-6 max-sm:px-5 max-sm:py-6">
        <div className="w-[46px] h-[46px] bg-[rgba(201,162,39,0.18)] flex items-center justify-center shrink-0">
          <Image className="h-5 w-5" width={20} height={20} alt="" src="/assets/Iconbouclier.svg" />
        </div>
        <div className="flex-1 min-w-[220px]">
          <h3 className="m-0 text-xl tracking-[0.4px] leading-[30px] font-bold font-[Rajdhani] text-[#e8eaf0]">{title}</h3>
          <p className="m-0 pt-1 text-sm text-[#6b7d94] font-[Inter] leading-[21px]">{text}</p>
        </div>
        <GoldButton onClick={() => signInWithDiscord(next)}>Se connecter avec Discord</GoldButton>
      </div>
    </div>
  );
}
