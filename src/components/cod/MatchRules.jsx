import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  LuArrowDown,
  LuBan,
  LuCheck,
  LuChevronDown,
  LuCrosshair,
  LuEye,
  LuFilm,
  LuHeartPulse,
  LuListChecks,
  LuServerCrash,
  LuSettings2,
  LuShield,
  LuSwords,
  LuTriangleAlert,
  LuUsers,
  LuVideo,
  LuWifiOff,
  LuX,
} from "react-icons/lu";
import { cn } from "../../lib/cn";
import { BANNED_SHORT, CONDUCT, ESSENTIALS, LOADOUT, MATCH_FORMATS, PERKS, roundsToWin, settingsTabs, settingsToChange } from "../../lib/matchRules";

/**
 * Règles de match MW4 (lib/matchRules) : l'essentiel, les paramètres de la partie privée façon menu du jeu (avec la liste
 * à cocher de l'hôte), la classe autorisée et la conduite en match. Utilisées dans le règlement et sur les feuilles de match.
 * Pas de <ul>/<li> : le règlement les habille en puces (legal-prose).
 */

const ESSENTIAL_ICONS = { format: LuSwords, hardcore: LuHeartPulse, weapons: LuCrosshair, perks: LuShield, disconnect: LuWifiOff, banned: LuBan };
const CONDUCT_ICONS = { glitch: LuTriangleAlert, snaking: LuEye, disconnect: LuWifiOff, host: LuServerCrash, settings: LuSettings2, proof: LuFilm, cam: LuVideo, roster: LuUsers };

export function RulesEssentials() {
  return (
    <div role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {ESSENTIALS.map(({ key, title, lines }) => {
        const Icon = ESSENTIAL_ICONS[key];
        return (
          <div role="listitem" key={key} className="clip-tactical border border-white/10 bg-white/[0.03] p-4 [--cut:12px]">
            <Icon aria-hidden className="h-5 w-5 text-gold" />
            <p className="mt-3 font-display text-lg font-black uppercase leading-none text-white">{title}</p>
            <div className="mt-2 space-y-0.5 text-[13px] leading-snug text-white/60">
              {lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Paramètres de la partie privée. bestOf fixé (feuille de match) ou choisi par onglets (règlement) ;
 * le Mode hôte (liste à cocher) est facultatif.
 */
export function MatchSettings({ bestOf: fixedBestOf = null }) {
  const [format, setFormat] = useState(MATCH_FORMATS[0]);
  const [tab, setTab] = useState("JEU");
  const [host, setHost] = useState(false);
  const [done, setDone] = useState({});
  const bestOf = fixedBestOf ?? format.bestOf;
  const tabs = settingsTabs(bestOf);
  const current = tabs.find((item) => item.id === tab);
  const toSet = settingsToChange(bestOf);
  const doneCount = toSet.filter((row) => done[row.label]).length;

  return (
    <div>
      <p className="text-sm text-white/60">
        Mode <strong className="text-white">CDL Recherche et destruction</strong>, {roundsToWin(bestOf)} manches à gagner. Seuls les{" "}
        <span className="text-gold">{toSet.length} réglages en or</span> changent : tout le reste reste par défaut.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {fixedBestOf === null
          ? MATCH_FORMATS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === format.id}
                onClick={() => setFormat(item)}
                className={cn("clip-slant px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em]", item.id === format.id ? "text-ink" : "bg-white/[0.05] text-white/60 hover:text-white")}
                style={item.id === format.id ? { background: item.color } : undefined}
              >
                {item.label}
              </button>
            ))
          : null}
        <button
          type="button"
          aria-pressed={host}
          onClick={() => setHost((value) => !value)}
          className={cn(
            "ml-auto flex items-center gap-2 border px-4 py-2 font-tech text-xs uppercase tracking-[0.2em] transition-colors",
            host ? "border-gold bg-gold/15 text-gold" : "border-white/15 text-white/70 hover:border-gold/50 hover:text-white",
          )}
        >
          <LuListChecks aria-hidden className="h-4 w-4" />
          {host ? `Mode hôte · ${doneCount}/${toSet.length}` : "Mode hôte"}
        </button>
      </div>

      {host ? (
        <div className="mt-4 border border-gold/40 bg-gold/[0.04] p-3 sm:p-4">
          <div className="h-1.5 w-full bg-white/10">
            <div className={cn("h-full transition-all duration-500", doneCount === toSet.length ? "bg-win" : "bg-gold")} style={{ width: `${(doneCount / toSet.length) * 100}%` }} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {toSet.map((row) => {
              const checked = Boolean(done[row.label]);
              return (
                <button
                  key={row.label}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => setDone((value) => ({ ...value, [row.label]: !value[row.label] }))}
                  className={cn("flex w-full items-center gap-3 border px-3 py-2.5 text-left transition-colors", checked ? "border-win/50 bg-win/10" : "border-white/10 bg-black/30 hover:border-white/25")}
                >
                  <span className={cn("grid h-5 w-5 shrink-0 place-items-center border", checked ? "border-win bg-win text-ink" : "border-white/30")}>
                    {checked ? <LuCheck aria-hidden className="h-3.5 w-3.5" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-tech text-[10px] uppercase tracking-[0.2em] text-white/40">{row.tab}</span>
                    <span className={cn("block text-sm leading-snug", checked ? "text-white/50 line-through" : "text-white")}>{row.label}</span>
                  </span>
                  <span className="shrink-0 font-display text-base font-bold text-gold">{row.set}</span>
                </button>
              );
            })}
          </div>
          {doneCount === toSet.length ? (
            <p className="mt-4 font-display text-lg font-black uppercase text-win">Partie prête : invitez les joueurs.</p>
          ) : (
            <p className="mt-4 text-xs text-white/45">Ne jamais activer le Mode Hardcore (onglet Gameplay) : le jeu plante.</p>
          )}
        </div>
      ) : (
        <div className="mt-4 border border-white/10 bg-[#0b0d10]">
          {/* Onglets du menu de la partie privée */}
          <div role="tablist" aria-label="Onglets du menu" className="flex overflow-x-auto border-b border-white/10 bg-black/40">
            {tabs.map((item) => {
              const changes = item.rows.filter((row) => row.set).length;
              const active = item.id === tab;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={cn("flex shrink-0 items-center gap-2 px-4 py-3 font-tech text-sm font-bold tracking-[0.18em] sm:px-5", active ? "bg-[#ece7da] text-ink" : "text-white/55 hover:text-white")}
                >
                  {item.id}
                  {changes ? <span className={cn("grid h-5 min-w-5 place-items-center px-1 text-[10px]", active ? "bg-ink text-gold" : "bg-gold text-ink")}>{changes}</span> : null}
                </button>
              );
            })}
          </div>
          <div role="tabpanel" className="divide-y divide-white/[0.06]">
            {current.rows.map((row) => (
              <div key={row.label} className={cn("flex items-center gap-3 px-3 py-3 sm:gap-4 sm:px-5", row.set && "bg-linear-to-r from-gold/[0.12] to-transparent")}>
                <span aria-hidden className={cn("h-6 w-0.5 shrink-0", row.set && "bg-gold")} />
                <span className={cn("min-w-0 flex-1 text-[15px] leading-snug", row.set ? "text-white" : "text-white/45")}>
                  {row.label}
                  {row.lock ? <span className="mt-0.5 block font-tech text-[10px] uppercase tracking-[0.18em] text-loss">{row.lock}</span> : null}
                </span>
                <span className="shrink-0 text-right">
                  {row.set ? <span className="mr-3 hidden text-xs text-white/30 line-through sm:inline">{row.def}</span> : null}
                  <span className={cn("font-tech text-[15px] font-bold", row.set ? "text-gold" : row.lock ? "text-loss" : "text-white/55")}>{row.set ?? row.def}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RulesLoadout() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LOADOUT.map((group) => (
        <div key={group.title} className="border border-white/10 bg-white/[0.02] p-4">
          <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">{group.title}</p>
          <div className="mt-3 space-y-1.5">
            {group.items.map(([name, ok, note]) => (
              <div key={name} className={cn("flex items-center gap-3 px-3 py-2", ok ? "bg-win/[0.07]" : "bg-loss/[0.07]")}>
                {ok ? <LuCheck aria-label="Autorisé" className="h-4 w-4 shrink-0 text-win" /> : <LuX aria-label="Interdit" className="h-4 w-4 shrink-0 text-loss" />}
                <span className={cn("flex-1 text-sm leading-snug", ok ? "text-white" : "text-white/50 line-through decoration-loss/60")}>{name}</span>
                {note ? <span className="text-right text-[11px] leading-tight text-white/45">{note}</span> : null}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="border border-gold/30 bg-gold/[0.04] p-4 sm:col-span-2">
        <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-gold">Atouts imposés</p>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {PERKS.map(([slot, name]) => (
            <div key={slot} className="clip-slant bg-black/40 px-3 py-3 sm:px-4">
              <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-white/40">{slot}</p>
              <p className="font-display text-base font-black uppercase leading-tight text-white sm:text-xl">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RulesConduct() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {CONDUCT.map(({ key, title, text }) => {
        const Icon = CONDUCT_ICONS[key];
        return (
          <div key={key} className="border-l-2 border-gold/50 bg-white/[0.03] p-4">
            <p className="flex items-center gap-2 font-display text-base font-black uppercase text-white">
              <Icon aria-hidden className="h-4 w-4 text-gold" />
              {title}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/60">{text}</p>
          </div>
        );
      })}
    </div>
  );
}

const OPEN_RULES = "sixsence:ouvrir-regles";

/** Lien « Réglages de la partie » du lancement du match : descend jusqu'au bloc des règles (en bas) et l'ouvre. */
export function RulesLink({ className }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_RULES))}
      className={cn(
        "group/regles clip-slant inline-flex items-center gap-2 bg-gold/15 px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.12em] text-gold transition-colors hover:bg-gold hover:text-ink",
        className,
      )}
    >
      <LuSettings2 aria-hidden className="h-4 w-4" />
      Voir les réglages
      <LuArrowDown aria-hidden className="h-4 w-4 transition-transform group-hover/regles:translate-y-0.5" />
    </button>
  );
}

/**
 * Bloc repliable « Règles du match » d'une feuille de match, placé en bas pour ne pas cacher la feuille sur téléphone :
 * en-tête bien visible (pastille, titre, Voir / Masquer), replié d'office avec le rappel des interdits ; RulesLink (lancement
 * du match) y descend et l'ouvre. Le Mode hôte reste facultatif.
 */
export function MatchRulesCard({ bestOf = 1, isHost = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const show = () => {
      setOpen(true);
      requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    };
    window.addEventListener(OPEN_RULES, show);
    return () => window.removeEventListener(OPEN_RULES, show);
  }, []);
  return (
    <div ref={ref} className="scroll-mt-24 border border-l-4 border-gold/40 border-l-gold bg-ink/60">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="group flex w-full items-center gap-4 bg-linear-to-r from-gold/[0.14] via-gold/[0.04] to-transparent px-4 py-4 text-left sm:px-5"
      >
        <span aria-hidden className="clip-tactical grid h-12 w-12 shrink-0 place-items-center bg-gold text-ink [--cut:8px]">
          <LuSettings2 className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-tech text-[10px] uppercase tracking-[0.3em] text-gold">Règles du match</span>
          <span className="mt-1 block font-display text-2xl font-black uppercase leading-none sm:text-3xl">{isHost ? "Ta partie privée à régler" : "Paramètres de la partie"}</span>
          <span className="mt-1.5 block text-xs text-white/55">
            {settingsToChange(bestOf).length} réglages · {roundsToWin(bestOf)} manches à gagner · classe et atouts imposés
          </span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 border border-gold/50 px-3 py-2 font-tech text-[11px] uppercase tracking-[0.2em] text-gold transition-colors group-hover:bg-gold/10 sm:inline-flex">
          {open ? "Masquer" : "Voir les règles"}
          <LuChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </span>
        <LuChevronDown aria-hidden className={cn("h-5 w-5 shrink-0 text-gold transition-transform sm:hidden", open && "rotate-180")} />
      </button>
      <div className="flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] px-4 py-3 sm:px-5">
        <span className="mr-1 font-tech text-[10px] uppercase tracking-[0.2em] text-loss">Interdit</span>
        {BANNED_SHORT.map((item) => (
          <span key={item} className="bg-loss/10 px-2 py-0.5 text-[11px] text-white/70">
            {item}
          </span>
        ))}
        <span className="ml-1 font-tech text-[10px] uppercase tracking-[0.2em] text-win">Atouts</span>
        {PERKS.map(([slot, name]) => (
          <span key={slot} className="bg-win/10 px-2 py-0.5 text-[11px] text-white/70">
            {name}
          </span>
        ))}
      </div>
      {open ? (
        <div className="border-t border-white/[0.06] p-4 sm:p-5">
          <MatchSettings bestOf={bestOf} />
          <p className="mt-4 text-xs text-white/45">
            Classe complète, glitchs, déconnexions :{" "}
            <Link href="/reglement#regles-classe" className="text-gold underline underline-offset-4">
              règles de match
            </Link>
            .
          </p>
        </div>
      ) : null}
    </div>
  );
}
