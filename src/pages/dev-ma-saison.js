import { MySeason } from "../components/cod/MySeason";
import { Container } from "../components/ui/Container";

// Démo (non commitée) : barre « Ma saison » avec un profil d'exemple.
export default function DevMaSaison() {
  return (
    <Container className="space-y-8 pb-16 pt-28">
      <MySeason profile={{ points: 1031, wins: 28, losses: 14 }} position={1} />
    </Container>
  );
}
