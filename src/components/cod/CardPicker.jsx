import { useEffect, useState } from "react";
import { LuCheck, LuChevronDown, LuLoaderCircle, LuX } from "react-icons/lu";
import { api } from "../../lib/api";
import { RARITY } from "../../lib/cards";
import { cn } from "../../lib/cn";
import { rankFor, rankGradient } from "../../lib/ranks";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Loading, Notice } from "../ui/Feedback";
import { Portal } from "../ui/Portal";
import { TacticalCard } from "../ui/TacticalCard";
import { CardBackdrop, CardTile } from "./CallingCard";
import { RankBadge } from "./RankBadge";

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "owned", label: "Débloquées" },
  ...Object.entries(RARITY).map(([key, value]) => ({ key, label: value.label })),
];

/**
 * Fenêtre « Changer de carte » (son propre profil) : aperçu de la 1re section avec la carte
 * choisie, grille par famille (verrouillées avec condition et progression), filtres,
 * compteur. À l'ouverture, les cartes « Nouvelles » sont marquées comme vues.
 */
export function CardPicker({ open, onClose, player, points, onEquipped }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setError(null);
    api("/cod/cards")
      .then((result) => {
        if (!active) return;
        setData(result);
        setSelected(result.equipped);
        if (result.newCount > 0) api("/cod/cards/seen", { method: "POST" }).catch(() => {});
      })
      .catch((caught) => active && setError(caught.message));
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      active = false;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const visible = (card) => filter === "all" || (filter === "owned" ? card.owned : card.rarity === filter);
  const families = data ? [...new Set(data.cards.map((card) => card.family))] : [];
  const current = data && selected ? [...data.cards, ...data.previousSeasons].find((card) => card.key === selected) : null;

  async function equip() {
    setPending(true);
    setError(null);
    try {
      const { equipped } = await api("/cod/cards/equip", { method: "POST", body: { key: selected } });
      setData((prev) => ({ ...prev, equipped }));
      onEquipped?.(equipped);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[95] overflow-y-auto bg-ink/90 backdrop-blur-sm sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
        <div role="dialog" aria-modal="true" aria-labelledby="titre-cartes" className="mx-auto min-h-full max-w-5xl border-gold/30 bg-ink-800 shadow-2xl shadow-black/60 sm:min-h-0 sm:border">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-ink-800 px-5 py-4 sm:px-7">
            <div>
              <p className="font-tech text-[11px] uppercase tracking-[0.3em] text-gold">Collection</p>
              <h2 id="titre-cartes" className="mt-1 font-display text-3xl font-black uppercase leading-none">
                Cartes de visite
              </h2>
            </div>
            <div className="flex items-center gap-4">
              {data ? (
                <p className="font-tech text-sm tabular-nums text-white/70">
                  <span className="text-gold">{data.ownedCount}</span> / {data.total} cartes
                </p>
              ) : null}
              <button type="button" onClick={onClose} className="p-1 text-white/50 hover:text-white" aria-label="Fermer">
                <LuX aria-hidden className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6 px-5 py-5 sm:px-7">
            {error ? <Notice tone="error">{error}</Notice> : null}
            {!data ? (
              error ? null : <Loading label="Chargement de ta collection…" />
            ) : (
              <>
                <div>
                  <p className="mb-2 font-tech text-[10px] uppercase tracking-[0.24em] text-white/45">Aperçu</p>
                  <TacticalCard highlight cut={18} innerClassName="holo overflow-hidden p-5">
                    <CardBackdrop cardKey={selected} compact />
                    <div className="relative flex items-center gap-4">
                      <Avatar src={player.avatar_url} name={player.username} size={64} className="[--cut:14px]" ring={rankGradient(rankFor(points), 160)} />
                      <div className="min-w-0">
                        <p className="truncate font-display text-4xl font-black uppercase leading-[0.9]">{player.username}</p>
                        <RankBadge points={points} className="mt-3" />
                      </div>
                    </div>
                  </TacticalCard>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button onClick={equip} disabled={pending || selected === data.equipped}>
                      {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : <LuCheck aria-hidden className="h-4 w-4" />}
                      {selected === data.equipped ? "Carte équipée" : `Équiper « ${current?.name ?? ""} »`}
                    </Button>
                    {selected !== data.equipped ? (
                      <span className="text-xs text-white/45">
                        Carte actuelle : {[...data.cards, ...data.previousSeasons].find((card) => card.key === data.equipped)?.name ?? "SixSence"}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer les cartes">
                  {FILTERS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={filter === item.key}
                      onClick={() => setFilter(item.key)}
                      className={cn(
                        "clip-slant px-3.5 py-1.5 font-display text-sm font-bold uppercase transition-colors",
                        filter === item.key ? "bg-gold text-ink" : "bg-white/[0.06] text-white/70 hover:bg-white/10",
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {families.map((family) => {
                  const cards = data.cards.filter((card) => card.family === family && visible(card));
                  if (cards.length === 0) return null;
                  const season = cards[0].season;
                  return (
                    <section key={family} aria-label={family}>
                      <p className="mb-2 flex flex-wrap items-center gap-2 font-tech text-[11px] uppercase tracking-[0.24em] text-white/55">
                        {family}
                        {season ? <span className="normal-case tracking-normal text-white/35">· attribuées à la clôture de la saison</span> : null}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {cards.map((card) => (
                          <CardTile key={card.key} card={card} selected={selected === card.key} onSelect={(item) => setSelected(item.key)} />
                        ))}
                      </div>
                    </section>
                  );
                })}

                {data.previousSeasons.some(visible) ? (
                  <details className="group border-t border-white/10 pt-3">
                    <summary className="flex cursor-pointer list-none items-center gap-2 font-tech text-[11px] uppercase tracking-[0.24em] text-white/55">
                      <LuChevronDown aria-hidden className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                      Saisons précédentes
                    </summary>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {data.previousSeasons.filter(visible).map((card) => (
                        <CardTile key={card.key} card={card} selected={selected === card.key} onSelect={(item) => setSelected(item.key)} />
                      ))}
                    </div>
                  </details>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
