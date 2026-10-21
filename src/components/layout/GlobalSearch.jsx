import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LuClock, LuCornerDownLeft, LuFileText, LuLoaderCircle, LuSearch, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { MATCH_TEAM_ENABLED } from "../../lib/config";
import { rankFor } from "../../lib/ranks";
import { TeamCrest } from "../teams/TeamParts";
import { Avatar } from "../ui/Avatar";

/** Pages proposées (et retrouvées par leur nom). */
const PAGES = [
  { href: "/cod/ranked", label: "File classée", keywords: "classe jouer file recherche" },
  { href: "/cod/leaderboard", label: "Classement", keywords: "classement joueurs top" },
  { href: "/cod/matchs", label: "Mes matchs", keywords: "historique matchs" },
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
 * Recherche globale : loupe dans la barre du haut, Ctrl+K (ou Cmd+K). Joueurs (pseudo, même stylisé),
 * équipes (nom ou tag) et pages, pendant la frappe ; flèches, Entrée, Échap ; dernières recherches.
 */
export function GlobalSearch() {
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
        className="group flex h-10 items-center gap-2 whitespace-nowrap px-2.5 text-white/70 transition-colors hover:text-gold lg:border lg:border-white/10 lg:bg-white/[0.03] lg:hover:border-gold/40"
      >
        <LuSearch aria-hidden className="h-5 w-5 lg:h-4 lg:w-4" />
        <kbd className="hidden font-tech text-[9px] text-white/40 2xl:inline">Ctrl K</kbd>
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
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#e7c05a] to-transparent" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5">
          {pending ? <LuLoaderCircle aria-hidden className="h-5 w-5 shrink-0 animate-spin text-[#e7c05a]" /> : <LuSearch aria-hidden className="h-5 w-5 shrink-0 text-[#e7c05a]" />}
          <input
            ref={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Joueur, équipe, page…"
            aria-label="Rechercher un joueur, une équipe ou une page"
            maxLength={40}
            className="h-16 min-w-0 flex-1 bg-transparent text-lg text-white placeholder:text-white/30 focus:outline-none"
          />
          <button type="button" onClick={onClose} aria-label="Fermer" className="shrink-0 border border-white/15 px-2 py-1 font-tech text-[10px] text-white/45 hover:text-white">
            <span className="hidden sm:inline">Échap</span>
            <LuX aria-hidden className="h-4 w-4 sm:hidden" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          <Group title="Récentes" rows={section("recent")} active={active} onPick={go} onHover={setActive} render={(item) => <PlainRow icon={LuClock} label={item.label} />} />
          <Group
            title="Joueurs"
            rows={section("player")}
            active={active}
            onPick={go}
            onHover={setActive}
            render={({ player }) => (
              <>
                <Avatar full src={player.avatarUrl} name={player.username} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {player.username}
                    {player.team ? (
                      <span className="ml-2 font-tech text-[10px] font-bold" style={{ color: player.team.color }}>
                        [{player.team.tag}]
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-white/45">
                    {rankFor(player.points).name} · {player.points.toLocaleString("fr-FR")} pts{player.position ? ` · #${player.position}` : ""}
                  </p>
                </div>
              </>
            )}
          />
          <Group
            title="Équipes"
            rows={section("team")}
            active={active}
            onPick={go}
            onHover={setActive}
            render={({ team }) => (
              <>
                <TeamCrest team={team} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {team.name}
                    <span className="ml-2 font-tech text-[10px] font-bold" style={{ color: team.color }}>
                      [{team.tag}]
                    </span>
                  </p>
                  <p className="text-xs text-white/45">
                    #{team.position} Division · {team.points.toLocaleString("fr-FR")} pts · {team.size} joueur{team.size > 1 ? "s" : ""}
                  </p>
                </div>
              </>
            )}
          />
          <Group title="Pages" rows={section("page")} active={active} onPick={go} onHover={setActive} render={(item) => <PlainRow icon={LuFileText} label={item.label} />} />
          {empty ? <p className="px-5 py-8 text-center text-sm text-white/45">Aucun résultat pour « {query.trim()} ».</p> : null}
        </div>

        <div className="hidden items-center gap-5 border-t border-white/10 px-5 py-2.5 font-tech text-[9px] uppercase tracking-[0.18em] text-white/35 sm:flex">
          <span>↑ ↓ naviguer</span>
          <span className="inline-flex items-center gap-1">
            <LuCornerDownLeft aria-hidden className="h-3 w-3" /> ouvrir
          </span>
          <span>Ctrl K rechercher</span>
        </div>
      </motion.div>
    </motion.div>
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
              className={cn("flex w-full items-center gap-3 border-l-2 px-5 py-2 text-left transition-colors", index === active ? "border-[#e7c05a] bg-[#e7c05a]/[0.08]" : "border-transparent")}
            >
              {render(item)}
              {index === active ? <LuCornerDownLeft aria-hidden className="h-4 w-4 shrink-0 text-[#e7c05a]" /> : null}
            </button>
          </li>
        ))}
      </ul>
    </div>
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
