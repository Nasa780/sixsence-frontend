import { FaDiscord } from "react-icons/fa6";
import { LuShieldCheck } from "react-icons/lu";
import { signInWithDiscord } from "../../lib/auth";
import { Button } from "./Button";
import { TacticalCard } from "./TacticalCard";

/**
 * Encadré « connecte-toi » : affiché à la place d'une action réservée aux
 * joueurs connectés (le reste de la page reste visible par tous).
 */
export function LoginPrompt({
  title = "Connecte-toi pour jouer",
  text = "La file classée est réservée aux joueurs connectés avec Discord.",
  next,
  className = "",
}) {
  return (
    <TacticalCard highlight cut={24} className={className} innerClassName="holo overflow-hidden p-6 sm:p-10">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--color-gold)_16%,transparent),transparent_60%)]" />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <LuShieldCheck aria-hidden className="mt-1 h-8 w-8 shrink-0 text-gold" />
          <div>
            <h2 className="font-display text-3xl font-black uppercase leading-none sm:text-4xl">{title}</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/60">{text}</p>
          </div>
        </div>
        <Button size="lg" onClick={() => signInWithDiscord(next)} className="shrink-0">
          <FaDiscord aria-hidden className="h-5 w-5" />
          Se connecter avec Discord
        </Button>
      </div>
    </TacticalCard>
  );
}
