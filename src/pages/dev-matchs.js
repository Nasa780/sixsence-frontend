import { useEffect, useState } from "react";
import { MatchesView } from "../components/cod/MyMatches";
import { Container } from "../components/ui/Container";
import { PageHeader } from "../components/ui/Typography";

const h = (hours) => new Date(Date.now() - hours * 3600e3).toISOString();
const team = (name, tag, color) => ({ id: tag, name, tag, color, logoUrl: null });
const rows = [
  { key: "l", mode: "division", href: "#", date: h(0.2), open: true, won: null, title: "vs Nexora", detail: "Avec [SIX] · BO3 · map 2 à jouer" },
  { key: "1", mode: "classe", href: "#", date: h(1), won: true, title: "Terminal", detail: "4v4 · Recherche & Destruction", points: 52 },
  { key: "2", mode: "division", href: "#", date: h(2), won: false, title: "vs Vault", opponent: team("Vault", "VLT", "#8c6cf0"), detail: "Avec [SIX] · 1-2", points: -24, xp: 150 },
  { key: "3", mode: "classe", href: "#", date: h(2.5), won: true, title: "Highrise", detail: "2v2 · Recherche & Destruction", points: 48 },
  { key: "4", mode: "tournoi", href: "#", date: h(50), won: true, title: "vs Scarabée", opponent: team("Scarabée", "SCA", "#e7c05a"), detail: "Avec [SPH] · 2-1 · Finale", xp: 500 },
  { key: "5", mode: "tournoi", href: "#", date: h(51), won: true, title: "vs Cobra", opponent: team("Cobra", "COB", "#3fbf7f"), detail: "Avec [SPH] · 1-0", xp: 500 },
  { key: "6", mode: "classe", href: "#", date: h(52), won: false, title: "Rust", detail: "3v3 · Recherche & Destruction", points: -30 },
  { key: "7", mode: "classe", href: "#", date: h(53), cancelled: true, won: null, title: "Shipment", detail: "4v4 · Recherche & Destruction" },
];

export default function DevMatchs() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return (
    <>
      <PageHeader
        eyebrow="MW4 · Mes matchs"
        title={
          <>
            Mes <span className="text-gold-gradient">matchs</span>
          </>
        }
        description="Classé, Division et coupes : ton match en cours et tout ton historique au même endroit."
      />
      <Container className="space-y-10 py-12">
        <MatchesView rows={rows} />
      </Container>
    </>
  );
}
