import { useEffect, useState } from "react";
import { LuCheck, LuLoaderCircle } from "react-icons/lu";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { MAPS, MAP_MODES, mapImage } from "../../lib/maps";
import { Button } from "../ui/Button";
import { TacticalCard } from "../ui/TacticalCard";

/**
 * Map pool de chaque mode (admin) : les maps qui peuvent être tirées au sort en Classé, en Division et en Tournoi
 * (GET /cod/maps, POST /admin/maps). Un clic sur une vignette l'ajoute ou la retire du pool du mode choisi.
 */
export function MapPoolsPanel() {
  const [pools, setPools] = useState(null);
  const [mode, setMode] = useState("classe");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    api("/cod/maps")
      .then((data) => setPools(data.pools))
      .catch((caught) => setMessage({ tone: "error", text: caught.message }));
  }, []);

  const toggle = (name) =>
    setPools((current) => ({ ...current, [mode]: current[mode].includes(name) ? current[mode].filter((item) => item !== name) : [...current[mode], name] }));

  async function save() {
    setPending(true);
    setMessage(null);
    try {
      setPools((await api("/admin/maps", { method: "POST", body: pools })).pools);
      setMessage({ tone: "ok", text: "Map pools enregistrés : ils servent dès le prochain tirage." });
    } catch (caught) {
      setMessage({ tone: "error", text: caught.message });
    } finally {
      setPending(false);
    }
  }

  const current = MAP_MODES.find((item) => item.id === mode);

  return (
    <TacticalCard cut={16} innerClassName="space-y-5 p-5">
      <div>
        <p className="font-display text-xl font-black uppercase leading-none">Map pool</p>
        <p className="mt-1 text-sm text-white/55">Maps tirées au sort dans chaque mode. Visibles par tous sur la page Maps.</p>
        {message ? <p className={cn("mt-2 text-sm", message.tone === "ok" ? "text-win" : "text-loss")}>{message.text}</p> : null}
      </div>
      {pools ? (
        <>
          <div className="flex flex-wrap gap-2">
            {MAP_MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn("clip-slant px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.14em]", item.id === mode ? "text-ink" : "bg-white/[0.05] text-white/60 hover:text-white")}
                style={item.id === mode ? { background: item.color } : undefined}
              >
                {item.label} · {pools[item.id].length}
              </button>
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {MAPS.map((map) => {
              const on = pools[mode].includes(map.name);
              return (
                <li key={map.id}>
                  <button
                    type="button"
                    onClick={() => toggle(map.name)}
                    aria-pressed={on}
                    className={cn("relative block aspect-video w-full overflow-hidden border text-left transition-all", on ? "border-[var(--c)]" : "border-white/10 opacity-45 grayscale")}
                    style={{ "--c": current.color }}
                  >
                    <img src={mapImage(map.name)} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <span aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/90 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 p-1.5 font-display text-xs font-bold uppercase leading-none">{map.name}</span>
                    {on ? (
                      <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center text-ink" style={{ background: current.color }}>
                        <LuCheck aria-hidden className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <Button size="sm" onClick={save} disabled={pending}>
            {pending ? <LuLoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : null}
            Enregistrer les map pools
          </Button>
        </>
      ) : null}
    </TacticalCard>
  );
}
