import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Les saisons changent rarement : une seule lecture partagée par toutes les pages.
let cache = null;
let request = null;

function fetchSeasons() {
  if (!request) {
    request = supabase
      .from("seasons")
      .select("id, name, starts_at, ends_at, is_active")
      .order("id", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          request = null;
          return [];
        }
        cache = data || [];
        return cache;
      });
  }
  return request;
}

/**
 * Saisons du classé COD (lecture publique).
 *   seasons : toutes les saisons, la plus récente d'abord (null pendant le chargement)
 *   active  : la saison en cours, ou null
 *   label   : nom de la saison en cours, « Saison 1 » par défaut
 */
export default function useSeasons() {
  const [seasons, setSeasons] = useState(cache);

  useEffect(() => {
    let alive = true;
    fetchSeasons().then((data) => alive && setSeasons(data));
    return () => {
      alive = false;
    };
  }, []);

  const active = seasons?.find((season) => season.is_active) ?? null;
  return { seasons, active, label: active?.name ?? "Saison 1" };
}

/** Libellé d'un badge de fin de saison (« s2-top10 » -> Top 10 de la saison 2), ou null. */
export function seasonBadge(key, seasons) {
  const match = /^s(\d+)-(top10|champion)$/.exec(key);
  if (!match) return null;
  const name = seasons?.find((season) => season.id === Number(match[1]))?.name ?? `Saison ${match[1]}`;
  return match[2] === "champion"
    ? { label: `Champion · ${name}`, description: `Premier du classement à la fin de la ${name}.` }
    : { label: `Top 10 · ${name}`, description: `Dans les dix premiers à la fin de la ${name}.` };
}
