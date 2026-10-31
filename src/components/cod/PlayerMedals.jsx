import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { AwardShelf, METALS } from "../ui/AwardShelf";

/** Médaille de la Coupe Anubis ou trophée de la Coupe Horus (cup_medals.kind). */
const image = (kind, place) => `/images/trophees/${kind === "horus" ? "horus" : "anubis"}-${place}.png`;
const dateFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/**
 * Vitrine d'un joueur (profil) : médailles de la Coupe Anubis et coupes de la Coupe Horus ensemble (images différentes),
 * nom de la coupe et date, la plus récente d'abord ;
 * au-delà de 8, palmarès regroupé par métal (vitrine commune AwardShelf). Rien n'est affiché sans médaille.
 */
export function PlayerMedals({ playerId }) {
  const [medals, setMedals] = useState([]);

  useEffect(() => {
    let alive = true;
    supabase
      .from("cup_medals")
      .select("id, place, name, kind, created_at")
      .eq("user_id", playerId)
      .order("created_at", { ascending: false })
      .then(({ data }) => alive && setMedals(data || []));
    return () => {
      alive = false;
    };
  }, [playerId]);

  const items = medals.map((medal) => ({
    key: medal.id,
    metal: medal.place,
    image: image(medal.kind, medal.place),
    label: METALS[medal.place]?.label ?? "Médaille",
    title: medal.name,
    sub: dateFr(medal.created_at),
  }));
  return <AwardShelf id="titre-medailles" title="Vitrine" items={items} swing />;
}
