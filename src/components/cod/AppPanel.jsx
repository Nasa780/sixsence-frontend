import { useEffect, useState } from "react";
import { LuBell, LuBellOff, LuDownload, LuLoaderCircle, LuSmartphone } from "react-icons/lu";
import { disablePush, enablePush, isIos, isPushEnabled, isStandalone, pushSupport } from "../../lib/push";
import { Button } from "../ui/Button";
import { TacticalCard } from "../ui/TacticalCard";

/**
 * « Ne rate plus aucun match » : installer l'appli et activer les notifications
 * (match trouvé, rappels d'événements GTA), même site fermé.
 */
export function AppPanel() {
  const [support, setSupport] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setSupport(pushSupport());
    setInstalled(isStandalone());
    isPushEnabled().then(setEnabled);
    // Chrome / Edge / Android : proposition d'installation gardée pour le bouton.
    const onPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
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

  async function install() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setInstallPrompt(null);
  }

  if (support === null) return null;
  const iosHelp = isIos() && !installed;

  return (
    <TacticalCard cut={20} className="mt-6" innerClassName="p-6">
      <p className="flex items-center gap-2 font-display text-2xl font-black uppercase leading-none">
        <LuSmartphone aria-hidden className="h-5 w-5 text-gold" />
        Ne rate plus aucun match
      </p>
      <p className="mt-2 max-w-xl text-sm text-white/55">
        Installe l&apos;appli SixSence et active les notifications : ton téléphone sonne quand ton match est trouvé, même si le site est
        fermé.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {installPrompt && !installed ? (
          <Button variant="outline" onClick={install}>
            <LuDownload aria-hidden className="h-4 w-4" />
            Installer l&apos;appli
          </Button>
        ) : null}
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

      {iosHelp ? (
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-white/60">
          <li>Dans Safari, touche le bouton Partager (carré avec une flèche).</li>
          <li>Choisis « Sur l&apos;écran d&apos;accueil », puis « Ajouter ».</li>
          <li>Ouvre SixSence depuis l&apos;écran d&apos;accueil et active les notifications ici.</li>
        </ol>
      ) : null}
      {support === "denied" && !enabled ? (
        <p className="mt-3 text-sm text-loss">Les notifications sont bloquées pour ce site : autorise-les dans les réglages du navigateur.</p>
      ) : null}
      {support === "unsupported" && !iosHelp ? <p className="mt-3 text-sm text-white/45">Ce navigateur ne gère pas les notifications.</p> : null}
      {message ? (
        <p className={`mt-3 text-sm ${message.tone === "error" ? "text-loss" : message.tone === "success" ? "text-win" : "text-white/55"}`}>{message.text}</p>
      ) : null}
    </TacticalCard>
  );
}
