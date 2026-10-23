import { AnimatePresence, motion } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LuDices, LuMap } from "react-icons/lu";
import { Container } from "../../components/ui/Container";
import { Loading } from "../../components/ui/Feedback";
import { PageHeader } from "../../components/ui/Typography";
import { api } from "../../lib/api";
import { cn } from "../../lib/cn";
import { MAPS, MAP_MODES, mapImage } from "../../lib/maps";

/**
 * Map pool : les maps de Modern Warfare 4 qui peuvent être tirées au sort dans chaque mode (Classé, Division,
 * Tournoi), réglées dans l'admin (GET /cod/maps du backend). ?mode=classe|division|tournoi choisit l'onglet.
 */
export default function MapPoolPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const mode = MAP_MODES.find((item) => item.id === router.query.mode) ?? MAP_MODES[0];

  useEffect(() => {
    api("/cod/maps")
      .then(setData)
      // Serveur injoignable : pools par défaut (toutes les maps dans chaque mode).
      .catch(() => setData({ pools: Object.fromEntries(MAP_MODES.map((item) => [item.id, MAPS.map((map) => map.name)])) }));
  }, []);

  const pool = data?.pools?.[mode.id] ?? [];
  const inPool = MAPS.filter((map) => pool.includes(map.name));
  const outPool = MAPS.filter((map) => !pool.includes(map.name));

  const choose = (id) => router.replace({ pathname: "/cod/maps", query: { mode: id } }, undefined, { shallow: true, scroll: false });

  return (
    <>
      <Head>
        <title>Map pool — SixSence</title>
        <meta name="description" content="Les maps de Modern Warfare 4 tirées au sort en Classé, en Division et en Tournoi sur SixSence." />
      </Head>
      <PageHeader
        eyebrow="Modern Warfare 4 · Maps"
        title={
          <>
            Map <span className="text-gold-gradient">pool</span>
          </>
        }
        description="Les maps qui peuvent tomber à chaque match, mode par mode. Tirées au sort au moment où le match est trouvé."
      />
      <Container className="space-y-10 py-12">
        {/* Onglets des modes, chacun dans sa couleur */}
        <div role="tablist" aria-label="Mode" className="flex flex-wrap gap-2">
          {MAP_MODES.map((item) => {
            const active = item.id === mode.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => choose(item.id)}
                className={cn(
                  "clip-slant px-6 py-3 font-display text-base font-black uppercase tracking-[0.14em] transition-all",
                  active ? "text-ink shadow-[0_0_24px_var(--c)]" : "bg-white/[0.05] text-white/60 hover:bg-white/10 hover:text-white",
                )}
                style={{ "--c": `${item.color}66`, ...(active ? { background: item.color } : {}) }}
              >
                {item.label}
                {data ? <span className={cn("ml-2 font-tech text-[11px]", active ? "text-ink/70" : "text-white/40")}>{data.pools[item.id].length}</span> : null}
              </button>
            );
          })}
        </div>

        {!data ? <Loading label="Chargement des maps…" /> : null}

        {data ? (
          <AnimatePresence mode="wait">
            <motion.section key={mode.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} aria-label={`Maps ${mode.label}`}>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
                <LuDices aria-hidden className="h-4 w-4" style={{ color: mode.color }} />
                <span className="font-semibold text-white">
                  {inPool.length} map{inPool.length > 1 ? "s" : ""} en {mode.label}
                </span>
                <span aria-hidden className="text-white/25">·</span>
                {mode.hint}
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {inPool.map((map, index) => (
                  <motion.li key={map.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.04 }}>
                    <MapCard map={map} index={index} color={mode.color} />
                  </motion.li>
                ))}
              </ul>

              {outPool.length ? (
                <div className="mt-12">
                  <p className="font-tech text-[10px] uppercase tracking-[0.26em] text-white/40">Pas dans le pool {mode.label}</p>
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {outPool.map((map) => (
                      <li key={map.id} className="relative aspect-video overflow-hidden border border-white/8 grayscale">
                        <img src={mapImage(map.name)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" loading="lazy" />
                        <span className="absolute inset-x-0 bottom-0 p-2 font-display text-sm font-bold uppercase text-white/50">{map.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </motion.section>
          </AnimatePresence>
        ) : null}
      </Container>
    </>
  );
}

/** Carte d'une map : image, numéro, nom en grand, liseré et lueur dans la couleur du mode au survol. */
function MapCard({ map, index, color }) {
  return (
    <div className="group relative aspect-[16/10] overflow-hidden border border-white/10 bg-ink clip-tactical [--cut:16px] transition-colors hover:border-[var(--c)]" style={{ "--c": color }}>
      <img src={mapImage(map.name)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink via-ink/40 to-transparent" />
      <div aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ boxShadow: `inset 0 0 60px ${color}55` }} />
      <span className="absolute left-4 top-3 font-tech text-xs font-bold tracking-[0.2em] text-white/60">{String(index + 1).padStart(2, "0")}</span>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <p className="font-display text-3xl font-black uppercase leading-none tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">{map.name}</p>
        <LuMap aria-hidden className="mb-1 h-5 w-5 shrink-0 opacity-80" style={{ color }} />
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: color }} />
    </div>
  );
}
