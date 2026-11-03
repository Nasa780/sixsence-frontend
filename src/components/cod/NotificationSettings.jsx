import { useEffect, useState } from "react";
import { FaDiscord } from "react-icons/fa6";
import { LuBell, LuBellOff, LuLoaderCircle } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { disablePush, enablePush, isPushEnabled, pushSupport } from "../../lib/push";
import { Notice } from "../ui/Feedback";

/** Catégories que le joueur peut couper (mêmes clés que services/notificationPrefs.ts du backend). */
const CATEGORIES = [
  ["match_trouve", "Match trouvé", "L'alerte quand ton match commence, en Classé comme en Division"],
  ["match", "Déroulé des matchs", "Résultat déclaré, contestation, décision de l'équipe, fin du match"],
  ["file", "Recherche", "Recherche arrêtée, « Toujours là ? »"],
  ["equipe", "Équipe", "Invitations, candidatures, arrivées, défis, matchs programmés"],
  ["coupes", "Tournois", "Inscriptions, check-in, tirage, matchs et résultats des coupes"],
  ["cartes", "Cartes de visite", "Nouvelle carte obtenue"],
  ["gta", "GTA 6", "Nouveaux événements et rappels de ceux où tu es inscrit"],
];

function Switch({ on, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full border transition-colors disabled:opacity-40", on ? "border-gold bg-gold/80" : "border-white/20 bg-white/10")}
    >
      <span className={cn("absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-[left]", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

/**
 * « Mes notifications » (son propre profil) : notifications de cet appareil (activer, couper) et, catégorie par
 * catégorie, ce que le joueur reçoit en notification et en message privé Discord (GET|POST /push/preferences).
 */
export function NotificationSettings() {
  const [prefs, setPrefs] = useState(null);
  const [error, setError] = useState(null);
  const [support, setSupport] = useState(null);
  const [device, setDevice] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    api("/push/preferences").then(setPrefs, (caught) => setError(caught.message));
    setSupport(pushSupport());
    isPushEnabled().then(setDevice);
  }, []);

  async function change(channel, category, value) {
    const before = prefs;
    setPrefs({ ...prefs, [channel]: { ...prefs[channel], [category]: value } });
    setError(null);
    try {
      setPrefs(await api("/push/preferences", { method: "POST", body: { [channel]: { [category]: value } } }));
    } catch (caught) {
      setPrefs(before);
      setError(caught.message);
    }
  }

  async function toggleDevice() {
    setPending(true);
    setError(null);
    try {
      if (device) await disablePush();
      else await enablePush();
      setDevice(!device);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      {support === "ios-needs-install" ? (
        <p className="border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">Sur iPhone, installe l&apos;application SixSence (bouton « Installer l&apos;application ») pour recevoir les notifications.</p>
      ) : null}
      {support === "denied" ? (
        <p className="border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/60">Les notifications sont bloquées dans ton navigateur : autorise-les depuis l&apos;icône à gauche de l&apos;adresse, puis recharge la page.</p>
      ) : null}
      {support === "ok" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-white/70">
            {device ? <LuBell aria-hidden className="h-4 w-4 text-gold" /> : <LuBellOff aria-hidden className="h-4 w-4 text-white/40" />}
            {device ? "Notifications activées sur cet appareil." : "Notifications coupées sur cet appareil."}
          </p>
          <button
            type="button"
            onClick={toggleDevice}
            disabled={pending}
            className="inline-flex items-center gap-2 border border-gold/50 px-3 py-1.5 font-tech text-[10px] uppercase tracking-[0.18em] text-gold transition-colors hover:bg-gold/10 disabled:opacity-50"
          >
            {pending ? <LuLoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" /> : null}
            {device ? "Couper sur cet appareil" : "Activer sur cet appareil"}
          </button>
        </div>
      ) : null}

      {prefs ? (
        <div className="border border-white/10">
          <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-5 border-b border-white/10 bg-white/[0.04] px-4 py-2.5 font-tech text-[10px] uppercase tracking-[0.2em] text-white/45">
            <span>Ce que tu reçois</span>
            <span className="flex w-11 justify-center" title="Notification">
              <LuBell aria-label="Notification" className="h-4 w-4" />
            </span>
            <span className="flex w-11 justify-center" title="Message privé Discord">
              <FaDiscord aria-label="Message privé Discord" className="h-4 w-4" />
            </span>
          </div>
          <ul>
            {CATEGORIES.map(([key, label, hint]) => (
              <li key={key} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-5 border-b border-white/[0.06] px-4 py-3 last:border-b-0">
                <span className="min-w-0">
                  <span className="block font-display text-base font-bold uppercase leading-none tracking-wide">{label}</span>
                  <span className="mt-1 block text-xs leading-snug text-white/45">{hint}</span>
                </span>
                <Switch on={prefs.push[key]} onChange={(value) => change("push", key, value)} label={`${label} : notification`} />
                <Switch on={prefs.dm[key]} onChange={(value) => change("dm", key, value)} label={`${label} : message privé Discord`} />
              </li>
            ))}
          </ul>
        </div>
      ) : !error ? (
        <p className="text-sm text-white/45">Chargement…</p>
      ) : null}

      {error ? <Notice tone="error">{error}</Notice> : null}
      <p className="text-xs text-white/40">Les messages importants (sanctions, décisions sur ton compte ou ton équipe, messages de l&apos;équipe SixSence) arrivent toujours.</p>
    </div>
  );
}
