import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { AwardShelf, METALS } from "../ui/AwardShelf";

const IMAGE = { or: "/images/trophees/anubis-or.png", argent: "/images/trophees/anubis-argent.png", bronze: "/images/trophees/anubis-bronze.png" };
const dateFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/**
 * Médailles Anubis d'un joueur (profil) : une médaille par podium de Coupe Anubis, la plus récente d'abord ;
 * au-delà de 8, palmarès regroupé par métal (vitrine commune AwardShelf). Rien n'est affiché sans médaille.
 */
export function PlayerMedals({ playerId }) {
  const [medals, setMedals] = useState([]);

  useEffect(() => {
    let alive = true;
    supabase
      .from("cup_medals")
      .select("id, place, name, team_name, created_at")
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
    image: IMAGE[medal.place],
    label: METALS[medal.place]?.label ?? "Médaille",
    title: medal.name,
    sub: `${medal.team_name ? `${medal.team_name} · ` : ""}${dateFr(medal.created_at)}`,
  }));
  return <AwardShelf id="titre-medailles" eyebrow="Coupe Anubis" title="Médailles" items={items} swing />;
}
