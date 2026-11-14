import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuClock, LuCornerDownLeft, LuFileText, LuLoaderCircle, LuSearch, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED, MY_MATCHES_ENABLED } from "../../lib/config";
import { rankFor, rankGradient } from "../../lib/ranks";
import { RankEmblem } from "../cod/RankEmblem";
import { TeamCrest } from "../teams/TeamParts";
import { Avatar } from "../ui/Avatar";
import { Portal } from "../ui/Portal";

/** Pages proposées (et retrouvées par leur nom). */
const PAGES = [
  { href: "/admin", label: "Administration", keywords: "admin contestations signalements sanctions" },
  { href: "/cod/ranked", label: "File classée", keywords: "classe jouer file recherche" },
  { href: "/cod/leaderboard", label: "Classement", keywords: "classement joueurs top" },
  ...(MY_MATCHES_ENABLED ? [{ href: "/cod/matchs", label: "Mes matchs", keywords: "historique matchs" }] : []),
  { href: "/cod/profile", label: "Mon profil", keywords: "profil compte activision" },
  ...(MATCH_TEAM_ENABLED
    ? [
        { href: "/cod/division", label: "File Division", keywords: "division equipe match" },
        { href: "/cod/equipes", label: "Classement des équipes", keywords: "division equipes classement" },
        { href: "/cod/equipe", label: "Mon équipe", keywords: "equipe team" },
        { href: "/cod/tournoi", label: "Coupe Horus", keywords: "coupe horus tournoi trophee" },
        { href: "/cod/tournoi?coupe=anubis", label: "Coupe Anubis", keywords: "coupe anubis solo medaille tournoi" },
      ]
    : []),
  { href: "/gta6/events", label: "Événements GTA 6", keywords: "gta evenements" },
  { href: "/reglement", label: "Règlement", keywords: "regles reglement" },
  { href: "/renommee", label: "Renommée", keywords: "bureau des legendes hall of fame champions records mvp" },
  { href: "/nouveautes", label: "Nouveautés", keywords: "mises a jour changelog nouveautes" },
  { href: "/calendrier", label: "Calendrier", keywords: "agenda trophees coupes evenements" },
];
const RECENT_KEY = "sixsence-recherches";
const plain = (text) => text.normalize("NFKD").toLowerCase().replace(/[^a-z0-9 ]/g, "");

function readRecent() {
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]").slice(0, 5);
  } catch {
    return [];
  }
}
function saveRecent(item) {
  try {
    const next = [item, ...readRecent().filter((x) => x.href !== item.href)].slice(0, 5);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible : rien à garder */
  }
}

/**
 * Recherche rapide de l'équipe SixSence (admin, staff, arbitres ; affichée par la Navbar) : loupe et Ctrl+K
 * (ou Cmd+K). Joueurs (pseudo, même stylisé, ou identifiant Activision), équipes (nom ou tag) et pages,
 * pendant la frappe ; flèches, Entrée, Échap ; dernières recherches.
 */
export function GlobalSearch({ iconOnly = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    const close = () => setOpen(false);
    router.events.on("routeChangeStart", close);
    return () => router.events.off("routeChangeStart", close);
  }, [router.events]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Rechercher (Ctrl K)"
        title="Rechercher (Ctrl K)"
        className={iconOnly ? "grid h-9 w-9 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/[0.08] hover:text-white" : "group flex h-10 items-center gap-2 whitespace-nowrap px-2.5 text-white/70 transition-colors hover:text-gold lg:border lg:border-white/10 lg:bg-white/[0.03] lg:hover:border-gold/40"}
      >
        <LuSearch aria-hidden className={iconOnly ? "h-[18px] w-[18px]" : "h-5 w-5 lg:h-4 lg:w-4"} />
        {iconOnly ? null : <kbd className="hidden font-tech text-[9px] text-white/40 2xl:inline">Ctrl K</kbd>}
      </button>
      <AnimatePresence>{open ? <SearchDialog onClose={() => setOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}

function SearchDialog({ onClose }) {
  const router = useRouter();
  const input = useRef(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState({ players: [], teams: [] });
  const [pending, setPending] = useState(false);
  const [active, setActive] = useState(0);
  const [recent] = useState(readRecent);

  useEffect(() => {
    input.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Recherche pendant la frappe (après 200 ms sans frappe).
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResult({ players: [], teams: [] });
      setPending(false);
      return undefined;
    }
    setPending(true);
    let alive = true;
    const timer = setTimeout(() => {
      api(`/search?q=${encodeURIComponent(term)}`)
        .then((data) => alive && setResult(data))
        .catch(() => alive && setResult({ players: [], teams: [] }))
        .finally(() => alive && setPending(false));
    }, 200);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [query]);

  const pages = useMemo(() => {
    const term = plain(query.trim());
    if (!term) return PAGES.slice(0, 6);
    return PAGES.filter((page) => plain(`${page.label} ${page.keywords}`).includes(term)).slice(0, 4);
  }, [query]);

  // Liste à plat pour le clavier.
  const items = useMemo(() => {
    const list = [];
    if (!query.trim()) for (const item of recent) list.push({ ...item, type: "recent" });
    for (const player of result.players) list.push({ type: "player", href: `/cod/profile/${player.id}`, label: player.username, player });
    for (const team of result.teams) list.push({ type: "team", href: `/cod/equipes/${team.id}`, label: team.name, team });
    for (const page of pages) list.push({ type: "page", href: page.href, label: page.label });
    return list;
  }, [query, recent, result, pages]);

  useEffect(() => setActive(0), [items.length, query]);

  const go = useCallback(
    (item) => {
      if (!item) return;
      saveRecent({ href: item.href, label: item.label, kind: item.type === "recent" ? item.kind : item.type });
      onClose();
      router.push(item.href);
    },
    [onClose, router],
  );

  function onKeyDown(event) {
    if (event.key === "Escape") onClose();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(items[active]);
    }
  }

  const section = (type) => items.map((item, index) => ({ item, index })).filter(({ item }) => item.type === type);
  const empty = query.trim().length >= 2 && !pending && result.players.length === 0 && result.teams.length === 0 && pages.length === 0;

  return (
    <Portal>
      <motion.div
        className="fixed inset-0 z-[80] flex items-start justify-center bg-black/70 px-4 pt-[10vh] backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Recherche"
          initial={{ opacity: 0, y: -16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-xl overflow-hidden border border-[#e7c05a]/35 bg-ink-800 shadow-2xl shadow-black/70 [clip-path:polygon(16px_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%,0_16px)]"
        >
          {/* Ambiance : grille tactique fine et lueur dorée en haut. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
          <div aria-hidden className="pointer-events-none absolute -top-20 left-1/2 h-40 w-4/5 -translate-x-1/2 rounded-full bg-[#e7c05a]/12 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#e7c05a] to-transparent" />
          <div className="relative flex items-center gap-3 border-b border-white/10 px-5">
            {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 shrink-0 animate-spin text-[#e7c05a]" /> : <LuSearch aria-hidden className="h-5 w-5 shrink-0 text-[#e7c05a]" />}
            <input
              ref={input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Pseudo, ID Activision, équipe, page…"
              aria-label="Rechercher un joueur, une équipe ou une page"
              maxLength={40}
              className="h-[4.25rem] min-w-0 flex-1 bg-transparent font-display text-xl font-bold tracking-[0.04em] text-white placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:tracking-normal placeholder:text-white/30 focus:outline-none"
            />
            <button type="button" onClick={onClose} aria-label="Fermer" className="shrink-0 text-white/45 hover:text-white">
              <Kbd className="hidden sm:grid">Échap</Kbd>
              <LuX aria-hidden className="h-4 w-4 sm:hidden" />
            </button>
          </div>

          <div className="relative max-h-[60vh] overflow-y-auto py-2">
            <Group title="Récentes" rows={section("recent")} active={active} onPick={go} onHover={setActive} render={(item) => <PlainRow icon={LuClock} label={item.label} />} />
            <Group
              title="Joueurs"
              rows={section("player")}
              active={active}
              onPick={go}
              onHover={setActive}
              render={({ player }) => {
                const rank = rankFor(player.points);
                return (
                  <>
                    {/* Avatar entouré de la couleur du rang. */}
                    <Avatar full src={player.avatarUrl} name={player.username} size={38} ring={rankGradient(rank, 160)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {player.username}
                        {player.team ? (
                          <span className="ml-2 font-tech text-[10px] font-bold" style={{ color: player.team.color }}>
                            [{player.team.tag}]
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/45">
                        <RankEmblem rank={rank} size={16} animated={false} />
                        <span className="font-semibold" style={{ color: rank.text }}>
                          {rank.name}
                        </span>
                        {player.position ? <span>· #{player.position}</span> : null}
                        {player.activisionId ? <span className="truncate text-white/35">· {player.activisionId}</span> : null}
                      </p>
                    </div>
                    <span className="shrink-0 text-right">
                      <span className="block font-tech text-sm font-bold tabular-nums text-[#e7c05a]">{player.points.toLocaleString("fr-FR")}</span>
                      <span className="block font-tech text-[9px] uppercase tracking-[0.2em] text-white/35">pts</span>
                    </span>
                  </>
                );
              }}
            />
            <Group
              title="Équipes"
              rows={section("team")}
              active={active}
              onPick={go}
              onHover={setActive}
              render={({ team }) => (
                <>
                  {/* Blason plus grand, liseré à la couleur de l'équipe. */}
                  <span className="shrink-0 p-[2px]" style={{ boxShadow: `0 0 0 1px ${team.color}, 0 0 12px ${team.color}55` }}>
                    <TeamCrest team={team} size={38} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {team.name}
                      <span className="ml-2 font-tech text-[10px] font-bold" style={{ color: team.color }}>
                        [{team.tag}]
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      #{team.position} Division · {team.size} joueur{team.size > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-right">
                    <span className="block font-tech text-sm font-bold tabular-nums" style={{ color: team.color }}>
                      {team.points.toLocaleString("fr-FR")}
                    </span>
                    <span className="block font-tech text-[9px] uppercase tracking-[0.2em] text-white/35">pts</span>
                  </span>
                </>
              )}
            />
            <Group title="Pages" rows={section("page")} active={active} onPick={go} onHover={setActive} render={(item) => <PlainRow icon={LuFileText} label={item.label} />} />
            {empty ? <p className="px-5 py-8 text-center text-sm text-white/45">Aucun résultat pour « {query.trim()} ».</p> : null}
          </div>

          {/* Raccourcis dessinés comme des touches de clavier. */}
          <div className="relative hidden items-center gap-5 border-t border-white/10 bg-ink-800/80 px-5 py-2.5 font-tech text-[9px] uppercase tracking-[0.18em] text-white/40 sm:flex">
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> naviguer
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>
                <LuCornerDownLeft aria-hidden className="h-3 w-3" />
              </Kbd>
              ouvrir
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd> rechercher
            </span>
          </div>
        </motion.div>
      </motion.div>
    </Portal>
  );
}

function Group({ title, rows, active, onPick, onHover, render }) {
  if (!rows.length) return null;
  return (
    <div className="py-1">
      <p className="px-5 pb-1.5 pt-2 font-tech text-[9px] uppercase tracking-[0.26em] text-white/35">{title}</p>
      <ul>
        {rows.map(({ item, index }) => (
          <li key={`${item.type}-${item.href}`}>
            <button
              type="button"
              onMouseMove={() => onHover(index)}
              onClick={() => onPick(item)}
              className={cn("relative flex w-full items-center gap-3 px-5 py-2 text-left transition-colors", index === active ? "bg-linear-to-r from-[#e7c05a]/[0.16] via-[#e7c05a]/[0.05] to-transparent" : "")}
            >
              {/* Ligne choisie : barre dorée en biais à gauche. */}
              {index === active ? <span aria-hidden className="absolute inset-y-1 left-0 w-1.5 bg-[#e7c05a] [clip-path:polygon(0_0,100%_18%,100%_82%,0_100%)]" /> : null}
              {render(item)}
              {index === active ? <LuCornerDownLeft aria-hidden className="h-4 w-4 shrink-0 text-[#e7c05a]" /> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Touche de clavier dessinée (raccourcis du bas de la recherche). */
function Kbd({ children, className = "" }) {
  return (
    <kbd className={cn("grid h-5 min-w-5 place-items-center border border-b-2 border-white/20 bg-white/[0.05] px-1 font-tech text-[9px] normal-case tracking-normal text-white/70", className)}>
      {children}
    </kbd>
  );
}

function PlainRow({ icon: Icon, label }) {
  return (
    <>
      <span className="grid h-[34px] w-[34px] shrink-0 place-items-center border border-white/10 text-white/50">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-white/80">{label}</span>
    </>
  );
}
