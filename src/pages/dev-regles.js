import { MatchRulesCard } from "../components/cod/MatchRules";
import { Container } from "../components/ui/Container";

// Aperçu (non commité) : bloc « Paramètres de la partie » des feuilles de match.
export default function DevRegles() {
  return (
    <Container className="max-w-4xl space-y-8 pb-16 pt-32">
      <MatchRulesCard bestOf={1} isHost />
      <MatchRulesCard bestOf={3} />
    </Container>
  );
}
