import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { LuCheck, LuChevronDown, LuCrosshair, LuLifeBuoy, LuLink, LuSearch, LuShield, LuTrophy, LuUser } from "react-icons/lu";
import { FaDiscord } from "react-icons/fa6";
import { Container } from "../components/ui/Container";
import { InstallGuide } from "../components/ui/InstallGuide";
import { PageHeader } from "../components/ui/Typography";
import { cn } from "../lib/cn";
import { DISCORD_INVITE_URL, MATCH_TEAM_ENABLED } from "../lib/config";
import { FAQ, FAQ_THEMES } from "../lib/faq";

const ICONS = { compte: LuUser, classe: LuCrosshair, division: LuShield, tournoi: LuTrophy, discord: FaDiscord, souci: LuLifeBuoy };
const normalize = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Questions fréquentes (lib/faq.js) : recherche, thèmes, réponses dépliables, lien direct vers chaque question
 * (/faq#id ouvre et fait défiler jusqu'à elle). Marche à suivre d'installation sur iPhone (InstallGuide).
 */
export default function FaqPage() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(null);
  const [open, setOpen] = useState(() => new Set());
  const [copied, setCopied] = useState(null);

  // Lien direct : /faq#id ouvre la question et la montre.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id || !FAQ.some((item) => item.id === id)) return;
    setOpen(new Set([id]));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "center" }));
  }, []);

  const items = useMemo(() => FAQ.filter((item) => MATCH_TEAM_ENABLED || (item.theme !== "division" && item.theme !== "tournoi")), []);
  const themes = FAQ_THEMES.filter((t) => items.some((item) => item.theme === t.id));
  const list = useMemo(() => {
    const q = normalize(query.trim());
    return items.filter((item) => (!theme || item.theme === theme) && (!q || normalize(`${item.q} ${item.a}`).includes(q)));
  }, [items, query, theme]);

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function copyLink(id) {
    const url = `${window.location.origin}/faq#${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.location.hash = id;
    }
    setCopied(id);
    setTimeout(() => setCopied((current) => (current === id ? null : current)), 2000);
  }

  return (
    <>
      <Head>
        <title>Questions fréquentes — SixSence</title>
        <meta name="description" content="FAQ de SixSence : compte, Classé, Division, tournois, Discord, installer l'appli sur iPhone et Android." />
      </Head>
      <PageHeader
        eyebrow="Aide"
        title={
          <>
            Questions <span className="text-gold-gradient">fréquentes</span>
          </>
        }
        description="Tout ce qu'on nous demande le plus, en deux lignes. Pas trouvé ? Ouvre un ticket sur Discord."
      />
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <nav aria-label="Thèmes" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <div className="relative">
              <LuSearch aria-hidden className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher : points, check-in…"
                aria-label="Rechercher dans la FAQ"
                className="w-full border border-white/10 bg-white/[0.03] py-3 pl-9 pr-3 text-sm outline-none placeholder:text-white/35 focus:border-gold/60"
              />
            </div>
            <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible">
              {[{ id: null, label: "Tout", color: "#d4af37" }, ...themes].map((t) => {
                const Icon = t.id ? ICONS[t.id] : LuSearch;
                const count = items.filter((item) => !t.id || item.theme === t.id).length;
                const active = theme === t.id;
                return (
                  <li key={t.label} className="shrink-0">
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTheme(t.id)}
                      className={cn("flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors", active ? "bg-white/[0.06]" : "border-transparent hover:bg-white/[0.03]")}
                      style={active ? { borderColor: t.color } : undefined}
                    >
                      <Icon aria-hidden className="h-4 w-4" style={{ color: t.color }} />
                      <span className={cn("flex-1 font-display text-base font-bold uppercase tracking-wide", active ? "text-white" : "text-white/60")}>{t.label}</span>
                      <span className="font-tech text-[10px] text-white/35">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="min-w-0 space-y-10">
            {themes
              .filter((t) => list.some((item) => item.theme === t.id))
              .map((t) => (
                <section key={t.id} aria-labelledby={`faq-${t.id}`}>
                  <h2 id={`faq-${t.id}`} className="flex items-center gap-3 font-display text-3xl font-black uppercase leading-none">
                    <span aria-hidden className="h-6 w-1.5 -skew-x-[18deg]" style={{ background: t.color }} />
                    {t.label}
                  </h2>
                  <ul className="mt-4 space-y-2">
                    {list
                      .filter((item) => item.theme === t.id)
                      .map((item) => {
                        const isOpen = open.has(item.id) || (query.trim().length >= 3 && list.length <= 3);
                        return (
                          <li
                            key={item.id}
                            id={item.id}
                            className={cn("scroll-mt-28 border transition-colors", isOpen ? "bg-white/[0.04]" : "border-white/10 bg-white/[0.02]")}
                            style={isOpen ? { borderColor: `${t.color}66` } : undefined}
                          >
                            <button type="button" aria-expanded={isOpen} aria-controls={`r-${item.id}`} onClick={() => toggle(item.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left">
                              <span className="flex-1 font-semibold">{item.q}</span>
                              <LuChevronDown aria-hidden className={cn("h-5 w-5 shrink-0 text-white/45 transition-transform", isOpen && "rotate-180")} style={isOpen ? { color: t.color } : undefined} />
                            </button>
                            {isOpen ? (
                              <div id={`r-${item.id}`} className="space-y-4 px-5 pb-4">
                                <p className="text-sm leading-relaxed text-white/65">{item.a}</p>
                                {item.guide === "ios" ? (
                                  <div className="space-y-5">
                                    <InstallGuide browser="ios-safari" />
                                    <div className="border-t border-white/10 pt-4">
                                      <p className="mb-3 font-display text-base font-black uppercase leading-none text-white/80">Autre navigateur sur iPhone (Chrome, Firefox, Edge…)</p>
                                      <InstallGuide browser="ios-autre" />
                                    </div>
                                  </div>
                                ) : null}
                                <button type="button" onClick={() => copyLink(item.id)} className="inline-flex items-center gap-1 font-tech text-[10px] uppercase tracking-[0.18em] text-white/40 transition-colors hover:text-gold">
                                  {copied === item.id ? <LuCheck aria-hidden className="h-3 w-3 text-win" /> : <LuLink aria-hidden className="h-3 w-3" />}
                                  {copied === item.id ? "Lien copié" : "Copier le lien"}
                                </button>
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
                  </ul>
                </section>
              ))}
            {list.length === 0 ? <p className="text-sm text-white/55">Aucune réponse pour « {query} ». Ouvre un ticket sur Discord : on te répond.</p> : null}

            <div className="clip-tactical flex flex-col gap-4 border border-gold/40 bg-gold/[0.06] p-6 [--cut:16px] sm:flex-row sm:items-center">
              <FaDiscord aria-hidden className="h-8 w-8 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="font-display text-2xl font-black uppercase leading-none">Pas trouvé ta réponse ?</p>
                <p className="mt-1 text-sm text-white/60">Ouvre un ticket « Question » sur le Discord : l&apos;équipe SixSence te répond.</p>
              </div>
              {DISCORD_INVITE_URL ? (
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="clip-slant self-start bg-gold px-5 py-2.5 font-display text-sm font-black uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-light sm:self-auto"
                >
                  Ouvrir un ticket
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
