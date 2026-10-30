import { ActiveMatchBanner } from "../components/cod/ActiveMatchBanner";
import { RequeueCard } from "../components/cod/RequeueCard";
import { Container } from "../components/ui/Container";

// Démonstration locale (jamais committée) : bandeau « Match en cours » et carte de fin de match.
export default function DevEnCours() {
  return (
    <Container className="space-y-10 py-28">
      <ActiveMatchBanner matchId="98557260-75ec-44ca-a467-17dea314617c" />
      <RequeueCard format="3v3" title="On enchaîne ?" text="Un clic et ta recherche repart tout de suite, sans recliquer sur la file." />
      <RequeueCard format="3v3" tone="grey" title="Match annulé" text="Un joueur n'a pas accepté à temps. Si tu étais prêt, tu es déjà remis en tête de file." />
    </Container>
  );
}
