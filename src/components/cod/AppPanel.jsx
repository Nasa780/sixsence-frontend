import { useEffect, useState } from "react";
import { LuBell, LuBellOff, LuLoaderCircle, LuSmartphone } from "react-icons/lu";
import { disablePush, enablePush, isPushEnabled, pushSupport } from "../../lib/push";
import { Button } from "../ui/Button";
import { InstallButton } from "../ui/InstallButton";
import { TacticalCard } from "../ui/TacticalCard";

/**
 * « Ne rate plus aucun match » (variant="gta" : « Ne rate aucun événement ») : installer
 * l'appli et activer les notifications (match trouvé, événements GTA), même site fermé.
 * L'installation passe par InstallButton (un clic, ou marche à suivre selon le navigateur).
 */
export function AppPanel({ variant = "cod", className = "mt-6" }) {
  const gta = variant === "gta";
  const [support, setSupport] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setSupport(pushSupport());
    isPushEnabled().then(setEnabled);
  }, []);

  async function toggle() {
    setPending(true);
    setMessage(null);
    try {
      if (enabled) {
        await disablePush();
        setEnabled(false);
        setMessage({ tone: "info", text: "Notifications désactivées sur cet appareil." });
      } else {
        await enablePush();
        setEnabled(true);
        setMessage({ tone: "success", text: "C'est activé : tu seras prévenu même site fermé." });
      }
    } catch (caught) {
      setMessage({ tone: "error", text: caught.message });
    } finally {
      setPending(false);
    }
  }

  if (support === null) return null;

  return (
    <TacticalCard cut={20} className={className} innerClassName="p-6">
      <p className="flex items-center gap-2 font-display text-2xl font-black uppercase leading-none">
        <LuSmartphone aria-hidden className="h-5 w-5 text-gold" />
        {gta ? "Ne rate aucun événement" : "Ne rate plus aucun match"}
      </p>
      <p className="mt-2 max-w-xl text-sm text-white/55">
        {gta
          ? "Installe l'appli SixSence et active les notifications : tu es prévenu des nouveaux événements GTA 6 et 1 h avant ceux où tu es inscrit, même si le site est fermé."
          : "Installe l'appli SixSence et active les notifications : ton téléphone sonne quand ton match est trouvé, même si le site est fermé."}
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <InstallButton />
        {support === "ok" || support === "denied" ? (
          <Button variant={enabled ? "ghost" : "primary"} onClick={toggle} disabled={pending || (support === "denied" && !enabled)}>
            {pending ? (
              <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
            ) : enabled ? (
              <LuBellOff aria-hidden className="h-4 w-4" />
            ) : (
              <LuBell aria-hidden className="h-4 w-4" />
            )}
            {enabled ? "Désactiver les notifications" : "Activer les notifications"}
          </Button>
        ) : null}
      </div>

      {support === "ios-needs-install" ? (
        <p className="mt-3 text-sm text-white/55">Sur iPhone, les notifications s&apos;activent depuis l&apos;appli installée : installe-la d&apos;abord.</p>
      ) : null}
      {support === "denied" && !enabled ? (
        <p className="mt-3 text-sm text-loss">Les notifications sont bloquées pour ce site : autorise-les dans les réglages du navigateur.</p>
      ) : null}
      {support === "unsupported" ? <p className="mt-3 text-sm text-white/45">Ce navigateur ne gère pas les notifications.</p> : null}
      {message ? (
        <p className={`mt-3 text-sm ${message.tone === "error" ? "text-loss" : message.tone === "success" ? "text-win" : "text-white/55"}`}>{message.text}</p>
      ) : null}
    </TacticalCard>
  );
}
