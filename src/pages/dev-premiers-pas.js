import { OnboardingPanel } from "../components/cod/OnboardingPanel";
import { Container } from "../components/ui/Container";

// Démo (non commitée) : premiers pas à onglets avec un joueur d'exemple.
export default function DevPremiersPas() {
  const user = { id: "demo-premiers-pas", profile: { activision_id: "Demo#123", wins: 0, losses: 0, points: 0 } };
  return (
    <Container className="pb-16 pt-28">
      <OnboardingPanel user={user} />
    </Container>
  );
}
