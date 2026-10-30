import { useEffect, useState } from "react";
import { PlayerMedals } from "../components/cod/PlayerMedals";
import { TeamTrophyCase } from "../components/teams/TeamTrophyCase";
import { Container } from "../components/ui/Container";
import { Eyebrow } from "../components/ui/Typography";

const d = (days) => new Date(Date.now() - days * 86400e3).toISOString();
const MEDALS = [
  ["or", "Coupe Anubis · Le Jugement", "Sphinx", 2],
  ["or", "Coupe Anubis du samedi", "Cobra", 9],
  ["argent", "Coupe Anubis · Pesée des âmes", "Ibis", 16],
  ["bronze", "Coupe Anubis · Le Chacal", "Faucon", 23],
  ["or", "Coupe Anubis · Gardien des tombes", "Scarabée", 30],
  ["argent", "Coupe Anubis du samedi", "Lotus", 37],
  ["bronze", "Coupe Anubis · Le Jugement", "Nil", 44],
].concat(Array.from({ length: 16 }, (_, i) => [["or", "argent", "bronze", "or"][i % 4], "Coupe Anubis du samedi", "Thot", 50 + i * 7])).map(([place, name, team, days], i) => ({ id: i + 1, place, name, team_name: team, created_at: d(days) }));
const TROPHIES = [
  ["or", "Coupe Horus du dimanche", 3],
  ["argent", "Coupe Horus · Œil d'or", 10],
  ["or", "Coupe Horus · Nuit des Pharaons", 17],
  ["bronze", "Coupe Horus · Sable et Sang", 24],
  ["winner", "Tournoi de fin de saison 1", 31],
  ["or", "Coupe Horus · Le Faucon", 38],
  ["argent", "Coupe Horus du dimanche", 45],
].concat(Array.from({ length: 7 }, (_, i) => [["or", "argent", "bronze"][i % 3], "Coupe Horus du dimanche", 50 + i * 7])).map(([place, name, days], i) => ({ tournamentId: `t${i}`, kind: "horus", name, place, date: d(days) }));

export default function DevVitrines() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const original = window.fetch;
    window.fetch = (url, init) =>
      String(url).includes("cup_medals") ? Promise.resolve(new Response(JSON.stringify(MEDALS), { headers: { "Content-Type": "application/json" } })) : original(url, init);
    setReady(true);
    if (new URLSearchParams(window.location.search).has("ouvert")) setTimeout(() => document.querySelectorAll("button[aria-expanded]").forEach((b) => b.click()), 1500);
  }, []);
  if (!ready) return null;
  return (
    <Container className="space-y-16 py-28">
      <div className="space-y-4">
        <Eyebrow>Profil d&apos;un joueur</Eyebrow>
        <PlayerMedals playerId="demo" />
      </div>
      <div className="space-y-4">
        <Eyebrow>Fiche d&apos;une équipe</Eyebrow>
        <TeamTrophyCase trophies={TROPHIES} />
      </div>
    </Container>
  );
}
